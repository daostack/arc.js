import BN = require('bn.js')
import { first } from 'rxjs/operators'
import { Arc, utils } from '..'
import { Proposal } from '../proposal'
import { IContributionRewardExtParams } from '../scheme'
import { Address } from '../types'
import { IProposalCreateOptionsContributionRewardExt } from './contributionRewardExt'

export interface ICompetitionProposal {
  endTime: Date
  numberOfWinners: number
  rewardSplit: number[]
  startTime: Date
  votingStartTime: Date
  suggestionsEndTime: Date
  numberOfVotesPerVoters: number
  // contributionReward: ControllerScheme!
  snapshotBlock: number
  // suggestions: [CompetitionSuggestion!] @derivedFrom(field: "proposal")
  // votes: [CompetitionVote!] @derivedFrom(field: "proposal")
  createdAt: Date,
 }

export interface IProposalCreateOptionsCompetition extends IProposalCreateOptionsContributionRewardExt {
  beneficiary: Address
  endTime: Date,
  reputationReward?: BN
  ethReward?: BN
  externalTokenReward?: BN
  externalTokenAddress?: Address
  proposer: Address,
  rewardSplit: number[]
  nativeTokenReward?: BN
  numberOfVotesPerVoter: number
  startTime: Date,
  suggestionsEndTime: Date,
  votingStartTime: Date,
}

export interface ICompetitionSuggestion {
  id: string
  suggestionId: number
  // proposal: CompetitionProposal!
  descriptionHash: string
  title?: string
  description?: string
  url?: string
  // fulltext: [string]
  suggester: Address
  // votes: [CompetitionVote!] @derivedFrom(field: "suggestion")
  totalVotes: BN
  createdAt: Date
  redeemedAt: Date
  rewardPercentage: number
}

export interface ICompetitionVote {
  id: string
  // proposal: CompetitionProposal!
  // suggestion: CompetitionSuggestion!
  voter: Address
  createdAt: Date
  reptutation: BN
}

// export enum IProposalType {
//   ContributionReward = 'ContributionRewardExt' // propose a contributionReward
// }

/**
 *
 * @param options
 * @param context
 */
export function createProposal(options: any, context: Arc) {
  // we assume this function is called with the correct scheme options..

  return async () => {
    // first get the scheme info
    const schemes = await context.schemes({ where: {address: options.scheme}}).pipe(first()).toPromise()
    const scheme = schemes[0]
    const schemeState = await scheme.state().pipe(first()).toPromise()
    if (!schemeState) {
      throw Error(`No scheme was found at address ${options.scheme}`)
    }
    const contract = context
      .getContract((schemeState.contributionRewardExtParams as IContributionRewardExtParams).rewarder)
    if (!options.proposer) {
      options.proposer = utils.NULL_ADDRESS
    }
    options.descriptionHash = await context.saveIPFSData(options)
    if (!options.rewardSplit) {
      throw Error(`Rewardsplit was not given..`)
    } else {
      if (options.rewardSplit.reduce((a: number, b: number) => a + b) !== 100) {
        throw Error(`Rewardsplit must sum 100 (they sum to  ${options.rewardSplit.reduce((a: number, b: number) => a + b) })`)
      }
    }
    // * @param _rewardSplit an array of precentages which specify how to split the rewards
    // *         between the winning suggestions
    // * @param _competitionParams competition parameters :
    // *         _competitionParams[0] - competition startTime
    // *         _competitionParams[1] - _votingStartTime competition voting start time
    // *         _competitionParams[2] - _endTime competition end time
    // *         _competitionParams[3] - _maxNumberOfVotesPerVoter on how many suggestions a voter can vote
    // *         _competitionParams[4] - _suggestionsEndTime suggestion submition end time
    // *         _competitionParams[4] - _suggestionsEndTime suggestion submition end time

    const competitionParams = [
      utils.dateToSecondsSinceEpoch(options.startTime) || 0,
      utils.dateToSecondsSinceEpoch(options.votingStartTime) || 0,
      utils.dateToSecondsSinceEpoch(options.endTime) || 0,
      options.numberOfVotesPerVoter.toString() || 0,
      utils.dateToSecondsSinceEpoch(options.suggestionsEndTime) || 0
    ]

    const transaction = contract.methods.proposeCompetition(
      options.descriptionHash || '',
      options.reputationReward && options.reputationReward.toString() || 0,
      [
        options.nativeTokenReward && options.nativeTokenReward.toString() || 0,
        options.ethReward && options.ethReward.toString() || 0,
        options.externalTokenReward && options.externalTokenReward.toString() || 0
      ],
      options.externalTokenAddress || utils.NULL_ADDRESS,
      options.rewardSplit,
      competitionParams
    )
    return transaction
  }
}

export function createTransactionMap(options: any, context: Arc) {
  const eventName = 'NewCompetitionProposal'
  const map = (receipt: any) => {
    const proposalId = receipt.events[eventName].returnValues._proposalId
    return new Proposal(proposalId, context)
  }
  return map
}

export class CompetitionSuggestion {
  public id: string
  public staticState?: ICompetitionSuggestion

  constructor(idOrOpts: string|ICompetitionSuggestion, public context: Arc) {
    if (typeof idOrOpts === 'string') {
      this.id = idOrOpts
    } else {
      const opts = idOrOpts as ICompetitionSuggestion
      this.id = opts.id
      this.setStaticState(opts)
    }
  }

  public setStaticState(opts: ICompetitionSuggestion) {
    this.staticState = opts
  }
}

export class CompetitionVote {
  public id: string
  public staticState?: ICompetitionVote

  constructor(idOrOpts: string|ICompetitionVote, public context: Arc) {
    if (typeof idOrOpts === 'string') {
      this.id = idOrOpts
    } else {
      const opts = idOrOpts as ICompetitionVote
      this.id = opts.id
      this.setStaticState(opts)
    }
  }

  public setStaticState(opts: ICompetitionVote) {
    this.staticState = opts
  }
}
