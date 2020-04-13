import BN from 'bn.js'
import { IProposalState, Proposal } from '../proposal'
import { Arc } from '../../arc'
import { ContributionReward } from './plugin'
import { IApolloQueryOptions, Address } from '../../types'
import { Observable } from 'rxjs'
import gql from 'graphql-tag'
import { Plugin } from '../plugin'


export interface IContributionRewardProposalState extends IProposalState { 
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

export class ContributionRewardProposal extends Proposal {

  public static fragment = {
    name: 'ContributionRewardProposalFields',
    fragment: gql`
      fragment ContributionRewardProposalFields on Proposal {
        contributionReward {
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

  coreState: IContributionRewardProposalState| undefined

  static itemMap (context: Arc, item: any): ContributionRewardProposal | null {

    if (item === null || item === undefined) return null

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
    
    const contributionReward = ContributionReward.itemMap(context, item) as ContributionReward
    const contributionRewardProposal = new ContributionRewardProposal(context, item.id)

    const baseState = Proposal.itemMapToBaseState(
      context,
      item,
      contributionReward,
      contributionRewardProposal,
      "ContributionReward"
    )

    if(baseState == null) return null
    
    const state: IContributionRewardProposalState = {
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

    return new ContributionRewardProposal(context, state)
  }

  public state(apolloQueryOptions: IApolloQueryOptions): Observable<IProposalState> {
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

    const itemMap = (item: any) => ContributionRewardProposal.itemMap(this.context, item)

    const result = this.context.getObservableObject(this.context, query, itemMap, apolloQueryOptions) as Observable<IContributionRewardProposalState>
    return result
  }

}