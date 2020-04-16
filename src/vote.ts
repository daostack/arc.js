import BN = require('bn.js')
import gql from 'graphql-tag'
import { Observable } from 'rxjs'
import { Arc, IApolloQueryOptions } from './arc'
import { IProposalOutcome } from './plugins/proposal'
import { Address, Date, ICommonQueryOptions } from './types'
import { createGraphQlQuery, isAddress } from './utils'
import { Entity, IEntityRef } from './entity'
import { Proposals, AnyProposal } from './plugins'

export interface IVoteState {
  id: string
  voter: Address
  createdAt: Date | undefined
  outcome: IProposalOutcome
  amount: BN // amount of reputation that was voted with
  //TODO: Any type of proposal?
  proposal: IEntityRef<AnyProposal>
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
        scheme {
          name
        }
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
    // if we are searching for votes of a specific proposal (a common case), we
    // will structure the query so that votes are stored in the cache together wit the proposal
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

    // if we are searching for votes of a specific proposal (a common case), we
    // will structure the query so that votes are stored in the cache together with the proposal
    // if (options.where.proposal && !options.where.id) {
    if (proposalId && !options.where.id) {
      query = gql`query ProposalVotesSearchFromProposal
        {
          proposal (id: "${proposalId}") {
            id
            scheme {
              name
            }
            votes ${createGraphQlQuery({ where: { ...options.where, proposal: undefined}}, where)} {
              ...VoteFields
            }
          }
        }
        ${Vote.fragments.VoteFields}
      `

      return context.getObservableObject(
        context,
        query,
        (context: Arc, r: any) => {
          if (r === null) { // no such proposal was found
            return []
          }
          const votes = r.votes
          const itemMap = (item: any) => Vote.itemMap(context, item)
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
        context,
        query,
        Vote.itemMap,
        apolloQueryOptions
      ) as Observable<Vote[]>
    }
  }

  public static itemMap = (context: Arc, item: any): Vote => {
    if (item === null) {
      //TODO: How to get ID for this error msg?
      throw Error(`Could not find a Vote with id`)
    }

    let outcome: IProposalOutcome = IProposalOutcome.Pass
    if (item.outcome === 'Pass') {
      outcome = IProposalOutcome.Pass
    } else if (item.outcome === 'Fail') {
      outcome = IProposalOutcome.Fail
    } else {
      throw new Error(`Unexpected value for proposalVote.outcome: ${item.outcome}`)
    }

    return new Vote(context, {
      amount: new BN(item.reputation || 0),
      createdAt: item.createdAt,
      dao: item.dao.id,
      id: item.id,
      outcome,
      proposal: {
        id: item.proposal.id,
        entity: new Proposals[item.proposal.scheme.name](context, item.proposal.id)
      },
      voter: item.voter
    })
  }

  public state(apolloQueryOptions: IApolloQueryOptions = {}): Observable<IVoteState> {
    const query = gql`query ProposalVoteById {
      proposalVote (id: "${this.id}") {
        ...VoteFields
      }
    }
    ${Vote.fragments.VoteFields}
    `
    
    return this.context.getObservableObject(this.context, query, Vote.itemMap, apolloQueryOptions)
  }
}
