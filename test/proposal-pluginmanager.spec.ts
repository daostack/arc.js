import {
  Arc,
  PluginManagerPlugin,
  IProposalCreateOptionsPM,
  PACKAGE_VERSION,
  PluginManagerProposal,
  NULL_ADDRESS,
  IPluginManagerProposalState,
  DAO,
  IProposalOutcome,
  LATEST_ARC_VERSION,
  ContributionRewardPlugin
} from '../src/index'
import {
  newArc,
  waitUntilTrue
} from './utils'
import { first } from 'rxjs/operators'
import { Interface } from 'ethers/utils'

jest.setTimeout(60000)

describe('Plugin Manager', () => {
  let arc: Arc

  beforeAll(async () => {
    arc = await newArc()
  })

  it('Creates, replaces and deletes a plugin', async () => {
    const dao = (await DAO.search(arc, { where: { name: 'My DAO'}}).pipe(first()).toPromise())[0]
    const pluginAddresses = (await dao.plugins().pipe(first()).toPromise()).map( p => {
      if(!p.coreState) throw new Error('Could not set Plugin state')
      return p.coreState.address
    })
    const plugin = (await dao.proposalPlugins({ where: { name: 'SchemeFactory'}}).pipe(first()).toPromise())[0] as PluginManagerPlugin
    const addProposalStates: IPluginManagerProposalState[] = []
    const memberAddresses = (await dao.members().pipe(first()).toPromise()).map(m => m.coreState?.address) as string[]

    const initData = {
      votingMachine: arc.getContractInfoByName("GenesisProtocol", LATEST_ARC_VERSION).address,
      easyVotingParams: [
        50,
        604800,
        129600,
        43200, 
        1200,
        86400, 
        10, 
        1, 
        50,
        10,
        0
      ],
      voteOnBehalf: "0x0000000000000000000000000000000000000000",
      voteParamsHash: '0x0000000000000000000000000000000000000000000000000000000000000000'
    }

    const abiInterface = new Interface(arc.getABI({ abiName: 'ContributionReward', version: LATEST_ARC_VERSION }))
    const pluginData = abiInterface.functions.initialize.encode([
      dao.id,
      initData.votingMachine,
      initData.easyVotingParams,
      initData.voteOnBehalf,
      initData.voteParamsHash
    ])

    const lastAddProposalState = () => addProposalStates[addProposalStates.length - 1]
    const options: IProposalCreateOptionsPM = {
      dao: dao.id,
      packageVersion: PACKAGE_VERSION,
      permissions: '0x0000001f',
      plugin: plugin.coreState?.address,
      pluginName: 'ContributionReward',
      pluginToReplace: NULL_ADDRESS,
      pluginData
    }

    const tx = await plugin.createProposal(options).send()
    if(!tx.result) throw new Error("Create proposal yielded no results")

    const addProposal = new PluginManagerProposal(arc, tx.result.id)

    addProposal.state({}).subscribe((pState) => {
      if(pState) {
        addProposalStates.push(pState)
      }
    })

    if(!arc.web3) throw new Error('Web3 Provider not set')

    //Wait for indexation
    await waitUntilTrue(() => addProposalStates.length > 0)
    
    //Vote for proposal to pass
    for(let i = 0; i < memberAddresses.length; i++) {
      try{
        arc.setAccount(memberAddresses[i])
        await addProposal.vote(IProposalOutcome.Pass).send()
      } catch(err) { }
      finally {
        arc.setAccount((await arc.web3.listAccounts())[0])
      }
    }

    //Wait for execution
    await waitUntilTrue(() => lastAddProposalState().executionState === 1)

    //Wait for indexation
    let newPlugins: ContributionRewardPlugin[] = []

    dao.plugins().subscribe(plugins => {
      const result = plugins.find( np => {
        if(!np.coreState) throw new Error('Could not set Plugin State')
        return !pluginAddresses.includes(np.coreState.address)
      })

      if(result) newPlugins.push(result as ContributionRewardPlugin)
    })

    //Wait until plugin is indexed
    await waitUntilTrue(() => newPlugins.length > 0)

    const newPlugin = newPlugins[0]

    if(!newPlugin.coreState) throw new Error('New Plugin has no state set')

    expect(lastAddProposalState().pluginRegistered).toEqual(true)
    expect(newPlugin).toBeTruthy()
    expect(newPlugin).toBeInstanceOf(ContributionRewardPlugin)
    expect(newPlugin.coreState.name).toEqual('ContributionReward')
  })
})