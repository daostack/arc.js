import { from, Observable } from 'rxjs'
import { concatMap } from 'rxjs/operators'
import {
  ITransaction,
  Operation,
  toIOperationObservable,
  Address,
  Plugin,
  IPluginState,
  IApolloQueryOptions
} from '../../index'

export class ReputationFromToken extends Plugin<IPluginState> {

  public state(apolloQueryOptions: IApolloQueryOptions = {}): Observable<IPluginState> {
    const query = gql`query SchemeStateById
      {
        controllerScheme (id: "${this.id}") {
          ...PluginFields
        }
      }
      ${Plugin.baseFragment}
    `
    return this.context.getObservableObject(this.context, query, Plugin.itemMap, apolloQueryOptions) as Observable<IGenericSchemeState>
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
