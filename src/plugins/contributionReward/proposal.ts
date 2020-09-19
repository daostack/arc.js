import { BigNumber } from 'ethers'
import { DocumentNode } from 'graphql'
import gql from 'graphql-tag'
import { Observable } from 'rxjs'
import {
  Address,
  Arc,
  ContributionRewardPlugin,
  IApolloQueryOptions,
  IProposalState,
  Logger,
  Plugin,
  Proposal
} from '../../index'

export interface IContributionRewardProposalState extends IProposalState {
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

export class ContributionRewardProposal extends Proposal<IContributionRewardProposalState> {
  public static get fragment() {
    if (!this.fragmentField) {
      this.fragmentField = {
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
    }

    return this.fragmentField
  }

  public static itemMap(
    context: Arc,
    item: any,
    queriedId?: string
  ): IContributionRewardProposalState | null {
    if (!item) {
      Logger.debug(`ContributionRewardProposal ItemMap failed. ${queriedId ? `Could not find ContributionRewardProposal with id '${queriedId}'` : ''}`)
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

    const contributionRewardState = ContributionRewardPlugin.itemMap(context, item.scheme, queriedId)

    if (!contributionRewardState) {
      return null
    }

    const contributionReward = new ContributionRewardPlugin(context, contributionRewardState)
    const contributionRewardProposal = new ContributionRewardProposal(context, item.id)

    const baseState = Proposal.itemMapToBaseState(
      context,
      item,
      contributionReward,
      contributionRewardProposal,
      'ContributionReward'
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

  private static fragmentField: {
    name: string
    fragment: DocumentNode
  } | undefined

  public state(
    apolloQueryOptions: IApolloQueryOptions
  ): Observable<IContributionRewardProposalState> {
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
      ContributionRewardProposal.itemMap,
      this.id,
      apolloQueryOptions
    ) as Observable<IContributionRewardProposalState>
    return result
  }
}
