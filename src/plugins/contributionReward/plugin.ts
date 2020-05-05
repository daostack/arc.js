import BN from 'bn.js'
import gql from 'graphql-tag'
import {
  Address,
  Arc,
  ContributionRewardProposal,
  getEventArgs,
  IContributionRewardProposalState,
  IGenesisProtocolParams,
  IPluginState,
  IProposalBaseCreateOptions,
  ITransaction,
  ITransactionReceipt,
  Logger,
  mapGenesisProtocolParams,
  NULL_ADDRESS,
  Plugin,
  ProposalPlugin,
  transactionResultHandler
} from '../../index'

export interface IContributionRewardState extends IPluginState {
  pluginParams: {
    votingMachine: Address
    voteParams: IGenesisProtocolParams
  }
}

export interface IProposalCreateOptionsCR extends IProposalBaseCreateOptions {
  beneficiary: Address
  nativeTokenReward?: BN
  reputationReward?: BN
  ethReward?: BN
  externalTokenReward?: BN
  externalTokenAddress?: Address
  periodLength?: number
  periods?: any
}

export class ContributionRewardPlugin extends ProposalPlugin<
  IContributionRewardState,
  IContributionRewardProposalState,
  IProposalCreateOptionsCR
> {
  public static fragment = {
    name: 'ContributionRewardParams',
    fragment: gql`
      fragment ContributionRewardParams on ControllerScheme {
        contributionRewardParams {
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
        }
      }
    `
  }

  public static itemMap(
    context: Arc,
    item: any,
    queriedId?: string
  ): IContributionRewardState | null {
    if (!item) {
      Logger.debug(`ContributionRewardPlugin ItemMap failed. ${queriedId && `Could not find ContributionRewardPlugin with id '${queriedId}'`}`)
      return null
    }

    const baseState = Plugin.itemMapToBaseState(context, item)

    const contributionRewardParams = item.contributionRewardParams && {
      voteParams: mapGenesisProtocolParams(item.contributionRewardParams.voteParams),
      votingMachine: item.contributionRewardParams.votingMachine
    }

    return {
      ...baseState,
      pluginParams: contributionRewardParams
    }
  }

  public async createProposalTransaction(options: IProposalCreateOptionsCR): Promise<ITransaction> {
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
          (options.externalTokenReward && options.externalTokenReward.toString()) || 0,
          options.periodLength || 0,
          options.periods || 1
        ],
        options.externalTokenAddress || NULL_ADDRESS,
        options.beneficiary
      ]
    }
  }

  public createProposalTransactionMap(): transactionResultHandler<any> {
    return async (receipt: ITransactionReceipt) => {
      const args = getEventArgs(
        receipt,
        'NewContributionProposal',
        'ContributionReward.createProposal'
      )
      const proposalId = args[1]
      return new ContributionRewardProposal(this.context, proposalId)
    }
  }
}
