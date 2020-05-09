import gql from 'graphql-tag'
import {
  Address,
  Arc,
  getEventArgs,
  IGenesisProtocolParams,
  IPluginManagerProposalState,
  IPluginState,
  IProposalBaseCreateOptions,
  ITransaction,
  ITransactionReceipt,
  Logger,
  mapGenesisProtocolParams,
  Plugin,
  PluginManagerProposal,
  ProposalPlugin,
  transactionResultHandler
} from '../../index'

export interface IPluginManagerState extends IPluginState {
  pluginParams: {
    votingMachine: Address
    voteParams: IGenesisProtocolParams
    daoFactory: Address
  }
}

export interface IProposalCreateOptionsPM extends IProposalBaseCreateOptions {
  packageVersion: number[]
  permissions: string
  pluginName: string
  pluginData: string
  pluginToReplace?: string
}

export class PluginManagerPlugin extends ProposalPlugin<
  IPluginManagerState,
  IPluginManagerProposalState,
  IProposalCreateOptionsPM
> {
  public static fragment = {
    name: 'PluginManagerParams',
    fragment: gql`
      fragment PluginManagerParams on ControllerScheme {
        schemeFactoryParams {
          votingMachine
          daoFactory
          voteParams {
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

  public static itemMap(context: Arc, item: any, queriedId?: string): IPluginManagerState | null {
    if (!item) {
      Logger.debug(`PluginManagerPlugin ItemMap failed.
        ${queriedId && `Could not find PluginManagerPlugin with id '${queriedId}'`}`)
      return null
    }

    const baseState = Plugin.itemMapToBaseState(context, item)

    const schemeFactoryParams = item.schemeFactoryParams && {
      daoFactory: item.schemeFactoryParams.daoFactory,
      voteParams: mapGenesisProtocolParams(item.schemeFactoryParams.voteParams),
      votingMachine: item.schemeFactoryParams.votingMachine
    }

    return {
      ...baseState,
      pluginParams: schemeFactoryParams
    }
  }

  public async createProposalTransaction(options: IProposalCreateOptionsPM): Promise<ITransaction> {

      options.descriptionHash = await this.context.saveIPFSData(options)

      const pluginId = (await this.fetchState()).address

      return {
        contract: this.context.getContract(pluginId),
        method: 'proposeScheme',
        args: [
          options.packageVersion,
          options.pluginName,
          options.pluginData,
          options.permissions,
          options.pluginToReplace,
          options.descriptionHash
        ]
      }
    }

  public createProposalTransactionMap(): transactionResultHandler<any> {
    return async (receipt: ITransactionReceipt) => {
      const args = getEventArgs(receipt, 'NewSchemeProposal', 'PluginManager.createProposal')
      const proposalId = args[1]
      return new PluginManagerProposal(this.context, proposalId)
    }
  }
}
