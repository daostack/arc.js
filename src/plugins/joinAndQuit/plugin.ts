import BN from 'bn.js'
import { BigNumber } from 'ethers/utils'
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
  fee: BN
}

export interface IInitParamsJQ {
  daoId: string
  votingMachine: string
  votingParams: number[]
  voteOnBehalf: string
  voteParamsHash: string
  fundingToken: string,
  minFeeToJoin: number
  memberReputation: number
  fundingGoal: number
  fundingGoalDeadline: number
  rageQuitEnable: boolean
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

  public static initializeParamsMap(initParams: IInitParamsJQ) {

    Object.keys(initParams).forEach((key) => {
      if (initParams[key] === undefined) {
        throw new Error(`JoinAndQuit's initialize parameter '${key}' cannot be undefined`)
      }
    })

    return [
      initParams.daoId,
      initParams.votingMachine,
      initParams.votingParams,
      initParams.voteOnBehalf,
      initParams.voteParamsHash,
      initParams.fundingToken,
      initParams.minFeeToJoin,
      initParams.memberReputation,
      initParams.fundingGoal,
      initParams.fundingGoalDeadline,
      initParams.rageQuitEnable
    ]
  }

  public static itemMap(context: Arc, item: any, queriedId?: string): IJoinAndQuitState | null {
    if (!item) {
      return null
    }

    if (!item.joinAndQuitParams) {
      throw new Error(`Plugin ${queriedId ? `with id '${queriedId}'` : ''}wrongly instantiated as JoinAndQuit Plugin`)
    }

    const baseState = Plugin.itemMapToBaseState(context, item)

    const fundingRequestParams = {
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

    if (options.plugin === undefined) {
      throw new Error(`Missing argument "plugin" for JoinAndQuit in Proposal.create()`)
    }

    const state = this.fetchState()
    let opts
    if ((await state).pluginParams.fundingToken === NULL_ADDRESS) {
      // if we have no funding token, we shoudl send the fee as ETH
      opts = { value: new BigNumber(options.fee.toString()).toHexString() }
    } else  {
      opts = {}
    }
    if (!options.descriptionHash) {
      options.descriptionHash = await this.context.saveIPFSData(options)
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
