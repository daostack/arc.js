import { ApolloQueryResult } from 'apollo-client'
import BN = require('bn.js')
import gql from 'graphql-tag'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { Arc, IApolloQueryOptions } from './arc'
import { ITransactionReceipt, Operation } from './operation'
import { REPUTATION_CONTRACT_VERSION } from './settings'
import { Address, ICommonQueryOptions, IStateful } from './types'
import { createGraphQlQuery, isAddress } from './utils'
import { Entity, IEntityRef } from './entity'
import { DAO } from './dao'

export interface IReputationState {
  id: Address
  address: Address
  totalSupply: BN
  dao: IEntityRef<DAO>
}

export interface IReputationQueryOptions extends ICommonQueryOptions {
  id?: string
  dao?: Address
  [key: string]: any
}

export class Reputation extends Entity<IReputationState> {

  /**
   * Reputation.search(context, options) searches for reputation entities
   * @param  context an Arc instance that provides connection information
   * @param  options the query options, cf. IReputationQueryOptions
   * @return         an observable of Reputation objects
   */
  public static search(
    context: Arc,
    options: IReputationQueryOptions = {},
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable<Reputation[]> {
    let where = ''
    if (!options.where) { options.where = {}}
    for (const key of Object.keys(options.where)) {
      if (options[key] === undefined) {
        continue
      }

      if (key === 'dao') {
        const option = options[key] as string
        isAddress(option)
        options[key] = option.toLowerCase()
      }

      where += `${key}: "${options[key] as string}"\n`
    }

    const query = gql`query ReputationSearch {
      reps
      ${createGraphQlQuery(options, where)}
      {
        id
      }
    }`

    return context.getObservableList(
      query,
      (r: any) => new Reputation(context, r.id),
      apolloQueryOptions
    )
  }

  public address: Address
  public coreState: IReputationState

  constructor(public context: Arc, idOrOpts: string | IReputationState){
    super()
    if (typeof idOrOpts === 'string') {
      isAddress(idOrOpts)
      this.address = idOrOpts
      this.id = idOrOpts
    } else {
      isAddress(idOrOpts.address)
      this.address = idOrOpts.address
      this.id = idOrOpts.address
      this.setState(idOrOpts)
    }
  }

  public static itemMap = (context: Arc, item: any): Reputation => {
    //TODO: How to get ID for this error msg?
    if (item === null) {
      throw Error(`Could not find a reputation contract with address`)
    }
    return new Reputation(context, {
      id: item.id,
      address: item.id,
      dao: {
        id: item.dao.id,
        entity: new DAO(context, item.dao.id)
      },
      totalSupply: new BN(item.totalSupply)
    })
  }

  public state(apolloQueryOptions: IApolloQueryOptions = {}): Observable<IReputationState> {
    const query = gql`query ReputationState
    {
      rep (id: "${this.address.toLowerCase()}") {
        id
        totalSupply
        dao {
          id
        }
      }
    }`

    const itemMap = (item: any) => Reputation.itemMap(this.context, item)

    return  this.context.getObservableObject(query, itemMap, apolloQueryOptions) as Observable<IReputationState>
  }

  public reputationOf(address: Address): Observable<BN> {
    isAddress(address)

    const query = gql`query ReputationHolderReputation {
      reputationHolders (
        where: { address:"${address}",
        contract: "${this.address}"}
      )
      {
        id, address, balance,contract
      }
    }`
    return this.context.getObservable(query).pipe(
      map((r: ApolloQueryResult<any>) => r.data.reputationHolders),
      map((items: any[]) => {
        const item = items.length > 0 && items[0]
        return item.balance !== undefined ? new BN(item.balance) : new BN(0)
      })
    )
  }

  /*
   * get a web3 contract instance for this token
   */
  public contract() {
    const abi = this.context.getABI(undefined, 'Reputation', REPUTATION_CONTRACT_VERSION)
    return this.context.getContract(this.address, abi)
  }

  public mint(beneficiary: Address, amount: BN): Operation<undefined> {
    const mapReceipt = (receipt: ITransactionReceipt) => undefined

    const errorHandler = async (err: Error) => {
      const contract = this.contract()
      const sender = await contract.signer.getAddress()
      const owner = await contract.owner()
      if (owner.toLowerCase() !== sender.toLowerCase()) {
        return Error(`Minting failed: sender ${sender} is not the owner of the contract at ${contract._address}` +
          `(which is ${owner})`)
      }
      return err
    }

    const transaction = {
      contract: this.contract(),
      method: 'mint',
      args: [ beneficiary, amount.toString() ]
    }

    return this.context.sendTransaction(transaction, mapReceipt, errorHandler)
  }
}
