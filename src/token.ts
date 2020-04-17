import BN from 'bn.js'
import { BigNumber } from 'ethers/utils'
import gql from 'graphql-tag'
import { Observable, Observer } from 'rxjs'
import { first } from 'rxjs/operators'
import {
  Arc,
  IApolloQueryOptions,
  createGraphQlQuery,
  isAddress,
  Entity,
  Address,
  Hash,
  ICommonQueryOptions
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

  public address: string

  constructor(context: Arc, idOrOpts: string|ITokenState) {
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
    options: ITokenQueryOptions = {},
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable<Token[]> {
    if (!options.where) { options.where = {}}
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
      (context: Arc, r: any) => new Token(context, r.id),
      apolloQueryOptions
    ) as Observable<Token[]>
  }

  public static itemMap = (context: Arc, item: any): Token => {
    if (item === null) {
      //TODO: How to get ID for this error msg?
      throw Error(`Could not find a token contract with address`)
    }
    return new Token(context, {
      id: item.id,
      address: item.id,
      name: item.name,
      owner: item.dao.id,
      symbol: item.symbol,
      totalSupply: new BN(item.totalSupply)
    })
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

    return  this.context.getObservableObject(this.context,query, Token.itemMap, apolloQueryOptions) as Observable<ITokenState>
  }

  public contract() {
    const abi = this.context.getABI({abiName: `DAOToken`, version: DAOTOKEN_CONTRACT_VERSION})
    return this.context.getContract(this.address, abi)
  }

  public balanceOf(owner: string): Observable<BN> {
    const errHandler = async (err: Error) => {
      if (err.message.match(/Returned values aren't valid/g) && this.context.web3) {
        // check if there is actually a contract deployed there
        const code = await this.context.web3.getCode(this.address)
        if (code === '0x') {
          return new Error(`Cannot get balanceOf(): there is no contract at this address ${this.address}`)
        }
      }
      return err
    }
    const observable = Observable.create(async (observer: Observer<BN>) => {
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
      const subscribe = () => contract.balanceOf(owner)
        .then((balance: BigNumber) => {
          if (balance === null) {
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

      contract.allowance(owner, spender)
        .then((balance: BigNumber) => {
          if (balance === null) {
            observer.error(`balanceOf ${owner} returned null`)
          }
          observer.next(new BN(balance.toString()))
          contract.on(filter, onApproval)
        })
        .catch((err: Error) => { observer.error(err)})
      return () => {
        contract.removeListener(filter, onApproval)
      }
    })
  }

  public mint(beneficiary: Address, amount: BN) {
    return this.context.sendTransaction({
      contract: this.contract(),
      method: 'mint',
      args: [ beneficiary, amount.toString() ]
    })
  }

  public transfer(beneficiary: Address, amount: BN) {
    return this.context.sendTransaction({
      contract: this.contract(),
      method: 'transfer',
      args: [ beneficiary, amount.toString() ]
    })
  }

  public approveForStaking(spender: Address, amount: BN) {
    return this.context.sendTransaction({
      contract: this.contract(),
      method: 'approve',
      args: [ spender, amount.toString() ]
    })
  }
}
