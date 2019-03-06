/**
 * Load tests for the subgraph.
 * This test tries to break the websocket connectionsu un er load
 */

import BN = require('bn.js')
import { first, take } from 'rxjs/operators'
import { Arc } from '../src/arc'
import { DAO } from '../src/dao'
import { IProposalStage, IProposalState, Proposal, ProposalOutcome } from '../src/proposal'
import { createAProposal, fromWei, getArc, getTestDAO, mineANewBlock, toWei, waitUntilTrue } from './utils'

jest.setTimeout(120000) // 120000 = 120 seconds  = 2 minutes

describe('Stress test', () => {
  let arc: Arc
  let dao: DAO

  beforeAll(async () => {
    arc = await getArc()
    dao = await getTestDAO()
  })

  async function createProposal() {
    const options = {
      beneficiary: '0xffcf8fdee72ac11b5c542428b35eef5769c409f0',
      ethReward: toWei('300'),
      externalTokenAddress: undefined,
      externalTokenReward: toWei('0'),
      nativeTokenReward: toWei('1'),
      periodLength: 12,
      periods: 5,
      reputationReward: toWei('10'),
      type: 'ContributionReward'
    }
    const response = await dao.createProposal(options).send()
    return response.result
  }

  it('many equal queries', async () => {
    const TIMES = 100
    const subscriptions = []
    const results: {[index: number]: any } = {}
    console.log(`Creating ${TIMES} subscriptions to proposals`)
    for (let i = 0; i < TIMES; i++) {
      // console.log(`[${i + 1}/${TIMES}] subscribing to query`)
      results[i] = []
      subscriptions[i] = dao.proposals().subscribe((then) => {
        results[i].push(then)
      })
    }

    async function checkSubscriptionIsResponsive(i: number) {
      // creates a proposal and checks if the subscription gets updated
      console.log(`Checking if ${i} is responding`)
      const proposal = await createProposal()

      // wait until the proposal is indexed
      await  waitUntilTrue(() => {
        const proposalIds = results[i][results[i].length - 1].map((p: Proposal) => p.id)
        return proposalIds.includes(proposal.id.toLowerCase())
      })
    }

    await checkSubscriptionIsResponsive(0)
    await checkSubscriptionIsResponsive(88)
    await checkSubscriptionIsResponsive(88)
    await checkSubscriptionIsResponsive(99)
    await checkSubscriptionIsResponsive(3)
    await checkSubscriptionIsResponsive(12)

  })

  it('many different queries', async () => {
    const TIMES = 300
    console.log(`Creating ${TIMES} various subscriptions`)
    const subscriptions = []
    const results: {[index: number]: any } = {}
    for (let i = 0; i < TIMES; i++) {
      results[i] = []
      console.log(`[${i}/${TIMES}] subscribing to proposals query`)
      const index0 = i
      subscriptions[i] = dao.proposals().subscribe((then) => {
        results[index0].push(then)
      })

      i++
      console.log(`[${i}/${TIMES}] subscribing to another query`)
      results[i] = []
      const index1 = i
      subscriptions[i] = dao.state().subscribe((then) => {
        results[index1].push(then)
      })
      //
      i++
      results[i] = []
      const index2 = i
      subscriptions[i] = dao.members().subscribe((then) => {
        results[index2].push(then)
      })

      i++
      results[i] = []
      // const proposal = await createProposal()
      const index3 = i
      subscriptions[i] = Proposal.search({executedAt_gt: i}, arc).subscribe((then) => {
        results[index3].push(then)
      })
    }

    async function checkProposalSubscriptionIsResponsive(i: number) {
      // creates a proposal and checks if the subscription gets updated
      console.log(`Checking if ${i} is responding`)
      const prop = await createProposal()
      // wait until the proposal is indexed
      await  waitUntilTrue(() => {
        // console.log(results[i])
        const proposalIds = results[i].length > 0 && results[i][results[i].length - 1].map((p: Proposal) => p.id) || []
        return proposalIds.includes(prop.id.toLowerCase())
      })
    }

    await checkProposalSubscriptionIsResponsive(0)
    // await checkProposalSubscriptionIsResponsive(88)
    // await checkProposalSubscriptionIsResponsive(88)
    // await checkProposalSubscriptionIsResponsive(96)
    await checkProposalSubscriptionIsResponsive(4)
    await checkProposalSubscriptionIsResponsive(12)

  })
})
