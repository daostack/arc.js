import gql from 'graphql-tag'
import {
  Address,
  Arc,
  getEventArgs,
  IGenesisProtocolParams,
  IPluginState,
  IProposalBaseCreateOptions,
  ISchemeRegistrarProposalState,
  ITransaction,
  ITransactionReceipt,
  Logger,
  mapGenesisProtocolParams,
  ProposalPlugin,
  SchemeRegistrarProposal
} from '../../index'

export interface ISchemeRegistrarState extends IPluginState {
  pluginParams: {
    votingMachine: Address
    voteRemoveParams: IGenesisProtocolParams
    voteRegisterParams: IGenesisProtocolParams
  }
}

export interface IProposalCreateOptionsSR extends IProposalBaseCreateOptions {
  proposalType: 'SchemeRegistrarAdd' | 'SchemeRegistrarEdit' | 'SchemeRegistrarRemove'
  parametersHash?: string
  permissions?: string
  pluginToRegister?: Address
}

export class SchemeRegistrarPlugin extends ProposalPlugin<
  ISchemeRegistrarState,
  ISchemeRegistrarProposalState,
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

  public static itemMap(arc: Arc, item: any, queriedId?: string): ISchemeRegistrarState | null {
    if (!item) {
      Logger.debug(`SchemeRegistrarPlugin ItemMap failed. ${queriedId && `Could not find SchemeRegistrarPlugin with id '${queriedId}'`}`)
      return null
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

  public async createProposalTransaction(options: IProposalCreateOptionsSR): Promise<ITransaction> {
    let msg: string

    const pluginId = options.plugin ? options.plugin : this.id

    switch (options.proposalType) {
      case 'SchemeRegistrarAdd':
      case 'SchemeRegistrarEdit':
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
          contract: this.context.getContract(pluginId),
          method: 'proposeScheme',
          args: [options.pluginToRegister, options.permissions, options.descriptionHash]
        }
      case 'SchemeRegistrarRemove':

        options.descriptionHash = await this.context.saveIPFSData(options)

        return {
          contract: this.context.getContract(pluginId),
          method: 'proposeToRemoveScheme',
          args: [options.pluginToRegister, options.descriptionHash]
        }
    }
  }

  public createProposalTransactionMap(options: IProposalCreateOptionsSR) {
    return (receipt: ITransactionReceipt) => {
      let eventName: string
      switch (options.proposalType) {
        case 'SchemeRegistrarAdd':
        case 'SchemeRegistrarEdit':
          eventName = 'NewSchemeProposal'
          break
        case 'SchemeRegistrarRemove':
          eventName = 'RemoveSchemeProposal'
          break
        default:
          throw Error(
            `SchemeRegistrar.createProposal: Unknown proposal type ${options.proposalType}`
          )
      }
      const args = getEventArgs(receipt, eventName, 'SchemeRegistrar.createProposal')
      const proposalId = args[1]
      return new SchemeRegistrarProposal(this.context, proposalId)
    }
  }
}
