import BN from 'bn.js'
import { DocumentNode } from 'graphql'
import gql from 'graphql-tag'
import { from, Observable } from 'rxjs'
import { concatMap } from 'rxjs/operators'
import {
  Address,
  Arc,
  ContributionRewardPlugin,
  IApolloQueryOptions,
  IProposalState,
  ITransaction,
  ITransactionReceipt,
  Logger,
  NULL_ADDRESS,
  Operation,
  Plugin,
  Proposal,
  REDEEMER_CONTRACT_VERSIONS,
  toIOperationObservable
} from '../../index'

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
      Logger.debug(`ContributionRewardProposal ItemMap failed. ${queriedId && `Could not find ContributionRewardProposal with id '${queriedId}'`}`)
      return null
    }

    const ethRewardLeft =
      (item.contributionReward.ethRewardLeft !== null &&
        new BN(item.contributionReward.ethRewardLeft)) ||
      null
    const externalTokenRewardLeft =
      (item.contributionReward.externalTokenRewardLeft !== null &&
        new BN(item.contributionReward.externalTokenRewardLeft)) ||
      null
    const nativeTokenRewardLeft =
      (item.contributionReward.nativeTokenRewardLeft !== null &&
        new BN(item.contributionReward.nativeTokenRewardLeft)) ||
      null
    const reputationChangeLeft =
      (item.contributionReward.reputationChangeLeft !== null &&
        new BN(item.contributionReward.reputationChangeLeft)) ||
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

  public redeemerContract() {
    for (const version of REDEEMER_CONTRACT_VERSIONS) {
      try {
        const contractInfo = this.context.getContractInfoByName('Redeemer', version)
        return this.context.getContract(contractInfo.address)
      } catch (err) {
        if (!err.message.match(/no contract/i)) {
          // if the contract cannot be found, try the next one
          throw err
        }
      }
    }
    throw Error(
      `No Redeemer contract could be found (search for versions ${REDEEMER_CONTRACT_VERSIONS})`
    )
  }

  public redeemRewards(beneficiary?: Address): Operation<boolean> {
    const mapReceipt = (receipt: ITransactionReceipt) => true

    const createTransaction = async (): Promise<ITransaction> => {
      if (!beneficiary) {
        beneficiary = NULL_ADDRESS
      }

      const state = await this.fetchState()
      const pluginState = await state.plugin.entity.fetchState()
      const pluginAddress = pluginState.address
      const method = 'redeem'
      const args = [pluginAddress, state.votingMachine, this.id, beneficiary]

      return {
        contract: this.redeemerContract(),
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
