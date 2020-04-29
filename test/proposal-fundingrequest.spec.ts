import { first } from 'rxjs/operators'
import {
  Arc,
  DAO,
  FundingRequest,
  FundingRequestProposal,
  IProposalStage,
  IProposalState,
  NULL_ADDRESS,
  Proposal
  } from '../src'
import { BN,
  // getTestScheme,
  newArc, toWei, voteToPassProposal, waitUntilTrue } from './utils'

jest.setTimeout(60000)

/**
 * Proposal test
 */
describe('FundingRequest', () => {
  let arc: Arc

  beforeAll(async () => {
    arc = await newArc()
  })

  it('Create a proposal, accept it, execute it', async () => {

    const fundingRequests = await arc
      .plugins({where: {name: 'FundingRequest'}}).pipe(first()).toPromise()

    const fundingRequest = fundingRequests[0] as FundingRequest
    const fundingRequestState = await fundingRequest.fetchState()

    expect(fundingRequestState.pluginParams).toMatchObject({
      fundingToken: NULL_ADDRESS
    })

    const dao = new DAO(arc, fundingRequestState.dao.id)

    const tx = await fundingRequest.createProposal({
      amount: new BN(1000),
      beneficiary: '0xffcf8fdee72ac11b5c542428b35eef5769c409f0',
      dao: dao.id,
      descriptionHash: 'hello',
      plugin: fundingRequestState.address
    }).send()

    if (!tx.result) { throw new Error('Create proposal yielded no results') }

    const proposal = new FundingRequestProposal(arc, tx.result.id)
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
