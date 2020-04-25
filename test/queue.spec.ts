import { first } from 'rxjs/operators'
import { inspect } from 'util'
import { getTestAddresses, getTestDAO, ITestAddresses,  newArc } from './utils'
import { ContributionRewardProposal, Arc, DAO, Queue } from '../src'

jest.setTimeout(20000)

/**
 * Queue test
 */
describe('Queue', () => {

  let arc: Arc
  let addresses: ITestAddresses
  let dao: DAO

  beforeAll(async () => {
    arc = await newArc()
    addresses = await getTestAddresses()
    dao = await getTestDAO()
  })

  it('Queue is instantiable', () => {
    const queue = new Queue(
      arc,
      '0x1234id',
      new DAO(arc, '0x124daoAddress'),
    )
    expect(queue).toBeInstanceOf(Queue)
  })

  it('Queues are searchable', async () => {
    let result: Queue[]
    result = await Queue.search(arc, {where: {dao: dao.id}})
        .pipe(first()).toPromise()
    // TODO: we should expect 3 queus here, see https://github.com/daostack/subgraph/issues/195
    expect(result.length).toBeGreaterThanOrEqual(2)

  })

  it('Queue.state() is working', async () => {
    const result = await Queue.search(arc, {where: {dao: dao.id}})
        .pipe(first()).toPromise()

    const queue = result[0]
    const state = await queue.fetchState()
    expect(state).toMatchObject({
      id: queue.id
    })
  })

  it('Queue.state() should be equal to proposal.state().queue', async () => {
    const { queuedProposalId } = addresses
    const proposal = await new ContributionRewardProposal(arc, queuedProposalId)
    const proposalState = await proposal.fetchState()
    const queue = new Queue(arc, proposalState.queue.id, proposalState.queue.entity.dao)
    const queueState = await queue.fetchState()

    if(!proposalState.queue.entity.coreState) throw new Error("Proposal's queue coreState not defined")

    console.log(queue.coreState)

    expect(inspect(proposalState.queue.entity.coreState)).toBe(inspect(queueState))
  })

  it('paging and sorting works', async () => {
    const ls1 = await Queue.search(arc, { first: 3, orderBy: 'id' }).pipe(first()).toPromise()
    expect(ls1.length).toEqual(3)
    expect(ls1[0].id <= ls1[1].id).toBeTruthy()

    const ls2 = await Queue.search(arc, { first: 2, skip: 2, orderBy: 'id' }).pipe(first()).toPromise()
    expect(ls2.length).toEqual(2)
    expect(ls1[2].id).toEqual(ls2[0].id)

    const ls3 = await Queue.search(arc, {  orderBy: 'id', orderDirection: 'desc'}).pipe(first()).toPromise()
    expect(ls3[0].id >= ls3[1].id).toBeTruthy()
  })

})
