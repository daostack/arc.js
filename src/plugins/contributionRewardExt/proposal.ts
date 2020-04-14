import BN from 'bn.js'
import { Proposal, IProposalState } from "../proposal";
import { Address, IApolloQueryOptions } from "../../types";
import { Arc } from "../../arc";
import { Plugin } from '../plugin'
import { Observable } from "rxjs";
import gql from "graphql-tag";
import { ContributionRewardProposal } from '../contributionReward/proposal';
import { ContributionRewardExt } from './plugin';

export interface IContributionRewardExtProposalState extends IProposalState { 
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

export class ContributionRewardExtProposal extends Proposal<IContributionRewardExtProposalState> {

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
    
    const contributionRewardExt = ContributionRewardExt.itemMap(context, item) as ContributionRewardExt
    const contributionRewardExtProposal = new ContributionRewardExtProposal(context, item.id)

    const baseState = Proposal.itemMapToBaseState(
      context,
      item,
      contributionRewardExt,
      contributionRewardExtProposal,
      "ContributionRewardExt"
    )

    if(baseState == null) return null
    
    const state: IContributionRewardExtProposalState = {
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

    return new ContributionRewardExtProposal(context, state)
  }

  public state(apolloQueryOptions: IApolloQueryOptions): Observable<IContributionRewardExtProposalState> {
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

    const result = this.context.getObservableObject(this.context, query, ContributionRewardExtProposal.itemMap, apolloQueryOptions) as Observable<IContributionRewardExtProposalState>
    return result
  }

}