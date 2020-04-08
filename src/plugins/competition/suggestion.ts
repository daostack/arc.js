import BN from 'bn.js'
import { Entity, IEntityRef } from "../../entity"
import { Arc } from "../../arc"
import gql from "graphql-tag"
import { hexStringToUint8Array, concat, createGraphQlQuery, secondSinceEpochToDate } from "../../utils"
import { utils } from "ethers"
import { Address, IApolloQueryOptions, ICommonQueryOptions } from "../../types"
import { Observable } from "rxjs"
import { toIOperationObservable, Operation } from '../../operation'
import { first, concatMap } from 'rxjs/operators'
import { CompetitionVote, ICompetitionVoteQueryOptions } from './vote'
import { CompetitionProposal } from './proposal'

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
    idOrOpts: string | { suggestionId: number, scheme: string } | ICompetitionSuggestionState
  ) {
    if (typeof idOrOpts === 'string') {
      super(context, idOrOpts)
      this.id = idOrOpts
    } else {
      if (
        Object.keys(idOrOpts).includes('scheme') &&
        Object.keys(idOrOpts).includes('suggestionId')
      ) {
        const id = CompetitionSuggestion.calculateId(idOrOpts as { suggestionId: number, scheme: string })
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

    let query
    const itemMap = (item: any) => {
      return new CompetitionSuggestion(context, this.mapItemToObject(context, item) as ICompetitionSuggestionState)
    }

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
        query,
        (r: any) => {
          if (r === null) { // no such proposal was found
            return []
          }
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
        query,
        itemMap,
        apolloQueryOptions
      ) as Observable<CompetitionSuggestion[]>
    }
  }

  public static calculateId(opts: { scheme: Address, suggestionId: number }): string {
    const seed = concat(
      hexStringToUint8Array(opts.scheme.toLowerCase()),
      hexStringToUint8Array(Number(opts.suggestionId).toString(16))
    )
    return utils.keccak256(seed)
  }

  private static mapItemToObject(context: Arc, item: any): ICompetitionSuggestionState | null {
    if (item === null) {
      return null
    }

    let redeemedAt = null
    if (item.redeemedAt !== null) {
      redeemedAt = secondSinceEpochToDate(item.redeemedAt)
    }
    let positionInWinnerList = null
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
      proposal: item.proposal.id,
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

    const itemMap = (item: any) => CompetitionSuggestion.mapItemToObject(this.context, item)
    return this.context.getObservableObject(query, itemMap, apolloQueryOptions)
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
        if(!suggestionState.proposal.entity.coreState) throw new Error("SuggestionState's proposal's state is not set")

        const competition = new CompetitionProposal(this.context, suggestionState.proposal.entity.coreState)
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
        if(!suggestionState.proposal.entity.coreState) throw new Error("SuggestionState's proposal's state is not set")
        
        const competition = new CompetitionProposal(this.context, suggestionState.proposal.entity.coreState)
        return competition.voteSuggestion({
          suggestionId: suggestionState.suggestionId
        })
      })
    )
    return toIOperationObservable(observable)
  }
}