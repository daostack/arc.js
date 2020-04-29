import BN from 'bn.js'
import { DocumentNode } from 'graphql'
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
    votingMachine: Address;
    voteParams: IGenesisProtocolParams;
    rewarder: Address;
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

export class ContributionRewardExt extends ProposalPlugin<
  IContributionRewardExtState,
  IContributionRewardExtProposalState,
  IProposalCreateOptionsCRExt
> {
  public static get fragment() {
    if (!this.fragmentField) {
      this.fragmentField = {
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
    }
    return this.fragmentField
  }

  public static itemMap(
    context: Arc,
    item: any,
    query: DocumentNode
  ): IContributionRewardExtState | null {
    if (!item) {
      Logger.debug(`ContributionRewardExt Plugin ItemMap failed. Query: ${query.loc?.source.body}`)
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

  private static fragmentField: { name: string; fragment: DocumentNode } | undefined

  public async createProposalTransaction(
    options: IProposalCreateOptionsCRExt
  ): Promise<ITransaction> {
    if (!options.proposer) {
      options.proposer = NULL_ADDRESS
    }

    options.descriptionHash = await this.context.saveIPFSData(options)

    const pluginId = options.plugin? options.plugin : this.id

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
