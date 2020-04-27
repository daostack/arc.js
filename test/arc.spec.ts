import BN = require('bn.js')
import gql from 'graphql-tag'
import { first } from 'rxjs/operators'
import Arc from '../src/index'
import { Proposal } from '../src/proposal'
import { Scheme } from '../src/scheme'
import { REDEEMER_CONTRACT_VERSIONS } from '../src/settings'
import { Address } from '../src/types'
import {
  fromWei,
  getTestAddresses,
  newArc,
  newArcWithoutEthereum,
  newArcWithoutGraphql,
  toWei,
  waitUntilTrue
} from './utils'

import { BigNumber } from 'ethers/utils'
import { Wallet } from 'ethers'
import { JsonRpcProvider } from 'ethers/providers'

jest.setTimeout(20000)

/**
 * Arc test
 */
describe('Arc ', () => {
  it('Arc is instantiable', () => {
    const arc = new Arc({
      contractInfos: [],
      graphqlHttpProvider: 'https://graphql.provider',
      graphqlWsProvider: 'https://graphql.provider',
      ipfsProvider: 'http://localhost:5001/api/v0',
      web3Provider: 'http://web3.provider'
    })
    expect(arc).toBeInstanceOf(Arc)
  })

  it('Arc is usable without subgraph connection', async () => {
    const arc = await newArcWithoutGraphql()
    expect(arc).toBeInstanceOf(Arc)

    expect(() => arc.sendQuery(gql`{daos {id}}`)).toThrowError(/no connection/i)
  })

  it('Arc is usable without knowing about contracts', async () => {
    const arc = await newArcWithoutEthereum()
    expect(arc).toBeInstanceOf(Arc)

    const daos = arc.sendQuery(gql`{daos {id}}`)
    expect(daos).toBeTruthy()
  })

  it('arc.allowances() should work', async () => {
    const arc = await newArc()

    const allowances: BN[] = []
    const spender = '0xDb56f2e9369E0D7bD191099125a3f6C370F8ed15'
    const amount = toWei(1001)
    await arc.approveForStaking(spender, amount).send()

    if (!arc.web3) throw new Error('Web3 provider not set')
    let defaultAccount = await arc.getDefaultAddress()
    
    if (!defaultAccount) {
      defaultAccount = await arc.web3.getSigner().getAddress()
    }

    arc.allowance(defaultAccount, spender).subscribe(
      (next: BN) => {
        allowances.push(next)
      }
    )
    const lastAllowance = () => allowances[allowances.length - 1]
    await waitUntilTrue(() => (allowances.length > 0))
    expect(fromWei(lastAllowance())).toEqual('1001.0')
  })

  it('arc.allowance() should work', async () => {
    const arc = await newArc()

    const allowances: BN[] = []
    const spender = '0xDb56f2e9369E0D7bD191099125a3f6C370F8ed15'
    const amount = toWei(1001)
    await arc.approveForStaking(spender, amount).send()

    if (!arc.web3) throw new Error('Web3 provider not set')
    let defaultAccount = await arc.getDefaultAddress()
    
    if (!defaultAccount) {
      defaultAccount = await arc.web3.getSigner().getAddress()
    }

    arc.allowance(defaultAccount, spender).subscribe(
      (next: BN) => {
        allowances.push(next)
      }
    )

    const lastAllowance = () => allowances[allowances.length - 1]
    await waitUntilTrue(() => (allowances.length > 0))
    expect(fromWei(lastAllowance())).toEqual('1001.0')
  })

  it('arc.getAccount() works and is correct', async () => {
    const arc = await newArc()
    const addressesObserved: Address[] = []
    arc.getAccount().subscribe((address) => addressesObserved.push(address))
    await waitUntilTrue(() => addressesObserved.length > 0)

    if (!arc.web3) throw new Error('Web3 provider not set')
    let defaultAccount = await arc.getDefaultAddress()
    
    if (!defaultAccount) {
      defaultAccount = await arc.web3.getSigner().getAddress()
    }

    expect(addressesObserved[0]).toEqual(defaultAccount)
  })

  it('arc.ethBalance() works with an account with 0 balance', async () => {
    const arc = await newArc()
    const balance = await arc.ethBalance('0x90f8bf6a479f320ead074411a4b0e7944ea81111').pipe(first()).toPromise()
    expect(balance).toEqual(new BN(0))

  })

  it('arc.ethBalance() works with multiple subscriptions', async () => {
    const arc = await newArc()
    // observe two balances
    const balances1: BN[] = []
    const balances2: BN[] = []
    const balances3: BN[] = []

    if (!arc.web3) throw new Error('Web3 provider not set')

    const address1 = await arc.web3.getSigner(1).getAddress()
    const address2 = await arc.web3.getSigner(2).getAddress()

    const subscription1 = arc.ethBalance(address1).subscribe((balance) => {
      balances1.push(balance)
    })
    const subscription2 = arc.ethBalance(address2).subscribe((balance) => {
      balances2.push(balance)
    })
    //
    // send some ether to the test accounts
    async function sendEth(address: Address, amount: BN) {

      if (!arc.web3) throw new Error('Web3 provider not set')

      await arc.web3.getSigner().sendTransaction({
        gasPrice: 100000000000,
        to: address,
        value: new BigNumber(amount.toString())
      })

    }
    const amount1 = new BN('123456')
    const amount2 = new BN('456677')
    await sendEth(address1, amount1)
    await sendEth(address2, amount2)

    await waitUntilTrue(() => balances1.length > 1)
    await waitUntilTrue(() => balances2.length > 1)

    expect(balances1.length).toEqual(2)
    expect(balances2.length).toEqual(2)
    expect(balances1[1].sub(balances1[0]).toString()).toEqual(amount1.toString())
    expect(balances2[1].sub(balances2[0]).toString()).toEqual(amount2.toString())

    // add a second subscription for address2's balance
    const subscription3 = arc.ethBalance(address2).subscribe((balance) => {
      balances3.push(balance)
    })

    await waitUntilTrue(() => balances3.length >= 1)
    expect(balances3[balances3.length - 1].toString()).toEqual(balances2[balances2.length - 1].toString())
    await subscription2.unsubscribe()
    // expect(Object.keys(arc.observedAccounts)).toEqual([address1])
    await subscription1.unsubscribe()

    // we have unsubscribed from subscription2, but we are still observing the account with subscription3
    expect(Object.keys(arc.observedAccounts).length).toEqual(1)

    const amount3 = new BN('333333')
    expect(balances3.length).toEqual(1)
    await sendEth(address2, amount3)
    await waitUntilTrue(() => balances3.length >= 2)
    expect(balances3[balances3.length - 1]).toEqual(balances3[balances3.length - 2].add(amount3))

    await subscription3.unsubscribe()
    // check if we cleanup up completely
    expect(Object.keys(arc.observedAccounts).length).toEqual(0)
  })

  it('arc.proposal() should work', async () => {
    const arc = await newArc()
    const proposal = arc.proposal(getTestAddresses().executedProposalId)
    expect(proposal).toBeInstanceOf(Proposal)
  })

  it('arc.proposals() should work', async () => {
    const arc = await newArc()
    const proposals = await arc.proposals().pipe(first()).toPromise()
    expect(typeof proposals).toEqual(typeof [])
    expect(proposals.length).toBeGreaterThanOrEqual(4)
  })

  it('arc.scheme() should work', async () => {
    const arc = await newArc()
    const schemeId = '0x124355'
    const scheme = await arc.scheme(schemeId)
    expect(scheme).toBeInstanceOf(Scheme)
  })

  it('arc.schemes() should work', async () => {
    const arc = await newArc()
    const schemes = await arc.schemes().pipe(first()).toPromise()
    expect(schemes.length).toBeGreaterThan(0)
  })

  it('arc.fetchContractInfos() should return lower case addresses', async () => {
    const arc = await newArc()
    await arc.fetchContractInfos()
    const anAddress = arc.contractInfos[2].address
    expect(anAddress).toEqual(anAddress.toLowerCase())
  })

  it('arc.getABI works', async () => {
    const arc = await newArc()
    await arc.fetchContractInfos()
    const abi = arc.getABI(undefined, 'Redeemer', REDEEMER_CONTRACT_VERSIONS[0])
    expect(abi[0].name).toEqual('redeem')
  })

  it('new Arc fails when a custom signer has no provider', async () => {
    await expect(
      newArc({
        web3Provider: new Wallet(
          '0xe485d098507f54e7733a205420dfddbe58db035fa577fc294ebd14db90767a52'
        )
      })
    ).rejects.toThrow(
      /Ethers Signer is missing a provider,/i
    )
  })

  it('arc.getContract uses the custom signer', async () => {
    const signer = new Wallet(
      '0xe485d098507f54e7733a205420dfddbe58db035fa577fc294ebd14db90767a52',
      new JsonRpcProvider('http://127.0.0.1:8545')
    )

    const arc = await newArc({
      web3Provider: signer
    })

    const avatar = arc.getContract(getTestAddresses().dao.Avatar)

    expect(await avatar.signer.getAddress())
      .toEqual(await signer.getAddress())
  })

  it('arc.getAccount works with a custom signer', async () => {
    const signer = new Wallet(
      '0xe485d098507f54e7733a205420dfddbe58db035fa577fc294ebd14db90767a52',
      new JsonRpcProvider('http://127.0.0.1:8545')
    )

    const arc = await newArc({
      web3Provider: signer
    })

    expect(await arc.getAccount().pipe(first()).toPromise())
      .toEqual(await signer.getAddress())
  })

  it('arc.setAccount fails when a custom signer is used', async () => {
    const signer = new Wallet(
      '0xe485d098507f54e7733a205420dfddbe58db035fa577fc294ebd14db90767a52',
      new JsonRpcProvider('http://127.0.0.1:8545')
    )

    const arc = await newArc({
      web3Provider: signer
    })

    const promisify = new Promise(() => {
      arc.setAccount('0xADDRESS')
    })

    await expect(promisify).rejects.toThrow(
      /The account cannot be set post-initialization when a custom Signer is being used/i
    )
  })

  it('arc.getSigner returns the custom signer', async () => {
    const signer = new Wallet(
      '0xe485d098507f54e7733a205420dfddbe58db035fa577fc294ebd14db90767a52',
      new JsonRpcProvider('http://127.0.0.1:8545')
    )

    const arc = await newArc({
      web3Provider: signer
    })

    expect(await (await arc.getSigner().pipe(first()).toPromise()).getAddress())
      .toEqual(await signer.getAddress())
  })
})
