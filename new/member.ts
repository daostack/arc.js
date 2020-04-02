import BN = require('bn.js')
import { utils } from 'ethers'
import gql from 'graphql-tag'
import { Observable, Observer } from 'rxjs'
import { map } from 'rxjs/operators'
import { Arc, IApolloQueryOptions } from './arc'
import { DAO } from './dao'
import { toIOperationObservable } from './operation'
import { IProposalQueryOptions, Proposal } from './proposal'
import { Reward } from './reward'
import { IStakeQueryOptions, Stake } from './stake'
import { Address, ICommonQueryOptions } from './types'
import { concat, createGraphQlQuery, hexStringToUint8Array, isAddress } from './utils'
import { IVoteQueryOptions, Vote } from './vote'
import { Entity } from './entity'

export interface IMemberState {
  address: Address,
  dao?: Address
  contract?: Address
  id: string
  reputation: BN
}

export interface IMemberQueryOptions extends ICommonQueryOptions {
  where?: {
    id?: string
    address?: Address,
    dao?: Address
  }
}

/**
 * Represents an account that holds reputaion in a specific DAO
 */
export class Member extends Entity<IMemberState> {

  public static fragments = {
    ReputationHolderFields: gql`
      fragment ReputationHolderFields on ReputationHolder {
        id
        address
        contract
        dao {
          id
        }
        balance
      }
    `
  }

  /**
   * Member.search(context, options) searches for member entities
   * @param  context an Arc instance that provides connection information
   * @param  options the query options, cf. IMemberQueryOptions
   * @return         an observable of IRewardState objects
   */
  public static search(
    context: Arc,
    options: IMemberQueryOptions = {},
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable<Member[]> {
    if (!options.where) { options.where = {}}
    if (options.where.id) {
      return new Member(context, options.where.id).state().pipe(map((r: any) => [r]))
    } else {
      let where = ''
      for (const key of Object.keys(options.where)) {
        if (options.where[key] === undefined) {
          continue
        }

        if (key === 'address' || key === 'dao') {
          const option = options.where[key] as string
          isAddress(option)
          options.where[key] = option.toLowerCase()
        }

        where += `${key}: "${options.where[key] as string}"\n`
      }
      where += ' dao_not: null\n'

      const query = gql`
        query ReputationHolderSearch {
          reputationHolders ${createGraphQlQuery(options, where)} {
            ...ReputationHolderFields
          }
        }
        ${Member.fragments.ReputationHolderFields}
      `

      const itemMap = (item: any) => Member.itemMap(context, item)

      return context.getObservableList(
          query,
          itemMap,
          apolloQueryOptions
        )
      }
  }

  public static calculateId(opts: { contract: Address, address: Address}): string {
    const seed = concat(
      hexStringToUint8Array(opts.contract.toLowerCase()),
      hexStringToUint8Array(opts.address.toLowerCase())
    )
    return utils.keccak256(seed)
  }

  /**
   * @param address addresssof the member
   * @param daoAdress addresssof the DAO this member is a member of
   * @param context an instance of Arc
   */
  constructor(public context: Arc, idOrOpts: string|IMemberState) {
    super()
    if (typeof idOrOpts === 'string') {
      this.id = idOrOpts as string
    } else {
      const opts: IMemberState = idOrOpts
      this.setState(opts)
    }
  }

  public setState(opts: IMemberState) {
    isAddress(opts.address)
    if (!opts.id && opts.contract && opts.address) {
      opts.id = Member.calculateId({ contract: opts.contract, address: opts.address})
    }
    this.id = opts.id
    this.coreState = {
      address: opts.address.toLowerCase(),
      contract: opts.contract && opts.contract.toLowerCase(),
      dao: opts.dao && opts.dao.toLowerCase(),
      id: opts.id,
      reputation: opts.reputation
    }
    return this.coreState
  }

  public static itemMap(context: Arc, item: any): Member {
    if (item === null || item === undefined || item.id === undefined) {
      //TODO: How to get ID for this error msg?
      throw Error(`No member with id was found`)
    }
    return new Member(context, {
      id: item.id,
      address: item.address,
      dao: item.dao.id,
      contract: item.contract,
      reputation: new BN(item.balance)
    })
  }

  public state(apolloQueryOptions: IApolloQueryOptions = {}): Observable<IMemberState> {
    let query: any

    const itemMap = (item: any) => Member.itemMap(this.context, item)

    if (this.id) {
      query = gql`query ReputionHolderStateFromId {
          # contract: ${this.coreState && this.coreState.contract}
          # address: ${this.coreState && this.coreState.address}
          reputationHolder (
              id: "${this.id}"
          ) {
            ...ReputationHolderFields
          }
        }
        ${Member.fragments.ReputationHolderFields}
      `
      return this.context.getObservableObject(
        query,
        itemMap,
        apolloQueryOptions
      )
    } else {
      const state = this.coreState as IMemberState
      query = gql`query ReputationHolderStateFromDAOAndAddress {
          reputationHolders (
            where: {
              address: "${state.address}"
              dao: "${state.dao}"
            }
          ) {
            ...ReputationHolderFields
          }
        }

        ${Member.fragments.ReputationHolderFields}
        `
    }

    return this.context.getObservableObject(
      query,
      (items: any) => items.length? new Member(this.context, this.coreState): itemMap(items[0]),
      apolloQueryOptions
    ) as Observable<IMemberState>
  }

  public async dao(): Promise < DAO > {
    const state = await this.fetchState()
    return new DAO(this.context, state.dao as Address)
  }

  public rewards(): Observable < Reward[] > {
    throw new Error('not implemented')
  }

  public proposals(
    options: IProposalQueryOptions = {},
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable < Proposal[] > {
    const observable = Observable.create(async (observer: Observer<Proposal[]>) => {
      const state = await this.fetchState()
      if (!options.where) { options.where = {} }
      options.where.proposer = state.address
      options.where.dao = state.dao
      const sub = Proposal.search(this.context, options, apolloQueryOptions).subscribe(observer)
      return () => sub.unsubscribe()
    })

    return toIOperationObservable(observable)
  }

  public stakes(options: IStakeQueryOptions = {}, apolloQueryOptions: IApolloQueryOptions = {}): Observable<Stake[]> {
    const observable = Observable.create(async (observer: Observer<Stake[]>) => {
      const state = await this.fetchState()
      if (!options.where) { options.where = {} }
      options.where.staker = state.address
      options.where.dao = state.dao
      const sub = Stake.search(this.context, options, apolloQueryOptions).subscribe(observer)
      return () => sub.unsubscribe()
    })

    return toIOperationObservable(observable)
  }

  public votes(options: IVoteQueryOptions = {}, apolloQueryOptions: IApolloQueryOptions = {}): Observable < Vote[] > {
    const observable = Observable.create(async (observer: Observer<Vote[]>) => {
      const state = await this.fetchState()
      if (!options.where) { options.where = {} }
      options.where.voter = state.address
      options.where.dao = state.dao
      const sub = Vote.search(this.context, options, apolloQueryOptions) .subscribe(observer)
      return () => sub.unsubscribe()
    })

    return toIOperationObservable(observable)
    }
}
