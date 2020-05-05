import BN from 'bn.js'
import gql from 'graphql-tag'
import { Observable } from 'rxjs'
import {
  Address,
  Arc,
  ContributionRewardExtProposal,
  getEventArgs,
  IContributionRewardExtProposalState,
  IGenesisProtocolParams,
  IPluginState,
  IProposalBaseCreateOptions,
  ITransaction,
  ITransactionReceipt,
  Logger,
  mapGenesisProtocolParams,
  NULL_ADDRESS,
  Plugin,
  ProposalPlugin
} from '../../index'

export interface IContributionRewardExtState extends IPluginState {
  pluginParams: {
    votingMachine: Address
    voteParams: IGenesisProtocolParams
    rewarder: Address
  }
}

export interface IProposalCreateOptionsCRExt extends IProposalBaseCreateOptions {
  beneficiary: Address
  nativeTokenReward?: BN
  reputationReward?: BN
  ethReward?: BN
  externalTokenReward?: BN
  externalTokenAddress?: Address
  proposer: Address
}

export class ContributionRewardExtPlugin extends ProposalPlugin<
  IContributionRewardExtState,
  IContributionRewardExtProposalState,
  IProposalCreateOptionsCRExt
> {
  public static fragment = {
    name: 'ContributionRewardExtParams',
    fragment: gql`
      fragment ContributionRewardExtParams on ControllerScheme {
        contributionRewardExtParams {
          id
          votingMachine
          voteParams {
            id
            queuedVoteRequiredPercentage
            queuedVotePeriodLimit
            boostedVotePeriodLimit
            preBoostedVotePeriodLimit
            thresholdConst
            limitExponentValue
            quietEndingPeriod
            proposingRepReward
            votersReputationLossRatio
            minimumDaoBounty
            daoBountyConst
            activationTime
            voteOnBehalf
          }
          rewarder
        }
      }
    `
  }

  public static itemMap(
    context: Arc,
    item: any,
    queriedId?: string
  ): IContributionRewardExtState | null {
    if (!item) {
      Logger.debug(`ContributionRewardExtPlugin ItemMap failed. ${queriedId && `Could not find ContributionRewardExtPlugin with id '${queriedId}'`}`)
      return null
    }

    const baseState = Plugin.itemMapToBaseState(context, item)

    const contributionRewardExtParams = item.contributionRewardExtParams && {
      rewarder: item.contributionRewardExtParams.rewarder,
      voteParams: mapGenesisProtocolParams(item.contributionRewardExtParams.voteParams),
      votingMachine: item.contributionRewardExtParams.votingMachine
    }

    return {
      ...baseState,
      pluginParams: contributionRewardExtParams
    }
  }

  public async createProposalTransaction(
    options: IProposalCreateOptionsCRExt
  ): Promise<ITransaction> {
    if (!options.proposer) {
      options.proposer = NULL_ADDRESS
    }

    options.descriptionHash = await this.context.saveIPFSData(options)

    const pluginId = options.plugin ? options.plugin : this.id

    return {
      contract: this.context.getContract(pluginId),
      method: 'proposeContributionReward',
      args: [
        options.descriptionHash || '',
        (options.reputationReward && options.reputationReward.toString()) || 0,
        [
          (options.nativeTokenReward && options.nativeTokenReward.toString()) || 0,
          (options.ethReward && options.ethReward.toString()) || 0,
          (options.externalTokenReward && options.externalTokenReward.toString()) || 0
        ],
        options.externalTokenAddress || NULL_ADDRESS,
        options.beneficiary,
        options.proposer
      ]
    }
  }

  public createProposalTransactionMap() {
    return (receipt: ITransactionReceipt) => {
      const args = getEventArgs(
        receipt,
        'NewContributionProposal',
        'ContributionRewardExt.createProposal'
      )
      const proposalId = args[1]
      return new ContributionRewardExtProposal(this.context, proposalId)
    }
  }

  public async ethBalance(): Promise<Observable<BN>> {
    let state

    if (!this.coreState) {
      state = await this.fetchState()
    } else {
      state = this.coreState
    }

    const contributionRewardExt = this.context.getContract(state.address)
    return this.context.ethBalance(await contributionRewardExt.vault())
  }
}
