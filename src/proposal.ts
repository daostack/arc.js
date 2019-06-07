import gql from 'graphql-tag'
const Web3 = require('web3')
import { Observable } from 'rxjs'
import { Arc, IApolloQueryOptions } from './arc'
import { Operation } from './operation'
import { IProposalCreateOptions, IProposalState, ProposalBase } from './proposalBase'
export { IProposalState, IProposalCreateOptions } from './proposalBase'
import { Scheme } from './scheme'
import * as ContributionReward from './schemes/contributionReward'
import { ContributionRewardProposal } from './schemes/contributionRewardClass'
import * as GenericScheme from './schemes/genericScheme'
import * as SchemeRegistrar from './schemes/schemeRegistrar'
import { Address, Date, ICommonQueryOptions, IStateful } from './types'

export const IProposalType = {
  ...ContributionReward.IProposalType,
  ...GenericScheme.IProposalType,
  ...SchemeRegistrar.IProposalType
}

export type IProposalType = (
  ContributionReward.IProposalType |
  GenericScheme.IProposalType |
  SchemeRegistrar.IProposalType
)

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

export class Proposal extends ProposalBase implements IStateful<IProposalState> {

  /**
   * Proposal.create() creates a new proposal on chain
   * @param  options cf. IProposalCreateOptions
   * @param  context [description]
   * @return  an observable that streams the various states of the ethereum transaction
   */
  public static create(options: IProposalCreateOptions, context: Arc): Operation<Proposal> {

    if (!options.dao) {
      throw Error(`Proposal.create(options): options must include an address for "dao"`)
    }
    if (!options.scheme) {
      throw Error(`Proposal.create(options): options must include an address for "scheme"`)
    }

    let schemeName: string
    try {
      schemeName = context.getContractInfo(options.scheme).name
    } catch (err) {
      if (err.message.match(/is known/)) {
        throw new Error(`Unknown scheme at ${options.scheme} - cannot create a proposal`)
      } else {
        throw err
      }
    }

    const scheme = new Scheme(
      options.scheme, // id
      options.dao, // dao
      schemeName,
      options.scheme, // address
      context
    )
    return scheme.createProposal(options)
  }

  /**
   * Search for proposals
   * @param  options            Search options, must implemeent IProposalQueryOptions
   * @param  context            An instance of Arc
   * @param  apolloQueryOptions [description]
   * @return                    An observable of lists of results
   *
   * For example:
   *    Proposal.search({ stage: IProposalStage.Queued})
   */
  public static search(
    context: Arc,
    options: IProposalQueryOptions = {},
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable<Proposal[]> {
    let where = ''

    for (const key of Object.keys(options)) {
      const value = options[key]
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
          if (IProposalType[value] === undefined) {
            throw Error(`Unknown value for "type" in proposals query: ${value}`)
          }
          const apolloKey = IProposalType[value][0].toLowerCase() + IProposalType[value].slice(1)
          where += `${apolloKey}_not: null\n`
        }
      } else if (Array.isArray(options[key])) {
        // Support for operators like _in
        const values = options[key].map((val: number) => '"' + val + '"')
        where += `${key}: [${values.join(',')}]\n`
      } else {
        if (key === 'proposer' || key === 'beneficiary' || key === 'dao') {
          where += `${key}: "${(options[key] as string).toLowerCase()}"\n`
        } else {
          where += `${key}: "${options[key] as string}"\n`

        }
      }
    }

    const query = gql`
      {
        proposals(where: {
          ${where}
        }) {
          id
          dao {
            id
          }
          votingMachine
          scheme {
            id
            address
          }
          contributionReward {
            id
          }
        }
      }
    `
    const itemMap = (r: any) => {
      if (r.contributionReward) {
        return new ContributionRewardProposal(r.id, r.dao.id, r.scheme.address, r.votingMachine, context)
      }
      return new Proposal(r.id, r.dao.id, r.scheme.address, r.votingMachine, context)
    }

    return context.getObservableList(
      query,
      itemMap,
      apolloQueryOptions
    ) as Observable<Proposal[]>
  }
}

enum ProposalQuerySortOptions {
  resolvesAt = 'resolvesAt',
  preBoostedAt = 'preBoostedAt'
}

export interface IProposalQueryOptions extends ICommonQueryOptions {
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
  [key: string]: any
}
