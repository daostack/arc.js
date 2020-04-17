import { first } from 'rxjs/operators'
import {
  Arc,
  DAO,
  IProposalStage,
  IProposalState,
  Proposal,
  ContributionRewardExt,
  ContributionRewardExtProposal
  } from '../src'
import { newArc, toWei, voteToPassProposal, waitUntilTrue } from './utils'

jest.setTimeout(60000)

/**
 * Proposal test
 */
describe('ContributionReward Ext', () => {
  let arc: Arc

  beforeAll(async () => {
    arc = await newArc()
  })

  it.skip('Create a proposal, accept it, execute it', async () => {
    // TODO: we are skipping this test, because we do not ahve at this point a contributionrewardext
    // contract in our test environment that is not a Competition scheme..

    // we'll get a `ContributionRewardExt` contract
    const contributionRewardExts = await arc
      .schemes({where: {name: "ContributionRewardExt"}}).pipe(first()).toPromise()

    const contributionRewardExt = contributionRewardExts[0] as ContributionRewardExt
    const contributionRewardExtState = await contributionRewardExt.fetchState()
    const dao = new DAO(arc, contributionRewardExtState.dao.id)

    const tx = await contributionRewardExt.createProposal({
      beneficiary: '0xffcf8fdee72ac11b5c542428b35eef5769c409f0',
      dao: dao.id,
      ethReward: toWei('300'),
      externalTokenAddress: undefined,
      externalTokenReward: toWei('0'),
      nativeTokenReward: toWei('1'),
      reputationReward: toWei('10'),
      plugin: contributionRewardExtState.address,
      proposalType: "ContributionRewardExt",
      //TODO: proposer?
      proposer: ''
    }).send()
    let proposal = new ContributionRewardExtProposal(arc, tx.result.coreState)
    expect(proposal).toBeInstanceOf(Proposal)

    const states: IProposalState[] = []
    const lastState = (): IProposalState => states[states.length - 1]
    proposal.state({}).subscribe((pState: IProposalState) => {
      states.push(pState)
    })
    await waitUntilTrue(() => !!lastState())

    expect(lastState()).toMatchObject({
      stage: IProposalStage.Queued
    })
    expect(lastState()).toMatchObject({
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
