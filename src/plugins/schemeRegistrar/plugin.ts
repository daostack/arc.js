import { Address, IApolloQueryOptions } from "../../types"
import { IPluginState, Plugin } from "../plugin"
import { IGenesisProtocolParams, mapGenesisProtocolParams } from "../../genesisProtocol"
import { IProposalBaseCreateOptions } from "../proposal"
import { ProposalPlugin } from "../proposalPlugin"
import { Arc } from "../../arc"
import gql from "graphql-tag"
import { Observable } from "rxjs"
import { ITransaction, ITransactionReceipt, getEventArgs, transactionErrorHandler } from "../../operation"
import { SchemeRegistrarProposal } from "./proposal"


export interface ISchemeRegistrarState extends IPluginState {
  schemeParams: {
    votingMachine: Address
    voteRemoveParams: IGenesisProtocolParams
    voteRegisterParams: IGenesisProtocolParams
  }
}

export interface IProposalCreateOptionsSR extends IProposalBaseCreateOptions {
  parametersHash?: string
  permissions?: string
  schemeToRegister?: Address
}

export class SchemeRegistrar extends ProposalPlugin {

  coreState: ISchemeRegistrarState| undefined

  constructor(context: Arc, idOrOpts: Address | ISchemeRegistrarState) {
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
      name: 'SchemeRegistrarParams',
      fragment: gql` fragment SchemeRegistrarParams on ControllerScheme {
        schemeRegistrarParams {
          votingMachine
          voteRemoveParams {
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
          voteRegisterParams {
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

  public static itemMap(arc: Arc, item: any): SchemeRegistrar | null {
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

    const schemeRegistrarParams = item.schemeRegistrarParams && {
      voteRegisterParams: mapGenesisProtocolParams(item.schemeRegistrarParams.voteRegisterParams),
      voteRemoveParams: mapGenesisProtocolParams(item.schemeRegistrarParams.voteRemoveParams),
      votingMachine: item.schemeRegistrarParams.votingMachine
    }
    
    return new SchemeRegistrar(arc, {
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
        schemeParams: schemeRegistrarParams,
        version: item.version
      }
    )
  }

  public state(apolloQueryOptions: IApolloQueryOptions = {}): Observable<ISchemeRegistrarState> {
    const query = gql`query SchemeStateById
      {
        controllerScheme (id: "${this.id}") {
          ...SchemeFields
        }
      }
      ${Plugin.baseFragment.SchemeFields}
    `
    const itemMap = (item: any) => SchemeRegistrar.itemMap(this.context, item)
    return this.context.getObservableObject(query, itemMap, apolloQueryOptions) as Observable<ISchemeRegistrarState>
  }

  public async createProposalTransaction(options: IProposalCreateOptionsSR): Promise<ITransaction> {
    let msg: string
    switch (options.proposalType) {
      case "SchemeRegistrarAdd":
      case "SchemeRegistrarEdit":
        if (options.scheme === undefined) {
          msg = `Missing argument "scheme" for SchemeRegistrar in Proposal.create()`
          throw Error(msg)
        }
        if (options.parametersHash === undefined) {
          msg = `Missing argument "parametersHash" for SchemeRegistrar in Proposal.create()`
          throw Error(msg)
        }
        if (options.permissions === undefined) {
          msg = `Missing argument "permissions" for SchemeRegistrar in Proposal.create()`
          throw Error(msg)
        }
  
        options.descriptionHash = await this.context.saveIPFSData(options)
  
        return {
          contract: this.context.getContract(options.scheme),
          method: 'proposeScheme',
          args: [
            options.dao,
            options.schemeToRegister,
            options.parametersHash,
            options.permissions,
            options.descriptionHash
          ]
        }
      case "SchemeRegistrarRemove":
        if (options.scheme === undefined) {
          msg = `Missing argument "scheme" for SchemeRegistrar`
          throw Error(msg)
        }
  
        options.descriptionHash = await this.context.saveIPFSData(options)
  
        return {
          contract: this.context.getContract(options.scheme),
          method: 'proposeToRemoveScheme',
          args: [
            options.dao,
            options.schemeToRegister,
            options.descriptionHash
          ]
        }
    }
    throw Error('For a schemeregistrar proposal, you must specifcy proposal.proposalType')
  }

  public createProposalTransactionMap (options: IProposalCreateOptionsSR) {
    return (receipt: ITransactionReceipt) => {
      let eventName: string
      switch (options.proposalType) {
        case "SchemeRegistrarAdd":
        case "SchemeRegistrarEdit":
          eventName = 'NewSchemeProposal'
          break
        case "SchemeRegistrarRemove":
          eventName = 'RemoveSchemeProposal'
          break
        default:
          throw Error(`SchemeRegistrar.createProposal: Unknown proposal type ${options.proposalType}`)
      }
      const args = getEventArgs(receipt, eventName, 'SchemeRegistrar.createProposal')
      const proposalId = args[1]
      return new SchemeRegistrarProposal(this.context, proposalId)
    }
  }

  public createProposalErrorHandler(options: IProposalBaseCreateOptions): transactionErrorHandler {
    throw new Error("Method not implemented.");
  }
  public getPermissions(): Permissions {
    throw new Error("Method not implemented.");
  }

}