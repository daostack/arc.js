import BN from 'bn.js'
import gql from 'graphql-tag'
import { utils } from 'ethers'
import { Observable } from 'rxjs'
import { first, concatMap } from 'rxjs/operators'
import {
  Entity,
  IEntityRef,
  Arc,
  hexStringToUint8Array,
  concat,
  createGraphQlQuery,
  secondSinceEpochToDate,
  toIOperationObservable,
  Operation,
  CompetitionVote,
  ICompetitionVoteQueryOptions,
  CompetitionProposal,
  Address,
  IApolloQueryOptions,
  ICommonQueryOptions
} from '../../index'
import { DocumentNode } from 'graphql'

export interface ICompetitionSuggestionState {
  id: string
  suggestionId: number
  proposal: IEntityRef<CompetitionProposal>
  descriptionHash: string
  title?: string
  description?: string
  url?: string
  // fulltext: [string]
  suggester: Address
  beneficiary: Address
  // votes: [CompetitionVote!] @derivedFrom(field: "suggestion")
  tags: string[]
  totalVotes: BN
  createdAt: Date
  redeemedAt: Date | null
  rewardPercentage: number
  positionInWinnerList: number | null // 0 is the first, null means it is not winning
  isWinner: boolean
}

export interface ICompetitionSuggestionQueryOptions extends ICommonQueryOptions {
  where?: {
    id?: string, // id of the competition
    proposal?: string, // id of the proposal
    suggestionId?: number // the "suggestionId" is a counter that is unique to the scheme
    // - and is not to be confused with suggestion.id
    positionInWinnerList?: number | null
    positionInWinnerList_not?: number | null
  }
}

export class CompetitionSuggestion extends Entity<ICompetitionSuggestionState> {

  public suggestionId?: number

  public static fragments = {
    CompetitionSuggestionFields: gql`fragment CompetitionSuggestionFields on CompetitionSuggestion {
      id
      suggestionId
      proposal {
       id
      }
      descriptionHash
      title
      description
      url
      tags {
        id
      }
      # fulltext: [string]
      beneficiary
      suggester
      # votes: [CompetitionVote!] @derivedFrom(field: "suggestion")
      totalVotes
      createdAt
      redeemedAt
      rewardPercentage
      positionInWinnerList
    }`
  }

  constructor(
    context: Arc,
    idOrOpts: string | { suggestionId: number, plugin: string } | ICompetitionSuggestionState
  ) {
    if (typeof idOrOpts === 'string') {
      super(context, idOrOpts)
      this.id = idOrOpts
    } else {
      if (
        Object.keys(idOrOpts).includes('plugin') &&
        Object.keys(idOrOpts).includes('suggestionId')
      ) {
        const id = CompetitionSuggestion.calculateId(idOrOpts as { suggestionId: number, plugin: string })
        super(context, id)
        this.id = id 
        this.suggestionId = idOrOpts.suggestionId
      } else {
        const opts = idOrOpts as ICompetitionSuggestionState
        super(context, opts)
        this.id = opts.id
        this.setState(opts)
      }
    }
  }
  
  public static search(
    context: Arc,
    options: ICompetitionSuggestionQueryOptions = {},
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable<CompetitionSuggestion[]> {

    const itemMap = (context: Arc, item: any, query: DocumentNode) => {
      const state = CompetitionSuggestion.itemMap(context, item, query)
      return new CompetitionSuggestion(context, state)
    }

    let query

    // if we are looing for the suggestions of a particular proposal, we prime the cache..
    if (options.where && options.where.proposal && !options.where.id) {
      query = gql`query CompetitionSuggestionSearchByProposal
        {
          competitionProposal (id: "${options.where.proposal}") {
              suggestions ${createGraphQlQuery({ where: { ...options.where, proposal: undefined } })} {
                ...CompetitionSuggestionFields
              }
            }
        }
        ${CompetitionSuggestion.fragments.CompetitionSuggestionFields}
      `
      return context.getObservableObject(
        context,
        query,
        (context: Arc, r: any, query: DocumentNode) => {
          if (!r) { // no such proposal was found
            return []
          }
          const itemMap = (item: any) =>
            new CompetitionSuggestion(context, CompetitionSuggestion.itemMap(context, item, query))

          return r.suggestions.map(itemMap)
        },
        apolloQueryOptions
      ) as Observable<CompetitionSuggestion[]>
    } else {
      query = gql`query CompetitionSuggestionSearch
        {
          competitionSuggestions ${createGraphQlQuery(options)} {
            ...CompetitionSuggestionFields
          }
        }
        ${CompetitionSuggestion.fragments.CompetitionSuggestionFields}
      `

      return context.getObservableList(
        context,
        query,
        itemMap,
        apolloQueryOptions
      ) as Observable<CompetitionSuggestion[]>
    }
  }

  public static calculateId(opts: { plugin: Address, suggestionId: number }): string {
    const seed = concat(
      hexStringToUint8Array(opts.plugin.toLowerCase()),
      hexStringToUint8Array(Number(opts.suggestionId).toString(16))
    )
    return utils.keccak256(seed)
  }

  private static itemMap(context: Arc, item: any, query: DocumentNode): ICompetitionSuggestionState {
    if (!item) {
      throw Error(`Competition Suggestion ItemMap failed. Query: ${query.loc?.source.body}`)
    }

    let redeemedAt: Date | null = null
    if (item.redeemedAt !== null) {
      redeemedAt = secondSinceEpochToDate(item.redeemedAt)
    }
    let positionInWinnerList: number | null = null
    if (item.positionInWinnerList !== null) {
      positionInWinnerList = Number(item.positionInWinnerList)
    }
    return {
      beneficiary: item.beneficiary,
      createdAt: secondSinceEpochToDate(item.createdAt),
      description: item.description,
      descriptionHash: item.descriptionHash,
      id: item.id,
      isWinner: positionInWinnerList !== null,
      positionInWinnerList,
      proposal: {
        id: item.proposal.id,
        entity: new CompetitionProposal(context, item.proposal.id)
      },
      redeemedAt,
      rewardPercentage: Number(item.rewardPercentage),
      suggester: item.suggester,
      suggestionId: item.suggestionId,
      tags: item.tags.map((tag: any) => tag.id),
      title: item.title,
      totalVotes: new BN(item.totalVotes),
      url: item.url
    }

  }

  public state(apolloQueryOptions: IApolloQueryOptions = {}): Observable<ICompetitionSuggestionState> {
    const query = gql`query CompetitionSuggestionById
      {
        competitionSuggestion (id: "${this.id}") {
          ...CompetitionSuggestionFields
        }
      }
      ${CompetitionSuggestion.fragments.CompetitionSuggestionFields}
    `

    return this.context.getObservableObject(this.context, query, CompetitionSuggestion.itemMap, apolloQueryOptions)
  }

  public async fetchState(): Promise<ICompetitionSuggestionState> {
    const state = await this.state({ fetchPolicy: 'cache-first' }).pipe(first()).toPromise()
    this.setState(state)
    return state
  }

  public async getPosition() {
    console.warn(`This method is deprecated - please use the positionInWinnerList from the proposal state`)
    const suggestionState = await this.fetchState()
    return suggestionState.positionInWinnerList
  }

  public async isWinner() {
    console.warn(`This method is deprecated - please use the positionInWinnerList !== from the proposal state`)
    const suggestionState = await this.fetchState()
    return suggestionState.isWinner
  }

  public votes(
    options: ICompetitionVoteQueryOptions = {},
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable<CompetitionVote[]> {
    if (!options.where) { options.where = {} }
    options.where = { ...options.where, suggestion: this.id }
    return CompetitionVote.search(this.context, options, apolloQueryOptions)
  }

  public redeem(): Operation<boolean> {
    const observable = this.state().pipe(
      first(),
      concatMap((suggestionState: ICompetitionSuggestionState) => {
        const competition = new CompetitionProposal(this.context, suggestionState.proposal.entity.id)
        return competition.redeemSuggestion({
          suggestionId: suggestionState.suggestionId
        })
      })
    )
    return toIOperationObservable(observable)
  }

  public vote(): Operation<CompetitionVote> {
    const observable = this.state().pipe(
      first(),
      concatMap((suggestionState: ICompetitionSuggestionState) => {
        const competition = new CompetitionProposal(this.context, suggestionState.proposal.entity.id)
        return competition.voteSuggestion({
          suggestionId: suggestionState.suggestionId
        })
      })
    )
    return toIOperationObservable(observable)
  }
}