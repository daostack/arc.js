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

export interface IJoinAndQuitState extends IPluginState {
  pluginParams: {
    votingMachine: Address
    voteParams: IGenesisProtocolParams
    fundingToken: Address
  }
}

export interface IProposalCreateOptionsJoinAndQuit extends IProposalBaseCreateOptions {
  descriptionHash: string
  fee: BN
}

export class JoinAndQuit
  extends ProposalPlugin<IJoinAndQuitState, IJoinAndQuitProposalState, IProposalCreateOptionsJoinAndQuit> {

  public static get fragment() {
    if (!this._fragment) {
      this._fragment = {
        name: 'JoinAndQuitParams',
        fragment: gql` fragment JoinAndQuitParams on ControllerScheme {
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

    return this._fragment
  }

  public static itemMap(context: Arc, item: any, query: DocumentNode): IJoinAndQuitState | null {
    if (!item) {
      console.log(`JoinAndQuit Plugin ItemMap failed. Query: ${query.loc?.source.body              }`)
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

  private static _fragment: { name: string, fragment: DocumentNode } | undefined

  public async createProposalTransaction(options: IProposalCreateOptionsJoinAndQuit): Promise<ITransaction> {
    options.descriptionHash = await this.context.saveIPFSData(options)

    if (options.plugin === undefined) {
      throw new Error(`Missing argument "plugin" for JoinAndQuit in Proposal.create()`)
    }

    return {
      contract: this.context.getContract(options.plugin),
      method: 'proposeToJoin',
      args: [
        options.descriptionHash,
        options.fee.toNumber()
      ],
      opts: {
        value: options.fee.toNumber()
      }
    }
  }

  public createProposalTransactionMap(): transactionResultHandler<any> {
    return async (receipt: ITransactionReceipt) => {
      const args = getEventArgs(receipt, 'NewContributionProposal', 'ContributionReward.createProposal')
      const proposalId = args[1]
      return new JoinAndQuitProposal(this.context, proposalId)
    }
  }

  public createProposalErrorHandler(options: IProposalCreateOptionsJoinAndQuit): transactionErrorHandler {
    return async (err) => {
      console.log(options.fee.toString())
      throw err
      // console.log(options)
      // console.log(this)
      // const state = await this.fetchState()
      // console.log(state)
      // throw Error('THIS is my error')
      // console.log('x')
      // console.log(options)
      // if (err.message.match(/startTime should be greater than proposing time/ig)) {
      //   if (!this.context.web3) {
      //     throw Error('Web3 provider not set')
      //   }
      //   return Error(`${err.message} - startTime is ${options.startTime}, current block time is ${await getBlockTime(this.context.web3)}`)
      // } else {
      //   const msg = `Error creating proposal: ${err.message}`
      //   return Error(msg)
      // }
    }
  }

}
