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
  transactionResultHandler,
  InitParams,
  LATEST_ARC_VERSION
} from '../../index'
import { Interface } from 'ethers/utils'

export interface IPluginManagerState extends IPluginState {
  pluginParams: {
    votingMachine: Address
    voteParams: IGenesisProtocolParams
    daoFactory: Address
  }
}

//TODO: Type inference
export interface IProposalCreateOptionsPM
//<TName extends keyof InitParams> 
extends IProposalBaseCreateOptions {
  packageVersion: number[]
  permissions: string
  pluginName: keyof InitParams
  pluginData: any
  pluginToReplace?: string
}

export interface InitParamsPM {
  daoId: string
  votingMachine: string
  votingParams: number[]
  voteOnBehalf: string
  voteParamsHash: string
  daoFactory: string
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

      const abiInterface = new Interface(this.context.getABI({ abiName: options.pluginName, version: LATEST_ARC_VERSION }))
      const pluginData = abiInterface.functions.initialize.encode(options.pluginData)

      return {
        contract: this.context.getContract(pluginId),
        method: 'proposeScheme',
        args: [
          options.packageVersion,
          options.pluginName,
          pluginData,
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
