import BN from 'bn.js'
import { first } from 'rxjs/operators'
import { Stake, Arc, DAO, IProposalOutcome, IProposalStage, ContributionRewardProposal } from '../src/'
import { createAProposal,
  // getTestAddresses,
  getTestDAO,
  // ITestAddresses,
  newArc,
  toWei,
  waitUntilTrue
} from './utils'

jest.setTimeout(60000)

describe('Stake on a ContributionReward', () => {
  let arc: Arc
  let accounts: string[]
  // let addresses: ITestAddresses
  let dao: DAO

  beforeAll(async () => {
    arc = await newArc()
    if (!arc.web3) throw new Error('Web3 provider not set')
    accounts = await arc.web3.listAccounts()
    dao = await getTestDAO()
  })

  it('works and gets indexed', async () => {

    const proposal = await createAProposal(dao)
    const stakingToken =  await proposal.stakingToken()

    // approve the spend, for staking
    const votingMachine = await proposal.votingMachine()
    await stakingToken.approveForStaking(votingMachine.address, toWei('100')).send()

    const stake = await proposal.stake(IProposalOutcome.Pass, new BN(100)).send()

    const state =  (stake.result as Stake).coreState
    expect(state).toMatchObject({
      outcome : IProposalOutcome.Pass
    })

    let stakes: Stake[] = []

    const stakeIsIndexed = async () => {
      // we pass no-cache to make sure we hit the server on each request
      stakes = await Stake.search(arc, {where: {proposal: proposal.id}}, { fetchPolicy: 'no-cache' })
        .pipe(first()).toPromise()
      return stakes.length > 0
    }
    await waitUntilTrue(stakeIsIndexed)

    expect(stakes.length).toEqual(1)
  })

  it('throws a meaningful error if an insufficient amount tokens is approved for staking', async () => {
    const stakingToken =  arc.GENToken().contract()
    const proposal = await createAProposal(dao)
    arc.setAccount(accounts[0])
    await stakingToken
      .mint(accounts[2], toWei('100').toString())
    proposal.context.defaultAccount = accounts[2]
    await expect(proposal.stake(IProposalOutcome.Pass, toWei('100')).send()).rejects.toThrow(
      /insufficient allowance/i
    )
  })

  it('throws a meaningful error if then senders balance is too low', async () => {
    const proposal = await createAProposal(dao)
    proposal.context.defaultAccount = accounts[4]
    await expect(proposal.stake(IProposalOutcome.Pass, toWei('10000000')).send()).rejects.toThrow(
      /insufficient balance/i
    )
  })

  it('throws a meaningful error if the proposal does not exist', async () => {
    // a non-existing proposal
    const proposal = new ContributionRewardProposal(
      arc,
      '0x1aec6c8a3776b1eb867c68bccc2bf8b1178c47d7b6a5387cf958c7952da267c2',
    )

    proposal.context.defaultAccount = accounts[2]
    await expect(proposal.stake(IProposalOutcome.Pass, new BN(10000000)).send()).rejects.toThrow(
      /Fetch state returned null. Entity not indexed yet or does not exist with this id/i
    )
  })

  it.skip('throws a meaningful error if the proposal is boosted', async () => {
    // Skipping this test, because the "stake" function actually also changes the proposal state sometimes
    const boostedProposals = await arc.proposals({where: {stage: IProposalStage.Boosted}}).pipe(first()).toPromise()
    if (boostedProposals.length === 0) {
      throw Error(`No boosted proposals were found, so this test fails... (perhap restart docker containers?)`)
    }
    const boostedProposal = boostedProposals[0]
    const state = await boostedProposal.fetchState()
    expect(state.stage).toEqual(IProposalStage.Boosted)
    await expect(boostedProposal.stake(IProposalOutcome.Pass, new BN(10000000)).send()).rejects.toThrow(
      /boosted/i
    )
  })

  it('stake gets correctly indexed on the proposal entity', async () => {
    const proposal = await createAProposal()

    const stakeHistory: Stake[][] = []
    proposal.stakes().subscribe((next: Stake[]) => {
      stakeHistory.push(next)
    })
    const lastStake = () => {
      if (stakeHistory.length > 0) {
       return stakeHistory[stakeHistory.length - 1]
     } else {
       return []
     }
    }
    await proposal.stake(IProposalOutcome.Pass, new BN(100)).send()
    await waitUntilTrue(() => {
      const ls = lastStake()
      return ls.length > 0
    })
    const state = await lastStake()[0].fetchState()
    expect(state.outcome).toEqual(IProposalOutcome.Pass)
  })

})
