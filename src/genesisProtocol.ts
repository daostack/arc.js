import { BigNumber } from 'ethers'
import { realMathToNumber } from './index'

export interface IGenesisProtocolParams {
  activationTime: number
  boostedVotePeriodLimit: number
  daoBountyConst: number // ?
  limitExponentValue: number
  minimumDaoBounty: BigNumber // in GEN
  preBoostedVotePeriodLimit: number
  proposingRepReward: BigNumber // in REP
  queuedVoteRequiredPercentage: number
  queuedVotePeriodLimit: number // in seconds (?)
  quietEndingPeriod: number
  thresholdConst: number
  votersReputationLossRatio: number // in 1000's
}

export function mapGenesisProtocolParams(params: IGenesisProtocolParams) {
  return {
    activationTime: Number(params.activationTime),
    boostedVotePeriodLimit: Number(params.boostedVotePeriodLimit),
    daoBountyConst: Number(params.daoBountyConst),
    limitExponentValue: Number(params.limitExponentValue),
    minimumDaoBounty: BigNumber.from(params.minimumDaoBounty),
    preBoostedVotePeriodLimit: Number(params.preBoostedVotePeriodLimit),
    proposingRepReward: BigNumber.from(params.proposingRepReward),
    queuedVotePeriodLimit: Number(params.queuedVotePeriodLimit),
    queuedVoteRequiredPercentage: Number(params.queuedVoteRequiredPercentage),
    quietEndingPeriod: Number(params.quietEndingPeriod),
    thresholdConst: realMathToNumber(BigNumber.from(params.thresholdConst)),
    votersReputationLossRatio: Number(params.votersReputationLossRatio)
  }
}
