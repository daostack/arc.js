import gql from 'graphql-tag'
import { Observable } from 'rxjs'
import {
  ITransaction,
  ITransactionReceipt,
  getEventArgs,
  SchemeRegistrarProposal,
  ISchemeRegistrarProposalState,
  ProposalPlugin,
  IProposalBaseCreateOptions,
  IGenesisProtocolParams,
  mapGenesisProtocolParams,
  IPluginState,
  Plugin,
  Arc,
  Address,
  IApolloQueryOptions
} from '../../index'
import { DocumentNode } from 'graphql'

export interface ISchemeRegistrarState extends IPluginState {
  pluginParams: {
    votingMachine: Address
    voteRemoveParams: IGenesisProtocolParams
    voteRegisterParams: IGenesisProtocolParams
  }
}

export interface IProposalCreateOptionsSR extends IProposalBaseCreateOptions {
  parametersHash?: string
  permissions?: string
  schemeToRegister?: Address
}

export class SchemeRegistrar extends ProposalPlugin<ISchemeRegistrarState, ISchemeRegistrarProposalState, IProposalCreateOptionsSR> {

  private static _fragment: { name: string, fragment: DocumentNode } | undefined

  public static get fragment () {
   if(!this._fragment){
    this._fragment = {
      name: 'SchemeRegistrarParams',
      fragment: gql` fragment SchemeRegistrarParams on ControllerScheme {
        schemeRegistrarParams {
          votingMachine
          voteRemoveParams {
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
          voteRegisterParams {
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
      }`
    }
  }

  return this._fragment

}

  public static itemMap(arc: Arc, item: any, query: DocumentNode): ISchemeRegistrarState | null {
    if (!item) {
      console.log(`SchemeRegistrar Plugin ItemMap failed. Query: ${query.loc?.source.body}`)
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

    const schemeRegistrarParams = item.schemeRegistrarParams && {
      voteRegisterParams: mapGenesisProtocolParams(item.schemeRegistrarParams.voteRegisterParams),
      voteRemoveParams: mapGenesisProtocolParams(item.schemeRegistrarParams.voteRemoveParams),
      votingMachine: item.schemeRegistrarParams.votingMachine
    }
    
    return {
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
        pluginParams: schemeRegistrarParams,
        version: item.version
      }
  }

  public state(apolloQueryOptions: IApolloQueryOptions = {}): Observable<ISchemeRegistrarState> {
    const query = gql`query SchemeStateById
      {
        controllerScheme (id: "${this.id}") {
          ...PluginFields
        }
      }
      ${Plugin.baseFragment}
    `
    return this.context.getObservableObject(this.context, query, SchemeRegistrar.itemMap, apolloQueryOptions) as Observable<ISchemeRegistrarState>
  }

  public async createProposalTransaction(options: IProposalCreateOptionsSR): Promise<ITransaction> {
    let msg: string
    switch (options.proposalType) {
      case "SchemeRegistrarAdd":
      case "SchemeRegistrarEdit":
        if (options.plugin === undefined) {
          msg = `Missing argument "plugin" for SchemeRegistrar in Proposal.create()`
          throw Error(msg)
        }
        if (options.parametersHash === undefined) {
          msg = `Missing argument "parametersHash" for SchemeRegistrar in Proposal.create()`
          throw Error(msg)
        }
        if (options.permissions === undefined) {
          msg = `Missing argument "permissions" for SchemeRegistrar in Proposal.create()`
          throw Error(msg)
        }
  
        options.descriptionHash = await this.context.saveIPFSData(options)
  
        return {
          contract: this.context.getContract(options.plugin),
          method: 'proposeScheme',
          args: [
            options.schemeToRegister,
            options.permissions,
            options.descriptionHash
          ]
        }
      case "SchemeRegistrarRemove":
        if (options.plugin === undefined) {
          msg = `Missing argument "scheme" for SchemeRegistrar`
          throw Error(msg)
        }
  
        options.descriptionHash = await this.context.saveIPFSData(options)
  
        return {
          contract: this.context.getContract(options.plugin),
          method: 'proposeToRemoveScheme',
          args: [
            options.dao,
            options.schemeToRegister,
            options.descriptionHash
          ]
        }
    }
    throw Error('For a schemeregistrar proposal, you must specifcy proposal.proposalType')
  }

  public createProposalTransactionMap (options: IProposalCreateOptionsSR) {
    return (receipt: ITransactionReceipt) => {
      let eventName: string
      switch (options.proposalType) {
        case "SchemeRegistrarAdd":
        case "SchemeRegistrarEdit":
          eventName = 'NewSchemeProposal'
          break
        case "SchemeRegistrarRemove":
          eventName = 'RemoveSchemeProposal'
          break
        default:
          throw Error(`SchemeRegistrar.createProposal: Unknown proposal type ${options.proposalType}`)
      }
      const args = getEventArgs(receipt, eventName, 'SchemeRegistrar.createProposal')
      const proposalId = args[1]
      return new SchemeRegistrarProposal(this.context, proposalId)
    }
  }

}