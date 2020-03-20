import { IProposalOutcome } from '../src/proposal'
import { Reward } from '../src/reward'
import { Vote } from '../src/vote'
import { createAProposal,
  voteToPassProposal,
  waitUntilTrue
} from './utils'

jest.setTimeout(60000)

describe('Vote on a ContributionReward', () => {

  it('reward gets correctly indexed on the proposal entity', async () => {
    const proposal = await createAProposal()


    const voteHistory: Vote[][] = []
    const rewardHistory: Reward[][] = []
    proposal.votes().subscribe((next: Vote[]) => {
      voteHistory.push(next)
    })
    proposal.rewards().subscribe((next: Reward[]) => {
      rewardHistory.push(next)
    })

    const lastRewards = () => {
      if (rewardHistory.length > 0) {
       return rewardHistory[rewardHistory.length - 1]
     } else {
       return []
     }
    }
    await proposal.vote(IProposalOutcome.Pass).send()

    await voteToPassProposal(proposal)

    if(!proposal.context.web3) throw new Error('Web3 provider not set')

    const defaultAccount = proposal.context.defaultAccount? proposal.context.defaultAccount : await proposal.context.web3.getSigner().getAddress()

    await waitUntilTrue(() => lastRewards().length > 1)
    expect(lastRewards().map((r: Reward) => (r.staticState as any).beneficiary))
      .toContain(defaultAccount.toLowerCase())
  })

})
