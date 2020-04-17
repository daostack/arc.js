import { first } from 'rxjs/operators'
import {
  Arc,
  IProposalStage,
  IProposalState,
  Proposal,
  IPluginState,
  GenericScheme,
  GenericSchemeProposal,
  LATEST_ARC_VERSION
  } from '../src'
import { getTestAddresses, ITestAddresses,
  newArc, voteToPassProposal, waitUntilTrue } from './utils'
import { Contract, ethers } from 'ethers'

jest.setTimeout(60000)

/**
 * Proposal test
 */
describe('Proposal', () => {
  let arc: Arc
  let testAddresses: ITestAddresses

  beforeAll(async () => {
    arc = await newArc()
    testAddresses = getTestAddresses()
  })

  it('Check proposal state is correct', async () => {
    const daos = await arc.daos({where: { name: 'Nectar DAO'}}).pipe(first()).toPromise()
    const dao = daos[0]
    if (dao === undefined) {
      throw Error(`Could not find "Nectar DAO"`)
    }
    const states: IProposalState[] = []
    const lastState = (): IProposalState => states[states.length - 1]

    const actionMockABI = arc.getABI({abiName: 'ActionMock', version: LATEST_ARC_VERSION})

    if(!arc.web3) throw new Error('Web3 provider not set')

    const actionMock = new Contract(testAddresses.organs.ActionMock.toString(), actionMockABI, arc.web3.getSigner())
    const callData = new ethers.utils.Interface(actionMockABI).functions.test2.encode([dao.id])

    const plugins = await dao.plugins({ where: {name: 'GenericScheme' }}).pipe(first()).toPromise() as GenericScheme[]
    const genericScheme = plugins[0]

    const tx = await genericScheme.createProposal({
      dao: dao.id,
      callData,
      value: 0,
      proposalType: "GenericScheme"
    }).send()

    const proposal = new GenericSchemeProposal(arc, tx.result.coreState)

    expect(proposal).toBeInstanceOf(Proposal)

    proposal.state({}).subscribe((pState: IProposalState) => {
      states.push(pState)
    })

    await waitUntilTrue(() => states.length > 0)

    expect(lastState()).toMatchObject({
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
  })
})
