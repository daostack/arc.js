
import {
  Arc,
  IProposalStage,
  IProposalState,
  Proposal,
  PluginRegistrarProposal,
  IPluginRegistrarProposalState,
  IProposalCreateOptionsSR,
  Plugin,
  PluginRegistrarPlugin
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

    const plugin = new PluginRegistrarPlugin(arc, getTestScheme("SchemeRegistrar"))

    const tx = await plugin.createProposal(options).send()

    if(!tx.result) throw new Error("Create proposal yielded no results")

    const proposalToAdd = new PluginRegistrarProposal(arc, tx.result.id)

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
    await waitUntilTrue(() => (lastProposalToAddState() as IPluginRegistrarProposalState).pluginRegistered)
    expect(lastProposalToAddState()).toMatchObject({
      stage: IProposalStage.Executed
    })
    expect(lastProposalToAddState()).toMatchObject({
      decision: '1',
      pluginRegistered: true
    })

    // we now expect our new plugin to appear in the plugins collection
    const registeredPlugins = await firstResult(Plugin.search(arc, {where: { dao: dao.id }})) as PluginRegistrarPlugin[]
    const registeredPluginsAddresses: string[] = []
    await Promise.all(
      registeredPlugins.map(async (x: PluginRegistrarPlugin) => {
        const state = await x.fetchState()
        registeredPluginsAddresses.push(state.address)
      })
    )
    
    expect(registeredPluginsAddresses).toContain(pluginToRegister)

    // we now uregister the new scheme

    const removeProposalOptions: IProposalCreateOptionsSR = {
      dao: dao.id,
      plugin: getTestScheme("SchemeRegistrar"),
      pluginToRegister,
      proposalType: "SchemeRegistrarRemove"
    }

    const removeTx = await plugin.createProposal(removeProposalOptions).send()

    if(!removeTx.result) throw new Error("Create proposal yielded no results")

    const proposalToRemove = new PluginRegistrarProposal(arc, removeTx.result.id)

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
    await waitUntilTrue(() => (lastProposalToRemoveState() as IPluginRegistrarProposalState).pluginRemoved)
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
