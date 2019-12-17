import { first } from 'rxjs/operators'
import {
  Arc,
  DAO,
  IProposalStage,
  IProposalState,
  // ISchemeStaticState,
  Proposal
  } from '../src'
import {
  // createAProposal,
  // getTestAddresses, ITestAddresses,
  newArc,
  toWei, voteToPassProposal, waitUntilTrue } from './utils'

jest.setTimeout(60000)

/**
 * Proposal test
 */
describe('Proposal', () => {
  let arc: Arc

  beforeAll(async () => {
    arc = await newArc()
  })

  it('Create a competition proposal, compete, win the competition..', async () => {
    // we'll get a `ContributionRewardExt` contract
    const ARC_VERSION = '0.0.1-rc.36'
    const contributionRewardExtContract  = arc.getContractInfoByName(`ContributionRewardExt`, ARC_VERSION)
    // find the corresponding scheme object
    const contributionRewardExts = await arc
      .schemes({where: {address: contributionRewardExtContract.address}}).pipe(first()).toPromise()

    const contributionRewardExt = contributionRewardExts[0]
    const contributionRewardExtState = await contributionRewardExt.state().pipe(first()).toPromise()
    const dao = new DAO(contributionRewardExtState.dao, arc)

    // @ts-ignore
    function addMinutes(date: Date, m: number) {
      date.setTime(date.getTime() + (m * 60 * 1000))
      return date
    }
    // TODO: test error handling for all these params
    // - all args are present
    // - order of times
    const tx = await dao.createProposal({
      beneficiary: '0xffcf8fdee72ac11b5c542428b35eef5769c409f0',
      dao: dao.id,
      endTime: addMinutes(new Date(), 5),
      ethReward: toWei('300'),
      externalTokenAddress: undefined,
      externalTokenReward: toWei('0'),
      nativeTokenReward: toWei('1'),
      numberOfVotesPerVoter: 3,
      proposalType: 'competition',
      reputationReward: toWei('10'),
      rewardSplit: [1, 2, 97],
      scheme: contributionRewardExtState.address,
      startTime: new Date(),
      suggestionsEndTime: addMinutes(new Date(), 1),
      value: 0,
      votingStartTime: addMinutes(new Date(), 2)
    }).send()
    const proposal = tx.result
    expect(proposal).toBeInstanceOf(Proposal)

    const states: IProposalState[] = []
    const lastState = (): IProposalState => states[states.length - 1]
    proposal.state().subscribe((pState: IProposalState) => {
      states.push(pState)
    })
    await waitUntilTrue(() => !!lastState())

    expect(lastState()).toMatchObject({
      stage: IProposalStage.Queued
    })
    expect(lastState().contributionReward).toMatchObject({
      alreadyRedeemedEthPeriods: 0,
      ethReward: toWei('300'),
      nativeTokenReward: toWei('1'),
      reputationReward: toWei('10')
    })

    // accept the proposal by voting the hell out of it
    await voteToPassProposal(proposal)

    await waitUntilTrue(() => (lastState().stage === IProposalStage.Executed))
    expect(lastState()).toMatchObject({
      stage: IProposalStage.Executed
    })
  })
})
