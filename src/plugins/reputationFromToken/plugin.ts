import { from } from 'rxjs'
import { concatMap } from 'rxjs/operators'
import {
  Address,
  Arc,
  IPluginState,
  ITransaction,
  Logger,
  Operation,
  Plugin,
  toIOperationObservable
} from '../../index'

export class ReputationFromTokenPlugin extends Plugin<IPluginState> {
  public static itemMap(context: Arc, item: any, queriedId?: string): IPluginState | null {
    if (!item) {
      Logger.debug(`ReputationFromTokenPlugin ItemMap failed. ${queriedId && `Could not find ReputationFromTokenPlugin with id '${queriedId}'`}`)
      return null
    }

    return Plugin.itemMapToBaseState(context, item)
  }

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
        args: [beneficiary]
      }
    }

    const observable = from(createTransaction()).pipe(
      concatMap((transaction) => {
        return this.context.sendTransaction(transaction)
      })
    )

    return toIOperationObservable(observable)
  }

  public async getContract() {
    const state = await this.fetchState()
    const contract = this.context.getContract(state.address)
    return contract
  }
}
