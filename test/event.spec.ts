import { first } from 'rxjs/operators'
import { Arc, DAO, Event, IEventState, Proposal } from '../src'
import { getTestAddresses, getTestDAO, ITestAddresses, newArc, toWei } from './utils'

/**
 * Event test
 */
describe('Event', () => {

  let arc: Arc
  let testAddresses: ITestAddresses
  let dao: DAO

  beforeAll(async () => {
    arc = await newArc()
    testAddresses = getTestAddresses(arc)
    dao = await getTestDAO()
  })

  it('Event is instantiable', () => {
    const id = 'some-id'
    const event = new Event(id, arc)
    expect(event).toBeInstanceOf(Event)
  })

  it('Events are searchable and have a state', async () => {

    // create a proposal with some events
    const beneficiary = '0xffcf8fdee72ac11b5c542428b35eef5769c409f0'
    const state = await dao.createProposal({
      beneficiary,
      dao: dao.id,
      ethReward: toWei('300'),
      externalTokenAddress: undefined,
      externalTokenReward: toWei('0'),
      nativeTokenReward: toWei('1'),
      scheme: testAddresses.base.ContributionReward
    }).send()
    const proposal = state.result as Proposal

    expect(proposal).toBeDefined()

    let result: Event[]
    result = await Event.search(arc)
        .pipe(first()).toPromise()
    expect(result.length).toBeGreaterThan(0)

    // search does not care about case in the address
    result = await Event.search(arc, { where: {dao: dao.id}})
        .pipe(first()).toPromise()
    expect(result.length).toBeGreaterThan(0)

    expect(() => Event.search(arc, {where: {dao: ''}})).toThrowError(
      /not a valid address/i
    )

    // get the event state
    const event = result[0]
    const eventState = await event.state().pipe(first()).toPromise()
    expect(eventState.id).toEqual(event.id)
  })

  it('paging and sorting works', async () => {
    const ls1 = await Event.search(arc, { first: 3, orderBy: 'id' }).pipe(first()).toPromise()
    expect(ls1.length).toEqual(3)
    expect(Number(ls1[0].id)).toBeLessThan(Number(ls1[1].id))

    const ls2 = await Event.search(arc, { first: 2, skip: 2, orderBy: 'id' }).pipe(first()).toPromise()
    expect(ls2.length).toEqual(2)
    expect(Number(ls1[2].id)).toEqual(Number(ls2[0].id))

    const ls3 = await Event.search(arc, {  orderBy: 'id', orderDirection: 'desc'}).pipe(first()).toPromise()
    expect(Number(ls3[0].id)).toBeGreaterThanOrEqual(Number(ls3[1].id))
  })

  it('fetchStaticState works as expected', async () => {
    const events = await Event.search(arc).pipe(first()).toPromise()
    const event = events[0]
    // staticState should be set on search
    expect(event.staticState).toBeTruthy()
    const eventFromId = new Event(event.id, arc)
    expect(eventFromId.staticState).not.toBeTruthy()
    await eventFromId.fetchStaticState()
    expect(eventFromId.staticState).toBeTruthy()
    const  eventFromStaticState = new Event(event.staticState as IEventState, arc)
    expect(eventFromStaticState.staticState).toBeTruthy()
  })
})
