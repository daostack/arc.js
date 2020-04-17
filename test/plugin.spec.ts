import { first } from 'rxjs/operators'
import { Arc } from '../src/arc'
import { IProposalStage, AnyPlugin, ContributionReward, SchemeRegistrar, GenericScheme, ContributionRewardProposal } from '../src'
import { IPluginState, Plugin } from '../src'
import { firstResult, getTestAddresses, getTestDAO,  ITestAddresses, newArc } from './utils'

jest.setTimeout(20000)

/**
 * Scheme test
 */
describe('Scheme', () => {

  let arc: Arc
  let testAddresses: ITestAddresses

  beforeAll(async () => {
    arc = await newArc()
    testAddresses = await getTestAddresses(arc)
  })

  it('Schemes are searchable', async () => {
    const dao = await getTestDAO()
    let result: AnyPlugin[]
    result = await Plugin.search(arc, {where: {dao: dao.id, name_not: null}})
        .pipe(first()).toPromise()

    expect(result.length).toBeGreaterThanOrEqual(3)

    // the schemes have their static state set
    const state = await result[0].fetchState()
    expect(state.name).toBeTruthy()
    expect(state.address).toBeTruthy()
    expect(state.id).toBeTruthy()
    expect(state.dao).toBeTruthy()
    expect(state.paramsHash).toBeTruthy()

    const pluginStates: IPluginState[] = []

    await Promise.all(result.map(async (item) => {
      const state = await item.fetchState()
      pluginStates.push(state)
    }))
    expect((pluginStates.map((r) => r.name)).sort()).toEqual([
      'ContributionReward',
      'SchemeRegistrar',
      'UGenericScheme',
      'ControllerCreator',
      'DaoCreator'
    ].sort())
    result = await Plugin.search(arc, {where: {dao: dao.id, name: 'ContributionReward'}})
        .pipe(first()).toPromise()
    expect(result.length).toEqual(1)

    result = await Plugin.search(arc, {where: {dao: dao.id, name: 'UGenericScheme'}})
        .pipe(first()).toPromise()
    expect(result.length).toEqual(1)

    result = await Plugin.search(arc, {where: {dao: dao.id, name: 'SchemeRegistrar'}})
        .pipe(first()).toPromise()
    expect(result.length).toEqual(1)
    result = await Plugin.search(arc, {where: {dao: dao.id, name_in: ['SchemeRegistrar', 'UGenericScheme']}})
        .pipe(first()).toPromise()
    expect(result.length).toEqual(2)
    result = await Plugin.search(arc, {where: {dao: dao.id, name_not_in: ['UGenericScheme']}})
        .pipe(first()).toPromise()
    expect(result.length).toBeGreaterThan(1)
  })

  it('Plugin.state() is working for ContributionReward plugins', async () => {
    const dao = await getTestDAO()
    const result = await Plugin
      .search(arc, {where: {dao: dao.id, name: 'ContributionReward'}})
      .pipe(first()).toPromise()

    const scheme = result[0] as ContributionReward
    const state = await scheme.fetchState()
    expect(state).toMatchObject({
      address: testAddresses.base.ContributionReward.toLowerCase(),
      id: scheme.id,
      name: 'ContributionReward'
    })
  })

  it('Plugin.state() is working for SchemeRegistrar plugins', async () => {
    const dao = await getTestDAO()
    const result = await Plugin
      .search(arc, {where: {dao: dao.id, name: 'SchemeRegistrar'}})
      .pipe(first()).toPromise()

    const plugin = result[0] as SchemeRegistrar
    const state = await plugin.fetchState()
    expect(state).toMatchObject({
      address: testAddresses.base.SchemeRegistrar.toLowerCase(),
      id: plugin.id,
      name: 'SchemeRegistrar'
    })
  })

  //TODO: uses UGenericScheme

  // it('Scheme.state() is working for UGenericScheme schemes', async () => {
  //   const result = await Scheme
  //     .search(arc, {where: {name: 'UGenericScheme'}})
  //     .pipe(first()).toPromise()
  //   const scheme = result[0]
  //   const state = await scheme.fetchState()
  //   expect(state).toMatchObject({
  //     id: scheme.id,
  //     name: 'UGenericScheme'
  //   })

  //   expect(state.uGenericSchemeParams).toEqual(state.schemeParams)
  // })

  it('Scheme.state() is working for GenericScheme plugins', async () => {
    const result = await Plugin
      .search(arc, {where: {name: 'GenericScheme'}})
      .pipe(first()).toPromise()

    const scheme = result[0] as GenericScheme
    const state = await scheme.fetchState()
    expect(state).toMatchObject({
      id: scheme.id,
      name: 'GenericScheme'
    })
  })

  it('state() should be equal to proposal.state().scheme', async () => {
    const { queuedProposalId } = testAddresses.test
    const proposal = new ContributionRewardProposal(arc, queuedProposalId)
    const proposalState = await proposal.fetchState()
    const plugins = await firstResult(Plugin.search(arc, {where: {id: proposalState.plugin.id}}))
    const schemeState = await firstResult(plugins[0].state())
    expect(schemeState).toMatchObject(proposalState.plugin.entity.coreState)
  })

  it('numberOfProposals counts are correct', async () =>  {
    const { queuedProposalId } = testAddresses.test
    const proposal = new ContributionRewardProposal(arc, queuedProposalId)
    const proposalState = await proposal.fetchState()
    const plugins = await firstResult(Plugin.search(arc, {where: {id: proposalState.plugin.id}}))
    const scheme = plugins[0]
    const schemeState = await firstResult(scheme.state())

    const queuedProposals = await scheme.proposals({ where: { stage: IProposalStage.Queued}, first: 1000})
      .pipe(first()).toPromise()
    expect(schemeState.numberOfQueuedProposals).toEqual(queuedProposals.length)
    const preBoostedProposals = await scheme.proposals({ where: { stage: IProposalStage.PreBoosted}, first: 1000})
      .pipe(first()).toPromise()
    expect(schemeState.numberOfPreBoostedProposals).toEqual(preBoostedProposals.length)
    const boostedProposals = await scheme.proposals({ where: { stage: IProposalStage.Boosted}, first: 1000})
      .pipe(first()).toPromise()
    expect(schemeState.numberOfBoostedProposals).toEqual(boostedProposals.length)
  })

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
