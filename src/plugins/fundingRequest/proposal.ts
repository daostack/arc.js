import BN from 'bn.js'
import { DocumentNode } from 'graphql'
import gql from 'graphql-tag'
import { Observable } from 'rxjs'
import {
  Address,
  Arc,
  FundingRequest,
  IApolloQueryOptions,
  IProposalState,
  Plugin,
  Proposal
} from '../../index'

export interface IFundingRequestProposalState extends IProposalState {
  beneficiary: Address
  externalTokenReward: BN
  externalToken: Address
  ethReward: BN
  nativeTokenReward: BN
  periods: number
  periodLength: number
  reputationReward: BN
  alreadyRedeemedNativeTokenPeriods: number
  alreadyRedeemedReputationPeriods: number
  alreadyRedeemedExternalTokenPeriods: number
  alreadyRedeemedEthPeriods: number
  reputationChangeLeft: BN | null
  nativeTokenRewardLeft: BN | null
  ethRewardLeft: BN | null
  externalTokenRewardLeft: BN | null
}

export class FundingRequestProposal extends Proposal<IFundingRequestProposalState> {

  public static get fragment() {
    if (!this._fragment) {
      this._fragment = {
        name: 'FundingRequestProposalFields',
        fragment: gql`
          fragment FundingRequestProposalFields on Proposal {
            fundingRequest {
              id
              beneficiary
              ethReward
              ethRewardLeft
              externalToken
              externalTokenReward
              externalTokenRewardLeft
              nativeTokenReward
              nativeTokenRewardLeft
              periods
              periodLength
              reputationReward
              reputationChangeLeft
              alreadyRedeemedReputationPeriods
              alreadyRedeemedExternalTokenPeriods
              alreadyRedeemedNativeTokenPeriods
              alreadyRedeemedEthPeriods
            }
          }
        `
      }
    }

    return this._fragment
  }

  public static itemMap(context: Arc, item: any, query: DocumentNode): IFundingRequestProposalState | null {

    if (!item) { return null }
    console.log(item)
    const ethRewardLeft = (
      item.contributionReward.ethRewardLeft !== null &&
      new BN(item.contributionReward.ethRewardLeft) ||
      null
    )
    const externalTokenRewardLeft = (
      item.contributionReward.externalTokenRewardLeft !== null &&
      new BN(item.contributionReward.externalTokenRewardLeft) ||
      null
    )
    const nativeTokenRewardLeft = (
      item.contributionReward.nativeTokenRewardLeft !== null &&
      new BN(item.contributionReward.nativeTokenRewardLeft) ||
      null
    )
    const reputationChangeLeft = (
      item.contributionReward.reputationChangeLeft !== null &&
      new BN(item.contributionReward.reputationChangeLeft) ||
      null
    )

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
      alreadyRedeemedEthPeriods: Number(item.contributionReward.alreadyRedeemedEthPeriods),
      alreadyRedeemedExternalTokenPeriods: Number(item.contributionReward.alreadyRedeemedExternalTokenPeriods),
      alreadyRedeemedNativeTokenPeriods: Number(item.contributionReward.alreadyRedeemedNativeTokenPeriods),
      alreadyRedeemedReputationPeriods: Number(item.contributionReward.alreadyRedeemedReputationPeriods),
      beneficiary: item.contributionReward.beneficiary,
      ethReward: new BN(item.contributionReward.ethReward),
      ethRewardLeft,
      externalToken: item.contributionReward.externalToken,
      externalTokenReward: new BN(item.contributionReward.externalTokenReward),
      externalTokenRewardLeft,
      nativeTokenReward: new BN(item.contributionReward.nativeTokenReward),
      nativeTokenRewardLeft,
      periodLength: Number(item.contributionReward.periodLength),
      periods: Number(item.contributionReward.periods),
      reputationChangeLeft,
      reputationReward: new BN(item.contributionReward.reputationReward)
    }
  }

  private static _fragment: { name: string, fragment: DocumentNode } | undefined

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
