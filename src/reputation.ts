import { ApolloQueryResult } from 'apollo-client'
import BN from 'bn.js'
import gql from 'graphql-tag'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import {
  Arc,
  IApolloQueryOptions,
  REPUTATION_CONTRACT_VERSION,
  createGraphQlQuery,
  isAddress,
  Entity,
  IEntityRef,
  DAO,
  Operation,
  ITransactionReceipt,
  Address,
  ICommonQueryOptions
} from './index'

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

  public address: Address

  constructor(context: Arc, idOrOpts: string | IReputationState){
    super(context, idOrOpts)
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
      context,
      query,
      (context: Arc, r: any) => new Reputation(context, r.id),
      apolloQueryOptions
    )
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

    return  this.context.getObservableObject(this.context, query, Reputation.itemMap, apolloQueryOptions) as Observable<IReputationState>
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

  public contract() {
    const abi = this.context.getABI({abiName: 'Reputation', version: REPUTATION_CONTRACT_VERSION})
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
