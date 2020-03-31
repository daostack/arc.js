import { Proposal, IProposalState, IProposalStage, IProposalOutcome } from "../../proposal/proposal";
import { realMathToNumber } from "../../utils";
import BN from 'bn.js'

interface IGenericSchemeProposalState extends IProposalState {

}

export class GenericSchemeProposal extends Proposal {
  itemMap (item: any): IGenericSchemeProposalState | null {
    if (item === null || item === undefined) {
      // no proposal was found - we return null
      // throw Error(`No proposal with id ${this.id} could be found`)
      return null
    }

    const result = {
      callData: item.genericScheme.callData,
      contractToCall: item.genericScheme.contractToCall,
      executed: item.genericScheme.executed,
      id: item.genericScheme.id,
      returnValue: item.genericScheme.returnValue
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

    const schemeState = Scheme.itemMap(this.context, scheme) as ISchemeState
    const queueState: IQueueState = {
      dao: item.dao.id,
      id: gpQueue.id,
      name: schemeState.name,
      scheme: schemeState,
      threshold,
      votingMachine: gpQueue.votingMachine
    }

    return {
      accountsWithUnclaimedRewards: item.accountsWithUnclaimedRewards,
      boostedAt: Number(item.boostedAt),
      closingAt: Number(item.closingAt),
      confidenceThreshold: Number(item.confidenceThreshold),
      createdAt: Number(item.createdAt),
      dao: new DAO(this.context, item.dao.id),
      description: item.description,
      descriptionHash: item.descriptionHash,
      downStakeNeededToQueue,
      executedAt: Number(item.executedAt),
      executionState: IExecutionState[item.executionState] as any,
      expiresInQueueAt: Number(item.expiresInQueueAt),
      genericScheme,
      genesisProtocolParams: mapGenesisProtocolParams(item.genesisProtocolParams),
      id: item.id,
      organizationId: item.organizationId,
      paramsHash: item.paramsHash,
      preBoostedAt: Number(item.preBoostedAt),
      proposal: this,
      proposer: item.proposer,
      queue: queueState,
      quietEndingPeriodBeganAt: Number(item.quietEndingPeriodBeganAt),
      resolvedAt: item.resolvedAt !== undefined ? Number(item.resolvedAt) : 0,
      scheme: schemeState,
      schemeRegistrar,
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
}