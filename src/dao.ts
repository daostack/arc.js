import BN from 'bn.js'
import { DocumentNode } from 'graphql'
import gql from 'graphql-tag'
import { Observable } from 'rxjs'
import { first, map } from 'rxjs/operators'
import {
  Address,
  AnyPlugin,
  AnyProposal,
  AnyProposalPlugin,
  Arc,
  createGraphQlQuery,
  Entity,
  IApolloQueryOptions,
  ICommonQueryOptions,
  IEntityRef,
  IMemberQueryOptions,
  IMemberState,
  IPluginQueryOptions,
  IProposalBaseCreateOptions,
  IProposalQueryOptions,
  IRewardQueryOptions,
  isAddress,
  IStakeQueryOptions,
  IVoteQueryOptions,
  Member,
  Plugin,
  Proposal,
  ProposalPlugin,
  Reputation,
  Reward,
  Stake,
  Token,
  Vote
} from './index'

export interface IDAOState {
  id: Address
  address: Address // address of the avatar
  name: string
  register: 'na' | 'proposed' | 'registered' | 'unRegistered'
  reputation: IEntityRef<Reputation>
  token: IEntityRef<Token>
  tokenName: string
  tokenSymbol: string
  memberCount: number
  reputationTotalSupply: BN
  tokenTotalSupply: BN
  numberOfQueuedProposals: number
  numberOfPreBoostedProposals: number
  numberOfBoostedProposals: number
}

export interface IDAOQueryOptions extends ICommonQueryOptions {
  where?: {
    address?: Address;
    name?: string;
    register?: 'na' | 'proposed' | 'registered' | 'unRegistered';
    [key: string]: any;
  }
}

export class DAO extends Entity<IDAOState> {
  public static fragments = {
    DAOFields: gql`
      fragment DAOFields on DAO {
        id
        name
        nativeReputation {
          id
          totalSupply
        }
        nativeToken {
          id
          name
          symbol
          totalSupply
        }
        numberOfQueuedProposals
        numberOfPreBoostedProposals
        numberOfBoostedProposals
        register
        reputationHoldersCount
      }
    `
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

    const itemMap = (arc: Arc, item: any, queryDoc: DocumentNode) => {
      const state = DAO.itemMap(arc, item, queryDoc)
      return new DAO(arc, state)
    }

    return context.getObservableList(context, query, itemMap, apolloQueryOptions)
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
    return this.state()
      .pipe(first())
      .pipe(map((r) => r.reputation.entity))
  }

  public async ethBalance(): Promise<Observable<BN>> {
    const avatar = this.context.getContract(this.id)
    return this.context.ethBalance(await avatar.vault())
  }

  public plugins(
    options: IPluginQueryOptions = {},
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable<AnyPlugin[]> {
    if (!options.where) {
      options.where = {}
    }
    options.where.dao = this.id
    return Plugin.search(this.context, options, apolloQueryOptions)
  }

  public proposalPlugins(
    options: IPluginQueryOptions = {},
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable<AnyProposalPlugin[]> {
    if (!options.where) {
      options.where = {}
    }
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
    if (!options.where) {
      options.where = {}
    }
    options.where.dao = this.id
    return Member.search(this.context, options, apolloQueryOptions)
  }

  public member(idOrOpts: IMemberState | string): Member {
    if (typeof idOrOpts !== 'string') {
      if (this.coreState) {
        // construct member with the reputationcontract address, if this is known
        // so it can make use of the apollo cache
        idOrOpts.reputation = this.coreState.reputationTotalSupply
        idOrOpts.contract = this.coreState.reputation.entity.address
      }
    }
    return new Member(this.context, idOrOpts)
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
    if (!options.where) {
      options.where = {}
    }
    options.where.dao = this.id
    return Reward.search(this.context, options, apolloQueryOptions)
  }

  public votes(
    options: IVoteQueryOptions = {},
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable<Vote[]> {
    if (!options.where) {
      options.where = {}
    }
    options.where.dao = this.id
    return Vote.search(this.context, options, apolloQueryOptions)
  }

  public stakes(
    options: IStakeQueryOptions = {},
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable<Stake[]> {
    if (!options.where) {
      options.where = {}
    }
    options.where.dao = this.id
    return Stake.search(this.context, options, apolloQueryOptions)
  }

  public async createProposal(options: IProposalBaseCreateOptions) {
    options.dao = this.id

    if (!options.plugin) {
      throw Error(`dao.createProposal(options): options must include an address for "plugin"`)
    }

    const pluginId = Plugin.calculateId({
      daoAddress: options.dao,
      contractAddress: options.plugin
    })

    const plugin = await this.proposalPlugin({ where: { id: pluginId } })

    return plugin.createProposal(options)
  }
}
