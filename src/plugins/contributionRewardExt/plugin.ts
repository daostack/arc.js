import BN from 'bn.js'
import gql from 'graphql-tag'
import { Observable } from 'rxjs'
import {
  IPluginState,
  Plugin,
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
  IApolloQueryOptions,
  Address
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

  public static itemMap(arc: Arc, item: any, query: DocumentNode): ContributionRewardExt | null {
    if (!item) {
      console.log(`ContributionRewardExt Plugin ItemMap failed. Query: ${query.loc?.source.body}`)
      return null
    }

    let name = item.name
    if (!name) {

      try {
        name = arc.getContractInfo(item.address).name
      } catch (err) {
        if (err.message.match(/no contract/ig)) {
          // continue
        } else {
          throw err
        }
      }
    }

    const contributionRewardExtParams = item.contributionRewardExtParams && {
      rewarder: item.contributionRewardExtParams.rewarder,
      voteParams: mapGenesisProtocolParams(item.contributionRewardExtParams.voteParams),
      votingMachine: item.contributionRewardExtParams.votingMachine
    }
    
    return new ContributionRewardExt(arc, {
        address: item.address,
        canDelegateCall: item.canDelegateCall,
        canManageGlobalConstraints: item.canManageGlobalConstraints,
        canRegisterPlugins: item.canRegisterSchemes,
        canUpgradeController: item.canUpgradeController,
        dao: item.dao.id,
        id: item.id,
        name,
        numberOfBoostedProposals: Number(item.numberOfBoostedProposals),
        numberOfPreBoostedProposals: Number(item.numberOfPreBoostedProposals),
        numberOfQueuedProposals: Number(item.numberOfQueuedProposals),
        pluginParams: contributionRewardExtParams,
        version: item.version
      }
    )
  }

  public state(apolloQueryOptions: IApolloQueryOptions = {}): Observable<IContributionRewardExtState> {
    const query = gql`query SchemeStateById
      {
        controllerScheme (id: "${this.id}") {
          ...PluginFields
        }
      }
      ${Plugin.baseFragment}
    `
    return this.context.getObservableObject(this.context, query, ContributionRewardExt.itemMap, apolloQueryOptions) as Observable<IContributionRewardExtState>
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