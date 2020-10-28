// we cannot import from 'ethers/utils` as this will run into a compile error in react-native
import { utils } from 'ethers'
import gql from 'graphql-tag'
import {
  Address,
  Arc,
  getEventArgs,
  IGenesisProtocolParams,
  IInitParams,
  IPluginManagerProposalState,
  IPluginState,
  IProposalBaseCreateOptions,
  ITransaction,
  ITransactionReceipt,
  LATEST_ARC_VERSION,
  Logger,
  mapGenesisProtocolParams,
  PACKAGE_VERSION,
  Plugin,
  PluginManagerProposal,
  Plugins,
  ProposalPlugin,
  transactionResultHandler
} from '../../index'

/**
 * Note: using abi-decoder instead of ethers due to some unexplained issue
 * with ethers interface.functions.FUNCTIONNAME.decode().
 * This might be solved when shifting to ethers 5.0.
 */
const abiDecoder = require('abi-decoder')

export interface IPluginManagerState extends IPluginState {
  pluginParams: {
    votingMachine: Address
    voteParams: IGenesisProtocolParams
    daoFactory: Address
  }
}

export type IProposalCreateOptionsPM =
  IProposalCreateOptions<'GenericScheme'> |
  IProposalCreateOptions<'ContributionReward'> |
  IProposalCreateOptions<'Competition'> |
  IProposalCreateOptions<'ContributionRewardExt'> |
  IProposalCreateOptions<'FundingRequest'> |
  IProposalCreateOptions<'Join'> |
  IProposalCreateOptions<'SchemeRegistrar'> |
  IProposalCreateOptions<'SchemeFactory'> |
  IProposalCreateOptions<'ReputationFromToken'> |
  IProposalCreateOptions<'TokenTrade'>

export interface IProposalCreateOptions<TName extends keyof IInitParams>
extends IProposalBaseCreateOptions {
  add?: {
    permissions: string
    pluginName: TName
    pluginInitParams: IInitParams[TName]
  },
  remove?: {
    plugin: string
  }
}

export interface IInitParamsPM {
  daoId: string
  votingMachine: string
  votingParams: string[]
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

  public static initializeParamsMap(initParams: IInitParamsPM) {

    Object.keys(initParams).forEach((key) => {
      if (initParams[key] === undefined) {
        throw new Error(`PluginManager's initialize parameter '${key}' cannot be undefined`)
      }
    })

    return [
      initParams.daoId,
      initParams.votingMachine,
      initParams.votingParams,
      initParams.voteOnBehalf,
      initParams.voteParamsHash,
      initParams.daoFactory
    ]
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

  public decodeDataByPluginName = (pluginName: string, encodedData: string) => {
    if (pluginName === '' || pluginName === null) {
      return {}
    }
    let abi
    if (pluginName === 'Competition') {
      abi = this.context.getABI({
        abiName: 'ContributionRewardExt',
        version: LATEST_ARC_VERSION
      })
    } else {
      abi = this.context.getABI({
        abiName: pluginName,
        version: LATEST_ARC_VERSION
      })
    }

    abiDecoder.addABI(abi)
    return abiDecoder.decodeMethod(encodedData)
  }

  public async createProposalTransaction(options: IProposalCreateOptionsPM): Promise<ITransaction> {
    const args = []
    const { address: pluginAddress } = (await this.fetchState())

    if (options.add) {

      let abiInterface: utils.Interface

      if (options.add.pluginName === 'Competition') {
        abiInterface = new utils.Interface(this.context.getABI({
          abiName: 'ContributionRewardExt',
          version: LATEST_ARC_VERSION
        }))
      } else {
        abiInterface = new utils.Interface(this.context.getABI({
          abiName: options.add.pluginName,
          version: LATEST_ARC_VERSION
        }))
      }

      const initializeParams = Plugins[options.add.pluginName].initializeParamsMap(
        options.add.pluginInitParams as any
      )
      const pluginData = abiInterface.functions.initialize.encode(initializeParams)

      args.push(
        // NOTE: The next line is a workaround
        this.context.getContractInfo(pluginAddress).version.substring(9) <= '2' ? [0, 1, 2] : PACKAGE_VERSION,
        options.add.pluginName === 'Competition' ? 'ContributionRewardExt' : options.add.pluginName,
        pluginData,
        options.add.permissions
      )
    } else {
      args.push(
        [0, 0, 0],
        '',
        '0x0',
        '0x00000000'
      )
    }

    if (!options.descriptionHash) {
      options.descriptionHash = await this.context.saveIPFSData(options)
    }

    return {
      contract: this.context.getContract(pluginAddress),
      method: 'proposeScheme',
      args: [
        ...args,
        options.remove ? options.remove.plugin : '0x0000000000000000000000000000000000000000',
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
