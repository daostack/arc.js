import BN from 'bn.js'
import gql from 'graphql-tag'
import {
  IPluginState,
  IGenesisProtocolParams,
  mapGenesisProtocolParams,
  IProposalBaseCreateOptions,
  ProposalPlugin,
  Arc,
  ITransaction,
  ITransactionReceipt,
  getEventArgs,
  NULL_ADDRESS,
  ContributionRewardExtProposal,
  IContributionRewardExtProposalState,
  Address,
  Plugin
} from '../../index'
import { DocumentNode } from 'graphql'

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

export class ContributionRewardExt extends ProposalPlugin<
  IContributionRewardExtState, IContributionRewardExtProposalState, IProposalCreateOptionsCRExt
> {

  private static _fragment: { name: string, fragment: DocumentNode } | undefined

  public static get fragment () {
   if(!this._fragment){
    this._fragment = {
      name: 'ContributionRewardExtParams',
      fragment: gql` fragment ContributionRewardExtParams on ControllerScheme {
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
    }`
    }
  }
  return this._fragment
}

  public static itemMap(context: Arc, item: any, query: DocumentNode): IContributionRewardExtState | null {
    if (!item) {
      console.log(`ContributionRewardExt Plugin ItemMap failed. Query: ${query.loc?.source.body}`)
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
  
    if (options.plugin === undefined) {
      throw new Error(`Missing argument "plugin" for ContributionRewardExt in Proposal.create()`)
    }
  
    return {
      contract: this.context.getContract(options.plugin),
      method: 'proposeContributionReward',
      args: [
        options.descriptionHash || '',
        options.reputationReward && options.reputationReward.toString() || 0,
        [
          options.nativeTokenReward && options.nativeTokenReward.toString() || 0,
          options.ethReward && options.ethReward.toString() || 0,
          options.externalTokenReward && options.externalTokenReward.toString() || 0
        ],
        options.externalTokenAddress || NULL_ADDRESS,
        options.beneficiary,
        options.proposer
      ]
    }
  }
  
  public createProposalTransactionMap() {
    return (receipt: ITransactionReceipt) => {
      const args = getEventArgs(receipt, 'NewContributionProposal', 'ContributionRewardExt.createProposal')
      const proposalId = args[1]
      return new ContributionRewardExtProposal(this.context, proposalId)
    }
  }
  
}