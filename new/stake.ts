import BN = require('bn.js')
import gql from 'graphql-tag'
import { Observable } from 'rxjs'
import { first } from 'rxjs/operators'
import { Arc, IApolloQueryOptions } from './arc'
import { IProposalOutcome, Proposal} from './proposal'
import { Address, ICommonQueryOptions, IStateful } from './types'
import { createGraphQlQuery, isAddress } from './utils'
import { Entity, IEntityRef } from './entity'
import Proposals from './proposals'

export interface IStakeState {
  id: string
  staker: Address
  createdAt: Date | undefined
  outcome: IProposalOutcome
  amount: BN // amount staked
  proposal: IEntityRef<Proposal>
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
    StakeFields: gql`fragment StakeFields on ProposalStake {
      id
      createdAt
      dao {
        id
      }
      staker
      proposal {
        id
        scheme {
          name
        }
      }
      outcome
      amount
    }`
  }

  constructor(
    public context: Arc,
    idOrOpts: string|IStakeState
  ) {
    super()
    if (typeof idOrOpts === 'string') {
      this.id = idOrOpts
    } else {
      this.id = idOrOpts.id
      this.setState(idOrOpts as IStakeState)
    }
  }

  public static search(
    context: Arc,
    options: IStakeQueryOptions = {},
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable <Stake[]> {
    if (!options.where) { options.where = {}}
    let where = ''

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

    let query
    const itemMap = (item: any) => Stake.itemMap(context, item)

    if (proposalId && !options.where.id) {
      query = gql`query ProposalStakesSearchFromProposal
        {
          proposal (id: "${proposalId}") {
            id
            scheme {
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
        query,
        (r: any) => {
          if (r === null) { // no such proposal was found
            return []
          }
          const stakes = r.stakes
          return stakes.map(itemMap)
        },
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

      return context.getObservableList(
        query,
        itemMap,
        apolloQueryOptions
      ) as Observable<Stake[]>
    }
  }

  public static itemMap = (context: Arc, item: any): Stake => {
    if (item === null) {
      //TODO: How to get ID for this error msg?
      throw Error(`Could not find a Stake with id`)
    }

    let outcome: IProposalOutcome = IProposalOutcome.Pass
    if (item.outcome === 'Pass') {
      outcome = IProposalOutcome.Pass
    } else if (item.outcome === 'Fail') {
      outcome = IProposalOutcome.Fail
    } else {
      throw new Error(`Unexpected value for proposalStakes.outcome: ${item.outcome}`)
    }

    return new Stake(context, {
      amount: new BN(item.amount),
      createdAt: item.createdAt,
      id: item.id,
      outcome,
      proposal: {
        id: item.proposal.id,
        entity: new Proposals[item.proposal.scheme.name](context, item.proposal.id)
      },
      staker: item.staker
    })
    
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

    const itemMap = (item: any) => Stake.itemMap(this.context, item)

    return this.context.getObservableObject(query, itemMap, apolloQueryOptions)
  }
}
