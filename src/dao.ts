import BN = require('bn.js')
import gql from 'graphql-tag'
import { Observable } from 'rxjs'
import { concatMap, first, map } from 'rxjs/operators'
import { Arc } from './arc'
import { IApolloQueryOptions } from './graphnode'
import { toIOperationObservable } from './operation'
import { IProposalQueryOptions, Proposal, IProposalBaseCreateOptions, IProposalState } from './plugins/proposal'
import { IStakeQueryOptions, Stake } from './stake'
import { Address, ICommonQueryOptions } from './types'
import { createGraphQlQuery, isAddress } from './utils'
import { IVoteQueryOptions, Vote } from './vote'
import { IEntityRef, Entity } from './entity'
import { IPluginQueryOptions, IPluginState } from './plugins/plugin'
import { ProposalPlugin } from './plugins/proposalPlugin'
import { Reward, IRewardQueryOptions } from './reward'
import { Reputation } from './reputation'
import { Token } from './token'
import { IMemberQueryOptions, Member } from './member'

export interface IDAOState {
  id: Address,
  address: Address, // address of the avatar
  name: string,
  register: 'na'|'proposed'|'registered'|'unRegistered',
  reputation: IEntityRef<Reputation>,
  token: IEntityRef<Token>,
  tokenName: string,
  tokenSymbol: string
  memberCount: number,
  reputationTotalSupply: BN,
  tokenTotalSupply: BN,
  numberOfQueuedProposals: number,
  numberOfPreBoostedProposals: number,
  numberOfBoostedProposals: number
}

export interface IDAOQueryOptions extends ICommonQueryOptions {
  where?: {
    address?: Address,
    name?: string,
    register?: 'na'|'proposed'|'registered'|'unRegistered',
    [key: string]: any
  }
}

export class DAO extends Entity<IDAOState> {

  public static fragments = {
    DAOFields: gql`
      fragment DAOFields on DAO {
        id
        name
        nativeReputation { id, totalSupply }
        nativeToken { id, name, symbol, totalSupply }
        numberOfQueuedProposals
        numberOfPreBoostedProposals
        numberOfBoostedProposals
        register
        reputationHoldersCount
    }`
  }

  public static search(
    context: Arc,
    options: IDAOQueryOptions = {},
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable<DAO[]> {
    let where = ''
    if (!options.where) {
      options.where = {}
    }
    for (const key of Object.keys(options.where)) {
      if (options.where[key] === undefined) {
        continue
      }

      if (key === 'address') {
        const option = options.where[key] as string
        isAddress(option)
        options.where[key] = option.toLowerCase()
      }

      where += `${key}: "${options.where[key] as string}"\n`
    }

    let query
    if (apolloQueryOptions.fetchAllData === true) {
      query = gql`query SearchDaosWithAllData {
        daos ${createGraphQlQuery(options, where)} {
          ...DAOFields
          }
        }
        ${DAO.fragments.DAOFields}`
    } else {
      query = gql`query SearchDaoIds {
        daos ${createGraphQlQuery(options, where)} {
          id
        }
      }`
    }

    const itemMap = (context: Arc, item: any) => 
      apolloQueryOptions.fetchAllData? DAO.itemMap(context, item) : new DAO(context, item.id)

    return context.getObservableList(
      context,
      query,
      itemMap,
      apolloQueryOptions
    )
  }

  public static itemMap = (context: Arc, item: any): DAO => {
    if (item === null) {
      //TODO: How to get ID for this error msg?
      throw Error(`Could not find a DAO with id`)
    }

    return new DAO(context, {
      address: item.id,
      id: item.id,
      memberCount: Number(item.reputationHoldersCount),
      name: item.name,
      numberOfBoostedProposals: Number(item.numberOfBoostedProposals),
      numberOfPreBoostedProposals: Number(item.numberOfPreBoostedProposals),
      numberOfQueuedProposals: Number(item.numberOfQueuedProposals),
      register: item.register,
      reputation: {
        id: item.nativeReputation.id,
        entity: new Reputation(context, item.nativeReputation.id)
      },
      reputationTotalSupply: new BN(item.nativeReputation.totalSupply),
      token: {
        id: item.nativeToken.id,
        entity: new Token(context, item.nativeToken.id)
      },
      tokenName: item.nativeToken.name,
      tokenSymbol: item.nativeToken.symbol,
      tokenTotalSupply: item.nativeToken.totalSupply
    })
  }

  public state(apolloQueryOptions: IApolloQueryOptions = {}): Observable<IDAOState> {
    const query = gql`query DAOById {
        dao(id: "${this.id}") {
          ...DAOFields
        }
      }
      ${DAO.fragments.DAOFields}
     `
     
    return this.context.getObservableObject(this.context, query, DAO.itemMap, apolloQueryOptions)
  }

  public nativeReputation(): Observable<Reputation> {
    return this.state().pipe(first()).pipe(map((r) => r.reputation.entity))
  }

  public ethBalance(): Observable<BN> {
    return this.context.ethBalance(this.id)
  }

  public plugins(
    options: IPluginQueryOptions = {},
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable<ProposalPlugin<IPluginState, IProposalState>[]> {
    if (!options.where) { options.where = {}}
    options.where.dao = this.id
    return ProposalPlugin.search(this.context, options, apolloQueryOptions)
  }

  public async plugin(options: IPluginQueryOptions): Promise<ProposalPlugin<IPluginState, IProposalState>> {
    const plugins = await this.plugins(options).pipe(first()).toPromise()
    if (plugins.length === 1) {
      return plugins[0]
    } else {
      throw Error('Could not find a unique plugin satisfying these options')
    }
  }

  public members(
    options: IMemberQueryOptions = {},
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable<Member[]> {
    if (!options.where) { options.where = {} }
    options.where.dao = this.id
    return Member.search(this.context, options, apolloQueryOptions)
  }

  public member(address: Address): Member {
    if (this.coreState) {
      // construct member with the reputationcontract address, if this is known
      // so it can make use of the apollo cache
      return new Member(this.context, {
        id: address,
        address,
        contract: this.coreState.reputation.entity.address,
        dao: {
          id: this.id,
          entity: new DAO(this.context, this.id)
        },
        reputation: this.coreState.reputationTotalSupply
      })
    } else {
      return new Member(this.context, {
        id: address,
        address,
        dao: {
          id: this.id,
          entity: new DAO(this.context, this.id)
        },
        reputation: new BN(0)
      })
    }
  }

  public proposals(
    options: IProposalQueryOptions = {},
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable<Proposal<IProposalState>[]> {
    if (!options.where) {
      options.where = {}
    }
    options.where.dao = this.id
    return Proposal.search(this.context, options, apolloQueryOptions)
  }

  public rewards(
    options: IRewardQueryOptions = {},
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable<Reward[]> {
    if (!options.where) { options.where = {} }
    options.where.dao = this.id
    return Reward.search(this.context, options, apolloQueryOptions)
  }

  public votes(
    options: IVoteQueryOptions = {},
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable<Vote[]> {
    if (!options.where) { options.where = {} }
    options.where.dao = this.id
    return Vote.search(this.context, options, apolloQueryOptions)
  }

  public stakes(
    options: IStakeQueryOptions = {},
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable<Stake[]> {
    if (!options.where) { options.where = {} }
    options.where.dao = this.id
    return Stake.search(this.context, options, apolloQueryOptions)
  }

  public createProposal(options: IProposalBaseCreateOptions) {
    options.dao = this.id

    if (!options.plugin) {
      throw Error(`dao.createProposal(options): options must include an address for "plugin"`)
    }

    const pluginsQuery = this.plugins(
      { where: {
        address: options.plugin,
        dao: options.dao
      }}
    )

    const observable = pluginsQuery.pipe(
      first(),
      concatMap((plugins) => {
        if (plugins && plugins.length > 0) {
          return plugins[0].createProposal(options)
        } else {
          throw Error(`No plugin with address ${options.plugin} is registered with dao ${options.dao}`)
        }
      }
    ))

    return toIOperationObservable(observable)
  }
}
