import { first } from 'rxjs/operators'
import { Arc } from '../src/arc'
import { DAO, IDAOState } from '../src/dao'
import { IMemberState, Member } from '../src/member'
import { IProposalOutcome, AnyProposal } from '../src'
import { Stake } from '../src/stake'
import { Address } from '../src/'
import { Vote } from '../src/vote'
import { createAProposal, fromWei,
  getTestDAO, newArc, toWei, waitUntilTrue } from './utils'

jest.setTimeout(60000)

/**
 * Member test
 */
describe('Member', () => {

  let arc: Arc
  let defaultAccount: Address
  let dao: DAO
  let daoState: IDAOState

  beforeAll(async () => {
    arc = await newArc()
    dao = await getTestDAO()
    daoState = await dao.fetchState()

    if(!arc.web3) throw new Error("Web3 provider not set")
    defaultAccount = arc.defaultAccount? arc.defaultAccount: await arc.web3.getSigner().getAddress()
  })

  it('Member is instantiable', () => {
    const member = new Member(arc, Member.calculateId({
      address: defaultAccount,
      contract: daoState.reputation.entity.address
    }))
    expect(member).toBeInstanceOf(Member)
    const memberFromId = new Member(arc, '0xsomeId')
    expect(memberFromId).toBeInstanceOf(Member)
  })

  it('Member state works', async () => {
    const members = await Member.search(arc, {where: { dao: dao.id}}).pipe(first()).toPromise()
    const member = members[0]
    const memberState = await member.fetchState()
    expect(Number(memberState.reputation)).toBeGreaterThan(0)
    expect(memberState.dao.id).toBe(dao.id.toLowerCase())
  })

  it('Member is usable without knowing id or contract', async () => {
    const members = await Member.search(arc, {where: { dao: dao.id}}).pipe(first()).toPromise()
    const member = members[0]
    const memberState = await member.fetchState()
    const newMember = new Member(arc, Member.calculateId({
      contract: daoState.reputation.entity.address,
      address: memberState.address
    }))
    const newMemberState = await newMember.fetchState()
    expect(memberState).toEqual(newMemberState)
  })

  it('Member proposals() works', async () => {
    const member = new Member(arc, Member.calculateId({ address: defaultAccount, contract: daoState.reputation.entity.address }))
    let proposals: AnyProposal[] = []
    member.proposals().subscribe((next: AnyProposal[]) => proposals = next)
    // wait until the proposal has been indexed
    await waitUntilTrue(() => proposals.length > 0)

    expect(proposals.length).toBeGreaterThan(0)
    expect(proposals[0].id).toBeDefined()
  })

  it('Member stakes() works', async () => {
    if (!arc.web3) throw new Error('Web3 provider not set')
    const stakerAccount = await arc.web3.getSigner(0).getAddress()
    const member = new Member(arc, Member.calculateId({ address: stakerAccount, contract: daoState.reputation.entity.address}))
    const proposal = await createAProposal()
    const stakingToken =  await proposal.stakingToken()

    // mint tokens with defaultAccount
    await stakingToken.mint(stakerAccount, toWei('10000')).send()
    // switch the defaultAccount to a fresh one

    stakingToken.context.defaultAccount = stakerAccount
    const votingMachine = await proposal.votingMachine()

    await stakingToken.approveForStaking(votingMachine.address, toWei('1000')).send()

    await proposal.stake(IProposalOutcome.Pass, toWei('99')).send()
    let stakes: Stake[] = []
    member.stakes({ where: { proposal: proposal.id}}).subscribe(
      (next: Stake[]) => { stakes = next }
    )
    // wait until the proposal has been indexed

    console.log(stakes)

    await waitUntilTrue(() => stakes.length > 0)

    expect(stakes.length).toBeGreaterThan(0)

    const stakeState = await stakes[0].fetchState()
    expect(stakeState.staker).toEqual(stakerAccount.toLowerCase())
    expect(fromWei(stakeState.amount)).toEqual('99.0')
    // clean up after test
    arc.defaultAccount = defaultAccount
  })

  it('Member votes() works', async () => {
    const member = new Member(arc, Member.calculateId({
      address: defaultAccount,
      contract: daoState.reputation.entity.address
    }))
    const proposal = await createAProposal()
    const votes: Vote[][] = []
    member.votes().subscribe((next: Vote[]) => votes.push(next))
    await waitUntilTrue(() => votes.length > 0)
    await proposal.vote(IProposalOutcome.Pass).send()
    await waitUntilTrue(() => votes.length > 1)
    expect(votes[votes.length - 1].length).toBeGreaterThan(0)
    const proposalIds: string[] = []
    await Promise.all(votes[votes.length - 1].map(async (vote) => {
      const voteState = await vote.fetchState()
      proposalIds.push(voteState.proposal.id)
    }))
    expect(proposalIds).toContain(proposal.id)
  })

  it('Members are searchable', async () => {
    let members: Member[] = []

    Member.search(arc)
      .subscribe((result) => members = result)

    await waitUntilTrue(() => members.length !== 0)

    expect(members.length).toBeGreaterThanOrEqual(10)
  })

  it('paging and sorting works', async () => {
    const ls1 = await Member.search(arc, { first: 3, orderBy: 'address' }).pipe(first()).toPromise()
    expect(ls1.length).toEqual(3)
    expect((ls1[0].coreState as IMemberState).address <=
      (ls1[1].coreState as IMemberState).address).toBeTruthy()

    const ls2 = await Member.search(arc, { first: 2, skip: 2, orderBy: 'address' }).pipe(first()).toPromise()
    expect(ls2.length).toEqual(2)
    expect((ls1[2].coreState as IMemberState).address)
      .toEqual((ls2[0].coreState as IMemberState).address)

    const ls3 = await Member.search(arc, {  orderBy: 'address', orderDirection: 'desc'}).pipe(first()).toPromise()
    expect((ls3[0].coreState as IMemberState).address >=
      (ls3[1].coreState as IMemberState).address).toBeTruthy()
  })

  it('member: generate id is correctly', async () => {
    const members = await Member.search(arc).pipe(first()).toPromise()
    const member = members[0]
    const memberState = await member.fetchState()
    expect(memberState.contract).toBeTruthy()
    const calculatedId = Member.calculateId({contract: memberState.contract as string, address: memberState.address})
    expect(memberState.id).toEqual(calculatedId)
    //
    // const newMember = new Member(
    //   { contract: memberState.contract, dao: memberState.dao, address: memberState.address}, arc)
    // const newMemberState = await newMember.fetchState()
    // expect(newMemberState.id).toEqual(memberState.id)
    // const newMemberState = await newMember.fetchState()
    // expect(newMemberState.id).toEqual(memberState.id)
  })
})
