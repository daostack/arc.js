import BN = require('bn.js')
import gql from 'graphql-tag'
import { Observable } from 'rxjs'
import { IEntityRef, Entity } from './entity'
import { IApolloQueryOptions, Address, ICommonQueryOptions } from './types'
import { Plugin } from './plugin'
import { IGenesisProtocolParams, mapGenesisProtocolParams } from './genesisProtocol'
import { Arc } from './arc'
import { createGraphQlQuery, isAddress, realMathToNumber } from './utils'
import { IObservable } from './graphnode'
import Proposals, { ProposalTypeNames } from './proposals'
import { IVoteQueryOptions, Vote } from './vote'
import { Stake, IStakeQueryOptions } from './stake'
import { Queue, IQueueState } from './queue'
import { IRewardQueryOptions, Reward } from './reward'
import { DAO } from './dao'

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
  scheme: IEntityRef<Plugin>
  closingAt: Number
  createdAt: Number | Date
  descriptionHash?: string
  description?: string
  name: string,
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
  type: ProposalTypeNames
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

  protected static itemMapToBaseState<TPlugin extends Plugin, TProposal extends Proposal>(
    context: Arc,
    item: any,
    scheme: TPlugin,
    proposal: TProposal,
    type: ProposalTypeNames
  ) : IProposalState {
    if (item === null || item === undefined) {
      // no proposal was found - we return null
      // throw Error(`No proposal with id ${this.id} could be found`)
      return null
    }

    let name = item.name
    if (!name) {

      try {
        name = context.getContractInfo(item.address).name
      } catch (err) {
        if (err.message.match(/no contract/ig)) {
          // continue
        } else {
          throw err
        }
      }
    }

    // the  formule to enter into the preboosted state is:
    // (S+/S-) > AlphaConstant^NumberOfBoostedProposal.
    // (stakesFor/stakesAgainst) > gpQueue.threshold
    const stage: any = IProposalStage[item.stage]
    const threshold = realMathToNumber(new BN(item.gpQueue.threshold))
    const stakesFor = new BN(item.stakesFor)
    const stakesAgainst = new BN(item.stakesAgainst)

    // upstakeNeededToPreBoost is the amount of tokens needed to upstake to move to the preboost queue
    // this is only non-zero for Queued proposals
    // note that the number can be negative!
    let upstakeNeededToPreBoost: BN = new BN(0)
    const PRECISION = Math.pow(2, 40)
    if (stage === IProposalStage.Queued) {

      upstakeNeededToPreBoost = new BN(threshold * PRECISION)
        .mul(stakesAgainst)
        .div(new BN(PRECISION))
        .sub(stakesFor)
    }
    // upstakeNeededToPreBoost is the amount of tokens needed to upstake to move to the Queued queue
    // this is only non-zero for Preboosted proposals
    // note that the number can be negative!
    let downStakeNeededToQueue: BN = new BN(0)
    if (stage === IProposalStage.PreBoosted) {
      downStakeNeededToQueue = stakesFor.mul(new BN(PRECISION))
        .div(new BN(threshold * PRECISION))
        .sub(stakesAgainst)
    }

    const gpQueue = item.gpQueue

    const queueState: IQueueState = {
      dao: item.dao.id,
      id: gpQueue.id,
      name: scheme.coreState.name,
      scheme: {
        id: scheme.id,
        entity: scheme
      },
      threshold,
      votingMachine: gpQueue.votingMachine
    }
    const dao = new DAO(context, item.dao.id)

    return {
      accountsWithUnclaimedRewards: item.accountsWithUnclaimedRewards,
      boostedAt: Number(item.boostedAt),
      closingAt: Number(item.closingAt),
      confidenceThreshold: Number(item.confidenceThreshold),
      createdAt: Number(item.createdAt),
      dao: {
        id: dao.id,
        entity: dao
      },
      description: item.description,
      descriptionHash: item.descriptionHash,
      downStakeNeededToQueue,
      executedAt: Number(item.executedAt),
      executionState: IExecutionState[item.executionState] as any,
      expiresInQueueAt: Number(item.expiresInQueueAt),
      genesisProtocolParams: mapGenesisProtocolParams(item.genesisProtocolParams),
      id: item.id,
      name,
      organizationId: item.organizationId,
      paramsHash: item.paramsHash,
      preBoostedAt: Number(item.preBoostedAt),
      proposal: {
        id: proposal.id,
        entity: proposal
      },
      proposer: item.proposer,
      queue: {
        id: queueState.id,
        entity: new Queue(context, queueState, dao)
      },
      quietEndingPeriodBeganAt: Number(item.quietEndingPeriodBeganAt),
      resolvedAt: item.resolvedAt !== undefined ? Number(item.resolvedAt) : 0,
      scheme: {
        id: scheme.id,
        entity: scheme
      },
      stage,
      stakesAgainst,
      stakesFor,
      tags: item.tags.map((t: any) => t.id),
      title: item.title,
      totalRepWhenCreated: new BN(item.totalRepWhenCreated),
      totalRepWhenExecuted: new BN(item.totalRepWhenExecuted),
      type,
      upstakeNeededToPreBoost,
      url: item.url,
      voteOnBehalf: item.voteOnBehalf,
      votesAgainst: new BN(item.votesAgainst),
      votesCount: item.votes.length,
      votesFor: new BN(item.votesFor),
      votingMachine: item.votingMachine,
      winningOutcome: IProposalOutcome[item.winningOutcome] as any
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