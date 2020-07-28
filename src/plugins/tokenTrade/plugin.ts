import BN from 'bn.js'
import { DocumentNode } from 'graphql'
import gql from 'graphql-tag'
import {
  Address,
  Arc,
  getEventArgs,
  IGenesisProtocolParams,
  IPluginState,
  IProposalBaseCreateOptions,
  ITransaction,
  ITransactionReceipt,
  mapGenesisProtocolParams,
  Plugin,
  ProposalPlugin,
  transactionErrorHandler,
  transactionResultHandler
} from '../../index'
import { ITokenTradeProposalState, TokenTradeProposal } from './proposal'

export interface ITokenTradeState extends IPluginState {
  pluginParams: {
    votingMachine: Address
    voteParams: IGenesisProtocolParams
  }
}

export interface IProposalCreateOptionsTokenTrade extends IProposalBaseCreateOptions {
  sendToken: Address,
  sendTokenAmount: BN,
  receiveToken: Address,
  receiveTokenAmount: BN,
  descriptionHash: string
}

export interface IInitParamsTT {
  daoId: string
  votingMachine: string
  votingParams: number[]
  voteOnBehalf: string
  voteParamsHash: string
}

export class TokenTrade extends ProposalPlugin<
  ITokenTradeState,
  ITokenTradeProposalState,
  IProposalCreateOptionsTokenTrade> {

  public static get fragment() {
    if (!this.fragmentField) {
      this.fragmentField = {
        name: 'TokenTradeParams',
        fragment: gql` fragment TokenTradeParams on ControllerScheme {
          tokenTradeParams {
            id
            votingMachine
            voteParams {
              id
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

    return this.fragmentField
  }

  public static initializeParamsMap(initParams: IInitParamsTT) {

    Object.keys(initParams).forEach((key) => {
      if (initParams[key] === undefined) {
        throw new Error(`TokenTrade's initialize parameter '${key}' cannot be undefined`)
      }
    })

    return [
      initParams.daoId,
      initParams.votingMachine,
      initParams.votingParams,
      initParams.voteOnBehalf,
      initParams.voteParamsHash
    ]
  }

  public static itemMap(context: Arc, item: any, queriedId?: string): ITokenTradeState | null {
    if (!item) {
      return null
    }

    if (!item.joinAndQuitParams) {
      throw new Error(`Plugin ${queriedId ? `with id '${queriedId}'` : ''}wrongly instantiated as TokenTrade Plugin`)
    }

    const baseState = Plugin.itemMapToBaseState(context, item)

    const tokenTradeParams = {
      voteParams: mapGenesisProtocolParams(item.joinAndQuitParams.voteParams),
      votingMachine: item.joinAndQuitParams.votingMachine
    }

    return {
        ...baseState,
        pluginParams: tokenTradeParams
      }
  }

  private static fragmentField: { name: string, fragment: DocumentNode } | undefined

  public async createProposalTransaction(options: IProposalCreateOptionsTokenTrade): Promise<ITransaction> {

    if (options.plugin === undefined) {
      throw new Error(`Missing argument "plugin" for TokenTrade in Proposal.create()`)
    }
    if (!options.receiveToken) {
      throw new Error(`Missing argument "receiveToken" for TokenTrade in Proposal.create()`)
    }
    if (!options.sendToken) {
      throw new Error(`Missing argument "sendToken" for TokenTrade in Proposal.create()`)
    }
    if (options.receiveTokenAmount.lte(new BN(0))) {
      throw new Error(`Argument "receiveTokenAmount" must be greater than 0 for TokenTrade in Proposal.create()`)
    }
    if (options.sendTokenAmount.lte(new BN(0))) {
      throw new Error(`Argument "sendTokenAmount" must be greater than 0 for TokenTrade in Proposal.create()`)
    }

    if (!options.descriptionHash) {
      options.descriptionHash = await this.context.saveIPFSData(options)
    }

    return {
      contract: this.context.getContract(options.plugin),
      method: 'proposeTokenTrade',
      args: [
        options.sendToken,
        options.sendTokenAmount,
        options.receiveToken,
        options.receiveTokenAmount,
        options.descriptionHash
      ]
    }
  }

  public createProposalTransactionMap(): transactionResultHandler<any> {
    return async (receipt: ITransactionReceipt) => {
      const args = getEventArgs(receipt, 'TokenTradeProposed', 'TokenTrade.createProposal')
      const proposalId = args[1]
      return new TokenTradeProposal(this.context, proposalId)
    }
  }

  public createProposalErrorHandler(options: IProposalCreateOptionsTokenTrade): transactionErrorHandler {
    return async (err) => {
      throw err
    }
  }

}
