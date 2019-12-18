import BN = require('bn.js')
import gql from 'graphql-tag'
import { Observable } from 'rxjs'
import { first, map } from 'rxjs/operators'
import { Address,
  Arc
 } from '..'
import { IApolloQueryOptions } from '../arc'
import { IProposalQueryOptions, Proposal } from '../proposal'
import { IContributionRewardExtParams } from '../scheme'
import { createGraphQlQuery, dateToSecondsSinceEpoch, isAddress, NULL_ADDRESS, secondSinceEpochToDate } from '../utils'

export interface ICompetitionProposal {
  id: string
  contract: Address
  endTime: Date
  numberOfWinners: number
  startTime: Date
  votingStartTime: Date
  suggestionsEndTime: Date
  numberOfVotesPerVoter: number
  snapshotBlock: number
  createdAt: Date,
 }

export interface IProposalCreateOptionsCompetition  { // extends IProposalCreateOptionsContributionRewardExt {
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
  proposal: string
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
      options.proposer = NULL_ADDRESS
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
      dateToSecondsSinceEpoch(options.startTime) || 0,
      dateToSecondsSinceEpoch(options.votingStartTime) || 0,
      dateToSecondsSinceEpoch(options.endTime) || 0,
      options.numberOfVotesPerVoter.toString() || 0,
      dateToSecondsSinceEpoch(options.suggestionsEndTime) || 0
    ]

    const transaction = contract.methods.proposeCompetition(
      options.descriptionHash || '',
      options.reputationReward && options.reputationReward.toString() || 0,
      [
        options.nativeTokenReward && options.nativeTokenReward.toString() || 0,
        options.ethReward && options.ethReward.toString() || 0,
        options.externalTokenReward && options.externalTokenReward.toString() || 0
      ],
      options.externalTokenAddress || NULL_ADDRESS,
      options.rewardSplit,
      competitionParams
    )
    return transaction
  }
}

export function createProposalErrorHandler(err: Error) {
  return err
}

export function createTransactionMap(options: any, context: Arc) {
  const eventName = 'NewCompetitionProposal'
  const map = (receipt: any) => {
    const proposalId = receipt.events[eventName].returnValues._proposalId
    return new Proposal(proposalId, context)
  }
  return map
}

export class Competition { // extends Proposal {
  public static search(
    context: Arc,
    options: IProposalQueryOptions = {},
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable < Competition[] > {
    return Proposal.search(context, options, apolloQueryOptions).pipe(
      map((proposals: Proposal[]) => proposals.map((p: Proposal) => new Competition(p.id, context)))
    )
  }
  public id: string
  public context: Arc
  constructor(id: string, context: Arc) {
    // super(id, context)
    this.id = id
    this.context = context
  }

  public suggestions(
      options: ICompetitionSuggestionQueryOptions = {},
      apolloQueryOptions: IApolloQueryOptions = {}
    ): Observable < CompetitionSuggestion[] > {
    if (!options.where) { options.where = {}}
    options.where.proposal = this.id
    return  CompetitionSuggestion.search(this.context, options, apolloQueryOptions)
  }
}

export interface ICompetitionSuggestionQueryOptions {
  where?: {
    proposal?: string
  }
}
export class CompetitionSuggestion {

  public static fragments = {
    CompetitionSuggestionFields: gql`fragment CompetitionSuggestionFields on CompetitionSuggestion {
      id
      suggestionId
      # proposal: CompetitionProposal!
      descriptionHash
      title
      description
      url
      # fulltext: [string]
      suggester
      # votes: [CompetitionVote!] @derivedFrom(field: "suggestion")
      totalVotes
      createdAt
      redeemedAt
      rewardPercentage
    }`
  }

  public static search(
    context: Arc,
    options: ICompetitionSuggestionQueryOptions = {},
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable<CompetitionSuggestion[]> {
    let where = ''
    if (!options.where) { options.where = {}}

    const proposalId = options.where.proposal
    // if we are searching for stakes on a specific proposal (a common case), we
    // will structure the query so that stakes are stored in the cache together wit the proposal
    if (proposalId) {
      delete options.where.proposal
    }

    for (const key of Object.keys(options.where)) {
      if (options.where[key] === undefined) {
        continue
      }

      if (key === 'beneficiary' || key === 'dao') {
        const option = options.where[key] as string
        isAddress(option)
        options.where[key] = option.toLowerCase()
      }

      where += `${key}: "${options.where[key] as string}"\n`
    }

    const itemMap = (item: any) => new CompetitionSuggestion({
      createdAt: secondSinceEpochToDate(item.createdAt),
      descriptionHash: item.descriptionHash,
      id: item.id,
      proposal: item.proposal,
      redeemedAt: secondSinceEpochToDate(item.redeemedAt),
      rewardPercentage: Number(item.rewardPercentage),
      suggester: item.suggester,
      suggestionId: item.suggestionId,
      totalVotes: new BN(item.totalVotes)
    }, context)

    const query = gql`query CompetitionSuggestionSearch
      {
        competitionSuggestions ${createGraphQlQuery(options, where)} {
          ...CompetitionSuggestionFields
        }
      }
      ${CompetitionSuggestion.fragments.CompetitionSuggestionFields}
      `

    return context.getObservableList(
      query,
      itemMap,
      apolloQueryOptions
    ) as Observable<CompetitionSuggestion[]>
  }

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
