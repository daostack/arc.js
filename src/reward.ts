import BN from 'bn.js'
import { DocumentNode } from 'graphql'
import gql from 'graphql-tag'
import { Observable } from 'rxjs'
import {
  Address,
  Arc,
  createGraphQlQuery,
  Entity,
  IApolloQueryOptions,
  ICommonQueryOptions,
  isAddress
} from './index'

export interface IRewardState {
  id: string
  beneficiary: Address
  createdAt: Date
  proposalId: string
  reputationForVoter: BN
  tokensForStaker: BN
  daoBountyForStaker: BN
  reputationForProposer: BN
  tokenAddress: Address
  reputationForVoterRedeemedAt: number
  tokensForStakerRedeemedAt: number
  reputationForProposerRedeemedAt: number
  daoBountyForStakerRedeemedAt: number
}

export interface IRewardQueryOptions extends ICommonQueryOptions {
  where?: {
    id?: string
    beneficiary?: Address
    dao?: Address
    proposal?: string
    createdAtAfter?: Date
    createdAtBefore?: Date
    [key: string]: any
  }
}

export class Reward extends Entity<IRewardState> {
  public static fragments = {
    RewardFields: gql`
      fragment RewardFields on GPReward {
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
      }
    `
  }

  public static search(
    context: Arc,
    options: IRewardQueryOptions = {},
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable<Reward[]> {
    let where = ''
    if (!options.where) {
      options.where = {}
    }

    const itemMap = (arc: Arc, item: any, queriedId?: string) => {
      const state = Reward.itemMap(arc, item, queriedId)
      return new Reward(arc, state)
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

      if (key === 'beneficiary' || key === 'dao') {
        const option = options.where[key] as string
        isAddress(option)
        options.where[key] = option.toLowerCase()
      }

      where += `${key}: "${options.where[key] as string}"\n`
    }

    let query: DocumentNode
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
        context,
        query,
        (arc: Arc, r: any, queriedId?: string) => {
          if (!r) {
            return []
          }
          const rewards = r.gpRewards

          const itemMapper = (item: any) => {
            const state = Reward.itemMap(arc, item, queriedId)
            return new Reward(arc, state)
          }

          return rewards.map(itemMapper)
        },
        options.where?.id,
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

    return context.getObservableList(context, query, itemMap, options.where?.id, apolloQueryOptions) as Observable<
      Reward[]
    >
  }

  public static itemMap(context: Arc, item: any, queriedId?: string): IRewardState {
    if (!item) {
      throw Error(`Reward ItemMap failed. ${queriedId && `Could not find Reward with id '${queriedId}'`}`)
    }

    return {
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
    }
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

    return this.context.getObservableObject(
      this.context,
      query,
      Reward.itemMap,
      this.id,
      apolloQueryOptions
    )
  }
}
