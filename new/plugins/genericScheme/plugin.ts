import { Address, IApolloQueryOptions } from "../../types";
import { IProposalBaseCreateOptions, IProposalQueryOptions } from "../../proposal/proposal";
import { ProposalPlugin } from "../proposalPlugin";
import { Arc } from "../../arc";
import { GenericSchemeProposal } from "./proposal";
import { IGenesisProtocolParams, mapGenesisProtocolParams } from "../../genesisProtocol";
import { IPluginState } from "../plugin";
import { ITransaction, transactionResultHandler, transactionErrorHandler, ITransactionReceipt, getEventArgs } from "../../operation";
import { Observable } from "rxjs";

interface IGenericSchemeParams {
  votingMachine: Address
  contractToCall: Address
  voteParams: IGenesisProtocolParams
}

interface IProposalCreateOptionsGS extends IProposalBaseCreateOptions {
  callData?: string
  value?: number
}

export class GenericScheme extends ProposalPlugin<GenericSchemeProposal, IProposalCreateOptionsGS, IGenericSchemeParams> {

  contractToCall: Address
  callData: string
  executed: boolean
  returnValue: string

  protected async createProposalTransaction(options: IProposalCreateOptionsGS): Promise<ITransaction> {
    if (options.callData === undefined) {
      throw new Error(`Missing argument "callData" for GenericScheme in Proposal.create()`)
    }
    if (options.value === undefined) {
      throw new Error(`Missing argument "value" for GenericScheme in Proposal.create()`)
    }
    if (options.scheme === undefined) {
      throw new Error(`Missing argument "scheme" for GenericScheme in Proposal.create()`)
    }
  
    options.descriptionHash = await this.context.saveIPFSData(options)
  
    return {
      contract: this.context.getContract(options.scheme),
      method: 'proposeCall',
      args: [
        options.callData,
        options.value,
        options.descriptionHash
      ]
    }
  }

  protected createProposalTransactionMap(): transactionResultHandler<any> {
    return async (receipt: ITransactionReceipt) => {
      const args = getEventArgs(receipt, 'NewCallProposal', 'GenericScheme.createProposal')
      const proposalId = args[1]
      return new GenericSchemeProposal(this.context, proposalId)
    }
  }

  protected createProposalErrorHandler(options: IProposalCreateOptionsGS): transactionErrorHandler {
    throw new Error("Method not implemented.");
  }

  public proposals(options: IProposalQueryOptions, apolloQueryOptions: IApolloQueryOptions): Observable<any[]> {
    throw new Error("Method not implemented.");
  }

  public getPermissions(): Permissions {
    throw new Error("Method not implemented.");
  }
  
  state(apolloQueryOptions: IApolloQueryOptions): Observable<IPluginState<IGenericSchemeParams>> {
    throw new Error("Method not implemented.");
  }

  public static itemMap(arc: Arc, item: any): IPluginState<IGenericSchemeParams> | null {
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

    const genericSchemeParams = item.genericSchemeParams  && {
      contractToCall: item.genericSchemeParams.contractToCall,
      voteParams: mapGenesisProtocolParams(item.genericSchemeParams.voteParams),
      votingMachine: item.genericSchemeParams.votingMachine
    }
    
    return {
      address: item.address,
      canDelegateCall: item.canDelegateCall,
      canManageGlobalConstraints: item.canManageGlobalConstraints,
      canRegisterSchemes: item.canRegisterSchemes,
      canUpgradeController: item.canUpgradeController,
      dao: item.dao.id,
      id: item.id,
      name,
      numberOfBoostedProposals: Number(item.numberOfBoostedProposals),
      numberOfPreBoostedProposals: Number(item.numberOfPreBoostedProposals),
      numberOfQueuedProposals: Number(item.numberOfQueuedProposals),
      paramsHash: item.paramsHash,
      schemeParams: genericSchemeParams,
      version: item.version
    }
  }
  
}