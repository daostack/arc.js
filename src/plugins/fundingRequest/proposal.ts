import BN from 'bn.js'
import { DocumentNode } from 'graphql'
import gql from 'graphql-tag'
import { Observable } from 'rxjs'
import { IEntityRef } from '../../entity'
import {
  Address,
  Arc,
  DAO,
  FundingRequest,
  IApolloQueryOptions,
  IProposalState,
  Plugin,
  Proposal,
  secondSinceEpochToDate
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
              # dao { id }
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

  public static itemMap(context: Arc, item: any, query: DocumentNode): IFundingRequestProposalState | null {

    if (!item) { return null }
    console.log(item)
    const contributionRewardState = FundingRequest.itemMap(context, item.scheme, query)

    if (!contributionRewardState) { return null }

    const contributionReward = new FundingRequest(context, contributionRewardState)
    const contributionRewardProposal = new FundingRequestProposal(context, item.id)

    const baseState = Proposal.itemMapToBaseState(
      context,
      item,
      contributionReward,
      contributionRewardProposal,
      'ContributionReward'
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
      this.context, query, FundingRequestProposal.itemMap, apolloQueryOptions
      ) as Observable<IFundingRequestProposalState>
    return result
  }
}
