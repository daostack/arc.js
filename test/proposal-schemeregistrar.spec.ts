import { Arc } from '../src/arc'
import {
  IProposalStage,
  IProposalState,
  Proposal,
  SchemeRegistrarProposal,
  ISchemeRegistrarProposalState,
  IProposalCreateOptionsSR
  } from '../src'
import { Plugin } from '../src'
import { SchemeRegistrar } from '../src'
import { firstResult, getTestAddresses, getTestDAO,
  newArc, voteToPassProposal, waitUntilTrue } from './utils'
import { Wallet } from 'ethers'

jest.setTimeout(60000)

/**
 * Proposal test
 */
describe('Proposal', () => {
  let arc: Arc

  beforeAll(async () => {
    arc = await newArc()
  })

  it('Check proposal state is correct', async () => {
    const dao = await getTestDAO()
    const schemeToRegister = Wallet.createRandom().address.toLowerCase()
    const proposalToAddStates: IProposalState[] = []
    const lastProposalToAddState = (): IProposalState => proposalToAddStates[proposalToAddStates.length - 1]

    const options: IProposalCreateOptionsSR = {
      dao: dao.id,
      descriptionHash: '',
      parametersHash: '0x0000000000000000000000000000000000000000000000000000000000001234',
      permissions: '0x0000001f',
      scheme: getTestScheme("SchemeRegistrar"),
      schemeToRegister,
      proposalType: "SchemeRegistrarAdd"
    }

    const plugin = new SchemeRegistrar(arc, getTestAddresses(arc).base.SchemeRegistrar)

    const tx = await plugin.createProposal(options).send()
    const proposalToAdd = new SchemeRegistrarProposal(arc, tx.result.coreState)

    proposalToAdd.state({}).subscribe((pState: IProposalState) => {
      proposalToAddStates.push(pState)
    })

    await waitUntilTrue(() => proposalToAddStates.length > 0)

    expect(lastProposalToAddState()).toMatchObject({
      decision: null,
      schemeRegistered: null,
      schemeRemoved: null,
      schemeToRegister,
      schemeToRegisterPermission: '0x0000001f',
      schemeToRemove: null
    })

    expect(lastProposalToAddState().type).toEqual('SchemeRegistrarAdd')

    // accept the proposal by voting the hell out of it
    await voteToPassProposal(proposalToAdd)

    await proposalToAdd.execute()
    await waitUntilTrue(() => (lastProposalToAddState() as ISchemeRegistrarProposalState).schemeRegistered)
    expect(lastProposalToAddState()).toMatchObject({
      stage: IProposalStage.Executed
    })
    expect(lastProposalToAddState()).toMatchObject({
      decision: '1',
      schemeRegistered: true
    })

    // we now expect our new scheme to appear in the schemes collection
    const registeredPlugins = await firstResult(Plugin.search(arc, {where: { dao: dao.id }})) as SchemeRegistrar[]
    const registeredPluginsAddresses: string[] = []
    await Promise.all(
      registeredPlugins.map(async (x: SchemeRegistrar) => {
        const state = await x.fetchState()
        registeredPluginsAddresses.push(state.address)
      })
    )
    expect(registeredPluginsAddresses).toContain(schemeToRegister)

    // we create a new proposal now to edit the scheme

    const editProposalOptions: IProposalCreateOptionsSR = {
      dao: dao.id,
      descriptionHash: '',
      parametersHash: '0x0000000000000000000000000000000000000000000000000000000000001234',
      permissions: '0x0000001f',
      scheme: getTestScheme("SchemeRegistrar"),
      schemeToRegister: schemeToRegister.toLowerCase(),
      proposalType: "SchemeRegistrarEdit"
    }

    const editTx = await registeredPlugins[0].createProposal(editProposalOptions).send()

    const proposalToEdit = new SchemeRegistrarProposal(arc, editTx.result.coreState)
    const proposalToEditStates: IProposalState[]  = []
    proposalToEdit.state({}).subscribe((pState: IProposalState) => {
      proposalToEditStates.push(pState)
    })
    const lastProposalToEditState = (): IProposalState => proposalToEditStates[proposalToEditStates.length - 1]

    await waitUntilTrue(() => proposalToEditStates.length > 0)

    expect(lastProposalToEditState()).toMatchObject({
      decision: null,
      // id: '0x11272ed228de85c4fd14ab467f1f8c6d6936ce3854e240f9a93c9deb95f243e6',
      schemeRegistered: null,
      schemeRemoved: null,
      schemeToRegister,
      schemeToRegisterPermission: '0x0000001f',
      schemeToRemove: null
    })
    expect(lastProposalToEditState().type).toEqual('SchemeRegistrarEdit')

    // we now uregister the new scheme

    const removeProposalOptions: IProposalCreateOptionsSR = {
      dao: dao.id,
      plugin: getTestAddresses(arc).base.SchemeRegistrar,
      schemeToRegister,
      proposalType: "SchemeRegistrarRemove"
    }

    const removeTx = await plugin.createProposal(removeProposalOptions).send()
    const proposalToRemove = new SchemeRegistrarProposal(arc, removeTx.result.coreState)

    expect(proposalToRemove).toBeInstanceOf(Proposal)

    const proposalToRemoveStates: IProposalState[]  = []
    proposalToRemove.state({}).subscribe((pState: IProposalState) => {
      proposalToRemoveStates.push(pState)
    })
    const lastProposalToRemoveState = (): IProposalState => proposalToRemoveStates[proposalToRemoveStates.length - 1]

    await waitUntilTrue(() => proposalToRemoveStates.length > 0)

    expect(lastProposalToRemoveState()).toMatchObject({
      decision: null,
      schemeRegistered: null,
      schemeRemoved: null,
      schemeToRegister: null,
      schemeToRegisterPermission: null,
      schemeToRemove: schemeToRegister.toLowerCase()
    })

    // accept the proposal by voting the hell out of it
    await voteToPassProposal(proposalToRemove)
    await proposalToRemove.execute()
    await waitUntilTrue(() => (lastProposalToRemoveState() as ISchemeRegistrarProposalState).schemeRemoved)
    expect(lastProposalToRemoveState()).toMatchObject({
      stage: IProposalStage.Executed
    })
    expect(lastProposalToRemoveState()).toMatchObject({
      decision: '1',
      schemeRegistered: null,
      schemeRemoved: true,
      schemeToRegisterPermission: null,
      schemeToRemove: schemeToRegister.toLowerCase()
    })
    expect(lastProposalToRemoveState().type).toEqual('SchemeRegistrarRemove')

  })
})
