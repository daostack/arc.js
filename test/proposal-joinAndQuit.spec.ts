import { first } from 'rxjs/operators'
import {
  Arc,
  DAO,
  IJoinAndQuitProposalState,
  IProposalStage,
  JoinAndQuit,
  JoinAndQuitProposal,
  NULL_ADDRESS,
  Proposal
  } from '../src'
import {
  BN,
  newArc,
  voteToPassProposal,
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

    const joinAndQuits = await arc
      .plugins({where: {name: 'JoinAndQuit'}}).pipe(first()).toPromise()

    const joinAndQuit = joinAndQuits[0] as JoinAndQuit
    const joinAndQuitState = await joinAndQuit.fetchState()

    expect(joinAndQuitState.pluginParams).toMatchObject({
      fundingToken: NULL_ADDRESS,
      fundingGoal: new BN(1000),
      minFeeToJoin: new BN(100),
      memberReputation: new BN(1000)
    })
    expect(Object.prototype.toString.call(joinAndQuitState.pluginParams.fundingGoalDeadline)).toBe('[object Date]')

    const dao = new DAO(arc, joinAndQuitState.dao.id)
    const daoState = await dao.fetchState()

    const fee = new BN(1000)
    const descriptionHash = 'hello'
    const proposedMember = accounts[daoState.memberCount + 2].toLowerCase()
    arc.setAccount(proposedMember)

    let tx
    try {
      tx = await joinAndQuit.createProposal({
        fee,
        descriptionHash,
        dao: dao.id,
        plugin: joinAndQuitState.address
      }).send()
    } catch (err) {
      if (err.message.match(/already a member/) || err.message.match(/already a candidate/)) {
        throw Error(`This test is failing because is either already a member, or has a member request pending - please restart your docker container`)
      }
      throw err
    }
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
      proposedMember,
      funding: fee,
      executed: false,
      reputationMinted: new BN(0)
    })

    // accept the proposal by voting the hell out of it
    await voteToPassProposal(proposal)

    await waitUntilTrue(() => (lastState().stage === IProposalStage.Executed))
    expect(lastState()).toMatchObject({
      stage: IProposalStage.Executed
    })

    const memberCount = (await dao.fetchState({}, true)).memberCount
    // now we can redeem the proposal
    await proposal.redeem().send()

    // member.state().subscribe((state) => {
    //   memberState = state
    // })
    await waitUntilTrue(async () => {
      return (await dao.fetchState({}, true)).memberCount > memberCount
    })
    const member = await dao.member(proposedMember)
    const memberState = await member.fetchState({ fetchPolicy: 'cache-only'}, true)
    expect(memberState.reputation).toEqual(new BN(1000))

  })
})
