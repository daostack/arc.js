import BN = require('bn.js')
import gql from 'graphql-tag'
import { Observable, from } from 'rxjs'
import { IEntityRef, Entity } from '../entity'
import { IApolloQueryOptions, Address, ICommonQueryOptions } from '../types'
import { Plugin, IPluginState } from './plugin'
import { IGenesisProtocolParams, mapGenesisProtocolParams } from '../genesisProtocol'
import { Arc } from '../arc'
import { createGraphQlQuery, isAddress, realMathToNumber, hexStringToUint8Array, concat, eventId, NULL_ADDRESS } from '../utils'
import { IObservable } from '../graphnode'
import { IVoteQueryOptions, Vote } from '../vote'
import { Stake, IStakeQueryOptions } from '../stake'
import { Queue, IQueueState } from '../queue'
import { IRewardQueryOptions, Reward } from '../reward'
import { DAO } from '../dao'
import { ProposalTypeNames, Proposals } from './'
import { utils } from 'ethers'
import { DocumentNode } from 'graphql'
import { ITransactionReceipt, Operation, getEventAndArgs, ITransaction, toIOperationObservable } from '../operation'
import { concatMap, first } from 'rxjs/operators'

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
    plugin?: Address
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
  plugin?: Address
  url?: string
  proposalType: ProposalTypeNames
}

export interface IProposalState {
  // TODO: semantically order props
  id: string
  dao: IEntityRef<DAO>
  votingMachine: Address
  //TODO: plugin instance inside itself? or other type of plugin?
  plugin: IEntityRef<Plugin<IPluginState>>
  closingAt: Number
  createdAt: Number | Date
  descriptionHash?: string
  description?: string
  name: string,
  executedAt: Number
  organizationId: string
  paramsHash: string
  //TODO: Stores proposal instance inside itself? Or is this another proposaltype?
  proposal: IEntityRef<Proposal<IProposalState>>
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

export abstract class Proposal<TProposalState extends IProposalState> extends Entity<TProposalState> {

  public static fragment: { name: string, fragment: DocumentNode } | undefined

  public static baseFragment: DocumentNode = gql`fragment ProposalFields on Proposal {
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
        ...PluginFields
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
      ${Object.values(Proposals)
        .filter(proposal => proposal.fragment)
        .map(proposal => '...' + proposal.fragment?.name).join('\n')}
    }
    ${Object.values(Proposals)
      .filter(proposal => proposal.fragment)
      .map(proposal => '...' + proposal.fragment?.fragment).join('\n')}
    
    ${Plugin.baseFragment}
  `

  public abstract state(apolloQueryOptions: IApolloQueryOptions): Observable<TProposalState>

  public static search<TProposalState extends IProposalState>(
    context: Arc,
    options: IProposalQueryOptions = {},
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable<Proposal<TProposalState>[]> {
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
        ${Proposal.baseFragment}
      `
      return context.getObservableList(
        context,
        query,
        (context: Arc, r: any) => Proposals[r.scheme.name].itemMap(context, r),
        apolloQueryOptions
      ) as IObservable<Proposal<TProposalState>[]>
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
        context,
        query,
        (context: Arc, r: any) => new Proposals[r.scheme.name](context, r),
        apolloQueryOptions
      ) as IObservable<Proposal<TProposalState>[]>
    }
  }

  public static calculateId(address: Address, proposalCount: number) {
    const seed = concat(
      hexStringToUint8Array(address.toLowerCase()),
      hexStringToUint8Array(proposalCount.toString())
    )
    return utils.keccak256(seed)
  }

  protected static itemMapToBaseState<TPlugin extends Plugin<IPluginState>, TProposal extends Proposal<IProposalState>>(
    context: Arc,
    item: any,
    plugin: TPlugin,
    proposal: TProposal,
    type: ProposalTypeNames
  ) : IProposalState | null{
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
      name: plugin.coreState? plugin.coreState.name: '',
      plugin: {
        id: plugin.id,
        entity: plugin
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
      plugin: {
        id: plugin.id,
        entity: plugin
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

  public async votingMachine() {
    const state = await this.fetchState()
    return this.context.getContract(state.votingMachine)
  }

  public stakingToken() {
    return this.context.GENToken()
  }

  public stake(outcome: IProposalOutcome, amount: BN): Operation<Stake> {

    const mapReceipt = (receipt: ITransactionReceipt) => {

      const [event, args] = getEventAndArgs(receipt, 'Stake', 'Proposal.stake')

      return new Stake(this.context, {
        id: eventId(event),
        amount: args[3], // _amount
        // createdAt is "about now", but we cannot calculate the data that will be indexed by the subgraph
        createdAt: undefined,
        outcome,
        proposal: {
          id: this.id,
          entity: this
        },
        staker: args[2] // _staker
      })
    }

    const errorHandler = async (error: Error) => {
      const proposal = this
      const votingMachine = await this.votingMachine()
      const proposalState = await votingMachine.proposals(proposal.id)
      const stakingToken = this.stakingToken()
      if (proposalState.proposer === NULL_ADDRESS) {
        return new Error(`Unknown proposal with id ${proposal.id}`)
      }
      // staker has sufficient balance
      const defaultAccount = await this.context.getAccount().pipe(first()).toPromise()
      const balance = new BN(await stakingToken.contract().balanceOf(defaultAccount))
      const amountBN = new BN(amount)
      if (balance.lt(amountBN)) {
        const msg = `Staker ${defaultAccount} has insufficient balance to stake ${amount.toString()}
          (balance is ${balance.toString()})`
        return new Error(msg)
      }

      // staker has approved the token spend
      const allowance = new BN(await stakingToken.contract().allowance(
        defaultAccount, votingMachine.address
      ))
      if (allowance.lt(amountBN)) {
        return new Error(
          `Staker has insufficient allowance to stake ${amount.toString()}
            (allowance for ${votingMachine.address} is ${allowance.toString()})`
        )
      }

      if (!!error.message.match(/event was found/)) {
        if (proposalState.state === IProposalStage.Boosted) {
          return new Error(`Staking failed because the proposal is boosted`)
        }
      }

      // if we have found no known error, we return the original error
      return error
    }

    const createTransaction = async (): Promise<ITransaction> => ({
      contract: await this.votingMachine(),
      method: 'stake',
      args: [
        this.id,  // proposalId
        outcome, // a value between 0 to and the proposal number of choices.
        amount.toString() // the amount of tokens to stake
      ]
    })

    const observable = from(createTransaction()).pipe(
      concatMap((transaction) => {
        return this.context.sendTransaction(transaction, mapReceipt, errorHandler)
      })
    )

    return toIOperationObservable(observable)
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

  public execute(): Operation<undefined> {

    const mapReceipt = (receipt: ITransactionReceipt) => undefined

    const errorHandler = async (err: Error) => {
      const votingMachine = await this.votingMachine()
      const proposalDataFromVotingMachine = await votingMachine.proposals(this.id)

      if (proposalDataFromVotingMachine.callbacks === NULL_ADDRESS) {
        const msg = `Error in proposal.execute(): A proposal with id ${this.id} does not exist`
        return Error(msg)
      } else if (proposalDataFromVotingMachine.state === '2') {
        const msg = `Error in proposal.execute(): proposal ${this.id} already executed`
        return Error(msg)
      }

      return err
    }

    const createTransaction = async (): Promise<ITransaction> => ({
      contract: await this.votingMachine(),
      method: 'execute',
      args: [ this.id ]
    })

    const observable = from(createTransaction()).pipe(
      concatMap((transaction) => {
        return this.context.sendTransaction(transaction, mapReceipt, errorHandler)
      })
    )

    return toIOperationObservable(observable)
  }

  public vote(outcome: IProposalOutcome, amount: number = 0): Operation<Vote | null> {

    const mapReceipt = (receipt: ITransactionReceipt) => {
      try {
        const [event, args] = getEventAndArgs(receipt, 'VoteProposal', 'Proposal.vote')
        return new Vote(this.context, {
          id: eventId(event),
          amount: args[3], // _reputation
          // createdAt is "about now", but we cannot calculate the data that will be indexed by the subgraph
          createdAt: 0,
          outcome,
          proposal: {
            id: this.id,
            entity: this
          },
          voter: args[2] // _vote
        })
      } catch (e) {
        // no vote was cast
        return null
      }
    }

    const errorHandler = async (error: Error) => {
      const proposal = this
      const votingMachine = await this.votingMachine()
      const proposalDataFromVotingMachine = await votingMachine.proposals(proposal.id)

      if (proposalDataFromVotingMachine.proposer === NULL_ADDRESS) {
        return Error(`Error in vote(): unknown proposal with id ${proposal.id}`)
      }

      if (proposalDataFromVotingMachine.state === '2') {
        const msg = `Error in vote(): proposal ${proposal.id} already executed`
        return Error(msg)
      }

      // if everything seems fine, just return the original error
      return error
    }

    const createTransaction = async (): Promise<ITransaction> => ({
      contract: await this.votingMachine(),
      method: 'vote',
      args: [
        this.id,  // proposalId
        outcome, // a value between 0 to and the proposal number of choices.
        amount.toString(), // amount of reputation to vote with . if _amount == 0 it will use all voter reputation.
        NULL_ADDRESS
      ]
    })

    const observable = from(createTransaction()).pipe(
      concatMap((transaction) => {
        return this.context.sendTransaction(transaction, mapReceipt, errorHandler)
      })
    )

    return toIOperationObservable(observable)
  }

}