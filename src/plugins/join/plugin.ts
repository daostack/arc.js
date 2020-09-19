import { BigNumber } from 'ethers'
import { DocumentNode } from 'graphql'
import gql from 'graphql-tag'
import {
  Address,
  Arc,
  getEventArgs,
  IGenesisProtocolParams,
  IJoinProposalState,
  IPluginState,
  IProposalBaseCreateOptions,
  ITransaction,
  ITransactionReceipt,
  JoinProposal,
  mapGenesisProtocolParams,
  Plugin,
  ProposalPlugin,
  transactionErrorHandler,
  transactionResultHandler
} from '../../index'
import { NULL_ADDRESS, secondSinceEpochToDate } from '../../utils'

export interface IJoinState extends IPluginState {
  pluginParams: {
    votingMachine: Address
    voteParams: IGenesisProtocolParams
    fundingToken: Address
    minFeeToJoin: BigNumber
    memberReputation: BigNumber
    fundingGoal: BigNumber
    fundingGoalDeadline: Date
   }
}

export interface IProposalCreateOptionsJoin extends IProposalBaseCreateOptions {
  fee: BigNumber
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

export class Join extends ProposalPlugin<
  IJoinState,
  IJoinProposalState,
  IProposalCreateOptionsJoin> {

  public static get fragment() {
    if (!this.fragmentField) {
      this.fragmentField = {
        name: 'JoinParams',
        fragment: gql` fragment JoinParams on ControllerScheme {
          joinParams {
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
        throw new Error(`Join's initialize parameter '${key}' cannot be undefined`)
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

  public static itemMap(context: Arc, item: any, queriedId?: string): IJoinState | null {
    if (!item) {
      return null
    }

    if (!item.joinParams) {
      throw new Error(`Plugin ${queriedId ? `with id '${queriedId}'` : ''}wrongly instantiated as Join Plugin`)
    }

    const baseState = Plugin.itemMapToBaseState(context, item)

    const fundingRequestParams = {
      voteParams: mapGenesisProtocolParams(item.joinParams.voteParams),
      votingMachine: item.joinParams.votingMachine,
      fundingToken: item.joinParams.fundingToken,
      minFeeToJoin: BigNumber.from(item.joinParams.minFeeToJoin),
      memberReputation: BigNumber.from(item.joinParams.memberReputation),
      fundingGoal: BigNumber.from(item.joinParams.fundingGoal),
      fundingGoalDeadline: secondSinceEpochToDate(item.joinParams.fundingGoalDeadline)
    }

    return {
        ...baseState,
        pluginParams: fundingRequestParams
      }
  }

  private static fragmentField: { name: string, fragment: DocumentNode } | undefined

  public async createProposalTransaction(options: IProposalCreateOptionsJoin): Promise<ITransaction> {

    if (options.plugin === undefined) {
      throw new Error(`Missing argument "plugin" for Join in Proposal.create()`)
    }

    const state = this.fetchState()
    let opts
    if ((await state).pluginParams.fundingToken === NULL_ADDRESS) {
      // if we have no funding token, we shoudl send the fee as ETH
      opts = { value: BigNumber.from(options.fee.toString()) }
    } else  {
      opts = {}
    }
    if (!options.descriptionHash) {
      options.descriptionHash = await this.context.saveIPFSData(options)
    }

    return {
      contract: this.context.getContract(options.plugin),
      method: 'proposeToJoin(string,uint256)',
      args: [
        options.descriptionHash,
        options.fee.toString()
      ],
      opts
    }
  }

  public createProposalTransactionMap(): transactionResultHandler<any> {
    return async (receipt: ITransactionReceipt) => {
      const args = getEventArgs(receipt, 'JoinInProposal', 'Join.createProposal')
      const proposalId = args[1]
      return new JoinProposal(this.context, proposalId)
    }
  }

  public createProposalErrorHandler(options: IProposalCreateOptionsJoin): transactionErrorHandler {
    return async (err) => {
      throw err
    }
  }

}
