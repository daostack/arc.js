import { Signer } from 'ethers'
import {
  AsyncSendable,
  JsonRpcProvider,
  Web3Provider as EthersWeb3JsProvider
} from 'ethers/providers'
import { Observable } from 'rxjs'
import { IApolloQueryOptions } from '../index'

export type Address = string
export type Date = number
export type Hash = string
export type Web3Provider = string | AsyncSendable | Signer
export type Web3Client = JsonRpcProvider | EthersWeb3JsProvider
export type IPFSProvider = string

export interface IStateful<T> {
  state: (apolloQueryOptions: IApolloQueryOptions) => Observable<T>
}

export interface ICommonQueryOptions {
  skip?: number
  first?: number
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
  where?: any
}
