
import {
  Arc,
  IProposalStage,
  IProposalState,
  Proposal,
  SchemeRegistrarProposal,
  ISchemeRegistrarProposalState,
  IProposalCreateOptionsSR,
  Plugin,
  SchemeRegistrarPlugin,
  AnyPlugin
  } from '../src'
import { firstResult, getTestDAO,
  newArc, voteToPassProposal, waitUntilTrue, getTestScheme } from './utils'
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
    const pluginToRegister = Wallet.createRandom().address.toLowerCase()
    const proposalToAddStates: IProposalState[] = []
    const lastProposalToAddState = (): IProposalState => proposalToAddStates[proposalToAddStates.length - 1]

    const options: IProposalCreateOptionsSR = {
      dao: dao.id,
      descriptionHash: '',
      parametersHash: '0x0000000000000000000000000000000000000000000000000000000000001234',
      permissions: '0x0000001f',
      plugin: getTestScheme("SchemeRegistrar"),
      pluginToRegister,
      proposalType: "SchemeRegistrarAdd"
    }

    const plugin = new SchemeRegistrarPlugin(arc, getTestScheme("SchemeRegistrar"))

    const tx = await plugin.createProposal(options).send()

    if(!tx.result) throw new Error("Create proposal yielded no results")

    const proposalToAdd = new SchemeRegistrarProposal(arc, tx.result.id)

    proposalToAdd.state({}).subscribe((pState: IProposalState) => {
      if(pState)
      proposalToAddStates.push(pState)
    })

    await waitUntilTrue(() => proposalToAddStates.length > 0)

    expect(lastProposalToAddState()).toMatchObject({
      decision: null,
      pluginRegistered: null,
      pluginRemoved: null,
      pluginToRegister,
      pluginToRegisterPermission: '0x0000001f',
      pluginToRemove: null
    })

    expect(lastProposalToAddState().type).toEqual('SchemeRegistrarAdd')

    // accept the proposal by voting the hell out of it
    await voteToPassProposal(proposalToAdd)

    await proposalToAdd.execute()
    await waitUntilTrue(() => (lastProposalToAddState() as ISchemeRegistrarProposalState).pluginRegistered)
    expect(lastProposalToAddState()).toMatchObject({
      stage: IProposalStage.Executed
    })
    expect(lastProposalToAddState()).toMatchObject({
      decision: '1',
      pluginRegistered: true
    })

    // we now expect our new scheme to appear in the schemes collection
    const registeredPlugins = await firstResult(Plugin.search(arc, {where: { dao: dao.id }})) as SchemeRegistrarPlugin[]
    const registeredPluginsAddresses: string[] = []
    await Promise.all(
      registeredPlugins.map(async (x: SchemeRegistrarPlugin) => {
        const state = await x.fetchState()
        registeredPluginsAddresses.push(state.address)
      })
    )
    
    //TODO: how to create a plugin?
    expect(registeredPluginsAddresses).toContain(pluginToRegister)

    // we create a new proposal now to edit the scheme

    const schemeRegistrarPlugin = registeredPlugins.find((rp: AnyPlugin) => rp instanceof (SchemeRegistrarPlugin)) as SchemeRegistrarPlugin

    const editProposalOptions: IProposalCreateOptionsSR = {
      dao: dao.id,
      descriptionHash: '',
      parametersHash: '0x0000000000000000000000000000000000000000000000000000000000001234',
      permissions: '0x0000001f',
      plugin: getTestScheme("SchemeRegistrar"),
      pluginToRegister: pluginToRegister.toLowerCase(),
      proposalType: "SchemeRegistrarEdit"
    }

    const editTx = await schemeRegistrarPlugin.createProposal(editProposalOptions).send()

    if(!editTx.result) throw new Error("Create proposal yielded no results")

    const proposalToEdit = new SchemeRegistrarProposal(arc, editTx.result.id)

    const proposalToEditStates: IProposalState[]  = []
    proposalToEdit.state({}).subscribe((pState: IProposalState) => {
      proposalToEditStates.push(pState)
    })
    const lastProposalToEditState = (): IProposalState => proposalToEditStates[proposalToEditStates.length - 1]

    await waitUntilTrue(() => proposalToEditStates.length > 1)

    expect(lastProposalToEditState()).toMatchObject({
      decision: null,
      // id: '0x11272ed228de85c4fd14ab467f1f8c6d6936ce3854e240f9a93c9deb95f243e6',
      pluginRegistered: null,
      pluginRemoved: null,
      pluginToRegister,
      pluginToRegisterPermission: '0x0000001f',
      pluginToRemove: null
    })
    expect(lastProposalToEditState().type).toEqual('SchemeRegistrarEdit')

    // we now uregister the new scheme

    const removeProposalOptions: IProposalCreateOptionsSR = {
      dao: dao.id,
      plugin: getTestScheme("SchemeRegistrar"),
      pluginToRegister,
      proposalType: "SchemeRegistrarRemove"
    }

    const removeTx = await plugin.createProposal(removeProposalOptions).send()

    if(!removeTx.result) throw new Error("Create proposal yielded no results")

    const proposalToRemove = new SchemeRegistrarProposal(arc, removeTx.result.id)

    expect(proposalToRemove).toBeInstanceOf(Proposal)

    const proposalToRemoveStates: IProposalState[]  = []
    proposalToRemove.state({}).subscribe((pState: IProposalState) => {
      proposalToRemoveStates.push(pState)
    })
    const lastProposalToRemoveState = (): IProposalState => proposalToRemoveStates[proposalToRemoveStates.length - 1]

    await waitUntilTrue(() => proposalToRemoveStates.length > 1)

    expect(lastProposalToRemoveState()).toMatchObject({
      decision: null,
      pluginRegistered: null,
      pluginRemoved: null,
      pluginToRegister: null,
      pluginToRegisterPermission: null,
      pluginToRemove: pluginToRegister.toLowerCase()
    })

    // accept the proposal by voting the hell out of it
    await voteToPassProposal(proposalToRemove)
    await proposalToRemove.execute()
    await waitUntilTrue(() => (lastProposalToRemoveState() as ISchemeRegistrarProposalState).pluginRemoved)
    expect(lastProposalToRemoveState()).toMatchObject({
      stage: IProposalStage.Executed
    })
    expect(lastProposalToRemoveState()).toMatchObject({
      decision: '1',
      pluginRegistered: null,
      pluginRemoved: true,
      pluginToRegisterPermission: null,
      pluginToRemove: pluginToRegister.toLowerCase()
    })
    expect(lastProposalToRemoveState().type).toEqual('SchemeRegistrarRemove')

  })
})
