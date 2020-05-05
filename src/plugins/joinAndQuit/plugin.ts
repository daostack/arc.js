import BN from 'bn.js'
import { DocumentNode } from 'graphql'
import gql from 'graphql-tag'
import {
  Address,
  Arc,
  getEventArgs,
  IGenesisProtocolParams,
  IJoinAndQuitProposalState,
  IPluginState,
  IProposalBaseCreateOptions,
  ITransaction,
  ITransactionReceipt,
  JoinAndQuitProposal,
  mapGenesisProtocolParams,
  Plugin,
  ProposalPlugin,
  transactionErrorHandler,
  transactionResultHandler
} from '../../index'
import { NULL_ADDRESS, secondSinceEpochToDate } from '../../utils'

export interface IJoinAndQuitState extends IPluginState {
  pluginParams: {
    votingMachine: Address
    voteParams: IGenesisProtocolParams
    fundingToken: Address
    minFeeToJoin: BN
    memberReputation: BN
    fundingGoal: BN
    fundingGoalDeadline: Date
   }
}

export interface IProposalCreateOptionsJoinAndQuit extends IProposalBaseCreateOptions {
  descriptionHash: string
  fee: BN
}

export class JoinAndQuit extends ProposalPlugin<
  IJoinAndQuitState,
  IJoinAndQuitProposalState,
  IProposalCreateOptionsJoinAndQuit> {

  public static get fragment() {
    if (!this.fragmentField) {
      this.fragmentField = {
        name: 'JoinAndQuitParams',
        fragment: gql` fragment JoinAndQuitParams on ControllerScheme {
          joinAndQuitParams {
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
            fundingToken,
            minFeeToJoin,
            memberReputation,
            fundingGoal,
            fundingGoalDeadline
          }
        }`
      }
    }

    return this.fragmentField
  }

  public static itemMap(context: Arc, item: any, query?: string): IJoinAndQuitState | null {
    if (!item) {
      return null
    }

    const baseState = Plugin.itemMapToBaseState(context, item)

    const fundingRequestParams = item.joinAndQuitParams && {
      voteParams: mapGenesisProtocolParams(item.joinAndQuitParams.voteParams),
      votingMachine: item.joinAndQuitParams.votingMachine,
      fundingToken: item.joinAndQuitParams.fundingToken,
      minFeeToJoin: new BN(item.joinAndQuitParams.minFeeToJoin),
      memberReputation: new BN(item.joinAndQuitParams.memberReputation),
      fundingGoal: new BN(item.joinAndQuitParams.fundingGoal),
      fundingGoalDeadline: secondSinceEpochToDate(item.joinAndQuitParams.fundingGoalDeadline)
    }

    return {
        ...baseState,
        pluginParams: fundingRequestParams
      }
  }

  private static fragmentField: { name: string, fragment: DocumentNode } | undefined

  public async createProposalTransaction(options: IProposalCreateOptionsJoinAndQuit): Promise<ITransaction> {
    // options.descriptionHash = await this.context.saveIPFSData(options)

    if (options.plugin === undefined) {
      throw new Error(`Missing argument "plugin" for JoinAndQuit in Proposal.create()`)
    }

    const state = this.fetchState()
    let opts
    if ((await state).pluginParams.fundingToken === NULL_ADDRESS) {
      // if we have no funding token, we shoudl send the fee as ETH
      opts = { value: options.fee.toNumber()}
    } else  {
      opts = {}
    }
    return {
      contract: this.context.getContract(options.plugin),
      method: 'proposeToJoin',
      args: [
        options.descriptionHash,
        options.fee.toString()
      ],
      opts
    }
  }

  public createProposalTransactionMap(): transactionResultHandler<any> {
    return async (receipt: ITransactionReceipt) => {
      const args = getEventArgs(receipt, 'JoinInProposal', 'JoinAndQuit.createProposal')
      const proposalId = args[1]
      return new JoinAndQuitProposal(this.context, proposalId)
    }
  }

  public createProposalErrorHandler(options: IProposalCreateOptionsJoinAndQuit): transactionErrorHandler {
    return async (err) => {
      throw err
    }
  }

}
