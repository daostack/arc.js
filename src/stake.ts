import BN from 'bn.js'
import { DocumentNode } from 'graphql'
import gql from 'graphql-tag'
import { Observable } from 'rxjs'
import {
  Address,
  AnyProposal,
  Arc,
  createGraphQlQuery,
  Entity,
  IApolloQueryOptions,
  ICommonQueryOptions,
  IEntityRef,
  IProposalOutcome,
  isAddress,
  Proposals
} from './index'

export interface IStakeState {
  id: string
  staker: Address
  createdAt: Date | undefined
  outcome: IProposalOutcome
  amount: BN // amount staked
  // TODO: Any type of proposal?
  proposal: IEntityRef<AnyProposal>
}

export interface IStakeQueryOptions extends ICommonQueryOptions {
  where?: {
    id?: string
    staker?: Address
    dao?: Address
    proposal?: string
    createdAt?: number
    [key: string]: any
  }
}

export class Stake extends Entity<IStakeState> {
  public static fragments = {
    StakeFields: gql`
      fragment StakeFields on ProposalStake {
        id
        createdAt
        dao {
          id
        }
        staker
        proposal {
          id
          scheme {
            id
            name
          }
        }
        outcome
        amount
      }
    `
  }

  public static search(
    context: Arc,
    options: IStakeQueryOptions = {},
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable<Stake[]> {
    if (!options.where) {
      options.where = {}
    }
    let where = ''

    const itemMap = (arc: Arc, item: any, queriedId?: string) => {
      const state = Stake.itemMap(arc, item, queriedId)
      return new Stake(arc, state)
    }

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

      if (key === 'staker' || key === 'dao') {
        const option = options.where[key] as string
        isAddress(option)
        options.where[key] = option.toLowerCase()
      }

      where += `${key}: "${options.where[key] as string}"\n`
    }

    let query: DocumentNode

    if (proposalId && !options.where.id) {
      query = gql`query ProposalStakesSearchFromProposal
        {
          proposal (id: "${proposalId}") {
            id
            scheme {
              id
              name
            }
            stakes ${createGraphQlQuery(options, where)} {
              ...StakeFields
            }
          }
        }
        ${Stake.fragments.StakeFields}
      `

      return context.getObservableObject(
        context,
        query,
        (arc: Arc, r: any, queriedId?: string) => {
          if (!r) {
            // no such proposal was found
            return []
          }
          const stakes = r.stakes
          const itemMapper = (item: any) => {
            const state = Stake.itemMap(arc, item, queriedId)
            return new Stake(arc, state)
          }

          if (!stakes) {
            return []
          }

          return stakes.map(itemMapper)
        },
        options.where?.id,
        apolloQueryOptions
      ) as Observable<Stake[]>
    } else {
      query = gql`query ProposalStakesSearch
        {
          proposalStakes ${createGraphQlQuery(options, where)} {
              ...StakeFields
          }
        }
        ${Stake.fragments.StakeFields}
      `

      return context.getObservableList(context, query, itemMap, options.where?.id, apolloQueryOptions) as Observable<
        Stake[]
      >
    }
  }

  public static itemMap = (context: Arc, item: any, queriedId?: string): IStakeState => {
    if (!item) {
      throw Error(`Stake ItemMap failed. ${queriedId && `Could not find Stake with id '${queriedId}'`}`)
    }

    let outcome: IProposalOutcome = IProposalOutcome.Pass
    if (item.outcome === 'Pass') {
      outcome = IProposalOutcome.Pass
    } else if (item.outcome === 'Fail') {
      outcome = IProposalOutcome.Fail
    } else {
      throw new Error(`Unexpected value for proposalStakes.outcome: ${item.outcome}`)
    }

    return {
      amount: new BN(item.amount),
      createdAt: item.createdAt,
      id: item.id,
      outcome,
      proposal: {
        id: item.proposal.id,
        entity: new Proposals[item.proposal.scheme.name](context, item.proposal.id)
      },
      staker: item.staker
    }
  }

  public state(apolloQueryOptions: IApolloQueryOptions = {}): Observable<IStakeState> {
    const query = gql`query StakeState
      {
        proposalStake (id: "${this.id}") {
          id
          createdAt
          staker
          proposal {
            id
          }
          outcome
          amount
        }
      }
    `

    return this.context.getObservableObject(this.context, query, Stake.itemMap, this.id, apolloQueryOptions)
  }
}
