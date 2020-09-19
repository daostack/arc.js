import { BigNumber } from 'ethers'
import gql from 'graphql-tag'
import { Observable } from 'rxjs'
import {
  Address,
  Arc,
  ContributionRewardExtPlugin,
  IApolloQueryOptions,
  IProposalState,
  Logger,
  Plugin,
  Proposal
} from '../../index'

export interface IContributionRewardExtProposalState extends IProposalState {
  beneficiary: Address
  externalTokenReward: BigNumber
  externalToken: Address
  ethReward: BigNumber
  nativeTokenReward: BigNumber
  periods: number
  periodLength: number
  reputationReward: BigNumber
  alreadyRedeemedNativeTokenPeriods: number
  alreadyRedeemedReputationPeriods: number
  alreadyRedeemedExternalTokenPeriods: number
  alreadyRedeemedEthPeriods: number
  reputationChangeLeft: BigNumber | null
  nativeTokenRewardLeft: BigNumber | null
  ethRewardLeft: BigNumber | null
  externalTokenRewardLeft: BigNumber | null
}

export class ContributionRewardExtProposal extends Proposal<IContributionRewardExtProposalState> {
  public static itemMap(
    context: Arc,
    item: any,
    queriedId?: string
  ): IContributionRewardExtProposalState | null {
    if (!item) {
      Logger.debug(
        `ContributionRewardProposal ItemMap failed.
          ${queriedId ? `Could not find ContributionRewardProposal with id '${queriedId}'` : ''}`
      )
      return null
    }

    const ethRewardLeft =
      (item.contributionReward.ethRewardLeft !== null &&
        BigNumber.from(item.contributionReward.ethRewardLeft)) ||
      null
    const externalTokenRewardLeft =
      (item.contributionReward.externalTokenRewardLeft !== null &&
        BigNumber.from(item.contributionReward.externalTokenRewardLeft)) ||
      null
    const nativeTokenRewardLeft =
      (item.contributionReward.nativeTokenRewardLeft !== null &&
        BigNumber.from(item.contributionReward.nativeTokenRewardLeft)) ||
      null
    const reputationChangeLeft =
      (item.contributionReward.reputationChangeLeft !== null &&
        BigNumber.from(item.contributionReward.reputationChangeLeft)) ||
      null

    const contributionRewardExtState = ContributionRewardExtPlugin.itemMap(context, item.scheme, queriedId)

    if (!contributionRewardExtState) {
      return null
    }

    const contributionRewardExt = new ContributionRewardExtPlugin(context, contributionRewardExtState)
    const contributionRewardExtProposal = new ContributionRewardExtProposal(context, item.id)

    const baseState = Proposal.itemMapToBaseState(
      context,
      item,
      contributionRewardExt,
      contributionRewardExtProposal,
      'ContributionRewardExt'
    )

    if (baseState == null) {
      return null
    }

    return {
      ...baseState,
      alreadyRedeemedEthPeriods: Number(item.contributionReward.alreadyRedeemedEthPeriods),
      alreadyRedeemedExternalTokenPeriods: Number(
        item.contributionReward.alreadyRedeemedExternalTokenPeriods
      ),
      alreadyRedeemedNativeTokenPeriods: Number(
        item.contributionReward.alreadyRedeemedNativeTokenPeriods
      ),
      alreadyRedeemedReputationPeriods: Number(
        item.contributionReward.alreadyRedeemedReputationPeriods
      ),
      beneficiary: item.contributionReward.beneficiary,
      ethReward: BigNumber.from(item.contributionReward.ethReward),
      ethRewardLeft,
      externalToken: item.contributionReward.externalToken,
      externalTokenReward: BigNumber.from(item.contributionReward.externalTokenReward),
      externalTokenRewardLeft,
      nativeTokenReward: BigNumber.from(item.contributionReward.nativeTokenReward),
      nativeTokenRewardLeft,
      periodLength: Number(item.contributionReward.periodLength),
      periods: Number(item.contributionReward.periods),
      reputationChangeLeft,
      reputationReward: BigNumber.from(item.contributionReward.reputationReward)
    }
  }

  public state(
    apolloQueryOptions: IApolloQueryOptions
  ): Observable<IContributionRewardExtProposalState> {
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
      this.context,
      query,
      ContributionRewardExtProposal.itemMap,
      this.id,
      apolloQueryOptions
    ) as Observable<IContributionRewardExtProposalState>
    return result
  }
}
