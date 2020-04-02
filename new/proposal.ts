import BN = require('bn.js')
import gql from 'graphql-tag'
import { Observable } from 'rxjs'
import { IEntityRef, Entity } from './entity'
import { IApolloQueryOptions, Address, ICommonQueryOptions } from './types'
import { Plugin } from './plugin'
import { IGenesisProtocolParams } from './genesisProtocol'
import { Arc } from './arc'
import { createGraphQlQuery, isAddress } from './utils'
import { IObservable } from './graphnode'
import Proposals from './proposals'
import { SchemeTypes } from './plugins'
import { IVoteQueryOptions, Vote } from './vote'
import { Stake, IStakeQueryOptions } from './stake'
import { Queue } from './queue'
import { IRewardQueryOptions, Reward } from './reward'
import { DAO } from './dao'

type ProposalTypeNames = keyof typeof Proposals

export enum IProposalOutcome {
  None,
  Pass,
  Fail
}

export enum IProposalStage {
  ExpiredInQueue,
  Executed,
  Queued,
  PreBoosted,
  Boosted,
  QuietEndingPeriod
}

export enum IExecutionState {
  None,
  QueueBarCrossed,
  QueueTimeOut,
  PreBoostedBarCrossed,
  BoostedTimeOut,
  BoostedBarCrossed
}

enum ProposalQuerySortOptions {
  resolvesAt = 'resolvesAt',
  preBoostedAt = 'preBoostedAt'
}

export interface IProposalQueryOptions extends ICommonQueryOptions {
  where?: {
    accountsWithUnclaimedRewards_contains?: Address[]
    active?: boolean
    boosted?: boolean
    dao?: Address
    expiresInQueueAt?: Date
    expiresInQueueAt_gte?: Date
    expiresInQueueAt_lte?: Date
    expiresInQueueAt_gt?: Date
    executedAfter?: Date
    executedBefore?: Date
    id?: string
    proposer?: Address
    proposalId?: string
    stage?: IProposalStage
    stage_in?: IProposalStage[]
    scheme?: Address
    orderBy?: ProposalQuerySortOptions
    type?: ProposalTypeNames
    [key: string]: any | undefined
  }
}

export interface IProposalBaseCreateOptions {
  dao: Address
  description?: string
  descriptionHash?: string
  title?: string
  tags?: string[]
  scheme?: Address
  url?: string
  // TODO: try to remove this ('competition')
  proposalType?: ProposalTypeNames | 'competition'
}

export interface IProposalState {
  // TODO: semantically order props
  id: string
  dao: IEntityRef<DAO>
  votingMachine: Address
  scheme: IEntityRef<SchemeTypes>
  closingAt: Number
  createdAt: Number
  descriptionHash?: string
  description?: string
  executedAt: Number
  organizationId: string
  paramsHash: string
  proposal: IEntityRef<Proposal>
  proposer: Address
  resolvedAt: Number
  tags?: string[]
  title?: string
  totalRepWhenCreated: BN
  totalRepWhenExecuted: BN
  url?: string
  votesFor: BN
  votesAgainst: BN
  votesCount: number
  voteOnBehalf: Address
  winningOutcome: IProposalOutcome

  // Genesis Protocol Proposal
  queue: IEntityRef<Queue>
  quietEndingPeriodBeganAt: Number
  stage: IProposalStage
  accountsWithUnclaimedRewards: Address[]
  boostedAt: Number
  upstakeNeededToPreBoost: BN
  stakesFor: BN
  stakesAgainst: BN
  preBoostedAt: Number
  genesisProtocolParams: IGenesisProtocolParams
  executionState: IExecutionState
  expiresInQueueAt: Number
  downStakeNeededToQueue: BN
  confidenceThreshold: number
}

export abstract class Proposal extends Entity<IProposalState> {

  // TODO: dynamically generate these from Proposals
  public static fragments = {
    ProposalFields: gql`fragment ProposalFields on Proposal {
      id
      accountsWithUnclaimedRewards
      boostedAt
      closingAt
      confidenceThreshold
      createdAt
      dao {
        id
        schemes {
          id
          address
        }
      }
      description
      descriptionHash
      executedAt
      executionState
      expiresInQueueAt
      competition {
        id
        admin
        endTime
        contract
        suggestionsEndTime
        createdAt
        numberOfWinningSuggestions
        numberOfVotesPerVoters
        numberOfWinners
        rewardSplit
        snapshotBlock
        startTime
        totalSuggestions
        totalVotes
        votingStartTime

      }
      contributionReward {
        id
        beneficiary
        ethReward
        ethRewardLeft
        externalToken
        externalTokenReward
        externalTokenRewardLeft
        nativeTokenReward
        nativeTokenRewardLeft
        periods
        periodLength
        reputationReward
        reputationChangeLeft
        alreadyRedeemedReputationPeriods
        alreadyRedeemedExternalTokenPeriods
        alreadyRedeemedNativeTokenPeriods
        alreadyRedeemedEthPeriods
      }
      genericScheme {
        id
        contractToCall
        callData
        executed
        returnValue
      }
      genesisProtocolParams {
        id
        activationTime
        boostedVotePeriodLimit
        daoBountyConst
        limitExponentValue
        minimumDaoBounty
        preBoostedVotePeriodLimit
        proposingRepReward
        queuedVotePeriodLimit
        queuedVoteRequiredPercentage
        quietEndingPeriod
        thresholdConst
        votersReputationLossRatio
      }
      gpRewards {
        id
      }
      scheme {
        ...SchemeFields
      }
      gpQueue {
        id
        threshold
        votingMachine
      }
      organizationId
      preBoostedAt
      proposer
      quietEndingPeriodBeganAt
      schemeRegistrar {
        id
        schemeToRegister
        schemeToRegisterParamsHash
        schemeToRegisterPermission
        schemeToRemove
        decision
        schemeRegistered
        schemeRemoved
      }
      stage
      # stakes { id }
      stakesFor
      stakesAgainst
      tags {
        id
      }
      totalRepWhenCreated
      totalRepWhenExecuted
      title
      url
      # votes { id }
      votesAgainst
      votesFor
      votingMachine
      winningOutcome
    }`
  }

  public abstract state(apolloQueryOptions: IApolloQueryOptions): Observable<IProposalState>

  public static search(
    context: Arc,
    options: IProposalQueryOptions = {},
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable<Proposal[]> {
    let where = ''

    if (!options.where) { options.where = {} }

    for (const key of Object.keys(options.where)) {
      const value = options.where[key]
      if (key === 'stage' && value !== undefined) {
        where += `stage: "${IProposalStage[value as IProposalStage]}"\n`
      } else if (key === 'stage_in' && Array.isArray(value)) {
        const stageValues = value.map((stage: number) => '"' + IProposalStage[stage as IProposalStage] + '"')
        where += `stage_in: [${stageValues.join(',')}]\n`
      } else if (key === 'type') {
        // TODO: we are not distinguishing between the schemeregisterpropose
        // and SchemeRegistrarProposeToRemove proposals
        if (value.toString().includes('SchemeRegistrar')) {
          where += `schemeRegistrar_not: null\n`
        } else {
          if (Proposals[value] === undefined) {
            throw Error(`Unknown value for "type" in proposals query: ${value}`)
          }
          const apolloKey = Proposals[value][0].toLowerCase() + Proposals[value].slice(1)
          where += `${apolloKey}_not: null\n`
        }
      } else if (Array.isArray(options.where[key])) {
        // Support for operators like _in
        const values = options.where[key].map((val: number) => '"' + val + '"')
        where += `${key}: [${values.join(',')}]\n`
      } else {
        if (key === 'proposer' || key === 'beneficiary' || key === 'dao') {
          const option = options.where[key] as string
          isAddress(option)
          where += `${key}: "${option.toLowerCase()}"\n`
        } else {
          where += `${key}: "${options.where[key]}"\n`
        }
      }
    }
    let query

    if (apolloQueryOptions.fetchAllData === true) {
      query = gql`query ProposalsSearchAllData
        {
          proposals ${createGraphQlQuery(options, where)} {
            ...ProposalFields
            votes {
              id
            }
            stakes {
              id
            }
          }
        }
        ${Proposal.fragments.ProposalFields}
        ${Plugin.baseFragment.SchemeFields}
      `
      return context.getObservableList(
        query,
        (r: any) => Proposals[r.scheme.name].itemMap(context, r),
        apolloQueryOptions
      ) as IObservable<Proposal[]>
    } else {
      query = gql`query ProposalSearchPartialData
        {
          proposals ${createGraphQlQuery(options, where)} {
            id
            dao {
              id
            }
            votingMachine
            scheme {
              id
              address
              name
            }
          }
        }
      `
      return context.getObservableList(
        query,
        (r: any) => new Proposals[r.scheme.name](context, r),
        apolloQueryOptions
      ) as IObservable<Proposal[]>
    }
  }

  public votes(options: IVoteQueryOptions = {}, apolloQueryOptions: IApolloQueryOptions = {}): Observable<Vote[]> {
    if (!options.where) { options.where = {} }
    options.where.proposal = this.id
    return Vote.search(this.context, options, apolloQueryOptions)
  }

  public stakes(options: IStakeQueryOptions = {}, apolloQueryOptions: IApolloQueryOptions = {}): Observable<Stake[]> {
    if (!options.where) { options.where = {} }
    options.where.proposal = this.id
    return Stake.search(this.context, options, apolloQueryOptions)
  }

  public rewards(
    options: IRewardQueryOptions = {},
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable<Reward[]> {
    if (!options.where) { options.where = {} }
    options.where.proposal = this.id
    return Reward.search(this.context, options, apolloQueryOptions)
  }


}