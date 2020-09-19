import { first } from 'rxjs/operators'
import {
  Arc,
  DAO,
  IJoinProposalState,
  IProposalStage,
  Join,
  JoinProposal,
  NULL_ADDRESS,
  Proposal,
  } from '../src'
import {
  BigNumber,
  newArc,
  voteToPassProposal,
  waitUntilTrue
 } from './utils'

jest.setTimeout(60000)

/**
 * Proposal test
 */
describe('Join', () => {
  let arc: Arc

  beforeAll(async () => {
    arc = await newArc()
  })

  it('Create a proposal and check if it is indexed correctly', async () => {

    const accounts = await arc.web3?.listAccounts() as any[]

    const joins = await arc
      .plugins({where: {name: 'Join'}}).pipe(first()).toPromise()

    const join = joins[0] as Join
    const joinState = await join.fetchState()

    expect(joinState.pluginParams).toMatchObject({
      fundingToken: NULL_ADDRESS,
      fundingGoal: BigNumber.from(1000),
      minFeeToJoin: BigNumber.from(100),
      memberReputation: BigNumber.from(1000)
    })
    expect(Object.prototype.toString.call(joinState.pluginParams.fundingGoalDeadline)).toBe('[object Date]')

    const dao = new DAO(arc, joinState.dao.id)
    const daoState = await dao.fetchState()

    const fee = BigNumber.from(1000)
    const descriptionHash = 'hello'
    const proposedMember = accounts[daoState.memberCount].toLowerCase()
    arc.setAccount(proposedMember)

    let tx
    try {
      tx = await join.createProposal({
        fee,
        descriptionHash,
        dao: dao.id,
        plugin: joinState.address
      }).send()
    } catch (err) {
      if (err.message.match(/already a member/) || err.message.match(/already a candidate/)) {
        throw Error(`This test is failing because is either already a member, or has a member request pending - please restart your docker container`)
      }
      throw err
    }
    if (!tx.result) { throw new Error('Create proposal yielded no results') }

    const proposal = new JoinProposal(arc, tx.result.id)
    expect(proposal).toBeInstanceOf(Proposal)

    const states: IJoinProposalState[] = []
    const lastState = (): IJoinProposalState => states[states.length - 1]
    proposal.state({}).subscribe((pState: IJoinProposalState) => {
      states.push(pState)
    })
    await waitUntilTrue(() => !!lastState())

    expect(lastState()).toMatchObject({
      stage: IProposalStage.Queued,
      proposedMember,
      funding: fee,
      executed: false,
      reputationMinted: BigNumber.from(0)
    })

    await voteToPassProposal(proposal)

    await waitUntilTrue(async () => {
      // for some reason that I cannot fathom, amountRedeemed is not updated from the subscripton
      // so we fetch the state
      const proposalState  = await proposal.fetchState({fetchPolicy: 'no-cache'}, true)
      states.push(proposalState)
      return proposalState.stage === IProposalStage.Executed
    })

    // await waitUntilTrue(() => (lastState().stage === IProposalStage.Executed))
    expect(lastState()).toMatchObject({
      stage: IProposalStage.Executed
    })

    const memberCount = (await dao.fetchState({}, true)).memberCount
    // now we can redeem the proposal, which should make the proposed member a member
    await proposal.redeem().send()
    await waitUntilTrue(async () => {
      const state = await dao.fetchState({fetchPolicy: 'no-cache'}, true)
      return state.memberCount > memberCount
    })

  })
})
