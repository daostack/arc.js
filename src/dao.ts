import BN = require('bn.js')
import gql from 'graphql-tag'
import { Observable } from 'rxjs'
import { concatMap, first, map } from 'rxjs/operators'
import { Arc } from './arc'
import { IApolloQueryOptions } from './graphnode'
import { IMemberQueryOptions, Member } from './member'
import { toIOperationObservable } from './operation'
import { IProposalCreateOptions, IProposalQueryOptions, Proposal } from './proposal'
import { Reputation } from './reputation'
import { IRewardQueryOptions, Reward } from './reward'
import { ISchemeQueryOptions, Scheme } from './scheme'
import { SchemeBase } from './schemes/base'
import { IStakeQueryOptions, Stake } from './stake'
import { Token } from './token'
import { Address, ICommonQueryOptions, IStateful } from './types'
import { createGraphQlQuery, isAddress } from './utils'
import { IVoteQueryOptions, Vote } from './vote'

export interface IDAOState {
  id: Address,
  address: Address, // address of the avatar
  name: string,
  register: 'na'|'proposed'|'registered'|'unRegistered',
  reputation: Reputation,
  token: Token,
  tokenName: string,
  tokenSymbol: string
  memberCount: number,
  reputationTotalSupply: BN,
  tokenTotalSupply: BN,
  dao?: DAO,
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

export class DAO implements IStateful<IDAOState> {
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

  /**
   * DAO.search(context, options) searches for DAO entities
   * @param  context an Arc instance that provides connection information
   * @param  options the query options, cf. IDAOQueryOptions
   * @return         an observable of DAO objects
   */
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

    return context.getObservableList(
      query,
      (r: any) => {
        if (apolloQueryOptions.fetchAllData) {
          const reputation = new Reputation(context, r.nativeReputation.id)
          const token = new Token(context, r.nativeToken.id)
          return new DAO(context, {
            address: r.id,
            id: r.id,
            memberCount: Number(r.reputationHoldersCount),
            name: r.name,
            numberOfBoostedProposals: Number(r.numberOfBoostedProposals),
            numberOfPreBoostedProposals: Number(r.numberOfPreBoostedProposals),
            numberOfQueuedProposals: Number(r.numberOfQueuedProposals),
            register: r.register,
            reputation,
            reputationTotalSupply: new BN(r.nativeReputation.totalSupply),
            token,
            tokenName: r.nativeToken.name,
            tokenSymbol: r.nativeToken.symbol,
            tokenTotalSupply: r.nativeToken.totalSupply
          })
        } else {
          return new DAO(context, r.id)
        }
      },
      apolloQueryOptions
    )
  }

  public id: Address
  public coreState: IDAOState|undefined

  constructor(public context: Arc, idOrOpts: Address|IDAOState) {
    if (typeof idOrOpts === 'string') {
      this.id = idOrOpts.toLowerCase()
    } else {
      this.id = idOrOpts.address
      this.setState(idOrOpts)
    }
  }

  public setState(opts: IDAOState) {
    this.coreState = opts
  }

  public async fetchState(apolloQueryOptions: IApolloQueryOptions = {}): Promise<IDAOState> {
    const state =  await this.state(apolloQueryOptions).pipe(first()).toPromise()
    this.setState(state)
    return state
  }

  /**
   * get the current state of the DAO
   * @return an Observable of IDAOState
   */
  public state(apolloQueryOptions: IApolloQueryOptions = {}): Observable<IDAOState> {
    const query = gql`query DAOById {
        dao(id: "${this.id}") {
          ...DAOFields
        }
      }
      ${DAO.fragments.DAOFields}
     `

    const itemMap = (item: any): IDAOState => {
      if (item === null) {
        throw Error(`Could not find a DAO with id ${this.id}`)
      }
      const reputation = new Reputation(this.context, item.nativeReputation.id)
      const token = new Token(this.context, item.nativeToken.id)
      const state = {
        address: item.id,
        dao: this,
        id: item.id,
        memberCount: Number(item.reputationHoldersCount),
        name: item.name,
        numberOfBoostedProposals: Number(item.numberOfBoostedProposals),
        numberOfPreBoostedProposals: Number(item.numberOfPreBoostedProposals),
        numberOfQueuedProposals: Number(item.numberOfQueuedProposals),
        register: item.register,
        reputation,
        reputationTotalSupply: new BN(item.nativeReputation.totalSupply),
        token,
        tokenName: item.nativeToken.name,
        tokenSymbol: item.nativeToken.symbol,
        tokenTotalSupply: item.nativeToken.totalSupply
      }
      this.setState(state)
      return state
    }
    return this.context.getObservableObject(query, itemMap, apolloQueryOptions)
  }

  /*
   * return the nativeReputation of the DAO
   * @returns an (Observable) that returns a Reputation instance
   */
  public nativeReputation(): Observable<Reputation> {
    return this.state().pipe(first()).pipe(map((r) => r.reputation))
  }

  public schemes(
    options: ISchemeQueryOptions = {},
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable<SchemeBase[]> {
    if (!options.where) { options.where = {}}
    options.where.dao = this.id
    return Scheme.search(this.context, options, apolloQueryOptions)
  }

  public async scheme(options: ISchemeQueryOptions): Promise<SchemeBase> {
    const schemes = await this.schemes(options).pipe(first()).toPromise()
    if (schemes.length === 1) {
      return schemes[0]
    } else {
      throw Error('Could not find a unique scheme satisfying these options')
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
        address,
        contract: this.coreState.reputation.address,
        reputation: this.coreState.reputationTotalSupply
      })
    } else {
      return new Member(this.context, { address, dao: this.id, reputation: new BN(0)})
    }
  }

  /**
   * create a new proposal in this DAO
   * @param  options [description]
   * @return a Proposal instance
   */
  public createProposal(options: IProposalCreateOptions) {
    options.dao = this.id

    if (!options.scheme) {
      throw Error(`dao.createProposal(options): options must include an address for "scheme"`)
    }

    const schemesQuery = this.schemes(
      { where: {
        address: options.scheme,
        dao: options.dao
      }}
    )

    const observable = schemesQuery.pipe(
      first(),
      concatMap((schemes) => {
        if (schemes && schemes.length > 0) {
          return schemes[0].createProposal(options)
        } else {
          throw Error(`No scheme with address ${options.scheme} is registered with dao ${options.dao}`)
        }
      }
    ))

    return toIOperationObservable(observable)
  }

  public proposals(
    options: IProposalQueryOptions = {},
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable<Proposal[]> {
    if (!options.where) {
      options.where = {}
    }
    options.where.dao = this.id
    return Proposal.search(this.context, options, apolloQueryOptions)
  }

  public proposal(proposalId: string ): Proposal {
    return new Proposal(this.context, proposalId)
  }

  public rewards(
    options: IRewardQueryOptions = {},
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable<Reward[]> {
    if (!options.where) { options.where = {}}
    options.where.dao = this.id
    return Reward.search(this.context, options, apolloQueryOptions)
  }

  public votes(
    options: IVoteQueryOptions = {},
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable<Vote[]> {
    if (!options.where) { options.where = {}}
    options.where.dao = this.id
    return Vote.search(this.context, options, apolloQueryOptions)
  }

  public stakes(
    options: IStakeQueryOptions = {},
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable<Stake[]> {
    if (!options.where) { options.where = {}}
    options.where.dao = this.id
    return Stake.search(this.context, options, apolloQueryOptions)
  }

  /**
   * get (an observable of) the Ether balance of the DAO from the web3Provider
   *
   * @return an observable stream of BN number instances
   */
  public ethBalance(): Observable<BN> {
    return this.context.ethBalance(this.id)
  }
}
