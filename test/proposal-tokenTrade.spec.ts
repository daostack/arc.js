import { first } from 'rxjs/operators'
import BN from 'bn.js'
import {
  Arc,
  DAO,
  IProposalStage,
  Proposal,
  TokenTrade,
  IProposalCreateOptionsTokenTrade,
  ITokenTradeProposalState,
  TokenTradeProposal,
  fromWei,
  Token,
  } from '../src'
import {
  newArc,
  voteToPassProposal,
  waitUntilTrue,
 } from './utils'

jest.setTimeout(60000)

/**
 * Proposal test
 */
describe('TokenTrade', () => {
  let arc: Arc

  beforeAll(async () => {
    arc = await newArc()
  })

  it('Create a proposal and trade tokens between user and DAO', async () => {

    // Verify user has 150 'DutchX Tokens' to trade with

    const dutchX = (await DAO.search(arc, { where: { name: 'DutchX DAO'}}).pipe(first()).toPromise())[0]
    const dutchXToken = (await Token.search(arc, { where: { dao: dutchX.id}}).pipe(first()).toPromise())[0]
    
    const tokenTradePlugin = (await arc
      .plugins({where: {name: 'TokenTrade'}}).pipe(first()).toPromise())[0] as TokenTrade
    const tokenTradePluginState = await tokenTradePlugin.fetchState()
    const testDao = new DAO(arc, tokenTradePluginState.dao.id)

    const genToken =  arc.GENToken().contract()
    await genToken.mint(testDao.id, 1000000)

    const userAddress = await (await arc.getSigner().pipe(first()).toPromise()).getAddress()
    const newUserBalance = new BN(fromWei(await dutchXToken.balanceOf(userAddress).pipe(first()).toPromise()))
    expect(newUserBalance.gte(new BN(150)))

    const firstUserTestTokensBalance = new BN(fromWei(await genToken.balanceOf(userAddress)))
    const firstDaoDutchXTokensBalance = new BN(fromWei(await dutchXToken.balanceOf(testDao.id).pipe(first()).toPromise()))

    console.log(firstUserTestTokensBalance.toString())
    console.log(firstDaoDutchXTokensBalance.toString())
    // Propose exchanging 150 'DutchX Tokens' for 50 'GEN Tokens'
    await dutchXToken.approveForStaking(tokenTradePluginState.address, new BN(250)).send()

    const options: IProposalCreateOptionsTokenTrade = {
      dao: testDao.id,
      descriptionHash: '',
      sendTokenAddress: dutchXToken.address,
      sendTokenAmount: 150,
      receiveTokenAddress: genToken.address,
      receiveTokenAmount: 50
    }

    console.log("Creating proposal")

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

    // now we can redeem the proposal, which should make the user have 50 additional GEN tokens and
    // make the Test DAO have 150 additional DutchX Tokens

    await proposal.redeem().send()
    await waitUntilTrue(async () => {
      const secondUserTestTokensBalance = new BN(fromWei(await genToken.balanceOf(userAddress)))
      const secondDaoDutchXTokens = new BN(fromWei(await dutchXToken.balanceOf(testDao.id).pipe(first()).toPromise()))

      const expectedUserBalance = firstUserTestTokensBalance.add(new BN(50))
      const expectedDaoBalance = firstDaoDutchXTokensBalance.add(new BN(150))

      return (
        secondUserTestTokensBalance.eq(expectedUserBalance) &&
        secondDaoDutchXTokens.eq(expectedDaoBalance)
      )
    })

  })
})
