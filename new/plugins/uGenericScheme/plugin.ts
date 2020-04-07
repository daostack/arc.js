import { Address, IApolloQueryOptions } from "../../types"
import { IPluginState, Plugin } from "../../plugin"
import { IGenesisProtocolParams, mapGenesisProtocolParams } from "../../genesisProtocol"
import { IProposalBaseCreateOptions } from "../../proposal"
import { ProposalPlugin } from "../../proposalPlugin"
import { Arc } from "../../arc"
import gql from "graphql-tag"
import { Observable } from "rxjs"
import { ITransaction, ITransactionReceipt, getEventArgs, transactionErrorHandler } from "../../operation"
import { UGenericSchemeProposal } from "./proposal"


export interface IUGenericSchemeState extends IPluginState {
  schemeParams: {
    votingMachine: Address
    contractToCall: Address
    voteParams: IGenesisProtocolParams
  }
}

export interface IProposalCreateOptionsUGS extends IProposalBaseCreateOptions {
  callData?: string
  value?: number
}

export class UGenericScheme extends ProposalPlugin {

  coreState: IUGenericSchemeState

  constructor(context: Arc, idOrOpts: Address | IUGenericSchemeState) {
    super()
    this.context = context
    if (typeof idOrOpts === 'string') {
      this.id = idOrOpts as string
      this.id = this.id.toLowerCase()
    } else {
      this.setState(idOrOpts)
      this.id = this.coreState.id
    }
  }

  public static fragments = {
    schemeParams: { 
      name: 'UGenericSchemeParams',
      fragment: gql` fragment UGenericSchemeParams on ControllerScheme {
      uGenericSchemeParams {
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

  public static itemMap(arc: Arc, item: any): UGenericScheme | null {
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

    const uGenericSchemeParams = item.uGenericSchemeParams && {
      contractToCall: item.uGenericSchemeParams.contractToCall,
      voteParams: mapGenesisProtocolParams(item.uGenericSchemeParams.voteParams),
      votingMachine: item.uGenericSchemeParams.votingMachine
    }
    
    return new UGenericScheme(arc, {
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
        schemeParams: uGenericSchemeParams,
        version: item.version
      }
    )
  }

  public state(apolloQueryOptions: IApolloQueryOptions = {}): Observable<IUGenericSchemeState> {
    const query = gql`query SchemeStateById
      {
        controllerScheme (id: "${this.id}") {
          ...SchemeFields
        }
      }
      ${Plugin.baseFragment.SchemeFields}
    `
    const itemMap = (item: any) => UGenericScheme.itemMap(this.context, item)
    return this.context.getObservableObject(query, itemMap, apolloQueryOptions) as Observable<IUGenericSchemeState>
  }

  public async createProposalTransaction(options: IProposalCreateOptionsUGS): Promise<ITransaction> {
    if (options.callData === undefined) {
      throw new Error(`Missing argument "callData" for UGenericScheme in Proposal.create()`)
    }
    if (options.value === undefined) {
      throw new Error(`Missing argument "value" for UGenericScheme in Proposal.create()`)
    }
    if (options.scheme === undefined) {
      throw new Error(`Missing argument "scheme" for GenericScheme in Proposal.create()`)
    }
  
    options.descriptionHash = await this.context.saveIPFSData(options)
  
    return {
      contract: this.context.getContract(options.scheme),
      method: 'proposeCall',
      args: [
        options.dao,
        options.callData,
        options.value,
        options.descriptionHash
      ]
    }
  }

  public createProposalTransactionMap () {
    return async (receipt: ITransactionReceipt) => {
      const args = getEventArgs(receipt, 'NewCallProposal', 'UGenericScheme.createProposal')
      const proposalId = args[1]
      return new UGenericSchemeProposal(this.context, proposalId)
    }
  }

  public createProposalErrorHandler(options: IProposalBaseCreateOptions): transactionErrorHandler {
    throw new Error("Method not implemented.");
  }
  public getPermissions(): Permissions {
    throw new Error("Method not implemented.");
  }

}