
import gql from "graphql-tag";
import { IPluginState, Plugin } from "../plugin";
import { IGenesisProtocolParams, mapGenesisProtocolParams } from "../../genesisProtocol";
import { IProposalBaseCreateOptions, IProposalQueryOptions } from "../proposal";
import { ProposalPlugin } from "../proposalPlugin";
import { Arc } from "../../arc";
import { IApolloQueryOptions, Address } from "../../types";
import { Observable } from "rxjs";
import { ITransaction, transactionResultHandler, ITransactionReceipt, getEventArgs, transactionErrorHandler } from "../../operation";
import { GenericSchemeProposal } from "./proposal";

export interface IGenericSchemeState extends IPluginState {
  schemeParams: {
    votingMachine: Address
    contractToCall: Address
    voteParams: IGenesisProtocolParams
  }
}

interface IProposalCreateOptionsGS extends IProposalBaseCreateOptions {
  callData?: string
  value?: number
}

export class GenericScheme extends ProposalPlugin {

  coreState: IGenericSchemeState| undefined

  constructor(context: Arc, idOrOpts: Address | IGenericSchemeState) {
    super(context, idOrOpts)
    this.context = context
    if (typeof idOrOpts === 'string') {
      this.id = idOrOpts as string
      this.id = this.id.toLowerCase()
    } else {
      this.setState(idOrOpts)
      this.id = idOrOpts.id
    }
  }

  public static fragments = {
    schemeParams: { 
      name: 'GenericSchemeParams',
      fragment: gql` fragment GenericSchemeParams on ControllerScheme {
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
      }`
    }
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

    const genericSchemeParams = item.genericSchemeParams  && {
      contractToCall: item.genericSchemeParams.contractToCall,
      voteParams: mapGenesisProtocolParams(item.genericSchemeParams.voteParams),
      votingMachine: item.genericSchemeParams.votingMachine
    }
    
    return new GenericScheme(arc, {
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
    )
  }

  public state(apolloQueryOptions: IApolloQueryOptions = {}): Observable<IGenericSchemeState> {
    const query = gql`query SchemeStateById
      {
        controllerScheme (id: "${this.id}") {
          ...SchemeFields
        }
      }
      ${Plugin.baseFragment.SchemeFields}
    `
    const itemMap = (item: any) => GenericScheme.itemMap(this.context, item)
    return this.context.getObservableObject(query, itemMap, apolloQueryOptions) as Observable<IGenericSchemeState>
  }

  public getPermissions(): Permissions {
    throw new Error("Method not implemented.");
  }

  public proposals(options: IProposalQueryOptions, apolloQueryOptions: IApolloQueryOptions): Observable<any[]> {
    throw new Error("Method not implemented.");
  }

  public async createProposalTransaction(options: IProposalCreateOptionsGS): Promise<ITransaction> {
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

  public createProposalTransactionMap(): transactionResultHandler<any> {
    return async (receipt: ITransactionReceipt) => {
      const args = getEventArgs(receipt, 'NewCallProposal', 'GenericScheme.createProposal')
      const proposalId = args[1]
      return new GenericSchemeProposal(this.context, proposalId)
    }
  }

  public createProposalErrorHandler(options: IProposalCreateOptionsGS): transactionErrorHandler {
    throw new Error("Method not implemented.");
  }
  
}