import BN = require('bn.js')
import { Arc } from '../arc'
import { Proposal } from '../proposal'
import { Address, Date } from '../types'
import { NULL_ADDRESS } from '../utils'
import { IProposalCreateOptionsCR} from './contributionReward'


export interface CompetitionProposal {
  // beneficiary: Address
  // externalTokenReward: BN
  // externalToken: Address
  // ethReward: BN
  // nativeTokenReward: BN
  // periods: number
  // periodLength: number
  // reputationReward: BN
  // alreadyRedeemedNativeTokenPeriods: number
  // alreadyRedeemedReputationPeriods: number
  // alreadyRedeemedExternalTokenPeriods: number
  // alreadyRedeemedEthPeriods: number
  // competition stuff
  numberOfWinners: number
  rewardSplit: [BN]
  startTime: Date
  votingStartTime: Date
  suggestionsEndTime: Date
  endTime: Date
  numberOfVotesPerVoters: number
  // contributionReward: ControllerScheme!
  snapshotBlock: number
  // suggestions: [CompetitionSuggestion!] @derivedFrom(field: "proposal")
  // votes: [CompetitionVote!] @derivedFrom(field: "proposal")
  createdAt: Date
}

export interface IProposalCreateOptionsCompetitionProposal {
  beneficiary: Address
  nativeTokenReward?: BN
  reputationReward?: BN
  ethReward?: BN
  externalTokenReward?: BN
  externalTokenAddress?: Address
  periodLength?: number
  periods?: any
}


export interface ICompetitionSuggestion {
  id: string
  suggestionId: number
  // proposal: CompetitionProposal!
  descriptionHash: string
  title?: string
  description?: string
  url?: string
  // fulltext: [string]
  suggester: Address
  // votes: [CompetitionVote!] @derivedFrom(field: "suggestion")
  totalVotes: BN
  createdAt: Date
  redeemedAt: Date
  rewardPercentage: number
}

export interface ICompetitionVote {
  id: string
  // proposal: CompetitionProposal!
  // suggestion: CompetitionSuggestion!
  voter: Address
  createdAt: Date
  reptutation: BN
}

interface IProposalCreateOptionsContributionRewardExt extends IProposalCreateOptionsCR {
  scheme: Address
  beneficiary: Address
  title: string
  description: string
  tags: [string]
  url: string
  descriptionHash?: string
  dao: Address
  reputationReward: BN
  nativeTokenReward: BN
  ethReward: BN
  externalTokenReward: BN
}
// export enum IProposalType {
//   ContributionReward = 'ContributionReward' // propose a contributionReward
// }

/**
 * Create a transaction to propose a new competition
 * @param options 
 * @param context 
 */
export function createTransaction(options: IProposalCreateOptionsContributionRewardExt, context: Arc) {
  // NB: this is just creating a proposal in ContributionRewardExt with a competition scheme
  // contract as its destination... Once we implement contributionReardExt as a standalone scheme
  // we can refactor this

  const contract = context.getContract(options.scheme)
  // The contract here is `ContributionRewardExt`, but we check for sanity
  if (contract.name !== 'ContributionRewardExt') {
    throw Error(`Expected to find a contract "ContributionRewardExt" here, not ${contract.name}`)
  }

  // the benefiiary must be a Compeition Scheme
  const beneficiaryContract = context.getContract(options.beneficiary)
  if (!beneficiaryContract || beneficiaryContract.name !== `Competition`) {
    throw Error(`Expected to find a Competion contract  the beneficiary of this proposal - found ${options.beneficiary}`)
  }

  return async () => {
    options.descriptionHash = await context.saveIPFSData(options)
    const transaction = contract.methods.proposeContributionReward(
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
        options.beneficiary,
        options.proposer
    )
    return transaction
  }
}

// @ts-ignore
export function createTransactionMap(options: any, context: Arc) {
  const eventName = 'NewContributionProposal'
  const map = (receipt: any) => {
    const proposalId = receipt.events[eventName].returnValues._proposalId
    // const votingMachineAddress = receipt.events[eventName].returnValues._intVoteInterface
    return new Proposal(proposalId,
      // options.dao as string, options.scheme, votingMachineAddress,
      context)
  }
  return map
}


export class CompetitionProposal extends Proposal {

}

export class CompetitionSuggestion {
  id: string
  staticState?: ICompetitionSuggestion

  constructor(idOrOpts: string|ICompetitionSuggestion, public context: Arc) {
    if (typeof idOrOpts === 'string') {
      this.id = idOrOpts
    } else {
      const opts = idOrOpts as ICompetitionSuggestion
      this.id = opts.id
      this.setStaticState(opts)
    }
  }

  public setStaticState(opts: ICompetitionSuggestion) {
    this.staticState = opts
  }
}

export class CompetitionVote {
  id: string
  staticState?: ICompetitionVote

  constructor(idOrOpts: string|ICompetitionVote, public context: Arc) {
    if (typeof idOrOpts === 'string') {
      this.id = idOrOpts
    } else {
      const opts = idOrOpts as ICompetitionVote
      this.id = opts.id
      this.setStaticState(opts)
    }
  }

  public setStaticState(opts: ICompetitionVote) {
    this.staticState = opts
  }
}
