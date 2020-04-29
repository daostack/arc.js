import BN from 'bn.js'
import { DocumentNode } from 'graphql'
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
<<<<<<< HEAD
=======
  Logger,
>>>>>>> architecture-change
  mapGenesisProtocolParams,
  NULL_ADDRESS,
  Plugin,
  ProposalPlugin,
  transactionResultHandler
} from '../../index'

export interface IContributionRewardState extends IPluginState {
  pluginParams: {
    votingMachine: Address;
    voteParams: IGenesisProtocolParams;
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

<<<<<<< HEAD
export class ContributionReward extends ProposalPlugin<IContributionRewardState, IContributionRewardProposalState, IProposalCreateOptionsCR> {

  public static get fragment() {
    if (!this._fragment) {
      this._fragment = {
=======
export class ContributionReward extends ProposalPlugin<
  IContributionRewardState,
  IContributionRewardProposalState,
  IProposalCreateOptionsCR
> {
  public static get fragment() {
    if (!this.fragmentField) {
      this.fragmentField = {
>>>>>>> architecture-change
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
    }

    return this.fragmentField
  }

  public static itemMap(
    context: Arc,
    item: any,
    query: DocumentNode
  ): IContributionRewardState | null {
    if (!item) {
<<<<<<< HEAD
      console.log(`ContributionReward Plugin ItemMap failed. Query: ${query.loc && query.loc.source.body  }`)
=======
      Logger.debug(`ContributionReward Plugin ItemMap failed. Query: ${query.loc?.source.body}`)
>>>>>>> architecture-change
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

<<<<<<< HEAD
  private static _fragment: { name: string, fragment: DocumentNode } | undefined
=======
  private static fragmentField: { name: string; fragment: DocumentNode } | undefined
>>>>>>> architecture-change

  public async createProposalTransaction(options: IProposalCreateOptionsCR): Promise<ITransaction> {
    options.descriptionHash = await this.context.saveIPFSData(options)

    if (options.plugin === undefined) {
      throw new Error(`Missing argument "plugin" for ContributionReward in Proposal.create()`)
    }

    return {
      contract: this.context.getContract(options.plugin),
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
<<<<<<< HEAD

=======
>>>>>>> architecture-change
}
