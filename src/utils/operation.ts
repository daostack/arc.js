import {
  Contract,
  ContractReceipt as ITransactionReceipt,
  Event as ITransactionEvent
} from 'ethers/contract'
import { TransactionResponse } from 'ethers/providers'
import { Observable, Observer } from 'rxjs'
import { first, take } from 'rxjs/operators'
import { Arc, Logger } from '../index'

export interface ITransaction {
  contract: Contract
  method: string
  args: any[]
  opts?: {
    gasLimit?: number;
    gasPrice?: number;
    value?: number;
    nonce?: number;
  }
}

export { ITransactionReceipt, ITransactionEvent }

export enum ITransactionState {
  Sending,
  Sent,
  Mined
}

/**
 * A transaction update is a snapshot of the state of a transaction at a particular time.
 */
export interface ITransactionUpdate<T> {
  state: ITransactionState
  transactionHash?: string
  receipt?: ITransactionReceipt
  /**
   *  number of confirmations
   */
  confirmations?: number
  /**
   * Parsed return value from the method call
   */
  result?: T
}

export type transactionErrorHandler = (
  error: Error,
  transaction: ITransaction,
  options?: { from?: string }
) => Promise<Error> | Error

export type transactionResultHandler<T> = (
  receipt: ITransactionReceipt
) => T | Promise<T> | undefined

/**
 * An operation is a stream of transaction updates
 */
export interface IOperationObservable<T> extends Observable<T> {
  send: () => Promise<T>
}

export type Operation<T> = IOperationObservable<ITransactionUpdate<T>>

/**
 *
 *  * send a transaction to the ethereumblockchain, and return a observable of ITransactionUpdatessend
 * for example:
 *  ```sendTransaction(.....).subscribe((txUpdate) => {
 *    if (txUpdate.state === 'sent' ) { notify("your transaction has been sent, waitin'for it to be mnied") }
 *    if (txUpdate.state === 'mined'} {
 *      notify("your transaction has been mined! It was confirmed ${txUpdate.confirmations} times"}
 *      // and we also ahve the txUpdate.receipt and the txUpdate.result to do stuff with
 *    }
 *  })```
 *
 * @export
 * @template T
 * @param {Arc} context An instance of Arc
 * @param {Transaction} transaction A Web3 transaction object to send
 * @param {TransactionResultHandler<T>} mapReceipt A function that takes the receipt of
 *  the transaction and returns an object
 * @param {TransactionErrorHandler} [errorHandler]
 *  A function that takes an error, and either returns or throws a more informative Error
 *  if errorHander is not provided, a default error handler will throw any errors thrown by calling `transaction.call()`
 * @returns {Operation<T>}
 */
export function sendTransaction<T>(
  context: Arc,
  tx: ITransaction,
  mapReceipt: transactionResultHandler<T>,
  errorHandler: transactionErrorHandler
): Operation<T> {
  const methodInfo = tx.contract.interface.functions[tx.method]

  if (methodInfo === undefined) {
    throw Error(
      `Trying to call non-existent function named '${tx.method}' at address ${tx.contract.address}`
    )
  }

  if (methodInfo.type === 'call') {
    throw Error(
      `Trying to send a transaction to a pure function named '${tx.method}' at address ${tx.contract.address}`
    )
  }

  if (methodInfo.inputs.length !== tx.args.length) {
    throw Error(
      `Incorrect number of arguments. Expected ${methodInfo.inputs.length} for method '${tx.method}', ` +
        `got ${tx.args.length}.\nInputs: ${JSON.stringify(methodInfo.inputs, null, 2)}`
    )
  }

  const observable = Observable.create(async (observer: Observer<ITransactionUpdate<T>>) => {
    const catchHandler = async (error: Error, transaction: ITransaction, from?: string) => {
      try {
        error = await errorHandler(error, tx, { from })
      } catch (err) {
        error = err
      }
      observer.error(error)
    }

    // Get the current account
    const signer = await context.getSigner().pipe(first()).toPromise()

    // Construct a new contract with the current signer
    const contract = new Contract(tx.contract.address, tx.contract.interface, signer)

    let gasLimit: number = 0

    if (!tx.opts) {
      tx.opts = {}
    }

    if (tx.opts.gasLimit) {
      gasLimit = tx.opts.gasLimit
    } else {
      try {
        gasLimit = (await contract.estimate[tx.method](...tx.args, tx.opts)).toNumber()
      } catch (error) {
        await catchHandler(error, tx, await signer.getAddress())
      }
    }

    const overrides = {
      ...tx.opts,
      gasLimit: gasLimit ? gasLimit : 1000000
    }

    let response: TransactionResponse
    let hash: string = ''
    let result: T | undefined

    observer.next({
      state: ITransactionState.Sending
    })

    try {
      response = await contract[tx.method](...tx.args, overrides)
    } catch (error) {
      await catchHandler(error, tx, await signer.getAddress())
      return
    }

    if (!response.hash) {
      throw Error('Transaction hash is undefined')
    }
    hash = response.hash

    Logger.debug('Sending transaction..')
    observer.next({
      state: ITransactionState.Sent,
      transactionHash: hash
    })

    let confirmations = 1

    // Get the mined transaction receipt
    const receipt = await response.wait(confirmations)

    // Map the results
    result = await mapReceipt(receipt)

    Logger.debug('transaction mined!')
    observer.next({
      confirmations,
      receipt,
      result,
      state: ITransactionState.Mined,
      transactionHash: hash
    })

    /**
     * Keep our own count here because ganache and infura are not consistent in how they count the
     * confirmatipn events.  Sometimes a confirmation event can appear before the receipt event.
     * Infura tends to start the confirmation count at 0, whereas ganache (in the test env) likes to start it at 1.
     * A consequence of the latter is that when we hit 24 events, there may or may not have been 24 actual minings --
     * we may have incorrectly counted the "receipt" event as a confirmation.
     */

    if (!context.web3) {
      throw new Error('Web3 provider not set')
    }
    const web3 = context.web3

    // Subscribe to new blocks, and look for new confirmations on our transaction
    const onNewBlock = async (blockNumber: number) => {
      const { confirmations: latestConfirmations } = await web3.getTransactionReceipt(
        response.hash as string
      )

      if (!latestConfirmations || confirmations >= latestConfirmations) {
        // Wait for a new block, as there are no new confirmations
        return
      } else {
        // We've received new confirmations!
        confirmations = latestConfirmations
      }

      // Update the observer
      observer.next({
        confirmations,
        receipt: await response.wait(confirmations),
        result,
        state: ITransactionState.Mined,
        transactionHash: hash
      })

      // the web3 observer will confirm up to 24 subscriptions, so we are done here
      if (confirmations > 23) {
        web3.removeListener('block', onNewBlock)
        observer.complete()
      }
    }

    context.web3.on('block', onNewBlock)
  })

  return toIOperationObservable(observable)
}

export function toIOperationObservable<T>(observable: Observable<T>): IOperationObservable<T> {
  // the 3rd update we get from the observable is the confirmation that it is mined
  // @ts-ignore
  observable.send = () => observable.pipe(take(3)).toPromise()
  // @ts-ignore
  return observable
}

export function getEvent(
  receipt: ITransactionReceipt,
  eventName: string,
  codeScope: string
): ITransactionEvent {
  if (!receipt.events || receipt.events.length === 0) {
    throw Error(`${codeScope}: missing events in receipt`)
  }

  const event = receipt.events.find((e: ITransactionEvent) => e.event === eventName)

  if (!event) {
    throw Error(`${codeScope}: missing ${eventName} event`)
  }

  return event
}

export function getEventArgs(
  receipt: ITransactionReceipt,
  eventName: string,
  codeScope: string
): any[] {
  return getEventAndArgs(receipt, eventName, codeScope)[1]
}

export function getEventAndArgs(
  receipt: ITransactionReceipt,
  eventName: string,
  codeScope: string
): [ITransactionEvent, any[]] {
  const event = getEvent(receipt, eventName, codeScope)

  if (!event.args) {
    throw Error(`${codeScope}: missing ${eventName} event args`)
  }

  return [event, event.args]
}
