import BN from 'bn.js'
import { DocumentNode } from 'graphql'
import gql from 'graphql-tag'
import { from, Observable } from 'rxjs'
import { concatMap } from 'rxjs/operators'
import { IEntityRef } from '../../entity'
import {
  Address,
  Arc,
  DAO,
  FundingRequest,
  IApolloQueryOptions,
  IProposalState,
  ITransaction,
  ITransactionReceipt,
  Operation,
  Plugin,
  Proposal,
  secondSinceEpochToDate,
  toIOperationObservable
} from '../../index'

export interface IFundingRequestProposalState extends IProposalState {
  dao: IEntityRef<DAO>
  beneficiary: Address
  amount: BN
  executed: Date
  amountRedeemed: BN
}

export class FundingRequestProposal extends Proposal<IFundingRequestProposalState> {

  public static get fragment() {
    if (!this.fragmentField) {
      this.fragmentField = {
        name: 'FundingRequestProposalFields',
        fragment: gql`
          fragment FundingRequestProposalFields on Proposal {
            fundingRequest {
              id
              dao { id }
              beneficiary
              amount
              executed
              amountRedeemed
            }
          }
        `
      }
    }

    return this.fragmentField
  }

  public static itemMap(context: Arc, item: any, query?: string): IFundingRequestProposalState | null {
    if (!item) { return null }
    const fundingRequestState = FundingRequest.itemMap(context, item.scheme, query)

    if (!fundingRequestState) { return null }

    const fundingRequest = new FundingRequest(context, fundingRequestState)
    const fundingRequestProposal = new FundingRequestProposal(context, item.id)

    const baseState = Proposal.itemMapToBaseState(
      context,
      item,
      fundingRequest,
      fundingRequestProposal,
      'FundingRequest'
    )

    if (baseState == null) { return null }

    return {
      ...baseState,
      dao: {
        id: item.fundingRequest.dao.id,
        entity: new DAO(context, item.fundingRequest.dao.id)
      },
      beneficiary: item.fundingRequest.beneficiary,
      amount: new BN(item.fundingRequest.amount),
      executed: secondSinceEpochToDate(item.fundingRequest.executed),
      amountRedeemed: new BN(item.fundingRequest.amountRedeemed)
    }
  }

  private static fragmentField: { name: string, fragment: DocumentNode } | undefined

  public state(apolloQueryOptions: IApolloQueryOptions): Observable<IFundingRequestProposalState> {
    const query = gql`query ProposalState
      {
        proposal(id: "${this.id}") {
          ...ProposalFields
          votes {
            id
          }
          stakes {
            id
          }
        }
      }
      ${Proposal.baseFragment}
      ${Plugin.baseFragment}
    `

    const result = this.context.getObservableObject(
      this.context, query, FundingRequestProposal.itemMap, this.id, apolloQueryOptions
      ) as Observable<IFundingRequestProposalState>
    return result
  }

  /**
   * Redeem this proposal after it was accepted
   */
  public redeem(): Operation<boolean> {
    const mapReceipt = (receipt: ITransactionReceipt) => true

    const createTransaction = async (): Promise<ITransaction> => {

      const state = await this.fetchState()
      const pluginState = await state.plugin.entity.fetchState()
      const pluginAddress = pluginState.address
      //  const pluginAddress = state.plugin.id
      const contract = this.context.getContract(pluginAddress)
      const method = 'redeem'
      const args: any[] = [this.id]

      return {
        contract,
        method,
        args
      }
    }

    const observable = from(createTransaction()).pipe(
      concatMap((transaction) => {
        return this.context.sendTransaction(transaction, mapReceipt)
      })
    )

    return toIOperationObservable(observable)
  }

}
