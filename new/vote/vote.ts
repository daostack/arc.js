import BN = require('bn.js')
import gql from 'graphql-tag'
import { Observable } from 'rxjs'
import { first } from 'rxjs/operators'
import { Arc, IApolloQueryOptions } from './arc'
import { IProposalOutcome } from './proposal'
import { Address, Date, ICommonQueryOptions, IStateful } from './types'
import { createGraphQlQuery, isAddress } from './utils'
import { Entity } from '../entity'
import { Arc } from '../arc'

export interface IVoteState {
  id: string
  voter: Address
  createdAt: Date | undefined
  outcome: IProposalOutcome
  amount: BN // amount of reputation that was voted with
  proposal: string
  dao?: Address
}

export interface IVoteQueryOptions extends ICommonQueryOptions {
  where?: {
    id?: string
    voter?: Address
    outcome?: IProposalOutcome
    proposal?: string
    dao?: Address
    [key: string]: any
  }
}

export class Vote extends Entity<IVoteState> {

  constructor(context: Arc, stateOrId: string | IVoteState) {
    super()
    this.context = context

    if (typeof stateOrId === 'string') {
      this.id = stateOrId
    } else {
      this.id = stateOrId.id
      this.setState(stateOrId)
    }
  }

  public static fragments = {
    VoteFields: gql`fragment VoteFields on ProposalVote {
      id
      createdAt
      dao {
        id
      }
      voter
      proposal {
        id
      }
      outcome
      reputation
    }`
  }

  public static search(
    context: Arc,
    options: IVoteQueryOptions = {},
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable <Vote[]> {
    if (!options.where) { options.where = {}}
    const proposalId = options.where.proposal

    if (proposalId) {
      delete options.where.proposal
    }

    let where = ''
    for (const key of Object.keys(options.where)) {
      if (options.where[key] === undefined) {
        continue
      }

      if (key === 'voter' || key === 'dao') {
        const option = options.where[key] as string
        isAddress(option)
        options.where[key] = option.toLowerCase()
      }

      if (key === 'outcome') {
        where += `${key}: "${IProposalOutcome[options.where[key] as number]}"\n`
      } else {
        where += `${key}: "${options.where[key] as string}"\n`
      }
    }

    let query
    const itemMap = (r: any) => {
      let outcome: IProposalOutcome = IProposalOutcome.Pass
      if (r.outcome === 'Pass') {
        outcome = IProposalOutcome.Pass
      } else if (r.outcome === 'Fail') {
        outcome = IProposalOutcome.Fail
      } else {
        throw new Error(`Unexpected value for proposalVote.outcome: ${r.outcome}`)
      }
      return new Vote(context, {
        amount: new BN(r.reputation || 0),
        createdAt: r.createdAt,
        dao: r.dao.id,
        id: r.id,
        outcome,
        proposal: r.proposal.id,
        voter: r.voter
      })
    }

    if (proposalId && !options.where.id) {
      query = gql`query ProposalVotesSearchFromProposal
        {
          proposal (id: "${proposalId}") {
            id
            votes ${createGraphQlQuery({ where: { ...options.where, proposal: undefined}}, where)} {
              ...VoteFields
            }
          }
        }
        ${Vote.fragments.VoteFields}
      `

      return context.getObservableObject(
        query,
        (r: any) => {
          if (r === null) { // no such proposal was found
            return []
          }
          const votes = r.votes
          return votes.map(itemMap)
        },
        apolloQueryOptions
      ) as Observable<Vote[]>

    } else {
      query = gql`query ProposalVotesSearch
        {
          proposalVotes ${createGraphQlQuery(options, where)} {
            ...VoteFields
          }
        }
        ${Vote.fragments.VoteFields}
      `

      return context.getObservableList(
        query,
        itemMap,
        apolloQueryOptions
      ) as Observable<Vote[]>
    }
  }

  public state(apolloQueryOptions: IApolloQueryOptions = {}): Observable<IVoteState> {
    const query = gql`query ProposalVoteById {
      proposalVote (id: "${this.id}") {
        ...VoteFields
      }
    }
    ${Vote.fragments.VoteFields}
    `

    const itemMap = (item: any): IVoteState => {
      if (item === null) {
        throw Error(`Could not find a Vote with id ${this.id}`)
      }

      let outcome: IProposalOutcome = IProposalOutcome.Pass
      if (item.outcome === 'Pass') {
        outcome = IProposalOutcome.Pass
      } else if (item.outcome === 'Fail') {
        outcome = IProposalOutcome.Fail
      } else {
        throw new Error(`Unexpected value for proposalVote.outcome: ${item.outcome}`)
      }

      return {
        amount: new BN(item.reputation || 0),
        createdAt: item.createdAt,
        dao: item.dao.id,
        id: item.id,
        outcome,
        proposal: item.proposal.id,
        voter: item.voter
      }
    }

    return this.context.getObservableObject(query, itemMap, apolloQueryOptions)
  }
}
