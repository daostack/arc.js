import { Observable as ZenObservable } from 'apollo-link'
import BN from 'bn.js'
import { utils } from 'ethers'
import WebSocket from 'isomorphic-ws'
import { Observable, Observer } from 'rxjs'
import { Address, ICommonQueryOptions, ITransactionEvent } from '../index'
import { Web3Client } from './types'

const checkAddress = (address: string) => {
  try {
    // If the address is all upper-case, convert to lower case
    if (address.indexOf('0X') > -1) {
      address = address.toLowerCase()
    }

    const result = utils.getAddress(address)
    if (!result) {
      throw new Error('Invalid address')
    }

    return true
  } catch (error) {
    return false
  }
}

export function fromWei(amount: BN): string {
  const etherAmount = utils.formatEther(amount.toString())
  return etherAmount.toString()
}

export function toWei(amount: string | number): BN {
  const weiAmount = utils.parseEther(amount.toString())
  return new BN(weiAmount.toString())
}

export function checkWebsocket(options: { url: string }) {
  const ws = new WebSocket(options.url, {
    // origin: 'https://websocket.org'
  })

  ws.onopen = function open() {
    // console.log('connected')
    ws.send(Date.now())
  }

  ws.onclose = function close() {
    // console.log('disconnected')
  }

  ws.onmessage = function incoming(data: any) {
    // console.log(`Roundtrip time: ${Date.now() - data} ms`)
    setTimeout(function timeout() {
      ws.send(Date.now())
    }, 500)
  }
}

export function hexStringToUint8Array(hexString: string) {
  if (hexString.startsWith('0x')) {
    hexString = hexString.substring(2)
  }
  // @ts-ignore
  return new Uint8Array(hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)))
}

export function stringToUint8Array(str: string) {
  const arrayBuffer = new ArrayBuffer(str.length * 1)
  const newUint = new Uint8Array(arrayBuffer)
  newUint.forEach((_, i) => {
    newUint[i] = str.charCodeAt(i)
  })
  return newUint
}

// function lifted and adapted from @daostack/subgraph/src/utils to generate unique ids
export function concat(a: Uint8Array, b: Uint8Array): Uint8Array {
  const out = new Uint8Array(a.length + b.length)
  for (let i = 0; i < a.length; i++) {
    out[i] = a[i]
  }
  for (let j = 0; j < b.length; j++) {
    out[a.length + j] = b[j]
  }
  return out
}

export function eventId(event: ITransactionEvent): string {
  if (!event.transactionHash || !event.logIndex) {
    throw new Error('Event must have both transactionHash and logIndex')
  }
  const hash = utils.keccak256(
    concat(stringToUint8Array(event.transactionHash), stringToUint8Array(event.logIndex.toString()))
  )
  return hash
}

export function isAddress(address: Address) {
  if (!address) {
    throw new Error(`Not a valid address: ${address}`)
  }
  if (!checkAddress(address)) {
    throw new Error(`Not a valid address: ${address}`)
  }
}

/**
 * convert a ZenObservable to an rxjs.Observable
 * @param  zenObservable [description]
 * @return an Observable instance
 */
export function zenToRxjsObservable(zenObservable: ZenObservable<any>) {
  return Observable.create((obs: Observer<any>) => {
    const subscription = zenObservable.subscribe(obs)
    return () => subscription.unsubscribe()
  })
}

/** convert the number representation of RealMath.sol representations to real real numbers
 * @param  t a BN instance of a real number in the RealMath representation
 * @return  a BN
 */
export function realMathToNumber(t: BN): number {
  const REAL_FBITS = 40
  const fraction = t.maskn(REAL_FBITS).toNumber() / Math.pow(2, REAL_FBITS)
  return t.shrn(REAL_FBITS).toNumber() + fraction
}

export const NULL_ADDRESS = '0x0000000000000000000000000000000000000000'

/**
 * creates a string to be plugsging into a graphql query
 * @example
 * `{  proposals ${createGraphQlQuery({ skip: 2}, 'id: "2"')}
 *    { id }
 * }`
 * @param  options [description]
 * @param  where   [description]
 * @return         [description]
 */
export function createGraphQlQuery(options: ICommonQueryOptions, where: string = '') {
  let queryString = ``

  if (!where) {
    where = createGraphQlWhereQuery(options.where)
  }
  if (where) {
    queryString += `where: {
      ${where}
    }`
  }
  if (options.first) {
    queryString += `first: ${options.first}\n`
  }
  if (options.skip) {
    queryString += `skip: ${options.skip}\n`
  }
  if (options.orderBy) {
    queryString += `orderBy: ${options.orderBy}\n`
  }
  if (options.orderDirection) {
    queryString += `orderDirection: ${options.orderDirection}\n`
  }
  if (queryString) {
    return `(${queryString})`
  } else {
    return ''
  }
}

export function createGraphQlWhereQuery(where?: { [key: string]: string | string[] | null }) {
  let result = ''
  if (!where) {
    where = {}
  }
  for (const key of Object.keys(where)) {
    if (where[key] === undefined) {
      continue
    }

    let value = where[key]
    if (key === 'dao' || key === 'address') {
      isAddress(value as string)
      value = (value as string).toLowerCase()
      result += `${key}: "${value}"\n`
    } else if (key.endsWith('_in') || key.endsWith('_not_in')) {
      value = JSON.stringify(value)
      result += `${key}: ${value}\n`
    } else if (!value) {
      result += `${key}: ${value}\n`
    } else {
      result += `${key}: "${value}"\n`
    }
  }
  return result
}

export function dateToSecondsSinceEpoch(date: Date) {
  if (!(date instanceof Date)) {
    throw Error(`Input should be a Date instance, got ${date} instead`)
  }

  return Math.floor(date.getTime() / 1000)
}

export function secondSinceEpochToDate(seconds: number): Date {
  try {
    seconds = Number(seconds)
  } catch (e) {
    throw e
    // throw Error(`argument "seconds" must be a number, got ${seconds} instead`)
  }
  const d = new Date()
  d.setTime(seconds * 1000)
  return d
}

/**
 * get the latest block time, or the current time, whichever is later
 *
 * @export
 * @param {*} web3
 * @returns
 */
export async function getBlockTime(web3: Web3Client) {
  const block = await web3.getBlock('latest')
  const blockTime = secondSinceEpochToDate(block.timestamp)
  const now = new Date()
  now.setMilliseconds(0)
  if (now < blockTime) {
    return blockTime
  } else {
    return now
  }
}
