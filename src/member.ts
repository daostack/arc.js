import BN from 'bn.js'
import { utils } from 'ethers'
import gql from 'graphql-tag'
import { Observable, Observer } from 'rxjs'
import { map } from 'rxjs/operators'
import {
  Arc,
  IApolloQueryOptions,
  DAO,
  toIOperationObservable,
  IProposalQueryOptions,
  Proposal,
  IStakeQueryOptions,
  Stake,
  concat,
  createGraphQlQuery,
  hexStringToUint8Array,
  isAddress,
  Reward,
  IVoteQueryOptions,
  Vote,
  Entity,
  IEntityRef,
  AnyProposal,
  Address,
  ICommonQueryOptions
} from './index'
import { DocumentNode } from 'graphql'

export interface IMemberState {
  id: string
  address: Address
  contract?: Address
  dao: IEntityRef<DAO>
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

      return context.getObservableList(
          context,
          query,
          Member.itemMap,
          apolloQueryOptions
        )
      }
  }

  public static itemMap(context: Arc, item: any, query: DocumentNode): IMemberState {
    if (item === null || item === undefined || item.id === undefined) {
      throw Error(`Member ItemMap failed. Query: ${query.loc?.source.body}`)
    }
    return {
      id: item.id,
      address: item.address,
      dao: {
        id: item.dao.id,
        entity: new DAO(context, item.dao.id)
      },
      contract: item.contract,
      reputation: new BN(item.balance)
    }
  }

  public static calculateId(opts: { contract: Address, address: Address}): string {
    const seed = concat(
      hexStringToUint8Array(opts.contract.toLowerCase()),
      hexStringToUint8Array(opts.address.toLowerCase())
    )
    return utils.keccak256(seed)
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
        this.context,
        query,
        Member.itemMap,
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
      this.context,
      query,
      (context: Arc, items: any, query: DocumentNode) => {
        if(items.length) {
          if(!this.coreState){
            throw new Error("Member state is not set")
          }

          return new Member(context, this.coreState)
        }
        
        return Member.itemMap(context, items[0], query)
      },
      apolloQueryOptions
    ) as Observable<IMemberState>
  }

  public async dao(): Promise < DAO > {
    const state = await this.fetchState()
    return new DAO(this.context, state.dao.id as Address)
  }

  public rewards(): Observable < Reward[] > {
    throw new Error('not implemented')
  }

  public proposals(
    options: IProposalQueryOptions = {},
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable < AnyProposal[] > {
    const observable = Observable.create(async (observer: Observer<AnyProposal[]>) => {
      const state = await this.fetchState()
      if (!options.where) { options.where = {} }
      options.where.proposer = state.address
      options.where.dao = state.dao.id
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
      options.where.dao = state.dao.id
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
      options.where.dao = state.dao.id
      const sub = Vote.search(this.context, options, apolloQueryOptions) .subscribe(observer)
      return () => sub.unsubscribe()
    })

    return toIOperationObservable(observable)
  }

  public setState(opts: IMemberState) {
    isAddress(opts.address)
    
    if(opts.contract) {
      this.id = Member.calculateId({ contract: opts.contract, address: opts.address})
    }
    
    if(!opts.dao) throw new Error("DAO not defined in options")

    const daoId = opts.dao.id.toLowerCase()

    this.coreState = {
      id: this.id,
      address: opts.address.toLowerCase(),
      contract: opts.contract && opts.contract.toLowerCase(),
      dao: {
        id: daoId,
        entity: new DAO(this.context, daoId)
      },
      reputation: opts.reputation
    }
    return this.coreState
  }
}
