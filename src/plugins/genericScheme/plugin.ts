
import gql from 'graphql-tag'
import {
  IPluginState,
  IGenesisProtocolParams,
  mapGenesisProtocolParams,
  IProposalBaseCreateOptions,
  ProposalPlugin,
  Arc,
  ITransaction,
  transactionResultHandler,
  ITransactionReceipt,
  getEventArgs,
  GenericSchemeProposal,
  IGenericSchemeProposalState,
  Address,
  Plugin
} from '../../index'
import { DocumentNode } from 'graphql'

export interface IGenericSchemeState extends IPluginState {
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

export class GenericScheme extends ProposalPlugin<IGenericSchemeState, IGenericSchemeProposalState, IProposalCreateOptionsGS> {

  private static _fragment: { name: string, fragment: DocumentNode } | undefined

  public static get fragment () {
   if(!this._fragment){
    this._fragment = {
      name: 'GenericpluginParams',
      fragment: gql` fragment GenericpluginParams on ControllerScheme {
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
    }`
    }
  }

  return this._fragment

}

  public static itemMap(context: Arc, item: any, query: DocumentNode): IGenericSchemeState | null {
    if (!item) {
      console.log(`GenericScheme Plugin ItemMap failed. Query: ${query.loc?.source.body}`)
      return null
    }

    const baseState = Plugin.itemMapToBaseState(context, item)

    const genericpluginParams = item.genericpluginParams  && {
      contractToCall: item.genericpluginParams.contractToCall,
      voteParams: mapGenesisProtocolParams(item.genericpluginParams.voteParams),
      votingMachine: item.genericpluginParams.votingMachine
    }

    return {
        ...baseState,
        pluginParams: genericpluginParams
      }
  }

  public async createProposalTransaction(options: IProposalCreateOptionsGS): Promise<ITransaction> {
    if (options.callData === undefined) {
      throw new Error(`Missing argument "callData" for GenericScheme in Proposal.create()`)
    }
    if (options.value === undefined) {
      throw new Error(`Missing argument "value" for GenericScheme in Proposal.create()`)
    }
    if (options.plugin === undefined) {
      throw new Error(`Missing argument "plugin" for GenericScheme in Proposal.create()`)
    }
  
    options.descriptionHash = await this.context.saveIPFSData(options)
  
    return {
      contract: this.context.getContract(options.plugin),
      method: 'proposeCall',
      args: [
        options.callData,
        options.value,
        options.descriptionHash
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