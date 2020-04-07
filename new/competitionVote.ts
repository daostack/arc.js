import BN from 'bn.js'
import { Entity } from "./entity"
import { Address, IApolloQueryOptions, ICommonQueryOptions } from "./types"
import gql from 'graphql-tag'
import { Observable } from 'rxjs'
import { createGraphQlQuery, secondSinceEpochToDate } from './utils'
import { Arc } from './arc'

export interface ICompetitionVoteState {
  id: string
  proposal: string
  suggestion: string
  voter: Address
  createdAt?: Date
  reputation: BN
}

export interface ICompetitionVoteQueryOptions extends ICommonQueryOptions {
  where?: {
    id?: string
    suggestion?: string
    voter?: Address
    proposal?: string
    proposal_not?: string | null
  }
}

export class CompetitionVote extends Entity<ICompetitionVoteState> {

  public static fragments = {
    CompetitionVoteFields: gql`fragment CompetitionVoteFields on CompetitionVote {
      id
      createdAt
      reputation
      voter
      proposal { id }
      suggestion { id }
    }`
  }

  constructor(public context: Arc, idOrOpts: string | ICompetitionVoteState) {
    super()
    if (typeof idOrOpts === 'string') {
      this.id = idOrOpts
    } else {
      const opts = idOrOpts as ICompetitionVoteState
      this.id = opts.id
      this.setState(opts)
    }
  }

  public static search(
    context: Arc,
    options: ICompetitionVoteQueryOptions = {},
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable<CompetitionVote[]> {
    if (!options.where) { options.where = {} }

    const itemMap = (item: any) => CompetitionVote.itemMap(context, item)
    
    let query
    if (options.where.suggestion && !options.where.id) {
      query = gql`query CompetitionVoteSearchBySuggestion
        {
          competitionSuggestion (id: "${options.where.suggestion}") {
            id
            votes ${createGraphQlQuery({ where: { ...options.where, suggestion: undefined } })} {
              ...CompetitionVoteFields
            }
          }
        }
        ${CompetitionVote.fragments.CompetitionVoteFields}
      `

      return context.getObservableObject(
        query,
        (r: any) => {
          if (r === null) { // no such proposal was found
            return []
          }
          return r.votes.map(itemMap)
        },
        apolloQueryOptions
      ) as Observable<CompetitionVote[]>
    } else {

      query = gql`query CompetitionVoteSearch
        {
          competitionVotes ${createGraphQlQuery(options)} {
            ...CompetitionVoteFields
          }
        }
        ${CompetitionVote.fragments.CompetitionVoteFields}
      `

      return context.getObservableList(
        query,
        itemMap,
        apolloQueryOptions
      ) as Observable<CompetitionVote[]>
    }
  }

  public static itemMap(context: Arc, item: any): CompetitionVote {

    return new CompetitionVote(context, {
      createdAt: secondSinceEpochToDate(item.createdAt),
      id: item.id,
      proposal: item.proposal.id,
      reputation: item.reputation,
      suggestion: item.suggestion.id,
      voter: item.voter
    })
  }

  public state(apolloQueryOptions: IApolloQueryOptions = {}): Observable<ICompetitionVoteState> {
    const query = gql`query CompetitionVoteById
      {
        competitionVote (id: "${this.id}") {
          ...CompetitionVoteFields
        }
      }
      ${CompetitionVote.fragments.CompetitionVoteFields}
      `
    return this.context.getObservableObject(query, (item: any) => CompetitionVote.itemMap(this.context, item), apolloQueryOptions)
  }

}