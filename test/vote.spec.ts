import { first } from 'rxjs/operators'
import { IProposalOutcome, ContributionRewardProposal, Arc, Vote } from '../src/'
import { createAProposal, getTestDAO, newArc, toWei, waitUntilTrue } from './utils'
import { getAddress } from 'ethers/utils'

jest.setTimeout(60000)

/**
 * Stake test
 */
describe('vote', () => {

  let arc: Arc

  beforeAll(async () => {
    arc = await newArc()
  })

  it('Vote is instantiable', () => {
    const vote = new Vote(arc, {
      amount: toWei('100'),
      createdAt: 0,
      id: '0x1234id',
      outcome: IProposalOutcome.Fail,
      proposal: {
        id:'0x12445proposalId',
        entity: new ContributionRewardProposal(arc, '0x12445proposalId')
      },
      voter: '0x124votes'
    })
    expect(vote).toBeInstanceOf(Vote)
  })

  it('Votes are searchable', async () => {
    let result: Vote[] = []
    const dao = await getTestDAO()
    const proposal = await createAProposal(dao)
    // let's have a vote
    await proposal.vote(IProposalOutcome.Pass).send()

    const voteIsIndexed = async () => {
      // we pass no-cache to make sure we hit the server on each request
      result = await Vote.search(arc, {where:  {proposal: proposal.id}}, { fetchPolicy: 'no-cache' })
        .pipe(first()).toPromise()
      return result.length > 0
    }
    await waitUntilTrue(voteIsIndexed)
    if (result) {
      expect(result.length).toEqual(1)
      expect((await result[0].fetchState()).outcome).toEqual(IProposalOutcome.Pass)
    }
    const vote = result[0]

    result = await Vote.search(arc)
      .pipe(first()).toPromise()
    expect(Array.isArray(result)).toBe(true)

    result = await Vote.search(arc, {where: {proposal: '0x12345doesnotexist'}})
      .pipe(first()).toPromise()
    expect(result).toEqual([])

    result = await Vote.search(arc, {where:  {id: '0x12345doesnotexist'}})
      .pipe(first()).toPromise()
    expect(result).toEqual([])

    result = await Vote.search(arc, {where:  {id: vote.id}})
      .pipe(first()).toPromise()
    expect(result.length).toEqual(1)

    const voteState = await vote.fetchState()
    result = await Vote.search(arc, {where: {id: vote.id, voter: getAddress(voteState.voter)}})
      .pipe(first()).toPromise()
    expect(result.length).toEqual(1)
  })

  it('paging and sorting works', async () => {
    const ls1 = await Vote.search(arc, { first: 3, orderBy: 'voter' }).pipe(first()).toPromise()
    expect(ls1.length).toEqual(3)
    expect((await ls1[0].fetchState()).voter <= (await ls1[1].fetchState()).voter).toBeTruthy()

    const ls2 = await Vote.search(arc, { first: 2, skip: 2, orderBy: 'voter' }).pipe(first()).toPromise()
    expect(ls2.length).toEqual(2)
    expect((await ls1[2].fetchState()).voter).toEqual((await ls2[0].fetchState()).voter)

    const ls3 = await Vote.search(arc, {  orderBy: 'voter', orderDirection: 'desc'}).pipe(first()).toPromise()
    expect((await ls3[0].fetchState()).voter <= (await ls3[1].fetchState()).voter).toBeTruthy()
  })

})
