import BN = require('bn.js')
import gql from 'graphql-tag'
import { Observable } from 'rxjs'
import { IEntityRef, Entity } from '../entity'
import { IApolloQueryOptions, Address, ICommonQueryOptions } from '../types'
import { Plugin } from '../plugins/plugin'
import { IGenesisProtocolParams } from '../genesisProtocol'
import { ProposalPlugin } from '../plugins/proposalPlugin'
import { Arc } from '../arc'

type IProposalType = "ContributionReward" | "GenericScheme" | "SchemeRegistrar"

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

export interface IProposalState {
  id: string
  dao: IEntityRef<DAO>
  votingMachine: Address
  accountsWithUnclaimedRewards: Address[],
  boostedAt: Number
  confidenceThreshold: number
  closingAt: Number
  createdAt: Number
  descriptionHash?: string
  description?: string
  downStakeNeededToQueue: BN
  executedAt: Number
  executionState: IExecutionState
  expiresInQueueAt: Number
  genesisProtocolParams: IGenesisProtocolParams
  organizationId: string
  paramsHash: string
  preBoostedAt: Number
  proposal: IEntityRef<Proposal>
  proposer: Address
  queue: IQueueState
  quietEndingPeriodBeganAt: Number
  resolvedAt: Number
  stage: IProposalStage
  stakesFor: BN
  stakesAgainst: BN
  tags?: string[]
  title?: string
  totalRepWhenCreated: BN
  totalRepWhenExecuted: BN
  upstakeNeededToPreBoost: BN
  url?: string
  votesFor: BN
  votesAgainst: BN
  votesCount: number
  voteOnBehalf: Address
  winningOutcome: IProposalOutcome
}

export abstract class Proposal extends Entity<IProposalState> {

  constructor(
    context: Arc,
    idOrOpts: string | IProposalState
  ) {
    super()
    if (typeof idOrOpts === 'string') {
      this.id = idOrOpts
    } else {
      this.id = idOrOpts.id
      this.setState(idOrOpts)
    }
    this.context = context
  }

  public static fragments = {
    ProposalFields: gql`fragment ProposalFields on Proposal {
      id
      accountsWithUnclaimedRewards
      boostedAt
      closingAt
      confidenceThreshold
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

  public state(apolloQueryOptions: IApolloQueryOptions = {}): Observable<IProposalState> {
    const query = gql`query ProposalState
      {
        proposal(id: "${this.id}") {
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
      ${Plugin.fragments.SchemeFields}
    `
    const result = this.context.getObservableObject(query, this.itemMap, apolloQueryOptions) as Observable<IProposalState>
    return result
  }

  protected abstract itemMap(item: any): IProposalState | null

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
    type?: IProposalType
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
  proposalType?: IProposalType | 'competition'
}