import { first } from 'rxjs/operators'
import {
  Arc,
  DAO,
  IProposalStage,
  IProposalState,
  JoinAndQuit,
  JoinAndQuitProposal,
  Proposal
  } from '../src'
import { BN,
  // getTestScheme,
  newArc, toWei, voteToPassProposal, waitUntilTrue } from './utils'

jest.setTimeout(60000)

/**
 * Proposal test
 */
describe('JoinAndQuit', () => {
  let arc: Arc

  beforeAll(async () => {
    arc = await newArc()
  })

  it('Create a proposal, accept it, execute it', async () => {

    const accounts = await arc.web3?.listAccounts() as any[]
    arc.setAccount(accounts[9])
    // we'll get a `JoinAndQuit` contract
    const joinAndQuits = await arc
      .plugins({where: {name: 'JoinAndQuit'}}).pipe(first()).toPromise()

    const joinAndQuit = joinAndQuits[0] as JoinAndQuit
    const joinAndQuitState = await joinAndQuit.fetchState()
    const dao = new DAO(arc, joinAndQuitState.dao.id)

    const tx = await joinAndQuit.createProposal({
      fee: new BN(1000),
      descriptionHash: 'hello',
      dao: dao.id,
      proposalType: 'JoinAndQuit',
      plugin: joinAndQuitState.address
    }).send()

    if (!tx.result) { throw new Error('Create proposal yielded no results') }

    const proposal = new JoinAndQuitProposal(arc, tx.result.id)
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
