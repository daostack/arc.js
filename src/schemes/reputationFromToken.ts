import { from } from 'rxjs'
import { concatMap } from 'rxjs/operators'

import {
  ITransaction,
  Operation,
  toIOperationObservable
} from '../operation'

import { Address } from '../types'

import { SchemeBase } from '../schemes/base'

export class ReputationFromTokenScheme {

  constructor(public scheme: SchemeBase) {

  }

  public async getAgreementHash(): Promise<string> {
    const contract = await this.getContract()
    const result = await contract.getAgreementHash()
    return result
  }

  public redeem(beneficiary: Address): Operation<undefined> {

    const createTransaction = async (): Promise<ITransaction> => {
      return {
        contract: await this.getContract(),
        method: 'redeem',
        args: [ beneficiary ]
      }
    }

    const observable = from(createTransaction()).pipe(
      concatMap((transaction) => {
        return this.scheme.context.sendTransaction(transaction)
      })
    )

    return toIOperationObservable(observable)
  }

  public async getContract() {
    const state = await this.scheme.fetchState()
    const contract = this.scheme.context.getContract(state.address)
    return contract
  }
}
