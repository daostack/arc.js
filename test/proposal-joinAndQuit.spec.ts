import { first } from 'rxjs/operators'
import {
  Arc,
  DAO,
  IJoinAndQuitProposalState,
  IProposalStage,
  JoinAndQuit,
  JoinAndQuitProposal,
  Proposal
  } from '../src'
import {
  BN,
  newArc,
  waitUntilTrue
 } from './utils'

jest.setTimeout(60000)

/**
 * Proposal test
 */
describe('JoinAndQuit', () => {
  let arc: Arc

  beforeAll(async () => {
    arc = await newArc()
  })

  it('Create a proposal and check if it is indexed correctly', async () => {

    const accounts = await arc.web3?.listAccounts() as any[]
    const proposedMember = accounts[9]
    arc.setAccount(proposedMember)

    const joinAndQuits = await arc
      .plugins({where: {name: 'JoinAndQuit'}}).pipe(first()).toPromise()

    const joinAndQuit = joinAndQuits[0] as JoinAndQuit
    const joinAndQuitState = await joinAndQuit.fetchState()

    expect(joinAndQuitState.pluginParams).toMatchObject({
      fundingGoal: new BN('330000000000000000000000000000000000000000'),
      minFeeToJoin: new BN(100),
      memberReputation: new BN(100)

    })
    expect(Object.prototype.toString.call(joinAndQuitState.pluginParams.fundingGoalDeadline)).toBe('[object Date]')

    const dao = new DAO(arc, joinAndQuitState.dao.id)

    // const contract = arc.getContract(joinAndQuitState.address)
    const fee = new BN(1000)
    const descriptionHash = 'hello'

    const tx = await joinAndQuit.createProposal({
      fee,
      descriptionHash,
      dao: dao.id,
      plugin: joinAndQuitState.address
    }).send()

    if (!tx.result) { throw new Error('Create proposal yielded no results') }

    const proposal = new JoinAndQuitProposal(arc, tx.result.id)
    expect(proposal).toBeInstanceOf(Proposal)

    const states: IJoinAndQuitProposalState[] = []
    const lastState = (): IJoinAndQuitProposalState => states[states.length - 1]
    proposal.state({}).subscribe((pState: IJoinAndQuitProposalState) => {
      states.push(pState)
    })
    await waitUntilTrue(() => !!lastState())

    expect(lastState()).toMatchObject({
      stage: IProposalStage.Queued,
      proposedMember: proposedMember.toLowerCase(),
      funding: fee,
      executed: false,
      reputationMinted: new BN(0)
    })

    // accept the proposal by voting the hell out of it
    // await voteToPassProposal(proposal)

    // await waitUntilTrue(() => (lastState().stage === IProposalStage.Executed))
    // expect(lastState()).toMatchObject({
    //   stage: IProposalStage.Executed
    // })
  })
})
