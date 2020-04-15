import { first } from 'rxjs/operators'
import { Arc, DAO, Event, IEventState, Proposal, ContributionRewardProposal, ContributionReward, IProposalCreateOptionsCR } from '../src'
import { getTestAddresses, getTestDAO, ITestAddresses, newArc, toWei, waitUntilTrue, createCRProposal } from './utils'

jest.setTimeout(20000)

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
    const event = new Event(arc, id)
    expect(event).toBeInstanceOf(Event)
  })

  it('Events are searchable and have a state', async () => {

    // create a proposal with some events
    const beneficiary = '0xffcf8fdee72ac11b5c542428b35eef5769c409f0'
    
    const options: IProposalCreateOptionsCR = {
      beneficiary,
      dao: dao.id,
      ethReward: toWei('300'),
      externalTokenAddress: undefined,
      externalTokenReward: toWei('0'),
      nativeTokenReward: toWei('1'),
      plugin: testAddresses.base.ContributionReward,
      title: 'a-title',
      proposalType: "ContributionReward"
    }

    const proposal = await createCRProposal(arc, testAddresses.base.ContributionReward, options)

    expect(proposal).toBeDefined()

    let result: Event[] = []

    await waitUntilTrue(async () => {
      result = await Event.search(arc, { where: {proposal: proposal.id}}, {fetchPolicy: 'no-cache'})
        .pipe(first()).toPromise()
      return result.length > 0
    })
    expect(result.length).toEqual(1)
    const event = result[0]
    const eventState = await event.fetchState()

    expect(eventState).toMatchObject({
      dao: dao.id,
      data: {title: 'a-title'},
      id: event.id,
      proposal: proposal.id,
      type: 'NewProposal'
    })

    expect(() => Event.search(arc, {where: {dao: ''}})).toThrowError(
      /not a valid address/i
    )
    result = await Event.search(arc, { where: {dao: dao.id}})
        .pipe(first()).toPromise()
    const allEvents = await Event.search(arc, {first: 1000}).pipe(first()).toPromise()
    expect(allEvents.length).toBeGreaterThan(result.length)

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

  it('fetchState works as expected', async () => {
    const events = await Event.search(arc).pipe(first()).toPromise()
    const event = events[0]
    // State should be set on search
    expect(event.coreState).toBeTruthy()

    // for events, the State is quel to the event state
    const state = await event.fetchState()
    expect(state).toEqual(event.coreState)

    const eventFromId = new Event(arc, event.id)
    expect(eventFromId.coreState).not.toBeTruthy()
    await eventFromId.fetchState()
    expect(eventFromId.coreState).toBeTruthy()
    const  eventFromState = new Event(arc, event.coreState as IEventState)
    expect(eventFromState.coreState).toBeTruthy()
  })

  it('arc.events() works', async () => {
    const eventsWithProposal = await arc.events({where: {proposal_not: null}}).pipe(first()).toPromise()
    expect(eventsWithProposal.length).toBeGreaterThan(1)
    const events1 = await arc
      .events({where: {proposal_in: [
        (eventsWithProposal[0].coreState as IEventState).proposal,
        (eventsWithProposal[1].coreState as IEventState).proposal
      ]}})
      .pipe(first()).toPromise()
    expect(events1.length).toBeGreaterThanOrEqual(2)
    expect(events1.length).toBeLessThan(eventsWithProposal.length)

    const eventsWithDAO = await arc.events({where: {proposal_not: null}}).pipe(first()).toPromise()
    expect(eventsWithDAO.length).toBeGreaterThan(1)
    const events2 = await arc
      .events({where: {dao_in: [
        (eventsWithDAO[0].coreState as IEventState).dao,
        (eventsWithDAO[1].coreState as IEventState).dao
      ]}})
      .pipe(first()).toPromise()
    expect(events2.length).toBeGreaterThanOrEqual(2)

    const eventsWithUser = await arc.events({where: {user_not: null}}).pipe(first()).toPromise()
    expect(eventsWithUser.length).toBeGreaterThan(1)
    const events3 = await arc
      .events({where: {user_in: [
        (eventsWithUser[0].coreState as IEventState).user,
        (eventsWithUser[1].coreState as IEventState).user
      ]}})
      .pipe(first()).toPromise()
    expect(events3.length).toBeGreaterThanOrEqual(2)

  })
})
