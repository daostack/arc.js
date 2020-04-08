import { AsyncSendable } from 'ethers/providers'
import { Observable } from 'rxjs'

export type Address = string
export type Date = number
export type Hash = string
export type Web3Provider = string | AsyncSendable
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

export interface IApolloQueryOptions {
  fetchPolicy?: 'cache-first' | 'network-only' | 'cache-only' | 'no-cache' | 'standby',
  subscribe?: true | false,
  fetchAllData?: true | false
}