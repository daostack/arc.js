import BN from 'bn.js'
import { utils } from 'ethers'
import gql from 'graphql-tag'
import { Observable } from 'rxjs'
import { concatMap, first } from 'rxjs/operators'
import {
  Address,
  Arc,
  CompetitionProposal,
  CompetitionVote,
  concat,
  createGraphQlQuery,
  Entity,
  hexStringToUint8Array,
  IApolloQueryOptions,
  ICommonQueryOptions,
  ICompetitionVoteQueryOptions,
  IEntityRef,
  Operation,
  secondSinceEpochToDate,
  toIOperationObservable
} from '../../index'

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
    id?: string // id of the competition
    proposal?: string // id of the proposal
    suggestionId?: number // the "suggestionId" is a counter that is unique to the scheme
    // - and is not to be confused with suggestion.id
    positionInWinnerList?: number | null
    positionInWinnerList_not?: number | null
  }
}

export class CompetitionSuggestion extends Entity<ICompetitionSuggestionState> {
  public static fragments = {
    CompetitionSuggestionFields: gql`
      fragment CompetitionSuggestionFields on CompetitionSuggestion {
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
      }
    `
  }

  public static search(
    context: Arc,
    options: ICompetitionSuggestionQueryOptions = {},
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable<CompetitionSuggestion[]> {
    const itemMap = (arc: Arc, item: any, queriedId?: string) => {
      const state = CompetitionSuggestion.itemMap(arc, item, queriedId)
      return new CompetitionSuggestion(arc, state)
    }

    let query

    // if we are looing for the suggestions of a particular proposal, we prime the cache..
    if (options.where && options.where.proposal && !options.where.id) {
      query = gql`query CompetitionSuggestionSearchByProposal
        {
          competitionProposal (id: "${options.where.proposal}") {
              suggestions ${createGraphQlQuery({
                where: { ...options.where, proposal: undefined }
              })} {
                ...CompetitionSuggestionFields
              }
            }
        }
        ${CompetitionSuggestion.fragments.CompetitionSuggestionFields}
      `
      return context.getObservableObject(
        context,
        query,
        (arc: Arc, r: any, queriedId?: string) => {
          if (!r) {
            // no such proposal was found
            return []
          }
          const itemMapper = (item: any) =>
            new CompetitionSuggestion(arc, CompetitionSuggestion.itemMap(context, item, queriedId))

          return r.suggestions.map(itemMapper)
        },
        options.where?.id,
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

      return context.getObservableList(context, query, itemMap, options.where?.id, apolloQueryOptions) as Observable<
        CompetitionSuggestion[]
      >
    }
  }

  public static calculateId(opts: {
      plugin: Address
      suggestionId: number
    }): string {
    const seed = concat(
      hexStringToUint8Array(opts.plugin.toLowerCase()),
      hexStringToUint8Array(Number(opts.suggestionId).toString(16))
    )
    return utils.keccak256(seed)
  }

  private static itemMap(
    context: Arc,
    item: any,
    queriedId?: string
  ): ICompetitionSuggestionState {
    if (!item) {
      throw Error(`Competition Suggestion ItemMap failed. ${queriedId && `Could not find Competition Suggestion with id '${queriedId}'`}`)
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

  public suggestionId?: number

  constructor(
    context: Arc,
    idOrOpts: string | {
      suggestionId: number
      plugin: string
    } | ICompetitionSuggestionState
  ) {
    if (typeof idOrOpts === 'string') {
      super(context, idOrOpts)
      this.id = idOrOpts
    } else {
      if (
        Object.keys(idOrOpts).includes('plugin') &&
        Object.keys(idOrOpts).includes('suggestionId')
      ) {
        const id = CompetitionSuggestion.calculateId(
          idOrOpts as {
            suggestionId: number
            plugin: string
          }
        )
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

  public state(
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable<ICompetitionSuggestionState> {
    const query = gql`query CompetitionSuggestionById
      {
        competitionSuggestion (id: "${this.id}") {
          ...CompetitionSuggestionFields
        }
      }
      ${CompetitionSuggestion.fragments.CompetitionSuggestionFields}
    `

    return this.context.getObservableObject(
      this.context,
      query,
      CompetitionSuggestion.itemMap,
      this.id,
      apolloQueryOptions
    )
  }

  public async fetchState(): Promise<ICompetitionSuggestionState> {
    const state = await this.state({ fetchPolicy: 'cache-first' }).pipe(first()).toPromise()
    this.setState(state)
    return state
  }

  public async getPosition() {
    console.warn(
      `This method is deprecated - please use the positionInWinnerList from the proposal state`
    )
    const suggestionState = await this.fetchState()
    return suggestionState.positionInWinnerList
  }

  public async isWinner() {
    console.warn(
      `This method is deprecated - please use the positionInWinnerList !== from the proposal state`
    )
    const suggestionState = await this.fetchState()
    return suggestionState.isWinner
  }

  public votes(
    options: ICompetitionVoteQueryOptions = {},
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable<CompetitionVote[]> {
    if (!options.where) {
      options.where = {}
    }
    options.where = { ...options.where, suggestion: this.id }
    return CompetitionVote.search(this.context, options, apolloQueryOptions)
  }

  public redeem(): Operation<boolean> {
    const observable = this.state().pipe(
      first(),
      concatMap((suggestionState: ICompetitionSuggestionState) => {
        const competition = new CompetitionProposal(
          this.context,
          suggestionState.proposal.entity.id
        )
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
        const competition = new CompetitionProposal(
          this.context,
          suggestionState.proposal.entity.id
        )
        return competition.voteSuggestion({
          suggestionId: suggestionState.suggestionId
        })
      })
    )
    return toIOperationObservable(observable)
  }
}
