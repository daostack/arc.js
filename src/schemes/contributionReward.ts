import BN = require('bn.js')
import { Arc } from '../arc'
import {
  getEventArgs,
  ITransaction,
  ITransactionReceipt
} from '../operation'
import { IProposalBaseCreateOptions, Proposal } from '../proposal'
import { Address } from '../types'
import { NULL_ADDRESS } from '../utils'

export interface IContributionReward {
  beneficiary: Address
  externalTokenReward: BN
  externalToken: Address
  ethReward: BN
  nativeTokenReward: BN
  periods: number
  periodLength: number
  reputationReward: BN
  alreadyRedeemedNativeTokenPeriods: number
  alreadyRedeemedReputationPeriods: number
  alreadyRedeemedExternalTokenPeriods: number
  alreadyRedeemedEthPeriods: number
  reputationChangeLeft: BN | null
  nativeTokenRewardLeft: BN | null
  ethRewardLeft: BN | null
  externalTokenRewardLeft: BN | null
}

export interface IProposalCreateOptionsCR extends IProposalBaseCreateOptions {
  beneficiary: Address
  nativeTokenReward?: BN
  reputationReward?: BN
  ethReward?: BN
  externalTokenReward?: BN
  externalTokenAddress?: Address
  periodLength?: number
  periods?: any
}

export enum IProposalType {
  ContributionReward = 'ContributionReward' // propose a contributionReward
}

export async function createProposalTransaction(
  context: Arc,
  options: IProposalCreateOptionsCR
): Promise<ITransaction> {
  options.descriptionHash = await context.saveIPFSData(options)

  if (options.scheme === undefined) {
    throw new Error(`Missing argument "scheme" for ContributionReward in Proposal.create()`)
  }

  return {
    contract: context.getContract(options.scheme),
    method: 'proposeContributionReward',
    args: [
      options.dao,
      options.descriptionHash || '',
      options.reputationReward && options.reputationReward.toString() || 0,
      [
        options.nativeTokenReward && options.nativeTokenReward.toString() || 0,
        options.ethReward && options.ethReward.toString() || 0,
        options.externalTokenReward && options.externalTokenReward.toString() || 0,
        options.periodLength || 0,
        options.periods || 1
      ],
      options.externalTokenAddress || NULL_ADDRESS,
      options.beneficiary
    ]
  }
}

export function createProposalTransactionMap(context: Arc, options: IProposalCreateOptionsCR) {
  return (receipt: ITransactionReceipt) => {
    const args = getEventArgs(receipt, 'NewContributionProposal', 'ContributionReward.createProposal')
    const proposalId = args[1]
    return new Proposal(context, proposalId)
  }
}
