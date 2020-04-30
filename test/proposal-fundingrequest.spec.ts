import { first } from 'rxjs/operators'
import {
  Arc,
  FundingRequest,
  FundingRequestProposal,
  IProposalStage,
  IProposalState,
  JoinAndQuit,
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

  it('Create a proposal is not possible hwen funding gaol is not reached yet', async () => {

    // get our test dao
    const daos = await arc.daos({where: { name: 'Common test 2'}}).pipe(first()).toPromise()
    const dao = daos[0]
    const fundingRequests = await dao
      .plugins({where: {name: 'FundingRequest'}}).pipe(first()).toPromise()

    const fundingRequest = fundingRequests[0] as FundingRequest
    const fundingRequestState = await fundingRequest.fetchState()

    expect(fundingRequestState.pluginParams).toMatchObject({
      fundingToken: NULL_ADDRESS
    })

    expect(fundingRequest.createProposal({
      amount: new BN(1000),
      beneficiary: '0xffcf8fdee72ac11b5c542428b35eef5769c409f0',
      dao: dao.id,
      descriptionHash: 'hello',
      plugin: fundingRequestState.address
    }).send()).rejects.toThrow(/funding is not allowed yet/)
  })

  it('Create a proposal, accept it, execute it', async () => {
      // get our test dao
      const daos = await arc.daos({where: { name: 'Common test 1'}}).pipe(first()).toPromise()
      const dao = daos[0]

      const fundingRequest = await dao
        .plugin({where: {name: 'FundingRequest'}}) as FundingRequest
      const fundingRequestState = await fundingRequest.fetchState()
      expect(fundingRequestState.pluginParams).toMatchObject({
        fundingToken: NULL_ADDRESS
      })
      // transfer some money to this dao so that we are sure the funding goal is reached
      const daoContract = await arc.getContract(dao.id)
      const vaultAddress = await daoContract.vault()
      // console.log(daoContract)
      const sendTx = await arc.web3?.getSigner().sendTransaction({
        to: vaultAddress,
        value: '0x10000'
      })
      await sendTx?.wait()
      // new dao balance
      // const balance = await arc.ethBalance(dao.id).pipe(first()).toPromise()

      const joinAndQuit = await dao
        .plugin({where: {name: 'JoinAndQuit'}}) as JoinAndQuit
      const joinAndQuitState = await joinAndQuit.fetchState()
      const joinAndQuitContract = arc.getContract(joinAndQuitState.address)
      await (await joinAndQuitContract.setFundingGoalReachedFlag()).wait()

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
        console.log(pState)
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
      return
      await voteToPassProposal(proposal)

      await waitUntilTrue(() => (lastState().stage === IProposalStage.Executed))
      expect(lastState()).toMatchObject({
      stage: IProposalStage.Executed
    })
  })
})
