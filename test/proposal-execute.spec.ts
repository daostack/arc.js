import BN from 'bn.js'
import {
  Arc, ContributionRewardProposal, DAO,
  IProposalCreateOptionsCR, IProposalOutcome, IProposalStage, IProposalState } from '../src'
import { advanceTime, createAProposal, createCRProposal, fromWei, getTestAddresses,
  getTestDAO, ITestAddresses, newArc,
  toWei, voteToPassProposal, waitUntilTrue } from './utils'

jest.setTimeout(40000)

describe('Proposal execute()', () => {
  let arc: Arc
  let addresses: ITestAddresses
  let dao: DAO
  let executedProposal: ContributionRewardProposal

  beforeAll(async () => {
    arc = await newArc()
    addresses = await getTestAddresses()
    dao = await getTestDAO()
    executedProposal = new ContributionRewardProposal(arc, addresses.executedProposalId)
  })

  it('runs correctly through the stages', async () => {

    const beneficiary = '0xffcf8fdee72ac11b5c542428b35eef5769c409f0'
    if (!arc.web3) {
      throw new Error('Web3 provider not set')
    }
    const accounts = await arc.web3.listAccounts()
    const state = await executedProposal.fetchState()
    const pluginState = await state.plugin.entity.fetchState()

    const options: IProposalCreateOptionsCR = {
      beneficiary,
      dao: dao.id,
      ethReward: toWei('4'),
      externalTokenAddress: undefined,
      externalTokenReward: toWei('3'),
      nativeTokenReward: toWei('2'),
      reputationReward: toWei('1'),
      plugin: pluginState.address
    }

    let proposalState: IProposalState
    const proposalStates: IProposalState[] = []
    const lastState = () => proposalStates[proposalStates.length - 1]

    const proposal = await createCRProposal(arc, options)

    proposal.state({}).subscribe(
      (next: IProposalState) => {
        if (next) {
          proposalStates.push(next)
        }
      },
      (error: Error) => { throw error }
    )

    // wait until the propsal is indexed
    await waitUntilTrue(() => proposalStates.length > 0)
    expect(lastState().stage).toEqual(IProposalStage.Queued)

    // calling execute in this stage has no effect on the stage
    await proposal.execute().send()

    await proposal.vote(IProposalOutcome.Pass).send()

    // wait until the votes have been counted
    await waitUntilTrue(() => lastState().votesFor.gt(new BN(0)))
    proposalState = lastState()
    expect(proposalState.stage).toEqual(IProposalStage.Queued)
    expect(Number(fromWei(proposalState.votesFor))).toBeGreaterThan(0)
    expect(fromWei(proposalState.votesAgainst)).toEqual('0.0')

    const amountToStakeFor = toWei(10000)
    await proposal.stakingToken().mint(accounts[0], amountToStakeFor).send()
    await proposal.stakingToken()
      .approveForStaking(proposalState.votingMachine, amountToStakeFor.add(new BN(1000))).send()

    await proposal.execute().send()

    await proposal.stake(IProposalOutcome.Pass, amountToStakeFor).send()

    await waitUntilTrue(() => lastState().stakesFor.gt(new BN(0)))
    proposalState = lastState()

    expect(Number(fromWei(proposalState.stakesFor))).toBeGreaterThan(0)
    expect(proposalState.stage).toEqual(IProposalStage.PreBoosted)

    // TODO: find out why the state is not updated to Boosted akreadt at this point
    await advanceTime(60000 * 60) // 30 minutes
    proposal.context.defaultAccount = accounts[2]
    await proposal.vote(IProposalOutcome.Pass).send()
    proposal.context.defaultAccount = accounts[0]

    await waitUntilTrue(() => {
      return lastState().stage === IProposalStage.Boosted
    })
    expect(lastState().stage).toEqual(IProposalStage.Boosted)
  })

  it('throws a meaningful error if the proposal does not exist', async () => {
    // a non-existing proposal
    const proposal = new ContributionRewardProposal(
      arc,
      '0x1aec6c8a3776b1eb867c68bccc2bf8b1178c47d7b6a5387cf958c7952da267c2'
    )
    await expect(proposal.execute().send()).rejects.toThrow(
      /Fetch state returned null. Entity not indexed yet or does not exist with this id/i
    )
  })

  it('execute a proposal by voting only', async () => {
    // daoBalance
    const daoState = await dao.fetchState()
    const repTotalSupply = daoState.reputationTotalSupply
    const proposalStates: IProposalState[] = []
    const lastState = () => proposalStates[proposalStates.length - 1]
    const proposal = await createAProposal(dao,  { ethReward: new BN(0)})
    proposal.state({}).subscribe((state: IProposalState) => {
      proposalStates.push(state)
    })
    // calling "execute" immediately will have no effect, because the proposal is not
    await waitUntilTrue(() => proposalStates.length === 1)
    expect(lastState().stage).toEqual(IProposalStage.Queued)
    // this execution will not change the state, because the quorum is not met
    await proposal.execute().send()
    expect(lastState().stage).toEqual(IProposalStage.Queued)
    expect(lastState().executedAt).toEqual(0)

    await voteToPassProposal(proposal)
    // wait until all votes have been counted
    await waitUntilTrue(() => {
      return lastState().executedAt !== 0
    })
    expect(Number(lastState().votesFor.toString())).toBeGreaterThan(Number(repTotalSupply.div(new BN(2)).toString()))

    /// with the last (winning) vote, the proposal is already executed
    await expect(proposal.execute().send()).rejects.toThrow(
      // TODO: uncomment when Ethers.js supports revert reasons, see thread:
      // https://github.com/ethers-io/ethers.js/issues/446
      // /already executed/i
      /transaction: revert/i
    )

    // check the state
    expect(lastState().stage).toEqual(IProposalStage.Executed)
    expect(lastState().executedAt).not.toEqual(null)
  })
})
