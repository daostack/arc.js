import BN from 'bn.js'
import gql from 'graphql-tag'
import { Observable } from 'rxjs'
import {
  Arc,
  createGraphQlQuery,
  secondSinceEpochToDate,
  Entity,
  Address,
  IApolloQueryOptions,
  ICommonQueryOptions
} from '../../index'

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

  public static search(
    context: Arc,
    options: ICompetitionVoteQueryOptions = {},
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable<CompetitionVote[]> {
    if (!options.where) { options.where = {} }
    
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
        context,
        query,
        (context: Arc, r: any) => {
          if (r === null) { // no such proposal was found
            return []
          }
          const itemMap = (item: any) => CompetitionVote.itemMap(context, item)
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
        context,
        query,
        CompetitionVote.itemMap,
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
    return this.context.getObservableObject(this.context, query, CompetitionVote.itemMap, apolloQueryOptions)
  }

}