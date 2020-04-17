import BN from 'bn.js'
import { Observable } from 'rxjs'
import { first } from 'rxjs/operators'
import { JsonRpcProvider } from 'ethers/providers'
import { utils } from 'ethers'
import {
  Arc,
  DAO,
  IProposalOutcome,
  Reputation,
  Address,
  IContractInfo,
  ContributionReward,
  ContributionRewardProposal,
  AnyProposal,
  IProposalCreateOptionsCR,
  LATEST_ARC_VERSION,
  PluginName
} from '../src'

export const graphqlHttpProvider: string = 'http://127.0.0.1:8000/subgraphs/name/daostack'
export const graphqlHttpMetaProvider: string = 'http://127.0.0.1:8000/subgraphs'
export const graphqlWsProvider: string = 'http://127.0.0.1:8001/subgraphs/name/daostack'
export const web3Provider: string = 'http://127.0.0.1:8545'
export const ipfsProvider: string = 'http://127.0.0.1:5001/api/v0'

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
  dao: {
    name: string
    Avatar: Address
    DAOToken: Address
    Reputation: Address
    Controller: Address
    Schemes: {
      name: string
      alias: string
      address: Address
    }[]
  }
  queuedProposalId: string
  preBoostedProposalId: string
  boostedProposalId: string
  executedProposalId: string
  organs: {
    DemoAvatar: Address
    DemoDAOToken: Address
    DemoReputation: Address
    ActionMock: Address
  }
}

export function getTestAddresses(version: string = LATEST_ARC_VERSION): ITestAddresses {
  return require('@daostack/test-env-experimental/daos.json').demo[version]
}

export function getTestScheme(name: PluginName): Address {
  const scheme = getTestAddresses().dao.Schemes.find(
    scheme => scheme.name === name
  )

  if (!scheme) {
    throw Error(`Test scheme is missing ${name}`)
  }

  return scheme.address
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
  const addresses = await getTestAddresses(version)
  if (!addresses.dao.Avatar) {
    const msg = `Expected to find ".test.avatar" in the migration file, found ${addresses} instead`
    throw Error(msg)
  }
  return arc.dao(addresses.dao.Avatar)
}

export async function createAProposal(
  dao?: DAO,
  options: any = {}
) {
  if (!dao) {
    dao = await getTestDAO()
  }
  options = {
    dao,
    beneficiary: '0xffcf8fdee72ac11b5c542428b35eef5769c409f0',
    ethReward: toWei('300'),
    externalTokenAddress: undefined,
    externalTokenReward: toWei('0'),
    nativeTokenReward: toWei('1'),
    periodLength: 0,
    periods: 1,
    reputationReward: toWei('10'),
    plugin: getTestScheme("ContributionReward"),
    proposalType: "ContributionReward",
    ...options
  }

  const plugin = new ContributionReward(
    dao.context, 
    getTestScheme("ContributionReward")
  )
  const response = await plugin.createProposal(options).send()
  const proposal = new ContributionRewardProposal(dao.context, response.result.coreState)
  // wait for the proposal to be indexed
  let indexed = false
  proposal.state({}).subscribe((next: any) => { if (next) { indexed = true } })
  await waitUntilTrue(() => indexed)
  return proposal
}

export async function createCRProposal(
  context: Arc,
  options: IProposalCreateOptionsCR,
  pluginId: Address = getTestScheme("ContributionReward")
) {
  const plugin = new ContributionReward(context, pluginId)
  const response = await plugin.createProposal(options).send()
  return new ContributionRewardProposal(context, response.result.coreState)
}

export async function mintSomeReputation(version: string = LATEST_ARC_VERSION) {
  const arc = await newArc()
  const addresses = getTestAddresses(version)
  const token = new Reputation(arc, addresses.organs.DemoReputation)
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
export async function voteToPassProposal(proposal: AnyProposal) {
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

export function getContractAddressesFromMigration(environment: 'private'|'rinkeby'|'mainnet'): IContractInfo[] {
  const migration = require('@daostack/migration-experimental/migration.json')[environment]
  const contracts: IContractInfo[] = []
  for (const version of Object.keys(migration.package)) {
    for (const name of Object.keys(migration.package[version])) {
      contracts.push({
        address: migration.package[version][name].toLowerCase(),
        id: migration.package[version][name],
        name,
        version
      })
    }
  }
  return contracts
}
