import BN from 'bn.js'
import { BigNumber } from 'ethers/utils'
import gql from 'graphql-tag'
import { Observable, Observer } from 'rxjs'
import { first } from 'rxjs/operators'
import {
  Address,
  Arc,
  createGraphQlQuery,
  Entity,
  Hash,
  IApolloQueryOptions,
  ICommonQueryOptions,
  isAddress
} from './index'

export interface ITokenState {
  id: Address
  address: Address
  name: string
  owner: Address
  symbol: string
  totalSupply: BN
}

export interface ITokenQueryOptions extends ICommonQueryOptions {
  where?: {
    address?: Address
    name?: string
    owner?: Address
    symbol?: string
    [key: string]: any
  }
}

export interface IApproval {
  id: Hash
  txHash: Hash
  contract: Address
  owner: Address
  spender: Address
  value: BN
}

export interface IAllowance {
  token: Address
  owner: Address
  spender: Address
  amount: BN
}

export class Token extends Entity<ITokenState> {
  public static search(
    context: Arc,
    options: ITokenQueryOptions = {},
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable<Token[]> {
    if (!options.where) {
      options.where = {}
    }
    let where = ''
    for (const key of Object.keys(options.where)) {
      if (options[key] === undefined) {
        continue
      }

      if (key === 'token' || key === 'owner' || key === 'spender') {
        const option = options[key] as string
        isAddress(option)
        options[key] = option.toLowerCase()
      }

      where += `${key}: "${options[key] as string}"\n`
    }

    const query = gql`query TokenSearch
    {
      tokens ${createGraphQlQuery(options, where)} {
        id
      }
    }`

    return context.getObservableList(
      context,
      query,
      (arc: Arc, r: any, queriedId?: string) => new Token(arc, r.id),
      options.where?.id,
      apolloQueryOptions
    ) as Observable<Token[]>
  }

  public static itemMap = (context: Arc, item: any, queriedId?: string): ITokenState => {
    if (!item) {
      throw Error(`Token ItemMap failed. ${queriedId && `Could not find Token with id '${queriedId}'`}`)
    }
    return {
      id: item.id,
      address: item.id,
      name: item.name,
      owner: item.dao.id,
      symbol: item.symbol,
      totalSupply: new BN(item.totalSupply)
    }
  }

  public address: string

  constructor(context: Arc, idOrOpts: string | ITokenState) {
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

  public state(apolloQueryOptions: IApolloQueryOptions = {}): Observable<ITokenState> {
    const query = gql`query tokenState {
      token(id: "${this.address.toLowerCase()}") {
        id,
        dao {
          id
        },
        name,
        symbol,
        totalSupply
      }
    }`

    return this.context.getObservableObject(
      this.context,
      query,
      Token.itemMap,
      this.address.toLowerCase(),
      apolloQueryOptions
    ) as Observable<ITokenState>
  }

  public contract() {
    return this.context.getContract(this.address)
  }

  public balanceOf(owner: string): Observable<BN> {
    const errHandler = async (err: Error) => {
      if (err.message.match(/Returned values aren't valid/g) && this.context.web3) {
        // check if there is actually a contract deployed there
        const code = await this.context.web3.getCode(this.address)
        if (code === '0x') {
          return new Error(
            `Cannot get balanceOf(): there is no contract at this address ${this.address}`
          )
        }
      }
      return err
    }
    const observable = Observable.create(async (observer: Observer<BN>) => {
      try {
        const contract = this.contract()

        const toFilter = contract.filters.Transfer(null, owner)
        const onTransferTo = (data: any) => {
          contract.balanceOf(owner).then((newBalance: BigNumber) => {
            observer.next(new BN(newBalance.toString()))
          })
        }

        const fromFilter = contract.filters.Transfer(owner)
        const onTransferFrom = (data: any) => {
          contract.balanceOf(owner).then((newBalance: number) => {
            observer.next(new BN(newBalance.toString()))
          })
        }

        const unsubscribe = () => {
          contract.removeListener(toFilter, onTransferTo)
          contract.removeListener(fromFilter, onTransferFrom)
        }
        const subscribe = () =>
          contract
            .balanceOf(owner)
            .then((balance: BigNumber) => {
              if (!balance) {
                observer.error(`balanceOf ${owner} returned null`)
              }
              observer.next(new BN(balance.toString()))
              contract.on(toFilter, onTransferTo)
              contract.on(fromFilter, onTransferFrom)
            })
            .catch(async (err: Error) => {
              if (err.message.match(/connection not open/g)) {
                observer.error(await errHandler(err))
              } else {
                observer.error(await errHandler(err))
              }
            })
        await subscribe()
        return () => unsubscribe()
      } catch (e) {
        return observer.error(e)
      }
    })
    observable.first = () => observable.pipe(first()).toPromise()
    return observable
  }

  public allowance(owner: Address, spender: Address): Observable<BN> {
    return Observable.create(async (observer: Observer<BN>) => {
      const contract = this.contract()

      const filter = contract.filters.Approval(owner)
      const onApproval = () => {
        // const newBalance = data.returnValues.value
        contract.allowance(owner, spender).then((newBalance: number) => {
          observer.next(new BN(newBalance.toString()))
        })
      }

      contract
        .allowance(owner, spender)
        .then((balance: BigNumber) => {
          if (!balance) {
            observer.error(`balanceOf ${owner} returned null`)
          }
          observer.next(new BN(balance.toString()))
          contract.on(filter, onApproval)
        })
        .catch((err: Error) => {
          observer.error(err)
        })
      return () => {
        contract.removeListener(filter, onApproval)
      }
    })
  }

  public mint(beneficiary: Address, amount: BN) {
    return this.context.sendTransaction({
      contract: this.contract(),
      method: 'mint',
      args: [beneficiary, amount.toString()]
    })
  }

  public transfer(beneficiary: Address, amount: BN) {
    return this.context.sendTransaction({
      contract: this.contract(),
      method: 'transfer',
      args: [beneficiary, amount.toString()]
    })
  }

  public approveForStaking(spender: Address, amount: BN) {
    return this.context.sendTransaction({
      contract: this.contract(),
      method: 'approve',
      args: [spender, amount.toString()]
    })
  }
}
