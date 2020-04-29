import BN from 'bn.js'
import { DocumentNode } from 'graphql'
import gql from 'graphql-tag'
import {
  Address,
  Arc,
  FundingRequestProposal,
  getEventArgs,
  IFundingRequestProposalState,
  IGenesisProtocolParams,
  IPluginState,
  IProposalBaseCreateOptions,
  IProposalCreateOptionsComp,
  ITransaction,
  ITransactionReceipt,
  mapGenesisProtocolParams,
  Plugin,
  ProposalPlugin,
  transactionErrorHandler,
  transactionResultHandler
} from '../../index'

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

  public static itemMap(context: Arc, item: any, query: DocumentNode): IFundingRequestState | null {
    if (!item) {
      console.log(`FundingRequest Plugin ItemMap failed. Query: ${query.loc?.source.body              }`)
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
      const args = getEventArgs(receipt, 'NewContributionProposal', 'ContributionReward.createProposal')
      const proposalId = args[1]
      return new FundingRequestProposal(this.context, proposalId)
    }
  }

  public createProposalErrorHandler(options: IProposalCreateOptionsComp): transactionErrorHandler {
    return async (err) => {
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
