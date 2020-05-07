import {
  Arc,
  PluginManagerPlugin,
  IProposalCreateOptionsPM,
  PACKAGE_VERSION,
  PluginManagerProposal,
  NULL_ADDRESS,
  IPluginManagerProposalState,
  Plugin,
  DAO,
  LATEST_ARC_VERSION
} from '../src/index'
import {
  newArc,
  voteToPassProposal,
  waitUntilTrue
} from './utils'
import { first } from 'rxjs/operators'
import { ethers } from 'ethers'

jest.setTimeout(60000)

describe('Plugin Manager', () => {
  let arc: Arc

  beforeAll(async () => {
    arc = await newArc()
  })

  it('Creates, replaces and deletes a plugin', async () => {
    const daos = await DAO.search(arc, { where: { name: 'My DAO'}}).pipe(first()).toPromise()
    const dao = daos[0]
    const addProposalStates: IPluginManagerProposalState[] = []

    const plugins = await Plugin.search(arc, { where: { name: 'SchemeFactory'}})
      .pipe(first()).toPromise() as PluginManagerPlugin[]

    const plugin = plugins.find(p => p.coreState?.dao.id === dao.id) as PluginManagerPlugin
    
    const actionMockABI = arc.getABI({abiName: 'ActionMock', version: LATEST_ARC_VERSION})

    if(!arc.web3) throw new Error("Web3 provider not set")

    const callData = new ethers.utils.Interface(actionMockABI).functions.test2.encode([dao.id])

    const lastAddProposalState = () => addProposalStates[addProposalStates.length - 1]
    const options: IProposalCreateOptionsPM = {
      dao: dao.id,
      packageVersion: PACKAGE_VERSION,
      permissions: '0x0000001f',
      plugin: plugin.coreState?.address,
      pluginName: 'GenericScheme',
      pluginToReplace: NULL_ADDRESS,
      pluginData: callData
    }

    const tx = await plugin.createProposal(options).send()
    if(!tx.result) throw new Error("Create proposal yielded no results")

    const addProposal = new PluginManagerProposal(arc, tx.result.id)

    addProposal.state({}).subscribe((pState) => {
      if(pState) {
        addProposalStates.push(pState)
        console.log(pState)
      }
    })

    await waitUntilTrue(() => addProposalStates.length > 0)

    await voteToPassProposal(addProposal)
    addProposal.execute()

    await waitUntilTrue(() => (
      lastAddProposalState().pluginRegistered
    ))

    const pluginRegistered = lastAddProposalState().pluginRegistered

    
  })
})