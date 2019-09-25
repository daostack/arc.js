import gql from 'graphql-tag'
import { Observable } from 'rxjs'
import { first } from 'rxjs/operators'
import { Arc, IApolloQueryOptions } from './arc'
import { Address, ICommonQueryOptions, IStateful } from './types'
import { BN } from './utils'
import { createGraphQlQuery, isAddress } from './utils'

export interface IRewardStaticState {
  id: string
  beneficiary: Address
  createdAt: Date
  proposalId: string,
  reputationForVoter: typeof BN,
  tokensForStaker: typeof BN,
  daoBountyForStaker: typeof BN,
  reputationForProposer: typeof BN,
  tokenAddress: Address,
}

export interface IRewardState extends IRewardStaticState {
  reputationForVoterRedeemedAt: number,
  tokensForStakerRedeemedAt: number,
  reputationForProposerRedeemedAt: number,
  daoBountyForStakerRedeemedAt: number
}

export interface IRewardQueryOptions extends ICommonQueryOptions {
  where?: {
    id?: string
    beneficiary?: Address
    dao?: Address
    proposal?: string
    createdAtAfter?: Date
    createdAtBefore?: Date
    [key: string]: any
  }
}

export class Reward implements IStateful<IRewardState> {

  /**
   * Reward.search(context, options) searches for reward entities
   * @param  context an Arc instance that provides connection information
   * @param  options the query options, cf. IRewardQueryOptions
   * @return         an observable of Reward objects
   */
  public static search(
    context: Arc,
    options: IRewardQueryOptions = {},
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable<Reward[]> {
    let where = ''
    if (!options.where) { options.where = {}}
    for (const key of Object.keys(options.where)) {
      if (options.where[key] === undefined) {
        continue
      }

      if (key === 'beneficiary' || key === 'dao') {
        const option = options.where[key] as string
        isAddress(option)
        options.where[key] = option.toLowerCase()
      }

      where += `${key}: "${options.where[key] as string}"\n`
    }

    const query = gql`query RewardSearch
    {
      gprewards ${createGraphQlQuery(options, where)} {
        id
      }
    }`

    return context.getObservableList(
      query,
      (r: any) => new Reward(r.id, context),
      apolloQueryOptions
    ) as Observable<Reward[]>
  }

  public id: string
  public staticState: IRewardStaticState|undefined

  constructor(public idOrOpts: string|IRewardStaticState, public context: Arc) {
    this.context = context
    if (typeof idOrOpts === 'string') {
      this.id = idOrOpts
    } else {
      this.id = idOrOpts.id
      this.setStaticState(idOrOpts as IRewardStaticState)
    }
  }

  public state(apolloQueryOptions: IApolloQueryOptions = {}): Observable<IRewardState> {

    const query = gql`query RewardState {
      gpreward ( id: "${this.id}" )
      {
        id
        createdAt
        dao {
          id
        }
        beneficiary
        daoBountyForStaker
        proposal {
           id
        }
        reputationForVoter
        reputationForVoterRedeemedAt
        reputationForProposer
        reputationForProposerRedeemedAt
        tokenAddress
        tokensForStaker
        tokensForStakerRedeemedAt
        daoBountyForStakerRedeemedAt
      }
    }`

    const itemMap = (item: any): IRewardState => {
      this.setStaticState({
        beneficiary: item.beneficiary,
        createdAt: item.createdAt,
        daoBountyForStaker: new BN(item.daoBountyForStaker),
        id: item.id,
        proposalId: item.proposal.id,
        reputationForProposer: new BN(item.reputationForProposer),
        reputationForVoter: new BN(item.reputationForVoter),
        tokenAddress: item.tokenAddress,
        tokensForStaker: new BN(item.tokensForStaker)
      })
      return {
        beneficiary: item.beneficiary,
        createdAt: item.createdAt,
        daoBountyForStaker: new BN(item.daoBountyForStaker),
        daoBountyForStakerRedeemedAt: Number(item.daoBountyForStakerRedeemedAt),
        id: item.id,
        proposalId: item.proposal.id,
        reputationForProposer: new BN(item.reputationForProposer),
        reputationForProposerRedeemedAt: Number(item.reputationForProposerRedeemedAt),
        reputationForVoter: new BN(item.reputationForVoter),
        reputationForVoterRedeemedAt: Number(item.reputationForVoterRedeemedAt),
        tokenAddress: item.tokenAddress,
        tokensForStaker: new BN(item.tokensForStaker),
        tokensForStakerRedeemedAt: Number(item.tokensForStakerRedeemedAt)
      }
    }

    return this.context.getObservableObject(query, itemMap, apolloQueryOptions)
  }

  public setStaticState(opts: IRewardStaticState) {
    this.staticState = opts
  }

  public async fetchStaticState(): Promise<IRewardStaticState> {
    if (!!this.staticState) {
      return this.staticState
    } else {
      const state = await this.state({ subscribe: false }).pipe(first()).toPromise()
      this.setStaticState(state)
      return state
    }
  }

}
