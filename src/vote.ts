import BN from 'bn.js'
import { DocumentNode } from 'graphql'
import gql from 'graphql-tag'
import { Observable } from 'rxjs'
import {
  Address,
  AnyProposal,
  Arc,
  createGraphQlQuery,
  Date,
  Entity,
  IApolloQueryOptions,
  ICommonQueryOptions,
  IEntityRef,
  IProposalOutcome,
  isAddress,
  Logger,
  Plugins,
  Proposals
} from './index'

export interface IVoteState {
  id: string
  voter: Address
  createdAt: Date | undefined
  outcome: IProposalOutcome
  amount: BN // amount of reputation that was voted with
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
    VoteFields: gql`
      fragment VoteFields on ProposalVote {
        id
        createdAt
        dao {
          id
        }
        voter
        proposal {
          id
          scheme {
            id
            name
          }
        }
        outcome
        reputation
      }
    `
  }

  public static search(
    context: Arc,
    options: IVoteQueryOptions = {},
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable<Vote[]> {
    if (!options.where) {
      options.where = {}
    }
    const proposalId = options.where.proposal

    const itemMap = (arc: Arc, item: any, queriedId?: string) => {
      const state = Vote.itemMap(arc, item, queriedId)
      return new Vote(arc, state)
    }

    // if we are searching for votes of a specific proposal (a common case), we
    // will structure the query so that votes are stored in the cache together wit the proposal
    if (proposalId) {
      delete options.where.proposal
    }

    let where = ''
    for (let key of Object.keys(options.where)) {
      if (options.where[key] === undefined) {
        continue
      }

      // TODO: remove once this issue is closed https://github.com/daostack/subgraph/issues/537
      const value = options.where[key]
      key = key.replace('plugin', 'scheme')
      key = key.replace('Plugin', 'Scheme')
      options.where[key] = value

      if (key === 'voter' || key === 'dao') {
        const option = options.where[key] as string
        isAddress(option)
        options.where[key] = option.toLowerCase()
      }

      if (key === 'outcome') {
        where += `${key}: "${IProposalOutcome[options.where[key] as number]}"\n`
      } else {
        if (Array.isArray(options.where[key])) {
          // Support for operators like _in
          const values = options.where[key].map((val: number) => '"' + val + '"')
          where += `${key}: [${values.join(',')}]\n`
        } else {
          where += `${key}: "${options.where[key] as string}"\n`
        }
      }
    }

    let query: DocumentNode

    // if we are searching for votes of a specific proposal (a common case), we
    // will structure the query so that votes are stored in the cache together with the proposal
    // if (options.where.proposal && !options.where.id) {
    if (proposalId && !options.where.id) {
      query = gql`query ProposalVotesSearchFromProposal
        {
          proposal (id: "${proposalId}") {
            id
            scheme {
              id
              name
            }
            votes ${createGraphQlQuery(
              { where: { ...options.where, proposal: undefined } },
              where
            )} {
              ...VoteFields
            }
          }
        }
        ${Vote.fragments.VoteFields}
      `

      return context.getObservableObject(
        context,
        query,
        (arc: Arc, r: any, queriedId?: string) => {
          if (!r) {
            // no such proposal was found
            return []
          }
          const votes = r.votes
          const itemMapper = (item: any) => {
            const state = Vote.itemMap(arc, item, queriedId)
            return new Vote(arc, state)
          }
          return votes.map(itemMapper)
        },
        options.where?.id,
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

      return context.getObservableList(context, query, itemMap, options.where?.id, apolloQueryOptions) as Observable<
        Vote[]
      >
    }
  }

  public static itemMap = (context: Arc, item: any, queriedId?: string): IVoteState => {
    if (!item) {
      throw Error(`Vote ItemMap failed. ${queriedId ? `Could not find Vote with id '${queriedId}'` : ''}`)
    }

    let outcome: IProposalOutcome = IProposalOutcome.Pass
    if (item.outcome === 'Pass') {
      outcome = IProposalOutcome.Pass
    } else if (item.outcome === 'Fail') {
      outcome = IProposalOutcome.Fail
    } else {
      throw new Error(`Unexpected value for proposalVote.outcome: ${item.outcome}`)
    }

    if (!Object.keys(Plugins).includes(item.proposal.scheme.name)) {
      Logger.debug(
        `Proposal's Plugin name '${item.proposal.scheme.name}' not supported. Instantiating it as Unknown Proposal.`
      )
      item.proposal.scheme.name = 'Unknown'
    }

    if (item.proposal.scheme.name === 'ContributionRewardExt') {
      if (item.proposal.competition) {
        item.proposal.scheme.name = 'Competition'
      }
    }

    return {
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

    return this.context.getObservableObject(this.context, query, Vote.itemMap, this.id, apolloQueryOptions)
  }
}
