import BN from 'bn.js'
import { DocumentNode } from 'graphql'
import gql from 'graphql-tag'
import {
  Address,
  Arc,
  fromWei,
  FundingRequestProposal,
  getEventArgs,
  IFundingRequestProposalState,
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
import { IJoinAndQuitState } from '../joinAndQuit'

export interface IFundingRequestState extends IPluginState {
  pluginParams: {
    votingMachine: Address
    voteParams: IGenesisProtocolParams
    fundingToken: Address
  }
}

export interface IProposalCreateOptionsFundingRequest extends IProposalBaseCreateOptions {
  beneficiary: Address
  amount: BN,
  descriptionHash: string
}

export class FundingRequest
  extends ProposalPlugin<IFundingRequestState, IFundingRequestProposalState, IProposalCreateOptionsFundingRequest> {

  public static get fragment() {
    if (!this.fragmentField) {
      this.fragmentField = {
        name: 'FundingRequestParams',
        fragment: gql` fragment FundingRequestParams on ControllerScheme {
          fundingRequestParams {
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
            fundingToken
          }
        }`
      }
    }

    return this.fragmentField
  }

  public static itemMap(context: Arc, item: any, query?: string): IFundingRequestState | null {
    if (!item) {
      return null
    }

    const baseState = Plugin.itemMapToBaseState(context, item)

    const fundingRequestParams = item.fundingRequestParams && {
      voteParams: mapGenesisProtocolParams(item.fundingRequestParams.voteParams),
      votingMachine: item.fundingRequestParams.votingMachine,
      fundingToken: item.fundingRequestParams.fundingToken
    }

    return {
        ...baseState,
        pluginParams: fundingRequestParams
      }
  }

  private static fragmentField: { name: string, fragment: DocumentNode } | undefined

  public async createProposalTransaction(options: IProposalCreateOptionsFundingRequest): Promise<ITransaction> {
    options.descriptionHash = await this.context.saveIPFSData(options)

    if (options.plugin === undefined) {
      throw new Error(`Missing argument "plugin" for FundingRequest in Proposal.create()`)
    }

    return {
      contract: this.context.getContract(options.plugin),
      method: 'propose',
      args: [
        options.beneficiary,
        options.amount.toNumber(),
        options.descriptionHash || ''
      ]
    }
  }

  public createProposalTransactionMap(): transactionResultHandler<any> {
    return async (receipt: ITransactionReceipt) => {
      const args = getEventArgs(receipt, 'NewFundingProposal', 'FundingRequest.createProposal')
      const proposalId = args[1]
      return new FundingRequestProposal(this.context, proposalId)
    }
  }

  public createProposalErrorHandler(options: IProposalCreateOptionsFundingRequest): transactionErrorHandler {
    return async (err) => {
      if (err.message.match(/funding is not allowed yet/)) {
        const state = await this.fetchState()
        const dao = state.dao.entity
        const joinAndQuit = (await dao.plugin({where: {name: 'JoinAndQuit'}}))
        const joinAndQuitState = await joinAndQuit.fetchState() as IJoinAndQuitState
        const deadline = joinAndQuitState.pluginParams.fundingGoalDeadline
        const now = new Date()
        if (deadline < now) {
          return new Error(`${err.message}: fundingGoal deadline ${deadline} has passed before reaching the funding goal`)

        }
        return new Error(`${err.message}: funding goal: ${fromWei(joinAndQuitState.pluginParams.fundingGoal)}, deadline: ${joinAndQuitState.pluginParams.fundingGoalDeadline}`)
      }
      throw err
    }
  }

}
