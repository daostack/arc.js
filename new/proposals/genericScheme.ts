import { Proposal, IProposalState, IProposalStage, IProposalOutcome, IExecutionState } from "../proposal";
import { realMathToNumber } from "../utils";
import BN from 'bn.js'
import { GenericScheme } from "../plugins/genericScheme";
import { mapGenesisProtocolParams } from "../genesisProtocol";
import { Address, IApolloQueryOptions } from "../types";
import { Arc } from "../arc";
import { Plugin } from '../plugin'
import { Observable } from "rxjs";
import gql from "graphql-tag";
import { IQueueState, Queue } from "../queue";
import { DAO } from "../dao";

interface IGenericSchemeProposalState extends IProposalState { 
  id: string
  contractToCall: Address
  callData: string
  executed: boolean
  returnValue: string
}

// TODO: Scheme => Plugin
export class GenericSchemeProposal extends Proposal {

  /*
    TODO:
    const entity = new Entity()
    const entityState = entity.fetchState()
    const sub = entity.state().subscribe()
    const current = entity.currentState
    const current = entity.fetchState()
  */
  coreState: IGenericSchemeProposalState

  constructor(
    context: Arc,
    idOrOpts: string | IGenericSchemeProposalState
  ) {
    super()
    this.context = context
    if (typeof idOrOpts === 'string') {
      this.id = idOrOpts
    } else {
      this.id = idOrOpts.id
      this.setState(idOrOpts)
    }
    this.context = context
  }

  static itemMap (context: Arc, item: any): GenericSchemeProposal | null {
    if (item === null || item === undefined) {
      // no proposal was found - we return null
      // throw Error(`No proposal with id ${this.id} could be found`)
      return null
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
    const scheme = item.scheme
    const gpQueue = item.gpQueue

    const genericScheme = GenericScheme.itemMap(context, scheme)
    const schemeState = genericScheme.coreState
    const queueState: IQueueState = {
      dao: item.dao.id,
      id: gpQueue.id,
      name: schemeState.name,
      scheme: {
        id: schemeState.id,
        entity: new GenericScheme(context, schemeState),
      },
      threshold,
      votingMachine: gpQueue.votingMachine
    }
    const dao = new DAO(context, item.dao.id)

    return new GenericSchemeProposal(context, {
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
      organizationId: item.organizationId,
      paramsHash: item.paramsHash,
      preBoostedAt: Number(item.preBoostedAt),
      proposal: {
        id: item.id,
        entity: new GenericSchemeProposal(context, item.id)
      },
      callData: item.genericScheme.callData,
      contractToCall: item.genericScheme.contractToCall,
      executed: item.genericScheme.executed,
      returnValue: item.genericScheme.returnValue,
      proposer: item.proposer,
      queue: {
        id: queueState.id,
        entity: new Queue(context, queueState, dao)
      },
      quietEndingPeriodBeganAt: Number(item.quietEndingPeriodBeganAt),
      resolvedAt: item.resolvedAt !== undefined ? Number(item.resolvedAt) : 0,
      scheme: {
        id: schemeState.id,
        entity: new GenericScheme(context, schemeState)
      },
      stage,
      stakesAgainst,
      stakesFor,
      tags: item.tags.map((t: any) => t.id),
      title: item.title,
      totalRepWhenCreated: new BN(item.totalRepWhenCreated),
      totalRepWhenExecuted: new BN(item.totalRepWhenExecuted),
      upstakeNeededToPreBoost,
      url: item.url,
      voteOnBehalf: item.voteOnBehalf,
      votesAgainst: new BN(item.votesAgainst),
      votesCount: item.votes.length,
      votesFor: new BN(item.votesFor),
      votingMachine: item.votingMachine,
      winningOutcome: IProposalOutcome[item.winningOutcome] as any
    })
  }

  public state(apolloQueryOptions: IApolloQueryOptions): Observable<IProposalState> {
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
      ${Plugin.baseFragment.SchemeFields}
    `

    const itemMap = (item: any) => GenericSchemeProposal.itemMap(this.context, item)

    const result = this.context.getObservableObject(query, itemMap, apolloQueryOptions) as Observable<IGenericSchemeProposalState>
    return result
  }

}