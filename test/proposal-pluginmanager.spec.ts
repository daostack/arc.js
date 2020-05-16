import {
  Arc,
  PluginManagerPlugin,
  IProposalCreateOptionsPM,
  PluginManagerProposal,
  IPluginManagerProposalState,
  DAO,
  IProposalOutcome,
  LATEST_ARC_VERSION,
  ContributionRewardPlugin,
  IInitParamsCR,
  IInitParamsCompetition,
  PACKAGE_VERSION,
  CompetitionPlugin
} from '../src/index'
import {
  newArc,
  waitUntilTrue
} from './utils'
import { first } from 'rxjs/operators'

jest.setTimeout(60000)

const easyVotingParams = [
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
];

const createAddProposal = async (arc: Arc, dao: DAO, plugin: PluginManagerPlugin, options: IProposalCreateOptionsPM) => {
  const pluginAddresses = (await dao.plugins().pipe(first()).toPromise()).map( p => {
    if(!p.coreState) throw new Error('Could not set Plugin state')
    return p.coreState.address
  })
  const addProposalStates: IPluginManagerProposalState[] = []
  const lastAddProposalState = () => addProposalStates[addProposalStates.length - 1]

  const tx = await plugin.createProposal(options).send()
  if(!tx.result) throw new Error("Create proposal yielded no results")

  const addProposal = new PluginManagerProposal(arc, tx.result.id)

  addProposal.state({}).subscribe((pState) => {
    if(pState) {
      addProposalStates.push(pState)
    }
  })

  //Wait for indexation
  await waitUntilTrue(() => addProposalStates.length > 0)
  
  //Vote for proposal to pass
  await voteProposal(arc, addProposal, dao)

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
  return newPlugins[0]
}

const voteProposal = async (arc: Arc, proposal: PluginManagerProposal, dao: DAO) => {

  const memberAddresses = (await dao.members().pipe(first()).toPromise()).map(m => m.coreState?.address) as string[]

  if(!arc.web3) throw new Error('Web3 Provider not set')

  for(let i = 0; i < memberAddresses.length; i++) {
    try{
      arc.setAccount(memberAddresses[i])
      await proposal.vote(IProposalOutcome.Pass).send()
    } catch(err) { }
    finally {
      arc.setAccount((await arc.web3.listAccounts())[0])
    }
  }
}

describe('Plugin Manager', () => {
  let arc: Arc

  beforeAll(async () => {
    arc = await newArc()
  })

//TODO: Refactor tests for new interface

  it('Creates a plugin', async () => {
    const dao = (await DAO.search(arc, { where: { name: 'My DAO'}}).pipe(first()).toPromise())[0]
    const plugin = (await dao.proposalPlugins({ where: { name: 'SchemeFactory'}}).pipe(first()).toPromise())[0] as PluginManagerPlugin
 
    const initData: IInitParamsCR = {
      daoId: dao.id,
      votingMachine: arc.getContractInfoByName("GenesisProtocol", LATEST_ARC_VERSION).address,
      votingParams: easyVotingParams,
      voteOnBehalf: "0x0000000000000000000000000000000000000000",
      voteParamsHash: '0x0000000000000000000000000000000000000000000000000000000000000000'
    }

    const options: IProposalCreateOptionsPM = {
      dao: dao.id,
      add: {
        permissions: '0x00000000',
        pluginName: 'ContributionReward',
        pluginInitParams: initData
      }
    }

    const createdPlugin = await createAddProposal(arc, dao, plugin, options)

    if(!createdPlugin.coreState) throw new Error('New Plugin has no state set')

    expect(createdPlugin).toBeTruthy()
    expect(createdPlugin).toBeInstanceOf(ContributionRewardPlugin)
    expect(createdPlugin.coreState.name).toEqual('ContributionReward')
    expect(createdPlugin.coreState.pluginParams.voteParams).toMatchObject({
      boostedVotePeriodLimit: 129600,
      daoBountyConst: 10,
      preBoostedVotePeriodLimit: 43200,
      queuedVotePeriodLimit: 604800,
      queuedVoteRequiredPercentage: 50,
      quietEndingPeriod: 86400,
      votersReputationLossRatio: 1,
      activationTime: 0
    })
  })

  it('Removes plugin', async () => {
    const dao = (await DAO.search(arc, { where: { name: 'My DAO'}}).pipe(first()).toPromise())[0]
    const plugin = (await dao.proposalPlugins({ where: { name: 'SchemeFactory'}}).pipe(first()).toPromise())[0] as PluginManagerPlugin
 
    const initData: IInitParamsCR = {
      daoId: dao.id,
      votingMachine: arc.getContractInfoByName("GenesisProtocol", LATEST_ARC_VERSION).address,
      votingParams: easyVotingParams,
      voteOnBehalf: "0x0000000000000000000000000000000000000000",
      voteParamsHash: '0x0000000000000000000000000000000000000000000000000000000000000000'
    }

    const options: IProposalCreateOptionsPM = {
      dao: dao.id,
      add: {
        permissions: '0x00000000',
        pluginName: 'ContributionReward',
        pluginInitParams: initData
      }
    }

    const createdPlugin = await createAddProposal(arc, dao, plugin, options)

    if(!createdPlugin.coreState) throw new Error('New Plugin has no state set')

    //Remove proposal data

    const pluginAddresses = (await dao.plugins().pipe(first()).toPromise()).map( p => {
      if(!p.coreState) throw new Error('Could not set Plugin state')
      return p.coreState.address
    })

    const removeProposalStates: IPluginManagerProposalState[] = []
    const lastRemoveProposalState = () => removeProposalStates[removeProposalStates.length - 1]

    const removeOptions: IProposalCreateOptionsPM = {
      dao: dao.id,
      remove: {
        plugin: createdPlugin.coreState.address
      }
    }

    const tx = await plugin.createProposal(removeOptions).send()
    if(!tx.result) throw new Error("Create proposal yielded no results")

    const removeProposal = new PluginManagerProposal(arc, tx.result.id)

    removeProposal.state({}).subscribe((pState) => {
      if(pState) {
        removeProposalStates.push(pState)
      }
    })

    //Wait for indexation
    await waitUntilTrue(() => removeProposalStates.length > 0)
    
    //Vote for proposal to pass
    await voteProposal(arc, removeProposal, dao)

    //Wait for execution
    await waitUntilTrue(() => lastRemoveProposalState().executionState === 1)

    //Wait for indexation

    let newPluginAddresses: string[] = []

    dao.plugins().subscribe(plugins => {
      if(plugins.length < pluginAddresses.length) {
        newPluginAddresses = plugins.map(p => {
          if(!p.coreState) throw new Error('Plugin does not have state set')
          return p.coreState.address
        })
      }
    })

    expect(newPluginAddresses).not.toContain(createdPlugin.coreState.address)
  })

  it('Replaces an existing plugin', async () => {
    const dao = (await DAO.search(arc, { where: { name: 'My DAO'}}).pipe(first()).toPromise())[0]
    const plugin = (await dao.proposalPlugins({ where: { name: 'SchemeFactory'}}).pipe(first()).toPromise())[0] as PluginManagerPlugin
 
    const initData: IInitParamsCR = {
      daoId: dao.id,
      votingMachine: arc.getContractInfoByName("GenesisProtocol", LATEST_ARC_VERSION).address,
      votingParams: easyVotingParams,
      voteOnBehalf: "0x0000000000000000000000000000000000000000",
      voteParamsHash: '0x0000000000000000000000000000000000000000000000000000000000000000'
    }

    const options: IProposalCreateOptionsPM = {
      dao: dao.id,
      add: {
        permissions: '0x00000000',
        pluginName: 'ContributionReward',
        pluginInitParams: initData
      }
    }

    const createdPlugin = await createAddProposal(arc, dao, plugin, options)

    if(!createdPlugin.coreState) throw new Error('New Plugin has no state set')

    // Replace the created plugin
    const replaceProposalStates: IPluginManagerProposalState[] = []
    const lastReplaceProposalState = () => replaceProposalStates[replaceProposalStates.length - 1]

    // Store a list of already added plugins, so we can diff it to see if the new one was added
    const pluginAddresses = (await dao.plugins().pipe(first()).toPromise()).map(p => {
      if(!p.coreState) throw new Error('Could not set Plugin state')
      return p.coreState.address
    })

    const editInitData: IInitParamsCompetition = {
      daoId: dao.id,
      votingMachine: arc.getContractInfoByName("GenesisProtocol", LATEST_ARC_VERSION).address,
      votingParams: [
        50,
        604805,
        129605,
        43205, 
        1200,
        86400, 
        10, 
        1, 
        50,
        10,
        0
      ],
      voteOnBehalf: "0x0000000000000000000000000000000000000000",
      voteParamsHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
      rewarderName: 'Competition',
      daoFactory: arc.getContractInfoByName("DAOFactoryInstance", LATEST_ARC_VERSION).address,
      packageVersion: PACKAGE_VERSION
    }

    const editOptions: IProposalCreateOptionsPM = {
      dao: dao.id,
      add: {
        permissions: '0x00000000',
        pluginName: 'Competition',
        pluginInitParams: editInitData
      },
      remove: {
        plugin: createdPlugin.coreState.address
      }
    }

    const tx = await plugin.createProposal(editOptions).send()
    if(!tx.result) throw new Error("Create proposal yielded no results")

    const replaceProposal = new PluginManagerProposal(arc, tx.result.id)

    //Wait for indexation
    const sub = replaceProposal.state({}).subscribe((pState) => {
      if(pState) {
        replaceProposalStates.push(pState)
      }
    })

    await waitUntilTrue(() => replaceProposalStates.length > 0)

    //Vote for proposal to pass
    await voteProposal(arc, replaceProposal, dao)

    //Wait for execution
    await waitUntilTrue(() => lastReplaceProposalState().executionState === 1)

    sub.unsubscribe()
    await replaceProposal.fetchState()

    // Wait for node changes

    let newPlugins: CompetitionPlugin[] = []
    let registeredAddresses: string[] = []

    dao.plugins({ where: { isRegistered: true } }).subscribe(plugins => {

      // If replacing plugin is found, push it
      const found = plugins.find(np => {
        if(!np.coreState) throw new Error('Could not set Plugin State')
        return !pluginAddresses.includes(np.coreState.address)
      })

      if (found) {
        newPlugins.push(found as CompetitionPlugin)
      }

      // If replaced plugin is removed, set the addresses array as the new registeredAddresses
      const addresses = plugins.map(p => {
        if(!p.coreState) throw new Error('Could not set Plugin State')
        return p.coreState.address
      })

      registeredAddresses = addresses

      if(!createdPlugin.coreState) throw new Error('Plugin State not set')
    })

    // Wait for replacing plugin indexation
    await waitUntilTrue(() => newPlugins.length > 0 && registeredAddresses.length > 0)

    const replacingPlugin = newPlugins[0]
    if (!replacingPlugin.coreState) throw new Error('Could not set Plugin State')

    expect(replacingPlugin.coreState.pluginParams.voteParams).toMatchObject({
      boostedVotePeriodLimit: 129605,
      daoBountyConst: 10,
      preBoostedVotePeriodLimit: 43205,
      queuedVotePeriodLimit: 604805,
      queuedVoteRequiredPercentage: 50,
      quietEndingPeriod: 86400,
      votersReputationLossRatio: 1,
      activationTime: 0
    })

    //@ts-ignore
    await waitUntilTrue(() => !registeredAddresses.includes(createdPlugin.coreState.address))
  })
})