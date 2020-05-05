import { first } from 'rxjs/operators'
import {
  Arc,
  FundingRequest,
  FundingRequestProposal,
  IFundingRequestProposalState,
  IProposalStage,
  JoinAndQuit,
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
      if (!arc.web3) { throw new Error('Web3 provider not set') }

      const daos = await arc.daos({where: { name: 'Common test 1'}}).pipe(first()).toPromise()
      const dao = daos[0]

      const daoAddress = dao.id
      console.log(`sending to ${daoAddress}`)
      const sendTx2 = await arc.web3.getSigner().sendTransaction({
        to: daoAddress,
        value: '0x10000000000000'
      })
      const response = await sendTx2.wait()
      console.log(response)
       // new dao balance
      const balance2 = await arc.ethBalance(daoAddress).pipe(first()).toPromise()
      console.log(await arc.web3.getBalance(daoAddress))
      console.log(balance2.toString())

      const fundingRequest = await dao
        .plugin({where: {name: 'FundingRequest'}}) as FundingRequest
      const fundingRequestState = await fundingRequest.fetchState()
      expect(fundingRequestState.pluginParams).toMatchObject({
        fundingToken: NULL_ADDRESS
      })
      console.log(fundingRequestState)
      // transfer some money to this dao so that we are sure the funding goal is reached
      const daoContract = await arc.getContract(dao.id)
      const vaultAddress = await daoContract.vault()
      // const daoAddress = dao.id
      const sendTx = await arc.web3.getSigner().sendTransaction({
        // to: daoAddress,
        to: vaultAddress,
        value: '0x10000000000000'
      })

      console.log(await sendTx.wait())
      const balance = await arc.ethBalance(vaultAddress).pipe(first()).toPromise()
      console.log(balance.toString())

      const joinAndQuit = await dao
        .plugin({where: {name: 'JoinAndQuit'}}) as JoinAndQuit
      const joinAndQuitState = await joinAndQuit.fetchState()
      console.log(joinAndQuitState)
      const joinAndQuitContract = arc.getContract(joinAndQuitState.address)
      await (await joinAndQuitContract.setFundingGoalReachedFlag()).wait()

      const value = await daoContract.db('FUNDED_BEFORE_DEADLINE')
      console.log(value)
      console.log('-------------------------------------------------------------------')
      const beneficiary = '0xffcf8fdee72ac11b5c542428b35eef5769c409f0'
      const amount = new BN(1000)

      const tx = await fundingRequest.createProposal({
        amount,
        beneficiary,
        dao: dao.id,
        descriptionHash: 'hello',
        plugin: fundingRequestState.address
      }).send()

      if (!tx.result) { throw new Error('Create proposal yielded no results') }

      const proposal = new FundingRequestProposal(arc, tx.result.id)
      expect(proposal).toBeInstanceOf(Proposal)

      const states: IFundingRequestProposalState[] = []
      const lastState = (): IFundingRequestProposalState => states[states.length - 1]
      proposal.state({}).subscribe((pState: IFundingRequestProposalState) => {
        states.push(pState)
      })
      await waitUntilTrue(() => !!lastState())

      let proposalState = lastState()
      expect(proposalState).toMatchObject({
        amount,
        beneficiary,
        amountRedeemed: new BN(0),
        stage: IProposalStage.Queued
      })
      await voteToPassProposal(proposal)

      await waitUntilTrue(() => (lastState().stage === IProposalStage.Executed))
      expect(lastState()).toMatchObject({
        stage: IProposalStage.Executed
      })
      // now we can redeem the proposal
      await proposal.redeem().send()

      await waitUntilTrue(async () => {
        // for some reason that I cannot fathom, amountRedeemed is not updated from the subscripton
        // so we fetch the state
        proposalState  = await proposal.fetchState({fetchPolicy: 'no-cache'}, true)
        return proposalState.amountRedeemed.gt(new BN(0))
      })
      expect(proposalState.amountRedeemed).toEqual(amount)

  })
})
