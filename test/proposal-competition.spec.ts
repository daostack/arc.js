import { first } from 'rxjs/operators'
import {
  Arc,
  IProposalStage,
  IProposalState,
  ISchemeStaticState,
  Proposal,
  DAO
  } from '../src'
import { createAProposal, getTestAddresses, ITestAddresses, LATEST_ARC_VERSION,
  newArc, voteToPassProposal, waitUntilTrue } from './utils'

jest.setTimeout(60000)

/**
 * Proposal test
 */
describe('Proposal', () => {
  let arc: Arc
  let testAddresses: ITestAddresses

  beforeAll(async () => {
    arc = await newArc()
    testAddresses = getTestAddresses(arc)
  })

  it('Createa a competition proposal (etc)', async () => {
    // we'll get a `ContributionRewardExt` contract 
    const ARC_VERSION = '0.0.1-rc.36'
    const contributionRewardExtContract  = arc.getContractInfoByName(`ContributionRewardExt`, ARC_VERSION)
    // find the corresponding scheme object
    const contributionRewardExts = arc
      .schemes({where: {address: contributionRewardExtContract.address}}).pipe(first()).toPromise()
    const contributionRewardExt = contributionRewardExts[0]
    const contributionRewardExtState = await contributionRewardExt.state().pipe(first()).toPromise()
    const dao = new DAO(contributionRewardExtState.dao, arc)
    
    const states: IProposalState[] = []
    const lastState = (): IProposalState => states[states.length - 1]

    const actionMockABI = arc.getABI(undefined, 'ActionMock', LATEST_ARC_VERSION)
    const actionMock = new arc.web3.eth.Contract(actionMockABI, testAddresses.test.ActionMock)
    const callData = await actionMock.methods.test2(dao.id).encodeABI()

    const schemes = await dao.schemes({ where: {name: 'GenericScheme' }}).pipe(first()).toPromise()
    const genericScheme = schemes[0].staticState as ISchemeStaticState
    const proposal = await createAProposal(dao, {
      callData,
      scheme: genericScheme.address,
      schemeToRegister: actionMock.options.address,
      value: 0
    })
    expect(proposal).toBeInstanceOf(Proposal)

    proposal.state().subscribe((pState: IProposalState) => {
      states.push(pState)
    })

    await waitUntilTrue(() => states.length > 0)

    expect(lastState().genericScheme).toMatchObject({
      callData,
      executed: false,
      returnValue: null
    })

    // accept the proposal by voting the hell out of it
    await voteToPassProposal(proposal)

    await waitUntilTrue(() => (lastState().stage === IProposalStage.Executed))
    expect(lastState()).toMatchObject({
      stage: IProposalStage.Executed
    })
    // TODO: check why this fails
    // expect(lastState().genericScheme).toMatchObject({
    //   callData,
    //   executed: true,
    //   returnValue: '0x'
    // })
  })
})
