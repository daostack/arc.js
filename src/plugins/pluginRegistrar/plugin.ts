import gql from 'graphql-tag'
import {
  Address,
  Arc,
  getEventArgs,
  IGenesisProtocolParams,
  IPluginRegistrarProposalState,
  IPluginState,
  IProposalBaseCreateOptions,
  ITransaction,
  ITransactionReceipt,
  Logger,
  mapGenesisProtocolParams,
  PluginRegistrarProposal,
  ProposalPlugin
} from '../../index'

export interface IPluginRegistrarState extends IPluginState {
  pluginParams: {
    votingMachine: Address
    voteRemoveParams: IGenesisProtocolParams
    voteRegisterParams: IGenesisProtocolParams
  }
}

export interface IInitParamsSR {
  daoId: string
  votingMachine: string
  votingParamsRegister: string[]
  voteOnBehalfRegister: string
  voteRegisterParamsHash: string
  votingParamsRemove: string[]
  voteOnBehalfRemove: string
  voteRemoveParamsHash: string
}

export interface IProposalCreateOptionsSR extends IProposalBaseCreateOptions {
  parametersHash?: string
  permissions?: string
  pluginToRegister?: Address
}

export class PluginRegistrarPlugin extends ProposalPlugin<
  IPluginRegistrarState,
  IPluginRegistrarProposalState,
  IProposalCreateOptionsSR
> {
  public static fragment = {
    name: 'SchemeRegistrarParams',
    fragment: gql`
      fragment SchemeRegistrarParams on ControllerScheme {
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
      }
    `
  }

  public static initializeParamsMap(initParams: IInitParamsSR) {

    Object.keys(initParams).forEach((key) => {
      if (initParams[key] === undefined) {
        throw new Error(`PluginRegistrar's initialize parameter '${key}' cannot be undefined`)
      }
    })

    return [
      initParams.daoId,
      initParams.votingMachine,
      initParams.votingParamsRegister,
      initParams.voteOnBehalfRegister,
      initParams.voteRegisterParamsHash,
      initParams.votingParamsRemove,
      initParams.voteOnBehalfRemove,
      initParams.voteRemoveParamsHash
    ]
  }

  public static itemMap(arc: Arc, item: any, queriedId?: string): IPluginRegistrarState | null {
    if (!item) {
      Logger.debug(`PluginRegistrarPlugin ItemMap failed. ${queriedId ? `Could not find PluginRegistrarPlugin with id '${queriedId}'` : ''}`)
      return null
    }

    if (!item.schemeRegistrarParams) {
      throw new Error(`Plugin ${queriedId ? `with id '${queriedId}'` : ''}wrongly instantiated as PluginRegistrar Plugin`)
    }

    let name = item.name
    if (!name) {
      try {
        name = arc.getContractInfo(item.address).name
      } catch (err) {
        if (err.message.match(/no contract/gi)) {
          // continue
        } else {
          throw err
        }
      }
    }

    const pluginRegistrarParams = {
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
      pluginParams: pluginRegistrarParams,
      version: item.version,
      isRegistered: item.isRegistered
    }
  }

  public async createProposalTransaction(options: IProposalCreateOptionsSR): Promise<ITransaction> {
    let msg: string

    switch (options.type) {
      case 'SchemeRegistrarAdd':
        if (options.parametersHash === undefined) {
          msg = `Missing argument "parametersHash" for PluginRegistrar in Proposal.create()`
          throw Error(msg)
        }
        if (options.permissions === undefined) {
          msg = `Missing argument "permissions" for PluginRegistrar in Proposal.create()`
          throw Error(msg)
        }
        if (!options.descriptionHash) {
          options.descriptionHash = await this.context.saveIPFSData(options)
        }

        return {
          contract: this.context.getContract(options.plugin as string),
          method: 'proposeScheme',
          args: [options.pluginToRegister, options.permissions, options.descriptionHash]
        }
      case 'SchemeRegistrarRemove':
        if (!options.descriptionHash) {
          options.descriptionHash = await this.context.saveIPFSData(options)
        }

        return {
          contract: this.context.getContract(options.plugin as string),
          method: 'proposeToRemoveScheme',
          args: [options.pluginToRegister, options.descriptionHash]
        }
      default:
        throw Error(
          `PluginRegistrar.createProposalTransaction: Unknown proposal type ${options.type}`
        )
    }
  }

  public createProposalTransactionMap(options: IProposalCreateOptionsSR) {
    return (receipt: ITransactionReceipt) => {
      let eventName: string
      switch (options.type) {
        case 'SchemeRegistrarAdd':
          eventName = 'NewSchemeProposal'
          break
        case 'SchemeRegistrarRemove':
          eventName = 'RemoveSchemeProposal'
          break
        default:
          throw Error(
            `PluginRegistrar.createProposal: Unknown proposal type ${options.type}`
          )
      }
      const args = getEventArgs(receipt, eventName, 'PluginRegistrar.createProposal')
      const proposalId = args[1]
      return new PluginRegistrarProposal(this.context, proposalId)
    }
  }
}
