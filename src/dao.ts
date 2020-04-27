import BN from 'bn.js'
import gql from 'graphql-tag'
import { Observable, from } from 'rxjs'
import { first, map, concatMap } from 'rxjs/operators'
import {
  Arc,
  IVoteQueryOptions,
  Vote,
  IEntityRef,
  Entity,
  IPluginQueryOptions,
  Plugin,
  ProposalPlugin,
  Reward,
  IRewardQueryOptions,
  Reputation,
  Token,
  IMemberQueryOptions,
  Member,
  AnyProposal,
  AnyProposalPlugin,
  IStakeQueryOptions,
  Stake,
  IProposalQueryOptions,
  Proposal,
  IProposalBaseCreateOptions,
  toIOperationObservable,
  IApolloQueryOptions,
  createGraphQlQuery,
  isAddress,
  Address,
  ICommonQueryOptions,
  AnyPlugin
} from './index'
import { DocumentNode } from 'graphql'

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

    const query = gql`query SearchDaosWithAllData {
      daos ${createGraphQlQuery(options, where)} {
        ...DAOFields
        }
      }
      ${DAO.fragments.DAOFields}`

    const itemMap = (context: Arc, item: any, query: DocumentNode) => {
      const state = DAO.itemMap(context, item, query)
      return new DAO(context, state)
    }
      

    return context.getObservableList(
      context,
      query,
      itemMap,
      apolloQueryOptions
    )
  }

  public static itemMap = (context: Arc, item: any, query: DocumentNode): IDAOState => {
    if (!item) {
      throw Error(`DAO ItemMap failed. Query: ${query.loc?.source.body}`)
    }

    return {
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
    }
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
  ): Observable<AnyPlugin[]> {
    if (!options.where) { options.where = {}}
    options.where.dao = this.id
    return Plugin.search(this.context, options, apolloQueryOptions)
  }

  public proposalPlugins(
    options: IPluginQueryOptions = {},
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable<AnyProposalPlugin[]> {
    if (!options.where) { options.where = {}}
    options.where.dao = this.id
    return ProposalPlugin.search(this.context, options, apolloQueryOptions)
  }

  public async plugin(options: IPluginQueryOptions): Promise<AnyPlugin> {
    const plugins = await this.plugins(options).pipe(first()).toPromise()
    if (plugins.length === 1) {
      return plugins[0]
    } else {
      throw Error('Could not find a unique plugin satisfying these options')
    }
  }

  public async proposalPlugin(options: IPluginQueryOptions): Promise<AnyProposalPlugin> {
    const plugins = await this.proposalPlugins(options).pipe(first()).toPromise()
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
  ): Observable<AnyProposal[]> {
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

    const pluginId = Plugin.calculateId({ daoAddress: options.dao, contractAddress: options.plugin })
    const proposalObservable = from(this.proposalPlugin({ where: { id: pluginId }})).pipe(
      first(),
      concatMap((plugin) => plugin.createProposal(options))
    )

    return toIOperationObservable(proposalObservable)
  }
}
