import { first } from 'rxjs/operators'
import {
  AnyPlugin,
  ContributionRewardPlugin,
  ContributionRewardProposal,
  GenericPlugin,
  IContributionRewardState,
  IProposalStage,
  SchemeRegistrarPlugin
} from '../src'
import { IPluginState, Plugin } from '../src'
import { Arc } from '../src/arc'
import { firstResult, getTestAddresses, getTestDAO,  getTestScheme, ITestAddresses, newArc } from './utils'

jest.setTimeout(20000)

/**
 * Plugin test
 */
describe('Plugin', () => {

  let arc: Arc
  let testAddresses: ITestAddresses

  beforeAll(async () => {
    arc = await newArc()
    testAddresses = await getTestAddresses()
  })

  it('Plugins are searchable', async () => {
    const dao = await getTestDAO()
    let result: AnyPlugin[]
    result = await Plugin.search(arc, {where: {dao: dao.id, name_not: null}})
        .pipe(first()).toPromise()

    expect(result.length).toBeGreaterThanOrEqual(3)

    // the plugins have their static state set
    const state = await result[0].fetchState()
    expect(state.name).toBeTruthy()
    expect(state.address).toBeTruthy()
    expect(state.id).toBeTruthy()
    expect(state.dao).toBeTruthy()

    const pluginStates: IPluginState[] = []

    await Promise.all(result.map(async (item) => {
      const st = await item.fetchState()
      pluginStates.push(st)
    }))

    // TODO: DAOFactoryInstance is a plugin not registered, therefore the ItemMap in the search method wont map it.
    // Its interface is unknown. This test is failing because of this

    expect((pluginStates.map((r) => r.name)).sort()).toEqual([
      'ContributionReward',
      'DAOFactoryInstance',
      'GenericScheme',
      'SchemeRegistrar'
    ].sort())
    result = await Plugin.search(arc, {where: {dao: dao.id, name: 'ContributionReward'}})
        .pipe(first()).toPromise()
    expect(result.length).toEqual(1)

    result = await Plugin.search(arc, {where: {dao: dao.id, name: 'GenericScheme'}})
        .pipe(first()).toPromise()
    expect(result.length).toEqual(1)

    result = await Plugin.search(arc, {where: {dao: dao.id, name: 'SchemeRegistrar'}})
        .pipe(first()).toPromise()
    expect(result.length).toEqual(1)
    result = await Plugin.search(arc, {where: {dao: dao.id, name_in: ['SchemeRegistrar', 'GenericScheme']}})
        .pipe(first()).toPromise()
    expect(result.length).toEqual(2)
    result = await Plugin.search(arc, {where: {dao: dao.id, name_not_in: ['GenericScheme']}})
        .pipe(first()).toPromise()
    expect(result.length).toBeGreaterThan(1)
  })

  it('Plugin.state() is working for ContributionReward plugins', async () => {
    const dao = await getTestDAO()
    const result = await Plugin
      .search(arc, {where: {dao: dao.id, name: 'ContributionReward'}})
      .pipe(first()).toPromise()

    const plugin = result[0] as ContributionRewardPlugin
    const state = await plugin.fetchState()
    expect(state).toMatchObject({
      address: getTestScheme('ContributionReward').toLowerCase(),
      id: plugin.id,
      name: 'ContributionReward'
    })
  })

  it('Plugin.state() is working for SchemeRegistrar plugins', async () => {
    const dao = await getTestDAO()
    const result = await Plugin
      .search(arc, {where: {dao: dao.id, name: 'SchemeRegistrar'}})
      .pipe(first()).toPromise()

    const plugin = result[0] as SchemeRegistrarPlugin
    const state = await plugin.fetchState()
    expect(state).toMatchObject({
      address: getTestScheme('SchemeRegistrar').toLowerCase(),
      id: plugin.id,
      name: 'SchemeRegistrar'
    })
  })

  it('Plugin.state() is working for GenericPlugin plugins', async () => {
    const result = await Plugin
      .search(arc, {where: {name: 'GenericScheme'}})
      .pipe(first()).toPromise()

    const plugin = result[0] as GenericPlugin
    const state = await plugin.fetchState()
    expect(state).toMatchObject({
      id: plugin.id,
      name: 'GenericScheme'
    })
  })

  it('state() should be equal to proposal.state().plugin', async () => {
    const { queuedProposalId } = testAddresses
    const proposal = new ContributionRewardProposal(arc, queuedProposalId)
    const proposalState = await proposal.fetchState()
    const plugins: ContributionRewardPlugin[] =
      await firstResult(Plugin.search(arc, {where: {id: proposalState.plugin.id}}))
    const pluginState: IContributionRewardState = await firstResult(plugins[0].state())
    expect(pluginState).toMatchObject(proposalState.plugin.entity.coreState as IContributionRewardState)
  })

  it('numberOfProposals counts are correct', async () =>  {
    const { queuedProposalId } = testAddresses
    const proposal = new ContributionRewardProposal(arc, queuedProposalId)
    const proposalState = await proposal.fetchState()
    const plugins = await firstResult(Plugin.search(arc, {where: {id: proposalState.plugin.id}}))
    const plugin = plugins[0]
    const pluginState = await firstResult(plugin.state())

    const queuedProposals = await plugin.proposals({ where: { stage: IProposalStage.Queued}, first: 1000})
      .pipe(first()).toPromise()
    expect(pluginState.numberOfQueuedProposals).toEqual(queuedProposals.length)
    const preBoostedProposals = await plugin.proposals({ where: { stage: IProposalStage.PreBoosted}, first: 1000})
      .pipe(first()).toPromise()
    expect(pluginState.numberOfPreBoostedProposals).toEqual(preBoostedProposals.length)
    const boostedProposals = await plugin.proposals({ where: { stage: IProposalStage.Boosted}, first: 1000})
      .pipe(first()).toPromise()
    expect(pluginState.numberOfBoostedProposals).toEqual(boostedProposals.length)
  })

  // TODO: DAOFactoryInstance is a plugin not registered, therefore the ItemMap in the search method wont map it.
  // Its interface is unknown. This test is failing because of this

  it('paging and sorting works', async () => {
    const ls1 = await Plugin.search(arc, { first: 3, orderBy: 'address' }).pipe(first()).toPromise()
    expect(ls1.length).toEqual(3)

    expect((await firstResult(ls1[0].state({}))).address <= (await firstResult(ls1[1].state({}))).address).toBeTruthy()

    const ls2 = await Plugin.search(arc, { first: 2, skip: 2, orderBy: 'address' }).pipe(first()).toPromise()
    expect(ls2.length).toEqual(2)
    expect((await firstResult(ls1[2].state({}))).address <= (await firstResult(ls2[0].state({}))).address).toBeTruthy()

    const ls3 = await Plugin.search(arc, {  orderBy: 'address', orderDirection: 'desc'}).pipe(first()).toPromise()
    expect((await firstResult(ls3[0].state({}))).address >= (await firstResult(ls3[1].state({}))).address).toBeTruthy()
  })

  it('fetchState works', async () => {
    const plugins = await firstResult(Plugin.search(arc))
    const plugin = plugins[0]
    const state = await plugin.fetchState()
    expect(Object.keys(state)).toContain('address')
  })

  it('fetchAllData works', async () => {
    const plugins = await Plugin.search(arc, {}, { fetchAllData: true }).pipe(first()).toPromise()
    const plugin = plugins[0]
    // now we have all data in the cache - and we can get the whole state from the cache without error
    const pluginStateFromCache = await plugin.state({ fetchPolicy: 'cache-only'}).pipe(first()).toPromise()
    const pluginStateFromServer = await plugin.state({ fetchPolicy: 'no-cache'}).pipe(first()).toPromise()
    expect(pluginStateFromCache).toEqual(pluginStateFromServer)
  })

})
