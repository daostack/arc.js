import { first } from 'rxjs/operators'
import {
  Arc,
  Competition,
  CompetitionSuggestion,
  CompetitionVote,
  DAO,
  // ISchemeStaticState,
  IProposalStage,
  IProposalState,
  Proposal,
  Scheme
  } from '../src'
import {
  // createAProposal,
  // getTestAddresses, ITestAddresses,
  newArc,
  // timeTravel,
  toWei,
  voteToPassProposal,
  waitUntilTrue } from './utils'

jest.setTimeout(60000)

/**
 * Proposal test
 */
describe('Proposal', () => {
  let arc: Arc

  beforeAll(async () => {
    arc = await newArc()
  })

  it('CompetitionSuggestion.calculateId works', async () => {
    function calc(scheme: string, suggestionId: string) {
      return CompetitionSuggestion.calculateId({scheme, suggestionId})

    }
    expect(calc('0xefc4d4e4ff5970c02572d90f8d580f534508f3377a17880e95c2ba9a6d670622',
                '8'))
      .toEqual('0x1c5a3d7aa889aff71dc8f5de18956b7b1e821c823f3f358d9eb74d18f135fa13')
    expect(calc('0xefc4d4e4ff5970c02572d90f8d580f534508f3377a17880e95c2ba9a6d670622',
                '8'))
      .toEqual('0x1c5a3d7aa889aff71dc8f5de18956b7b1e821c823f3f358d9eb74d18f135fa13')

    expect(calc('0xefc4d4e4ff5970c02572d90f8d580f534508f3377a17880e95c2ba9a6d670622',
                '14'))
      .toEqual('0x137446f8b5c791e505e6e8228801ed78555a4e35957fd0b026b70fc3f262b629')
  })

  it('Create a competition proposal, compete, win the competition..', async () => {
    // we'll get a `ContributionRewardExt` contract
    const ARC_VERSION = '0.0.1-rc.36'
    const contributionRewardExtContract  = arc.getContractInfoByName(`ContributionRewardExt`, ARC_VERSION)
    // find the corresponding scheme object
    const contributionRewardExts = await arc
      .schemes({where: {address: contributionRewardExtContract.address}}).pipe(first()).toPromise()

    const contributionRewardExt = contributionRewardExts[0]
    const contributionRewardExtState = await contributionRewardExt.state().pipe(first()).toPromise()
    const dao = new DAO(contributionRewardExtState.dao, arc)

    // @ts-ignore
    function addSeconds(date: Date, seconds: number) {
      if (!(date instanceof Date)) {
        throw Error(`Input should be a Date instance, got ${date} instead`)
      }
      const result = new Date()
      result.setTime(date.getTime() + (seconds * 1000))
      return result
    }
    // TODO: test error handling for all these params
    // - all args are present
    // - order of times
    const now = new Date()
    now.setTime(Math.floor((new Date()).getTime() / 1000) * 1000)
    console.log('00000000000000000000000000000000000000000000000000000000000000000000000')
    const startTime = addSeconds(now, 2)
    const proposalOptions  = {
      beneficiary: '0xffcf8fdee72ac11b5c542428b35eef5769c409f0',
      dao: dao.id,
      endTime: addSeconds(startTime, 3000),
      ethReward: toWei('300'),
      externalTokenAddress: undefined,
      externalTokenReward: toWei('0'),
      nativeTokenReward: toWei('1'),
      numberOfVotesPerVoter: 3,
      proposalType: 'competition',
      reputationReward: toWei('10'),
      rewardSplit: [1, 2, 97],
      scheme: contributionRewardExtState.address,
      startTime,
      suggestionsEndTime: addSeconds(startTime, 100),
      value: 0,
      votingStartTime: addSeconds(startTime, 120)
    }

    const tx = await dao.createProposal(proposalOptions).send()
    const proposal = tx.result
    expect(proposal).toBeInstanceOf(Proposal)

    const states: IProposalState[] = []
    const lastState = (): IProposalState => states[states.length - 1]
    proposal.state().subscribe((pState: IProposalState) => {
      states.push(pState)
    })
    await waitUntilTrue(() => !!lastState())

    expect(lastState()).toMatchObject({
      stage: IProposalStage.Queued
    })
    expect(lastState().contributionReward).toMatchObject({
      alreadyRedeemedEthPeriods: 0,
      ethReward: toWei('300'),
      nativeTokenReward: toWei('1'),
      reputationReward: toWei('10')
    })
    expect(lastState().competition).toMatchObject({
      endTime: proposalOptions.endTime,
      numberOfVotesPerVoter: proposalOptions.numberOfVotesPerVoter,
      numberOfWinners: 3,
      snapshotBlock: null,
      startTime: proposalOptions.startTime,
      suggestionsEndTime: proposalOptions.suggestionsEndTime,
      votingStartTime: proposalOptions.votingStartTime
    })

    // accept the proposal by voting for et
    await voteToPassProposal(proposal)

    await waitUntilTrue(() => (lastState().stage === IProposalStage.Executed))
    expect(lastState()).toMatchObject({
      stage: IProposalStage.Executed
    })

    // now we should have a competition object available...
    const scheme = new Scheme(lastState().scheme.id, arc)
    // check sanity for scheme
    const schemeState = await scheme.state().pipe(first()).toPromise()
    expect(schemeState.address).toEqual(lastState().scheme.address)

    const competitions = await scheme.competitions({ where: {id: proposal.id}}).pipe(first()).toPromise()
    expect(competitions.length).toEqual(1)
    const competition = competitions[0]
    expect(competition).toBeInstanceOf(Competition)
    expect(competition.id).toEqual(proposal.id)
    // lets submit a solution
    const suggestion1Options = {
      description: 'descxription',
      proposalId: proposal.id,
      tags: ['tag1', 'tag2'],
      title: 'title',
      url: 'https://somewhere.some.place'
    }
    // await timeTravel(110, arc.web3)
    const receipt1 = await scheme.competitionCreateSuggestion(suggestion1Options).send()
    const suggestion1 = receipt1.result
    expect(suggestion1).toBeDefined()
    expect(suggestion1).toBeInstanceOf(CompetitionSuggestion)
    const suggestion2Options = { ...suggestion1Options, title: 'suggestion nr 2'}
    const receipt2 = await scheme.competitionCreateSuggestion(suggestion2Options).send()
    const suggestion2 = receipt2.result
    // // we now should find 2 suggestions

    let suggestionIds: string[] = []
    competition.suggestions().subscribe((ls) => {suggestionIds = ls.map((x) => x.id)})
    await waitUntilTrue(() => suggestionIds.indexOf(suggestion2.id) > -1)

    // // and lets vote for the first suggestion
    // TODO: would be nice to be able to vote directly from the suggestion
    // const vote = await suggestion1.vote().send()
    const voteReceipt = await scheme.competitionVote({ suggestionId: suggestion2.id}).send()
    const vote = voteReceipt.result
    // // the vote should be counted
    expect(vote).toBeInstanceOf(CompetitionVote)
    const votes = await suggestion1.votes().pipe(first()).toPromise()
    expect(votes.length).toEqual(1)

  })
})
