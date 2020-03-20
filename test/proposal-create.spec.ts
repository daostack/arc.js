import { first } from 'rxjs/operators'
import { Arc } from '../src/arc'
import { DAO } from '../src/dao'
import { IProposalStage, Proposal } from '../src/proposal'
import { IContributionReward } from '../src/schemes/contributionReward'

import {
  fromWei,
  getTestAddresses,
  getTestDAO,
  ITestAddresses,
  newArc,
  toWei,
  waitUntilTrue
} from './utils'

jest.setTimeout(20000)

describe('Create a ContributionReward proposal', () => {
  let arc: Arc
  let accounts: string[]
  let testAddresses: ITestAddresses
  let dao: DAO

  beforeAll(async () => {
    arc = await newArc()
    accounts = arc.accounts
    arc.defaultAccount = accounts[0]
    testAddresses = getTestAddresses(arc)
    dao = await getTestDAO()
  })

  it('is properly indexed', async () => {
    const options = {
      beneficiary: '0xffcf8fdee72ac11b5c542428b35eef5769c409f0',
      dao: dao.id,
      ethReward: toWei('300'),
      externalTokenAddress: undefined,
      externalTokenReward: toWei('0'),
      nativeTokenReward: toWei('1'),
      reputationReward: toWei('10'),
      scheme: testAddresses.base.ContributionReward
    }

    const response = await dao.createProposal(options).send()
    const proposal = response.result as Proposal
    let proposals: Proposal[] = []
    const proposalIsIndexed = async () => {
      // we pass no-cache to make sure we hit the server on each request
      proposals = await Proposal.search(arc, { where: {id: proposal.id}}, { fetchPolicy: 'no-cache' })
        .pipe(first()).toPromise()
      return proposals.length > 0
    }
    await waitUntilTrue(proposalIsIndexed)

    expect(proposal.id).toBeDefined()

    const proposalState = await proposal.state().pipe(first()).toPromise()

    const contributionReward = proposalState.contributionReward as IContributionReward
    expect(fromWei(contributionReward.externalTokenReward)).toEqual('0.0')
    expect(fromWei(contributionReward.ethReward)).toEqual('300.0')
    expect(fromWei(contributionReward.nativeTokenReward)).toEqual('1.0')
    expect(fromWei(contributionReward.reputationReward)).toEqual('10.0')
    expect(fromWei(proposalState.stakesAgainst)).toEqual('100.0')
    expect(fromWei(proposalState.stakesFor)).toEqual('0.0')

    if(!dao.context.web3) throw new Error('Web3 provider not set')
    const defaultAccount = dao.context.defaultAccount? dao.context.defaultAccount: await dao.context.web3.getSigner().getAddress()

    expect(proposalState).toMatchObject({
      executedAt: 0,
      proposer: defaultAccount.toLowerCase(),
      quietEndingPeriodBeganAt: 0,
      resolvedAt: 0,
      stage: IProposalStage.Queued
    })

    expect(proposalState.contributionReward).toMatchObject({
      beneficiary: options.beneficiary
    })

    expect(proposalState.dao.id).toEqual(dao.id)
  })

  it('saves title etc on ipfs', async () => {
    const options = {
      beneficiary: '0xffcf8fdee72ac11b5c542428b35eef5769c409f0',
      dao: dao.id,
      description: 'Just eat them',
      ethReward: toWei('300'),
      externalTokenAddress: undefined,
      externalTokenReward: toWei('0'),
      nativeTokenReward: toWei('1'),
      scheme: testAddresses.base.ContributionReward,
      title: 'A modest proposal',
      url: 'http://swift.org/modest'
    }

    const response = await dao.createProposal(options).send()
    const proposal = response.result as Proposal
    let proposals: Proposal[] = []
    const proposalIsIndexed = async () => {
      // we pass no-cache to make sure we hit the server on each request
      proposals = await Proposal.search(arc, {where: {id: proposal.id}}, { fetchPolicy: 'no-cache' })
        .pipe(first()).toPromise()
      return proposals.length > 0
    }
    await waitUntilTrue(proposalIsIndexed)
    const proposal2 = await dao.proposal(proposal.id)
    const proposalState = await proposal2.state().pipe(first()).toPromise()
    expect(proposalState.descriptionHash).toEqual('QmRg47CGnf8KgqTZheTejowoxt4SvfZFqi7KGzr2g163uL')

    // get the data
    // TODO - do the round trip test to see if subgraph properly indexs the fields
    // (depends on https://github.com/daostack/subgraph/issues/42)
    const savedData = await arc.ipfs.cat(proposalState.descriptionHash) // + proposalState.descriptionHash)
    expect(savedData).toEqual({
      description: options.description,
      title: options.title,
      url: options.url
    })

  })

  it('handles the fact that the ipfs url is not set elegantly', async () => {
    const arcWithoutIPFS = await newArc()
    arcWithoutIPFS.ipfsProvider = ''
    const contractAddresses = await getTestAddresses(arc)
    const anotherDAO = arcWithoutIPFS.dao(contractAddresses.dao.Avatar)
    const options = {
      beneficiary: '0xffcf8fdee72ac11b5c542428b35eef5769c409f0',
      dao: anotherDAO.id,
      description: 'Just eat them',
      ethReward: toWei('300'),
      externalTokenAddress: undefined,
      nativeTokenReward: toWei('1'),
      scheme: testAddresses.base.ContributionReward,
      title: 'A modest proposal',
      url: 'http://swift.org/modest'
    }

    await expect(anotherDAO.createProposal(options).send()).rejects.toThrowError(
      /no ipfsProvider set/i
    )
  })
})
