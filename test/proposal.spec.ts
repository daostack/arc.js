import { first} from 'rxjs/operators'
import { 
  Arc,
  DAO,
  IProposalOutcome,
  IProposalStage,
  IProposalState,
  Proposal, 
  ContributionRewardProposal,
  AnyProposal,
  IProposalCreateOptionsCR,
  ContributionReward
  } from '../src'

import BN from 'bn.js'
import { createAProposal,
  fromWei,
  getTestAddresses,
  getTestScheme,
  ITestAddresses,
  newArc,
  toWei,
  voteToPassProposal,
  waitUntilTrue,
  createCRProposal
} from './utils'
import { getAddress } from 'ethers/utils'

jest.setTimeout(20000)
/**
 * Proposal test
 */
describe('Proposal', () => {
  let arc: Arc
  let addresses: ITestAddresses
  let dao: DAO
  let executedProposal: ContributionRewardProposal
  let queuedProposal: ContributionRewardProposal
  let preBoostedProposal: ContributionRewardProposal

  beforeAll(async () => {
    arc = await newArc()
    addresses = await getTestAddresses()
    const { executedProposalId, queuedProposalId, preBoostedProposalId } = addresses
    dao = arc.dao(addresses.dao.Avatar.toLowerCase())
    // check if the executedProposalId indeed has the correct state
    executedProposal = new ContributionRewardProposal(arc, executedProposalId)
    await executedProposal.fetchState()
    queuedProposal = new ContributionRewardProposal(arc, queuedProposalId)
    await queuedProposal.fetchState()
    preBoostedProposal = new ContributionRewardProposal(arc, preBoostedProposalId)
    await preBoostedProposal.fetchState()
  })

  it('get list of proposals', async () => {
    const proposals = dao.proposals()
    const proposalsList = await proposals.pipe(first()).toPromise()
    expect(typeof proposalsList).toBe('object')
    expect(proposalsList.length).toBeGreaterThan(0)
    expect(proposalsList.map((p) => p.id)).toContain(queuedProposal.id)
  })

  it('paging works', async () => {
    const proposals = dao.proposals()
    const ls1 = await proposals.pipe(first()).toPromise()
    expect(ls1.length).toBeGreaterThan(3)
    const ls2 = await dao.proposals({ first: 2}).pipe(first()).toPromise()
    expect(ls2.length).toEqual(2)
    const ls3 = await dao.proposals({ first: 2, skip: 1}).pipe(first()).toPromise()
    expect(ls3.length).toEqual(2)
    expect(ls2[1]).toEqual(ls3[0])
  })

  it('sorting works', async () => {
    const ls1 = await dao.proposals({ orderBy: 'createdAt'}).pipe(first()).toPromise()
    expect(ls1.length).toBeGreaterThan(3)
    const state0 = await ls1[0].fetchState()
    const state1 = await ls1[1].fetchState()
    expect(state0.createdAt as number).toBeLessThanOrEqual(state1.createdAt as number)

    const ls2 = await dao.proposals({ orderBy: 'createdAt', orderDirection: 'desc'}).pipe(first()).toPromise()
    const state3 = await ls2[0].fetchState()
    const state2 = await ls2[1].fetchState()
    expect(state2.createdAt as number).toBeLessThanOrEqual(state3.createdAt as number)

    expect(state1.createdAt as number).toBeLessThanOrEqual(state2.createdAt as number)
  })

  it('proposal.search() accepts expiresInQueueAt argument', async () => {
    const l1 = await Proposal.search(arc, { where: {expiresInQueueAt_gt: 0}}).pipe(first()).toPromise()
    expect(l1.length).toBeGreaterThan(0)

    const expiryDate = (await l1[0].fetchState()).expiresInQueueAt
    const l2 = await Proposal.search(arc, { where: {expiresInQueueAt_gt: expiryDate}}).pipe(first()).toPromise()
    expect(l2.length).toBeLessThan(l1.length)
  })

  it('proposal.search() accepts scheme argument', async () => {
    const state = await queuedProposal.fetchState()
    const l1 = await Proposal.search(arc, { where: { scheme: state.plugin.id}}).pipe(first()).toPromise()
    expect(l1.length).toBeGreaterThan(0)
  })

  it('proposal.search() accepts type argument', async () => {
    let ls: AnyProposal[]
    ls = await Proposal.search(arc, { where: {type: "ContributionReward"}}).pipe(first()).toPromise()
    expect(ls.length).toBeGreaterThan(0)
  })

  it('proposal.search ignores case in address', async () => {
    const proposalState = await queuedProposal.fetchState()
    const proposer = proposalState.proposer
    let result: AnyProposal[]

    result = await Proposal.search(arc, { where: {proposer, id: queuedProposal.id}}).pipe(first()).toPromise()
    expect(result.length).toEqual(1)

    result = await Proposal.search(arc, { where: {proposer: proposer.toUpperCase(), id: queuedProposal.id}})
      .pipe(first()).toPromise()
    expect(result.length).toEqual(1)

    result = await Proposal
      .search(arc, { where: {proposer: getAddress(proposer), id: queuedProposal.id}})
      .pipe(first()).toPromise()
    expect(result.length).toEqual(1)

    result = await Proposal
      .search(arc, {where: {dao: getAddress(proposalState.dao.id), id: queuedProposal.id}})
      .pipe(first()).toPromise()
    expect(result.length).toEqual(1)
  })

  it('dao.proposals() accepts different query arguments', async () => {
    const proposals = await dao.proposals({ where: { stage: IProposalStage.Queued}}).pipe(first()).toPromise()
    expect(typeof proposals).toEqual(typeof [])
    expect(proposals.length).toBeGreaterThan(0)
    // expect(proposals.map((p: Proposal) => p.id)).toContain(queuedProposalId)
    // expect(proposals.map((p: Proposal) => p.id)).(executedProposalId)
  })

  it('get list of redeemable proposals for a user', async () => {
    // check if the executedProposalId indeed has the correct state
    const searched = await Proposal.search(arc, { where: { id: executedProposal.id} }).pipe(first()).toPromise()
    const proposal = searched[0]
    const proposalState = await proposal.fetchState()
    expect(proposalState.accountsWithUnclaimedRewards.length).toEqual(4)
    const someAccount = proposalState.accountsWithUnclaimedRewards[1]
    // query for redeemable proposals
    const proposals = await dao.proposals({ where: {accountsWithUnclaimedRewards_contains: [someAccount]}})
      .pipe(first()).toPromise()
    expect(proposals.length).toBeGreaterThan(0)

    const shouldBeJustThisExecutedProposal = await dao.proposals({ where: {
      accountsWithUnclaimedRewards_contains: [someAccount],
      id: proposal.id
    }}).pipe(first()).toPromise()

    expect(shouldBeJustThisExecutedProposal.map((p: AnyProposal) => p.id)).toEqual([proposal.id])
  })

  it('state should be available before the data is indexed', async () => {
    const options: IProposalCreateOptionsCR = {
      dao: dao.id,
      beneficiary: '0xffcf8fdee72ac11b5c542428b35eef5769c409f0',
      ethReward: toWei('300'),
      externalTokenAddress: undefined,
      externalTokenReward: toWei('0'),
      nativeTokenReward: toWei('1'),
      periodLength: 0,
      periods: 1,
      reputationReward: toWei('10'),
      plugin: getTestScheme("ContributionReward"),
      proposalType: "ContributionReward"
    }

    const proposal = await createCRProposal(arc, options)

    // the state is null because the proposal has not been indexed yet
    // TODO: so is this test supposed to fail?
    await expect(proposal.fetchState()).rejects.toThrow(
      /Fetch state returned null. Entity not indexed yet or does not exist with this id/i
    )
  })

  it('Check queued proposal state is correct', async () => {

    const proposal = preBoostedProposal
    const pState = await proposal.fetchState()
    const plugin = pState.plugin.entity as ContributionReward
    expect(proposal).toBeInstanceOf(Proposal)

    expect(fromWei(pState.nativeTokenReward)).toEqual('10.0')
    expect(fromWei(pState.stakesAgainst)).toEqual('100.0')
    expect(fromWei(pState.stakesFor)).toEqual('1000.0')
    expect(fromWei(pState.reputationReward)).toEqual('10.0')
    expect(fromWei(pState.ethReward)).toEqual('10.0')
    expect(fromWei(pState.externalTokenReward)).toEqual('10.0')
    expect(fromWei(pState.votesFor)).toEqual('0.0')
    expect(fromWei(pState.votesAgainst)).toEqual('0.0')


    //TODO: This comparison one makes the heap run out of memory, probably because of entityRef stringifying
    
    // expect(pState).toMatchObject({
    //     boostedAt: 0,
    //     description: '',
    //     descriptionHash: '0x000000000000000000000000000000000000000000000000000000000000efgh',
    //     // downStakeNeededToQueue: new BN(0),
    //     executedAt: 0,
    //     executionState: IExecutionState.None,
    //     genesisProtocolParams: {
    //       activationTime: 0,
    //       boostedVotePeriodLimit: 600,
    //       daoBountyConst: 10,
    //       limitExponentValue: 172,
    //       minimumDaoBounty: new BN('100000000000000000000'),
    //       preBoostedVotePeriodLimit: 600,
    //       proposingRepReward: new BN('5000000000000000000'),
    //       queuedVotePeriodLimit: 1800,
    //       queuedVoteRequiredPercentage: 50,
    //       quietEndingPeriod: 300,
    //       thresholdConst: 2,
    //       votersReputationLossRatio: 1
    //     },
    //     proposer: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1',
    //     quietEndingPeriodBeganAt: 0,
    //     resolvedAt: 0,
    //     // stage: IProposalStage.Queued,
    //     title: '',
    //     url: '',
    //     winningOutcome: IProposalOutcome.Fail
    // })

    expect(pState).toMatchObject({
        beneficiary: '0xffcf8fdee72ac11b5c542428b35eef5769c409f0',
        periodLength: 0,
        periods: 1
    })
    expect(pState.plugin.entity.coreState).toMatchObject({
        canDelegateCall: false,
        canManageGlobalConstraints: false,
        canRegisterPlugins: false,
        dao: dao.id,
        name: 'ContributionReward'
    })

    if(!plugin.coreState) throw new Error("Plugin coreState is not defined")

    expect(plugin.coreState.pluginParams).toBeTruthy()

    if(!pState.queue.entity.coreState) throw new Error("Queue coreState is not defined")

    expect(pState.queue.entity.coreState.threshold).toBeGreaterThan(0)
    // check if the upstakeNeededToPreBoost value is correct
    //  (S+/S-) > AlphaConstant^NumberOfBoostedProposal.
    const boostedProposals = await pState.dao.entity
      .proposals({ where: {stage: IProposalStage.Boosted}}).pipe(first()).toPromise()
    const numberOfBoostedProposals = boostedProposals.length
    expect(pState.queue.entity.coreState.threshold.toString())
      .toEqual(Math.pow(pState.genesisProtocolParams.thresholdConst, numberOfBoostedProposals).toString())

    // expect(pState.stakesFor.add(pState.upstakeNeededToPreBoost).div(pState.stakesAgainst).toString())
    //   .toEqual(Math.pow(pState.genesisProtocolParams.thresholdConst, numberOfBoostedProposals).toString())
  })

  it('Check preboosted proposal state is correct', async () => {
    const proposal = preBoostedProposal
    const pState = await proposal.fetchState()
    expect(proposal).toBeInstanceOf(Proposal)

    expect(pState.upstakeNeededToPreBoost).toEqual(new BN(0))
    // check if the upstakeNeededToPreBoost value is correct
    //  (S+/S-) > AlphaConstant^NumberOfBoostedProposal.
    const boostedProposals = await pState.dao.entity
      .proposals({ where: {stage: IProposalStage.Boosted}}).pipe(first()).toPromise()
    const numberOfBoostedProposals = boostedProposals.length

    expect(pState.stakesFor.div(pState.stakesAgainst.add(pState.downStakeNeededToQueue)).toString())
      .toEqual(Math.pow(pState.genesisProtocolParams.thresholdConst, numberOfBoostedProposals).toString())
  })

  it('get proposal rewards', async () => {
    const proposal = queuedProposal
    const rewards = await proposal.rewards().pipe(first()).toPromise()
    expect(rewards.length).toBeGreaterThanOrEqual(0)
  })

  it('get proposal stakes', async () => {
    const proposal = await createAProposal()
    const stakes: any[] = []
    proposal.stakes().subscribe((next) => stakes.push(next))

    const stakeAmount = toWei('18')

    if(!arc.web3) throw new Error('Web3 provider not set')
    const defaultAccount = arc.defaultAccount? arc.defaultAccount : await arc.web3.getSigner().getAddress()

    await proposal.stakingToken().mint(defaultAccount, stakeAmount).send()
    const votingMachine = await proposal.votingMachine()
    await arc.approveForStaking(votingMachine.address, stakeAmount).send()
    await proposal.stake(IProposalOutcome.Pass, stakeAmount).send()

    // wait until we have the we received the stake update
    await waitUntilTrue(() => stakes.length > 0 && stakes[stakes.length - 1].length > 0)
    expect(stakes[0].length).toEqual(0)
    expect(stakes[stakes.length - 1].length).toEqual(1)
  })

  it('get proposal votes', async () => {
    const proposal = await createAProposal()
    // vote with several accounts
    await voteToPassProposal(proposal)
    await new Promise((resolve) => setTimeout(() => resolve(), 1000))
    const votes = await proposal.votes({}, { fetchPolicy: 'no-cache'}).pipe(first()).toPromise()
    expect(votes.length).toBeGreaterThanOrEqual(1)
    // @ts-ignore
    const someAccount = votes[0].coreState.voter
    const votesForAccount = await proposal.votes({where: {voter: someAccount}}, { fetchPolicy: 'no-cache'})
      .pipe(first()).toPromise()
    expect(votesForAccount.length).toEqual(1)
  })

  it('state gets all updates', async () => {
    // TODO: write this test!
    const states: IProposalState[] = []
    const proposal = await createAProposal()
    proposal.state({}).subscribe(
      (state: any) => {
        states.push(state)
      },
      (err: any) => {
        throw err
      }
    )
    // wait for the proposal to be indexed
    await waitUntilTrue(() => states.length > 0)
    // vote for the proposal
    await proposal.vote(IProposalOutcome.Pass).pipe(first()).toPromise()

    // wait until all transactions are indexed
    await waitUntilTrue(() => {
      if (states.length > 1 && states[states.length - 1].votesFor.gt(new BN(0))) {
        return true
      } else {
        return false
      }
    })

    expect(Number(fromWei(states[states.length - 1].votesFor))).toBeGreaterThan(0)
    expect(states[states.length - 1].winningOutcome).toEqual(IProposalOutcome.Pass)
  })
})
