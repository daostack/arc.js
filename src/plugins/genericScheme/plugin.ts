
import gql from "graphql-tag";
import { IPluginState, Plugin } from "../plugin";
import { IGenesisProtocolParams, mapGenesisProtocolParams } from "../../genesisProtocol";
import { IProposalBaseCreateOptions } from "../proposal";
import { ProposalPlugin } from "../proposalPlugin";
import { Arc } from "../../arc";
import { IApolloQueryOptions, Address } from "../../types";
import { Observable } from "rxjs";
import { ITransaction, transactionResultHandler, ITransactionReceipt, getEventArgs } from "../../operation";
import { GenericSchemeProposal, IGenericSchemeProposalState } from "./proposal";

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

  public static fragment = {
    name: 'GenericpluginParams',
    fragment: gql` fragment GenericpluginParams on ControllerScheme {
    genericpluginParams {
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
    }`
  }

  public static itemMap(arc: Arc, item: any): GenericScheme | null {
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

    const genericpluginParams = item.genericpluginParams  && {
      contractToCall: item.genericpluginParams.contractToCall,
      voteParams: mapGenesisProtocolParams(item.genericpluginParams.voteParams),
      votingMachine: item.genericpluginParams.votingMachine
    }
    
    return new GenericScheme(arc, {
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
        pluginParams: genericpluginParams,
        version: item.version
      }
    )
  }

  public state(apolloQueryOptions: IApolloQueryOptions = {}): Observable<IGenericSchemeState> {
    const query = gql`query SchemeStateById
      {
        controllerScheme (id: "${this.id}") {
          ...PluginFields
        }
      }
      ${Plugin.baseFragment}
    `
    return this.context.getObservableObject(this.context, query, GenericScheme.itemMap, apolloQueryOptions) as Observable<IGenericSchemeState>
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