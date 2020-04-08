import BN = require('bn.js')
import gql from 'graphql-tag'
import { Observable } from 'rxjs'
import { Arc, IApolloQueryOptions } from './arc'
import { Address, ICommonQueryOptions, IStateful } from './types'
import { createGraphQlQuery, isAddress } from './utils'
import { Entity } from './entity'

export interface IRewardState {
  id: string,
  beneficiary: Address,
  createdAt: Date,
  proposalId: string,
  reputationForVoter: BN,
  tokensForStaker: BN,
  daoBountyForStaker: BN,
  reputationForProposer: BN,
  tokenAddress: Address,
  reputationForVoterRedeemedAt: number,
  tokensForStakerRedeemedAt: number,
  reputationForProposerRedeemedAt: number,
  daoBountyForStakerRedeemedAt: number
}

export interface IRewardQueryOptions extends ICommonQueryOptions {
  where?: {
    id?: string,
    beneficiary?: Address,
    dao?: Address,
    proposal?: string,
    createdAtAfter?: Date,
    createdAtBefore?: Date,
    [key: string]: any
  }
}

export class Reward extends Entity<IRewardState> {

  public static fragments = {
    RewardFields: gql`fragment RewardFields on GPReward {
      id
      createdAt
      dao {
        id
      }
      beneficiary
      daoBountyForStaker
      proposal {
         id
      }
      reputationForVoter
      reputationForVoterRedeemedAt
      reputationForProposer
      reputationForProposerRedeemedAt
      tokenAddress
      tokensForStaker
      tokensForStakerRedeemedAt
      daoBountyForStakerRedeemedAt
    }`
  }

  constructor(context: Arc, idOrOpts: string|IRewardState) {
    super(context, idOrOpts)
    this.context = context
    if (typeof idOrOpts === 'string') {
      this.id = idOrOpts
    } else {
      this.id = idOrOpts.id
      this.setState(idOrOpts)
    }
  }

  public static search(
    context: Arc,
    options: IRewardQueryOptions = {},
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable<Reward[]> {
    let where = ''
    if (!options.where) { options.where = {}}

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

      if (key === 'beneficiary' || key === 'dao') {
        const option = options.where[key] as string
        isAddress(option)
        options.where[key] = option.toLowerCase()
      }

      where += `${key}: "${options.where[key] as string}"\n`
    }

    const itemMap = (item: any) => Reward.itemMap(context, item)

    let query
    if (proposalId) {
      query = gql`query RewardSearchFromProposal
      {
        proposal (id: "${proposalId}") {
          id
          gpRewards ${createGraphQlQuery(options, where)} {
            ...RewardFields
          }
        }
      }
      ${Reward.fragments.RewardFields}
      `
      return context.getObservableObject(
        query,
        (r: any) => {
          if (r === null) {
            return []
          }
          const rewards = r.gpRewards
          return rewards.map(itemMap)
        },
        apolloQueryOptions
      ) as Observable<Reward[]>
    } else {
      query = gql`query RewardSearch
      {
        gprewards ${createGraphQlQuery(options, where)} {
          ...RewardFields
        }
      }
      ${Reward.fragments.RewardFields}
      `
    }

    return context.getObservableList(
      query,
      itemMap,
      apolloQueryOptions
    ) as Observable<Reward[]>
  }

  public static itemMap(context: Arc, item: any): Reward {
    return new Reward(context, {
      beneficiary: item.beneficiary,
      createdAt: item.createdAt,
      daoBountyForStaker: new BN(item.daoBountyForStaker),
      daoBountyForStakerRedeemedAt: Number(item.daoBountyForStakerRedeemedAt),
      id: item.id,
      proposalId: item.proposal.id,
      reputationForProposer: new BN(item.reputationForProposer),
      reputationForProposerRedeemedAt: Number(item.reputationForProposerRedeemedAt),
      reputationForVoter: new BN(item.reputationForVoter),
      reputationForVoterRedeemedAt: Number(item.reputationForVoterRedeemedAt),
      tokenAddress: item.tokenAddress,
      tokensForStaker: new BN(item.tokensForStaker),
      tokensForStakerRedeemedAt: Number(item.tokensForStakerRedeemedAt)
    })
  }

  public state(apolloQueryOptions: IApolloQueryOptions = {}): Observable<IRewardState> {

    const query = gql`
      query RewardState {
        gpreward (id: "${this.id}")
        {
          ...RewardFields
        }
      }
      ${Reward.fragments.RewardFields}
    `

    const itemMap = (item: any) => Reward.itemMap(this.context, item)

    return this.context.getObservableObject(query, itemMap, apolloQueryOptions)
  }
}
