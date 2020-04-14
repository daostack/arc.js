import BN = require('bn.js')
import { Observable } from 'rxjs'
import { first } from 'rxjs/operators'
import { IContractInfo, Proposal, ContributionReward, IProposalState, ContributionRewardProposal } from '../src'
import { Arc } from '../src/arc'
import { DAO } from '../src/dao'
import { IProposalOutcome } from '../src'
import { Reputation } from '../src/reputation'
import { Address } from '../src/types'
import { JsonRpcProvider } from 'ethers/providers'
import { utils } from 'ethers'

const path = require('path')

export const graphqlHttpProvider: string = 'http://127.0.0.1:8000/subgraphs/name/daostack'
export const graphqlHttpMetaProvider: string = 'http://127.0.0.1:8000/subgraphs'
export const graphqlWsProvider: string = 'http://127.0.0.1:8001/subgraphs/name/daostack'
export const web3Provider: string = 'http://127.0.0.1:8545'
export const ipfsProvider: string = 'http://127.0.0.1:5001/api/v0'

export const LATEST_ARC_VERSION = '0.0.1-rc.32'

export { BN }

export function padZeros(str: string, max = 36): string {
  str = str.toString()
  return str.length < max ? padZeros('0' + str, max) : str
}

export function fromWei(amount: BN): string {
  const etherAmount = utils.formatEther(amount.toString())
  return etherAmount.toString()
}

export function toWei(amount: string | number): BN {
  const weiAmount = utils.parseEther(amount.toString())
  return new BN(weiAmount.toString())
}

export interface ITestAddresses {
  base: { [key: string]: Address },
  dao: { [key: string]: Address },
  test: {
    organs: { [key: string]: Address },
    Avatar: Address,
    boostedProposalId: Address,
    executedProposalId: Address,
    queuedProposalId: Address,
    preBoostedProposalId: Address,
    [key: string]: Address | { [key: string]: Address }
  }
}

export function getTestAddresses(arc: Arc, version: string = LATEST_ARC_VERSION): ITestAddresses {
  // const contractInfos = arc.contractInfos
  const migrationFile = path.resolve(`${require.resolve('@daostack/migration')}/../migration.json`)
  const migration = require(migrationFile).private
  let UGenericScheme: string = ''
  try {
    UGenericScheme = arc.getContractInfoByName('GenericScheme', version).address
  } catch (err) {
    if (err.message.match(/no contract/i)) {
      // pass
    } else {
      throw err
    }
  }

  const addresses = {
    base: {
      ContributionReward: arc.getContractInfoByName('ContributionReward', version).address,
      GEN: arc.GENToken().address,
      GenericScheme: arc.getContractInfoByName('GenericScheme', version).address,
      SchemeRegistrar: arc.getContractInfoByName('SchemeRegistrar', version).address,
      UGenericScheme
    },
    dao: migration.dao[version],
    test: migration.test[version]
  }
  return addresses

}
export async function getOptions(web3: JsonRpcProvider) {
  const block = await web3.getBlock('latest')
  return {
    from: await web3.getSigner().getAddress(),
    gas: block.gasUsed.toNumber() - 100000
  }
}

export async function newArc(options: { [key: string]: any } = {}): Promise<Arc> {
  const defaultOptions = {
    graphqlHttpProvider,
    graphqlWsProvider,
    ipfsProvider,
    web3Provider
  }
  const arc = new Arc(Object.assign(defaultOptions, options))
  // get the contract addresses from the subgraph
  await arc.fetchContractInfos()
  return arc
}

/**
 * Arc without a valid ethereum connection
 * @return [description]
 */
export async function newArcWithoutEthereum(): Promise<Arc> {
  const arc = new Arc({
    graphqlHttpProvider,
    graphqlWsProvider
  })
  return arc
}

/**
 * Arc instance without a working graphql connection
 * @return [description]
 */

export async function newArcWithoutGraphql(): Promise<Arc> {
  const arc = new Arc({
    ipfsProvider,
    web3Provider
  })
  const normalArc = await newArc()
  arc.setContractInfos(normalArc.contractInfos)
  return arc
}

export async function getTestDAO(arc?: Arc, version: string = LATEST_ARC_VERSION) {
  if (!arc) {
    arc = await newArc()
  }
  const addresses = await getTestAddresses(arc, version)
  if (!addresses.test.Avatar) {
    const msg = `Expected to find ".test.avatar" in the migration file, found ${addresses} instead`
    throw Error(msg)
  }
  return arc.dao(addresses.test.Avatar)
}

export async function createAProposal(
  dao?: DAO,
  options: any = {}
) {
  if (!dao) {
    dao = await getTestDAO()
  }
  options = {
    beneficiary: '0xffcf8fdee72ac11b5c542428b35eef5769c409f0',
    ethReward: toWei('300'),
    externalTokenAddress: undefined,
    externalTokenReward: toWei('0'),
    nativeTokenReward: toWei('1'),
    periodLength: 0,
    periods: 1,
    reputationReward: toWei('10'),
    scheme: getTestAddresses(dao.context).base.ContributionReward,
    ...options
  }

  const plugin = new ContributionReward(
    dao.context, 
    getTestAddresses(dao.context).base.ContributionReward
  )
  const response = await plugin.createProposal(options).send()
  const proposal = new ContributionRewardProposal(dao.context, response.result.coreState)
  // wait for the proposal to be indexed
  let indexed = false
  proposal.state({}).subscribe((next: any) => { if (next) { indexed = true } })
  await waitUntilTrue(() => indexed)
  return proposal
}

export async function mintSomeReputation(version: string = LATEST_ARC_VERSION) {
  const arc = await newArc()
  const addresses = getTestAddresses(arc, version)
  const token = new Reputation(arc, addresses.test.organs.DemoReputation)
  if (!arc.web3) throw new Error('Web3 provider not set')
  const accounts = await arc.web3.listAccounts()
  await token.mint(accounts[1], new BN('99')).send()
}

export function mineANewBlock() {
  return mintSomeReputation()
}

export async function waitUntilTrue(test: () => Promise<boolean> | boolean) {
  return new Promise((resolve) => {
    (async function waitForIt(): Promise<void> {
      if (await test()) { return resolve() }
      setTimeout(waitForIt, 100)
    })()
  })
}

// Vote and vote and vote for proposal until it is accepted
export async function voteToPassProposal(proposal: Proposal<IProposalState>) {
  const arc = proposal.context
  if (!arc.web3) throw new Error('Web3 provider not set')
  const accounts = await arc.web3.listAccounts()
  // make sure the proposal is indexed
  await waitUntilTrue(async () => {
    const state = await proposal.state({ fetchPolicy: 'network-only' }).pipe(first()).toPromise()
    return !!state
  })

  for (let i = 0; i <= 3; i++) {
    try {
      arc.setAccount(accounts[i])
      await proposal.vote(IProposalOutcome.Pass).send()
    } catch (err) {
      return
    } finally {
      arc.setAccount(accounts[0])
    }
  }
  return
}

const web3 = new JsonRpcProvider('http://127.0.0.1:8545')

export const advanceTime = async (time: number) => await web3.send('evm_increaseTime', [time])

export const advanceBlock = async () => {
  await web3.send('evm_mine', [])
  return (await web3.getBlock('latest')).hash
}

export const takeSnapshot = async () => await web3.send('evm_snapshot', [])

export const revertToSnapShot = async (id: string) => await web3.send('evm_revert', [id])

export const advanceTimeAndBlock = async (time: number) => {
  await advanceTime(time)
  await advanceBlock()
  return Promise.resolve(web3.getBlock('latest'))
}

export async function firstResult(observable: Observable<any>) {
  return observable.pipe(first()).toPromise()
}

export function getContractAddressesFromMigration(environment: 'private' | 'rinkeby' | 'mainnet'): IContractInfo[] {
  const migration = require('@daostack/migration/migration.json')[environment]
  const contracts: IContractInfo[] = []
  for (const version of Object.keys(migration.base)) {
    for (const name of Object.keys(migration.base[version])) {
      contracts.push({
        address: migration.base[version][name].toLowerCase(),
        id: migration.base[version][name],
        name,
        version
      })
    }
  }
  return contracts
}
