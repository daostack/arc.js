import { first } from 'rxjs/operators'
import {
  Arc,
  DAO,
  IJoinAndQuitProposalState,
  IProposalStage,
  JoinAndQuit,
  JoinAndQuitProposal,
  NULL_ADDRESS,
  Proposal,
  TokenTrade,
  IProposalCreateOptionsTokenTrade,
  ITokenTradeProposalState,
  TokenTradeProposal,
  } from '../src'
import {
  BN,
  newArc,
  voteToPassProposal,
  waitUntilTrue
 } from './utils'

jest.setTimeout(60000)

const SEND_TOKEN_ADDRESS = '0x6B175474E89094C44Da98b954EedeAC495271d0F' //DAI

/**
 * Proposal test
 */
describe('JoinAndQuit', () => {
  let arc: Arc

  beforeAll(async () => {
    arc = await newArc()
  })

  it('Create a proposal and check if it is indexed correctly', async () => {

    const tokenTradePlugin = (await arc
    .plugins({where: {name: 'TokenTrade'}}).pipe(first()).toPromise())[0] as TokenTrade

    const tokenTradePluginState = await tokenTradePlugin.fetchState()

    const dao = new DAO(arc, tokenTradePluginState.dao.id)
    const daoState = await dao.fetchState()

    const options: IProposalCreateOptionsTokenTrade = {
      dao: dao.id,
      descriptionHash: '',
      sendToken: SEND_TOKEN_ADDRESS,
      sendTokenAmount: new BN(100),
      receiveToken: daoState.token.id,
      receiveTokenAmount: new BN(50)
    }

    const tx = await tokenTradePlugin.createProposal(options).send()

    if (!tx.result) { throw new Error('Create proposal yielded no results') }

    const proposal = new TokenTradeProposal(arc, tx.result.id)
    expect(proposal).toBeInstanceOf(Proposal)

    const states: ITokenTradeProposalState[] = []
    const lastState = (): ITokenTradeProposalState => states[states.length - 1]
    proposal.state({}).subscribe((pState: ITokenTradeProposalState) => {
      states.push(pState)
    })
    await waitUntilTrue(() => !!lastState())

    expect(lastState()).toMatchObject({
      stage: IProposalStage.Queued,
      executed: false,
    })

    await voteToPassProposal(proposal)

    await waitUntilTrue(async () => {
      const proposalState  = await proposal.fetchState({fetchPolicy: 'no-cache'}, true)
      states.push(proposalState)
      return proposalState.stage === IProposalStage.Executed
    })

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
