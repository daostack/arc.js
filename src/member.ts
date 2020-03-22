import BN = require('bn.js')
import gql from 'graphql-tag'
import { Observable } from 'rxjs'
import { first, map } from 'rxjs/operators'
import { Arc, IApolloQueryOptions } from './arc'
import { DAO } from './dao'
import { toIOperationObservable } from './operation'
import { IProposalQueryOptions, Proposal } from './proposal'
import { Reward } from './reward'
import { IStakeQueryOptions, Stake } from './stake'
import { Address, ICommonQueryOptions, IStateful } from './types'
import { concat, createGraphQlQuery, hexStringToUint8Array,
  isAddress
  // stringToUint8Array
 } from './utils'
import { IVoteQueryOptions, Vote } from './vote'
import { utils } from 'ethers'

export interface IMemberState {
  address: Address,
  dao?: Address
  contract: Address
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

export class Member implements IStateful<IMemberState> {

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
      return new Member(options.where.id, context).state().pipe(map((r: any) => [r]))
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

      return context.getObservableList(
          query,
          (r: any) => new Member({ id: r.id, address: r.address, dao: r.dao.id, contract: r.contract}, context),
          apolloQueryOptions
        )
      }
  }

  public id: string|undefined
  public coreState: IMemberState|undefined

  /**
   * @param address addresssof the member
   * @param daoAdress addresssof the DAO this member is a member of
   * @param context an instance of Arc
   */
  constructor(idOrOpts: string|IMemberState, public context: Arc) {
    if (typeof idOrOpts === 'string') {
      this.id = idOrOpts as string
    } else {
      const opts: IMemberState = idOrOpts
      this.setState(opts)
    }
  }

  public async fetchState(): Promise<IMemberState> {
    const state = await this.state().pipe(first()).toPromise()
    return this.setState({
      address: state.address,
      contract: state.contract,
      dao: state.dao,
      id: state.id
    })
  }
  public calculateId(opts: { contract: Address, address: Address}): string {
    const seed = concat(
      hexStringToUint8Array(opts.contract.toLowerCase()),
      hexStringToUint8Array(opts.address.toLowerCase())
    )
    return utils.keccak256(seed)
  }
  public setState(opts: IMemberState) {
    isAddress(opts.address)
    if (!opts.id && opts.contract && opts.address) {
      opts.id = this.calculateId({ contract: opts.contract, address: opts.address})
    }
    this.id = opts.id
    this.coreState = {
      address: opts.address.toLowerCase(),
      contract: opts.contract && opts.contract.toLowerCase(),
      dao: opts.dao && opts.dao.toLowerCase(),
      id: opts.id
    }
    return this.coreState
  }

  public state(apolloQueryOptions: IApolloQueryOptions = {}): Observable<IMemberState> {
    let query: any
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
        (r: any) => {
          if (r === null || r === undefined || r.id === undefined) {
            // we return a dummy object with 0 reputation
            const state = this.coreState as IMemberState
            if (state) {
              return  {
                address: state.address,
                dao: state.dao,
                reputation: new BN(0)
              }
            } else {
              throw Error(`No member with id ${this.id} was found`)
            }
          }
          return { id: r.id, address: r.address, dao: r.dao.id, contract: r.contract, reputation: new BN(r.balance)}
        },
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

    const itemMap = (items: any) => {
      if (items.length === 0) {
        const state = this.coreState as IMemberState
        return  {
          address: state.address,
          dao: state.dao,
          reputation: new BN(0)
        }
      } else {
        const item = items[0]
        return {
            address: item.address,
            contract: item.contract,
            dao: item.dao.id,
            id: item.id,
            reputation: new BN(item.balance)
          }
        }
      }
    return this.context.getObservableObject(query, itemMap, apolloQueryOptions) as Observable<IMemberState>
  }

  public async dao(): Promise < DAO > {
    const state = await this.fetchState()
    return new DAO(state.dao as Address, this.context)
  }

  public rewards(): Observable < Reward[] > {
    throw new Error('not implemented')
  }

  public proposals(
    options: IProposalQueryOptions = {},
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable < Proposal[] > {
    const observable = Observable.create(async (observer: any) => {
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
    const observable = Observable.create(async (observer: any) => {
      const state = await this.fetchState()
      if (!options.where) { options.where = {} }
      options.where.staker = state.address
      options.where.dao = state.dao
      const sub = Stake.search(this.context, options, apolloQueryOptions) .subscribe(observer)
      return () => sub.unsubscribe()
    })

    return toIOperationObservable(observable)
  }

  public votes(options: IVoteQueryOptions = {}, apolloQueryOptions: IApolloQueryOptions = {}): Observable < Vote[] > {
    const observable = Observable.create(async (observer: any) => {
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
