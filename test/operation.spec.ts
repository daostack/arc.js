import { ITransactionState, ITransactionUpdate } from '../src/'
import { Proposal, IProposalCreateOptionsCR, ContributionReward } from '../src'
import { getTestDAO, mineANewBlock, toWei, waitUntilTrue, getTestScheme } from './utils'
import { IContributionRewardProposalState } from '../src/plugins/contributionReward/proposal'

jest.setTimeout(20000)

describe('Operation', () => {

  it('returns the correct sequence of states', async () => {
    const dao = await getTestDAO()
    const arc = dao.context
    const options: IProposalCreateOptionsCR = {
      beneficiary: '0xffcf8fdee72ac11b5c542428b35eef5769c409f0',
      dao: dao.id,
      ethReward: toWei('300'),
      externalTokenAddress: undefined,
      externalTokenReward: toWei('0'),
      nativeTokenReward: toWei('1'),
      plugin: getTestScheme("ContributionReward")
    }

    const plugin = new ContributionReward(arc, getTestScheme("ContributionReward"))

    // collect the first 4 results of the observable in a a listOfUpdates array
    const listOfUpdates: Array<ITransactionUpdate<Proposal<IContributionRewardProposalState>>> = []
    plugin.createProposal(options).subscribe(
      (next: ITransactionUpdate<Proposal<IContributionRewardProposalState>>) => listOfUpdates.push(next)
    )

    // wait for the transaction to be mined
    // (we expect first a
    // 1 'transaction sending' update
    // 2 'transaction sent' update,
    // 3. then the 0 confirmation)
    await waitUntilTrue(() => listOfUpdates.length === 3)

    // wait for all blocks mined in the reduce step
    for (let i = 0; i < 4; i++) {
      await mineANewBlock()
    }
    // wait forl all updates
    await waitUntilTrue(() => listOfUpdates.length > 4)

    // the first returned value is expected to be the "sending" (i.e. not mined yet)
    expect(listOfUpdates[0]).toMatchObject({
      state: ITransactionState.Sending
    })
    expect(listOfUpdates[1]).toMatchObject({
      state: ITransactionState.Sent
    })
    expect(listOfUpdates[2]).toMatchObject({
      confirmations: 1,
      state: ITransactionState.Mined
    })
    expect(listOfUpdates[2].result).toBeDefined()
    expect(listOfUpdates[2].receipt).toBeDefined()
    expect(listOfUpdates[2].transactionHash).toBeDefined()

    expect(listOfUpdates[2].result ).toBeInstanceOf(Proposal)

    expect(listOfUpdates[3].confirmations).toBeGreaterThanOrEqual(2)
    expect(listOfUpdates[3]).toMatchObject({
      state: ITransactionState.Mined
    })

    // We turn the objects into multi-line strings as a work around,
    // since object comparison using `toMatchObject(...)`
    // is throwing errors due to property type names.
    const splitLines = (str: any) => str.split(/\r?\n/)
    const stringify = (obj: any) => splitLines(JSON.stringify(obj, null, 2))

    // Remove the confirmations
    const recipt4 = listOfUpdates[4].receipt as any
    const recipt2 = listOfUpdates[2].receipt as any
    delete recipt4.confirmations
    delete recipt2.confirmations

    expect(stringify(listOfUpdates[4].receipt))
      .toEqual(stringify(listOfUpdates[2].receipt))

    expect(listOfUpdates[4].confirmations).toBeGreaterThanOrEqual(4)
    expect(listOfUpdates[4].state).toEqual(ITransactionState.Mined)
    expect(listOfUpdates[4].transactionHash)
      .toEqual(listOfUpdates[2].transactionHash)
  })
})
