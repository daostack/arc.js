import BN = require('bn.js')
import { Arc } from '../arc'
import {  getEventArgs, ITransaction, ITransactionReceipt } from '../operation'
import { IProposalBaseCreateOptions, Proposal } from '../proposal'
import { Address } from '../types'
import { NULL_ADDRESS } from '../utils'

// // this interface is not used - it is conflated with IContributionReward
export interface IContributionRewardExt {
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
  reputationChangeLeft: BN
  nativeTokenRewardLeft: BN
  ethRewardLeft: BN
  externalTokenRewardLeft: BN
}

export interface IProposalCreateOptionsCRExt extends IProposalBaseCreateOptions {
  beneficiary: Address
  nativeTokenReward?: BN
  reputationReward?: BN
  ethReward?: BN
  externalTokenReward?: BN
  externalTokenAddress?: Address
  proposer: Address
}

export enum IProposalType {
  ContributionReward = 'ContributionRewardExt' // propose a contributionReward
}

export async function createProposalTransaction(
  context: Arc,
  options: IProposalCreateOptionsCRExt
): Promise<ITransaction> {
  if (!options.proposer) {
    options.proposer = NULL_ADDRESS
  }

  options.descriptionHash = await context.saveIPFSData(options)

  if (options.scheme === undefined) {
    throw new Error(`Missing argument "scheme" for ContributionRewardExt in Proposal.create()`)
  }

  return {
    contract: context.getContract(options.scheme),
    method: 'proposeContributionReward',
    args: [
      options.descriptionHash || '',
      options.reputationReward && options.reputationReward.toString() || 0,
      [
        options.nativeTokenReward && options.nativeTokenReward.toString() || 0,
        options.ethReward && options.ethReward.toString() || 0,
        options.externalTokenReward && options.externalTokenReward.toString() || 0
      ],
      options.externalTokenAddress || NULL_ADDRESS,
      options.beneficiary,
      options.proposer
    ]
  }
}

export function createProposalTransactionMap(context: Arc, options: IProposalCreateOptionsCRExt) {
  return (receipt: ITransactionReceipt) => {
    const args = getEventArgs(receipt, 'NewContributionProposal', 'ContributionRewardExt.createProposal')
    const proposalId = args[1]
    return new Proposal(context, proposalId)
  }
}
