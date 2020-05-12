import gql from 'graphql-tag'
import {
  Address,
  Arc,
  GenericPluginProposal,
  getEventArgs,
  IGenericPluginProposalState,
  IGenesisProtocolParams,
  IPluginState,
  IProposalBaseCreateOptions,
  ITransaction,
  ITransactionReceipt,
  Logger,
  mapGenesisProtocolParams,
  Plugin,
  ProposalPlugin,
  transactionResultHandler
} from '../../index'

export interface IGenericPluginState extends IPluginState {
  pluginParams: {
    votingMachine: Address
    contractToCall: Address
    voteParams: IGenesisProtocolParams
  }
}

export interface IProposalCreateOptionsGS extends IProposalBaseCreateOptions {
  callData?: string
  value?: number
}

export class GenericPlugin extends ProposalPlugin<
  IGenericPluginState,
  IGenericPluginProposalState,
  IProposalCreateOptionsGS
> {
  public static fragment = {
    name: 'GenericpluginParams',
    fragment: gql`
      fragment GenericpluginParams on ControllerScheme {
        genericSchemeParams {
          votingMachine
          contractToCall
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

  public static itemMap(context: Arc, item: any, queriedId?: string): IGenericPluginState | null {
    if (!item) {
      Logger.debug(`GenericPlugin ItemMap failed.
       ${queriedId ? `Could not find GenericPlugin with id '${queriedId}'` : ''}`)
      return null
    }

    if (!item.genericSchemeParams) {
      throw new Error(`Plugin ${queriedId ? `with id '${queriedId}'` : ''}wrongly instantiated as Generic Plugin`)
    }

    const baseState = Plugin.itemMapToBaseState(context, item)

    const genericpluginParams = {
      contractToCall: item.genericSchemeParams.contractToCall,
      voteParams: mapGenesisProtocolParams(item.genericSchemeParams.voteParams),
      votingMachine: item.genericSchemeParams.votingMachine
    }

    return {
      ...baseState,
      pluginParams: genericpluginParams
    }
  }

  public async createProposalTransaction(options: IProposalCreateOptionsGS): Promise<ITransaction> {
    if (options.callData === undefined) {
      throw new Error(`Missing argument "callData" for GenericPlugin in Proposal.create()`)
    }
    if (options.value === undefined) {
      throw new Error(`Missing argument "value" for GenericPlugin in Proposal.create()`)
    }

    options.descriptionHash = await this.context.saveIPFSData(options)

    return {
      contract: this.context.getContract(options.plugin as string),
      method: 'proposeCall',
      args: [options.callData, options.value, options.descriptionHash]
    }
  }

  public createProposalTransactionMap(): transactionResultHandler<any> {
    return async (receipt: ITransactionReceipt) => {
      const args = getEventArgs(receipt, 'NewCallProposal', 'GenericPlugin.createProposal')
      const proposalId = args[1]
      return new GenericPluginProposal(this.context, proposalId)
    }
  }
}
