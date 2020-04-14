import BN from 'bn.js'
import { Address } from "../../types";
import { IProposalBaseCreateOptions } from "../proposal";
import { Arc, IApolloQueryOptions } from "../../arc";
import { ITransaction, transactionResultHandler, transactionErrorHandler, ITransactionReceipt, getEventArgs } from "../../operation";
import { Observable } from "rxjs";
import { ICompetitionSuggestionQueryOptions, CompetitionSuggestion } from './suggestion';
import { IVoteQueryOptions } from '../../vote';
import { getBlockTime, dateToSecondsSinceEpoch, NULL_ADDRESS } from '../../utils';
import { CompetitionVote } from './vote';
import { CompetitionProposal } from './proposal';
import { IContributionRewardExtState, ContributionRewardExt } from '../contributionRewardExt/plugin';

export interface IProposalCreateOptionsComp extends IProposalBaseCreateOptions {
  endTime: Date,
  reputationReward?: BN
  ethReward?: BN
  externalTokenReward?: BN
  externalTokenAddress?: Address
  rewardSplit: number[]
  nativeTokenReward?: BN
  numberOfVotesPerVoter: number
  proposerIsAdmin?: boolean, // true if new suggestions are limited to the proposer
  startTime: Date | null
  suggestionsEndTime: Date
  votingStartTime: Date
}

export class Competition extends ContributionRewardExt {

  public static getCompetitionContract(arc: Arc, state: IContributionRewardExtState) {
    if (state === null) {
      throw Error(`No Plugin was provided`)
    }
    const rewarder = state.pluginParams && state.pluginParams.rewarder
    if (!rewarder) {
      throw Error(`This Plugin's rewarder is not set, and so no compeittion contract could be found`)
    }
  
    if (!Competition.isCompetitionPlugin(arc, state)) {
      throw Error(`We did not find a Competition contract at the rewarder address ${rewarder}`)
    }
    const contract = arc.getContract(rewarder as Address)
    return contract
  }

  public static isCompetitionPlugin(arc: Arc, item: any) {
    if (item.contributionRewardExtParams) {
      const contractInfo = arc.getContractInfo(item.contributionRewardExtParams.rewarder)
      const versionNumber = Number(contractInfo.version.split('rc.')[1])
      if (versionNumber < 39) {
        throw Error(`Competition contracts of version < 0.0.1-rc.39 are not supported`)
      }
      return contractInfo.name === 'Competition'
    } else {
      return false
    }
  }

  public suggestions(
    options: ICompetitionSuggestionQueryOptions = {},
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable<CompetitionSuggestion[]> {
    if (!options.where) { options.where = {} }
    options.where.proposal = this.id
    return CompetitionSuggestion.search(this.context, options, apolloQueryOptions)
  }

  public votes(
    options: IVoteQueryOptions = {},
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable<CompetitionVote[]> {
    if (!options.where) { options.where = {} }
    options.where.proposal = this.id
    return CompetitionVote.search(this.context, options, apolloQueryOptions)
  }

  public async createCompetitionProposalTransaction(options: IProposalCreateOptionsComp): Promise<ITransaction> {
    const context = this.context
    const pluginState = await this.fetchState()
    if (!pluginState) {
      throw Error(`No plugin was found with this id: ${this.id}`)
    }

    const contract = Competition.getCompetitionContract(this.context, pluginState as IContributionRewardExtState)

    // check sanity -- is the competition contract actually c
    const contributionRewardExtAddress = await contract.contributionRewardExt()
    if (contributionRewardExtAddress.toLowerCase() !== pluginState.address) {
      throw Error(`This ContributionRewardExt/Competition combo is malconfigured: expected ${contributionRewardExtAddress.toLowerCase()} to equal ${pluginState.address}`)
    }

    options.descriptionHash = await context.saveIPFSData(options)
    if (!options.rewardSplit) {
      throw Error(`Rewardsplit was not given..`)
    } else {
      if (options.rewardSplit.reduce((a: number, b: number) => a + b) !== 100) {
        throw Error(`Rewardsplit must sum 100 (they sum to  ${options.rewardSplit.reduce((a: number, b: number) => a + b)})`)
      }
    }

    const competitionParams = [
      (options.startTime && dateToSecondsSinceEpoch(options.startTime)) || 0,
      dateToSecondsSinceEpoch(options.votingStartTime) || 0,
      dateToSecondsSinceEpoch(options.endTime) || 0,
      options.numberOfVotesPerVoter.toString() || 0,
      dateToSecondsSinceEpoch(options.suggestionsEndTime) || 0
    ]
    const proposerIsAdmin = !!options.proposerIsAdmin

    return {
      contract,
      method: 'proposeCompetition',
      args: [
        options.descriptionHash || '',
        options.reputationReward && options.reputationReward.toString() || 0,
        [
          options.nativeTokenReward && options.nativeTokenReward.toString() || 0,
          options.ethReward && options.ethReward.toString() || 0,
          options.externalTokenReward && options.externalTokenReward.toString() || 0
        ],
        options.externalTokenAddress || NULL_ADDRESS,
        options.rewardSplit,
        competitionParams,
        proposerIsAdmin
      ]
    }
  }

  public createCompetitionProposalTransactionMap(): transactionResultHandler<CompetitionProposal> {
    return (receipt: ITransactionReceipt) => {
      const args = getEventArgs(receipt, 'NewCompetitionProposal', 'Competition.createProposal')
      const proposalId = args[0]
      return new CompetitionProposal(this.context, proposalId)
    }
  }

  public createCompetitionProposalErrorHandler(options: IProposalCreateOptionsComp): transactionErrorHandler {
    return async (err) => {
      if (err.message.match(/startTime should be greater than proposing time/ig)) {
        if (!this.context.web3) {
          throw Error('Web3 provider not set')
        }
        return Error(`${err.message} - startTime is ${options.startTime}, current block time is ${await getBlockTime(this.context.web3)}`)
      } else {
        const msg = `Error creating proposal: ${err.message}`
        return Error(msg)
      }
    }
  }

}