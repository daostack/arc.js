import { DocumentNode } from 'graphql'
import gql from 'graphql-tag'
import {
  Address,
  Arc,
  GenericSchemeProposal,
  getEventArgs,
  IGenericSchemeProposalState,
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

export interface IGenericSchemeState extends IPluginState {
  pluginParams: {
    votingMachine: Address;
    contractToCall: Address;
    voteParams: IGenesisProtocolParams;
  }
}

export interface IProposalCreateOptionsGS extends IProposalBaseCreateOptions {
  callData?: string
  value?: number
}

export class GenericScheme extends ProposalPlugin<
  IGenericSchemeState,
  IGenericSchemeProposalState,
  IProposalCreateOptionsGS
> {
  public static get fragment() {
    if (!this.fragmentField) {
      this.fragmentField = {
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
    }

    return this.fragmentField
  }

  public static itemMap(context: Arc, item: any, query: DocumentNode): IGenericSchemeState | null {
    if (!item) {
      Logger.debug(`GenericScheme Plugin ItemMap failed. Query: ${query.loc?.source.body}`)
      return null
    }

    const baseState = Plugin.itemMapToBaseState(context, item)

    const genericpluginParams = item.genericpluginParams && {
      contractToCall: item.genericpluginParams.contractToCall,
      voteParams: mapGenesisProtocolParams(item.genericpluginParams.voteParams),
      votingMachine: item.genericpluginParams.votingMachine
    }

    return {
      ...baseState,
      pluginParams: genericpluginParams
    }
  }

  private static fragmentField: { name: string; fragment: DocumentNode } | undefined

  public async createProposalTransaction(options: IProposalCreateOptionsGS): Promise<ITransaction> {
    if (options.callData === undefined) {
      throw new Error(`Missing argument "callData" for GenericScheme in Proposal.create()`)
    }
    if (options.value === undefined) {
      throw new Error(`Missing argument "value" for GenericScheme in Proposal.create()`)
    }

    const pluginId = options.plugin? options.plugin : this.id

    options.descriptionHash = await this.context.saveIPFSData(options)

    return {
      contract: this.context.getContract(pluginId),
      method: 'proposeCall',
      args: [options.callData, options.value, options.descriptionHash]
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
