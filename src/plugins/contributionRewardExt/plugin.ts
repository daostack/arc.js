import BN from 'bn.js'
import { IPluginState, Plugin } from "../plugin"
import { IGenesisProtocolParams, mapGenesisProtocolParams } from "../../genesisProtocol"
import { IProposalBaseCreateOptions, IProposalQueryOptions } from "../proposal"
import { ProposalPlugin } from "../proposalPlugin"
import gql from "graphql-tag"
import { Arc } from "../../arc"
import { IApolloQueryOptions, Address } from "../../types"
import { Observable } from "rxjs"
import { ITransaction, ITransactionReceipt, getEventArgs, transactionErrorHandler } from "../../operation"
import { NULL_ADDRESS } from "../../utils"
import { ContributionRewardExtProposal } from "./proposal"

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

export class ContributionRewardExt extends ProposalPlugin {

  coreState: IContributionRewardExtState| undefined

  public static fragments = {
    pluginParams: { 
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
      }`
    }
  }

  constructor(context: Arc, idOrOpts: Address | IContributionRewardExtState) {
    super(context, idOrOpts)
    this.context = context
    if (typeof idOrOpts === 'string') {
      this.id = idOrOpts as string
      this.id = this.id.toLowerCase()
    } else {
      this.setState(idOrOpts)
      this.id = idOrOpts.id
    }
  }

  public static itemMap(arc: Arc, item: any): ContributionRewardExt | null {
    if (!item) {
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
        paramsHash: item.paramsHash,
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
      ${Plugin.baseFragment.PluginFields}
    `
    const itemMap = (item: any) => ContributionRewardExt.itemMap(this.context, item)
    return this.context.getObservableObject(query, itemMap, apolloQueryOptions) as Observable<IContributionRewardExtState>
  }

  public getPermissions(): Permissions {
    throw new Error("Method not implemented.");
  }

  public proposals(options: IProposalQueryOptions, apolloQueryOptions: IApolloQueryOptions): Observable<any[]> {
    throw new Error("Method not implemented.");
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

  public createProposalErrorHandler(options: IProposalCreateOptionsCRExt): transactionErrorHandler {
    throw new Error("Method not implemented.");
  }
  
}