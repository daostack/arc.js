import { from } from 'rxjs'
import { concatMap } from 'rxjs/operators'
import {
  ITransaction,
  Operation,
  toIOperationObservable,
  Address,
  AnyPlugin
} from '../../index'

export class ReputationFromTokenScheme {

  constructor(public plugin: AnyPlugin) { }

  public async getAgreementHash(): Promise<string> {
    const contract = await this.getContract()
    const result = await contract.getAgreementHash()
    return result
  }

  public redeem(beneficiary: Address, agreementHash?: string): Operation<undefined> {

    const createTransaction = async (): Promise<ITransaction> => {
      return {
        contract: await this.getContract(),
        method: 'redeem',
        args: [ beneficiary ]
      }
    }

    const observable = from(createTransaction()).pipe(
      concatMap((transaction) => {
        return this.plugin.context.sendTransaction(transaction)
      })
    )

    return toIOperationObservable(observable)
  }

  public async getContract() {
    const state = await this.plugin.fetchState()
    const contract = this.plugin.context.getContract(state.address)
    return contract
  }

}
