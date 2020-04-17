import BN from 'bn.js'
import { Observable } from 'rxjs'
import gql from 'graphql-tag'
import {
  IProposalBaseCreateOptions,
  ProposalPlugin,
  Arc,
  GenericSchemeProposal,
  IGenesisProtocolParams,
  mapGenesisProtocolParams,
  IPluginState,
  Plugin,
  ITransaction,
  transactionResultHandler,
  ITransactionReceipt,
  getEventArgs,
  NULL_ADDRESS,
  IContributionRewardProposalState,
  Address,
  IApolloQueryOptions
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

export class ContributionReward extends ProposalPlugin<IContributionRewardState, IContributionRewardProposalState, IProposalCreateOptionsCR> {

  public static fragment = {
    name: 'ContributionRewardParams',
    fragment: gql` fragment ContributionRewardParams on ControllerScheme {
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
    }`
  }

  public static itemMap(arc: Arc, item: any): ContributionReward | null {
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

    const contributionRewardParams = item.contributionRewardParams && {
      voteParams: mapGenesisProtocolParams(item.contributionRewardParams.voteParams),
      votingMachine: item.contributionRewardParams.votingMachine
    }
    
    return new ContributionReward(arc, {
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
        pluginParams: contributionRewardParams,
        version: item.version
      }
    )
  }

  public state(apolloQueryOptions: IApolloQueryOptions = {}): Observable<IContributionRewardState> {
    const query = gql`query SchemeStateById
      {
        controllerScheme (id: "${this.id}") {
          ...PluginFields
        }
      }
      ${Plugin.baseFragment}
    `

    return this.context.getObservableObject(this.context, query, ContributionReward.itemMap, apolloQueryOptions) as Observable<IContributionRewardState>
  }

  public async createProposalTransaction(options: IProposalCreateOptionsCR): Promise<ITransaction> {
    options.descriptionHash = await this.context.saveIPFSData(options)
  
    if (options.plugin === undefined) {
      throw new Error(`Missing argument "plugin" for ContributionReward in Proposal.create()`)
    }
  
    return {
      contract: this.context.getContract(options.plugin),
      method: 'proposeContributionReward',
      args: [
        options.dao,
        options.descriptionHash || '',
        options.reputationReward && options.reputationReward.toString() || 0,
        [
          options.nativeTokenReward && options.nativeTokenReward.toString() || 0,
          options.ethReward && options.ethReward.toString() || 0,
          options.externalTokenReward && options.externalTokenReward.toString() || 0,
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
      const args = getEventArgs(receipt, 'NewCallProposal', 'GenericScheme.createProposal')
      const proposalId = args[1]
      return new GenericSchemeProposal(this.context, proposalId)
    }
  }
  
}