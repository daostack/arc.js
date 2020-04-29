import BN from 'bn.js'
import gql from 'graphql-tag'
import { first } from 'rxjs/operators'
import {
  Arc,
  Competition as CompetitionPlugin,
  CompetitionProposal,
  CompetitionSuggestion,
  CompetitionVote,
  DAO,
  ICompetitionProposalState,
  ICompetitionSuggestionState,
  IProposalStage,
  IProposalState,
  Proposal,
  Plugin,
  IProposalCreateOptionsComp,
  getBlockTime,
  ContributionRewardExt
} from '../src'
import {
  advanceTimeAndBlock,
  newArc,
  toWei,
  voteToPassProposal,
  waitUntilTrue
} from './utils'
import { BigNumber } from 'ethers/utils'
import { inspect } from 'util'

jest.setTimeout(40000)

describe('Competition Proposal', () => {
  let arc: Arc
  let dao: DAO
  let contributionRewardExt: ContributionRewardExt
  let contributionRewardExtAddress: string
  let address0: string
  let address1: string
  const ethReward = new BN('300')
  const reputationReward = new BN('10111')

  function addSeconds(date: Date, seconds: number) {
    if (!(date instanceof Date)) {
      throw Error(`Input should be a Date instance, got ${date} instead`)
    }
    const result = new Date()
    result.setTime(date.getTime() + (seconds * 1000))
    return result
  }

  async function getPosition(suggestion: CompetitionSuggestion) {
    const state = await suggestion.state({ fetchPolicy: 'no-cache'}).pipe(first()).toPromise()
    return state.positionInWinnerList
  }

  async function isWinner(suggestion: CompetitionSuggestion) {
    const state = await suggestion.state({fetchPolicy: 'no-cache'}).pipe(first()).toPromise()
    return state.isWinner
  }

  beforeAll(async () => {
    arc = await newArc()
    // we'll get a `ContributionRewardExt` contract
    const contributionRewardExts = await arc
      .plugins({ where: { name: "ContributionRewardExt" } }).pipe(first()).toPromise()

    contributionRewardExt = contributionRewardExts[0] as ContributionRewardExt

    const contributionRewardExtState = await contributionRewardExt.fetchState()
    contributionRewardExtAddress = contributionRewardExtState.address
    await contributionRewardExtState.dao.entity.fetchState()

    if(!contributionRewardExtState.dao.entity.coreState) throw new Error("Dao coreState not defined")

    dao = new DAO(arc, contributionRewardExtState.dao.entity.coreState)

    if (!arc.web3) throw new Error('Web3 provider not set')
    address0 = (await arc.web3.getSigner(0).getAddress()).toLowerCase()
    address1 = (await arc.web3.getSigner(1).getAddress()).toLowerCase()
  })

  async function createCompetition(options: {
      rewardSplit?: number[],
      proposerIsAdmin?: boolean
    }  = {}) {
    const plugin = new  CompetitionPlugin(arc, contributionRewardExt.id)

    // make sure that the DAO has enough Ether to pay forthe reward

    if(!arc.web3) throw new Error('Web3 provider not set')

    await arc.web3.getSigner().sendTransaction({
      gasLimit: 4000000,
      gasPrice: 100000000000,
      to: dao.id,
      value: new BigNumber(ethReward.toString()).toHexString()
    })
    const externalTokenReward = new BN(0)
    const nativeTokenReward = new BN(0)
    const now = await getBlockTime(arc.web3)
    const startTime = addSeconds(now, 2)
    const rewardSplit = options.rewardSplit || [80, 20]
    const proposalOptions: IProposalCreateOptionsComp = {
      dao: dao.id,
      endTime: addSeconds(startTime, 200),
      ethReward,
      externalTokenAddress: undefined,
      externalTokenReward,
      nativeTokenReward,
      numberOfVotesPerVoter: 3,
      proposerIsAdmin: options.proposerIsAdmin,
      reputationReward,
      rewardSplit,
      startTime,
      suggestionsEndTime: addSeconds(startTime, 100),
      votingStartTime: addSeconds(startTime, 0)
    }

    // CREATE PROPOSAL

    //TODO: this actually creates a CRExt proposal, not a competition one. Therefore, its fetchState itemMapper fails.
    const tx = await plugin.createProposal(proposalOptions).send()

    if(!tx.result) throw new Error("Create proposal yielded no results")

    const proposal = new CompetitionProposal(arc, tx.result.id)

    const proposalStates = []
    proposal.state({}).subscribe(pstate => { 
      if(pstate) proposalStates.push(pstate)
    })

    await waitUntilTrue(() => proposalStates.length > 0)

    await proposal.fetchState()

    // accept the proposal by voting for et
    await voteToPassProposal(proposal)
    await proposal.redeemRewards().send()

    //TODO: the scheme name in the following query is ContributionRewardExt, therefore thats the ItemMapper called.

    // find the competition
    const competitions = await Proposal.search(arc, { where: {id: proposal.id}}).pipe(first()).toPromise() as CompetitionProposal[]
    const competition = competitions[0]

    // lets create some suggestions
    const suggestion1Options = {
      beneficiary: address1,
      description: 'descxription',
      proposal: proposal.id,
      // tags: ['tag1', 'tag2'],
      title: 'title',
      url: 'https://somewhere.some.place'
    }
    const suggestion2Options = { ...suggestion1Options, beneficiary: address1, title: 'suggestion nr 2'}
    const suggestion3Options = { ...suggestion1Options, beneficiary: address1, title: 'suggestion nr 3'}
    const suggestion4Options = { ...suggestion1Options, beneficiary: address0, title: 'suggestion nr 4'}

    const receipt1 = await competition.createSuggestion(suggestion1Options).send()
    const suggestion1 = receipt1.result as CompetitionSuggestion
    const receipt2 = await competition.createSuggestion(suggestion2Options).send()
    const suggestion2 = receipt2.result as CompetitionSuggestion
    const receipt3 = await competition.createSuggestion(suggestion3Options).send()
    const suggestion3 = receipt3.result as CompetitionSuggestion
    const receipt4 = await competition.createSuggestion(suggestion4Options).send()
    const suggestion4 = receipt4.result as CompetitionSuggestion

    // wait until suggestions are properly indexed
    let suggestionIds: string[] = []
    const sub = competition.suggestions()
      .subscribe((ls: CompetitionSuggestion[]) => {
        suggestionIds = ls.map((x: CompetitionSuggestion) => x.id)
      }
    )

    await waitUntilTrue(() => suggestionIds.indexOf(suggestion2.id) > -1)
    await waitUntilTrue(() => suggestionIds.indexOf(suggestion3.id) > -1)
    await waitUntilTrue(() => suggestionIds.indexOf(suggestion4.id) > -1)

    sub.unsubscribe()

    return {
      competition,
      suggestions: [
        suggestion1,
        suggestion2,
        suggestion3,
        suggestion4
      ]
    }
  }

  it('CompetitionSuggestion.calculateId works', async () => {
    function calc(plugin: string, suggestionId: number) {
      return CompetitionSuggestion.calculateId({ plugin, suggestionId })

    }
    expect(calc('0xefc4d4e4ff5970c02572d90f8d580f534508f3377a17880e95c2ba9a6d670622', 8))
      .toEqual('0x1c5a3d7aa889aff71dc8f5de18956b7b1e821c823f3f358d9eb74d18f135fa13')
    expect(calc('0xefc4d4e4ff5970c02572d90f8d580f534508f3377a17880e95c2ba9a6d670622', 8))
      .toEqual('0x1c5a3d7aa889aff71dc8f5de18956b7b1e821c823f3f358d9eb74d18f135fa13')
    expect(calc('0xefc4d4e4ff5970c02572d90f8d580f534508f3377a17880e95c2ba9a6d670622', 14))
      .toEqual('0x137446f8b5c791e505e6e8228801ed78555a4e35957fd0b026b70fc3f262b629')
  })

  it('create a competition proposal with starttime set to null', async () => {
    const plugin = new CompetitionPlugin(arc,contributionRewardExt.id)
    // TODO: test error handling for all these params
    // - all args are present
    // - order of times
    if (!arc.web3) throw Error('Web3 provider not set')
    const now = await getBlockTime(arc.web3)
    const startTime = addSeconds(now, 3)
    const proposalOptions: IProposalCreateOptionsComp = {
      dao: dao.id,
      endTime: addSeconds(startTime, 2000),
      ethReward,
      externalTokenAddress: undefined,
      externalTokenReward: toWei('0'),
      nativeTokenReward: toWei('1'),
      numberOfVotesPerVoter: 3,
      reputationReward,
      rewardSplit: [1, 2, 97],
      startTime: null,
      suggestionsEndTime: addSeconds(startTime, 1000),
      votingStartTime: addSeconds(startTime, 200)
    }

    // CREATE PROPOSAL
    const tx = await plugin.createProposal(proposalOptions).send()

    if(!tx.result) throw new Error("Create proposal yielded no results")

    const proposal1 = new CompetitionProposal(arc, tx.result.id)
    expect(proposal1).toBeInstanceOf(Proposal)

    const states: IProposalState[] = []
    const lastState = (): IProposalState => states[states.length - 1]
    const sub = proposal1.state({}).subscribe((pState: IProposalState) => {
      states.push(pState)
    })
    await waitUntilTrue(() => !!lastState())
    sub.unsubscribe()

    expect(lastState()).toMatchObject({
      stage: IProposalStage.Queued
    })
    expect((lastState() as ICompetitionProposalState).startTime).toBeDefined()
  })

  it('Create a competition proposal, compete, win the competition..', async () => {

    const plugin = new CompetitionPlugin(arc, contributionRewardExt.id)

    if(!arc.web3) throw new Error("Web3 provider not set")

    // make sure that the DAO has enough Ether to pay for the reward

    if(!arc.web3) throw new Error('Web3 provider not set')

    await arc.web3.getSigner().sendTransaction({
      gasLimit: 4000000,
      gasPrice: 100000000000,
      to: dao.id,
      value: new BigNumber(ethReward.toString()).toHexString()
    })
    const externalTokenReward = new BN(0)
    const nativeTokenReward = new BN(0)

    // TODO: test error handling for all these params
    // - all args are present
    // - order of times
    const now = await getBlockTime(arc.web3)
    const startTime = addSeconds(now, 3)
    const proposalOptions: IProposalCreateOptionsComp = {
      dao: dao.id,
      endTime: addSeconds(startTime, 300),
      ethReward,
      externalTokenAddress: undefined,
      externalTokenReward,
      nativeTokenReward,
      numberOfVotesPerVoter: 3,
      reputationReward,
      rewardSplit: [1, 2, 97],
      startTime,
      suggestionsEndTime: addSeconds(startTime, 100),
      votingStartTime: addSeconds(startTime, 0)
    }

    const pluginState = await plugin.fetchState()

    const beforeBalanceBigNum = await arc.web3.getBalance(address1)
    const balanceBefore = new BN(beforeBalanceBigNum.toString())

    // CREATE PROPOSAL
    const tx = await plugin.createProposal(proposalOptions).send()

    if(!tx.result) throw new Error("Create proposal yielded no results")

    const proposal = new CompetitionProposal(arc, tx.result.id)
    expect(proposal).toBeInstanceOf(Proposal)

    const states: ICompetitionProposalState[] = []
    const lastState = (): ICompetitionProposalState => states[states.length - 1]
    let sub = proposal.state({}).subscribe((pState: ICompetitionProposalState) => {
      states.push(pState)
    })
    await waitUntilTrue(() => !!lastState())
    sub.unsubscribe()

    const proposalState = lastState()

    expect(proposalState.stage).toEqual(IProposalStage.Queued)
    expect(proposalState.endTime).toEqual(proposalOptions.endTime)
    expect(proposalState.numberOfVotesPerVoter).toEqual(proposalOptions.numberOfVotesPerVoter)
    expect(proposalState.numberOfWinners).toEqual(3)
    expect(proposalState.rewardSplit).toEqual([1, 2, 97])
    expect(proposalState.snapshotBlock).not.toBeTruthy()
    expect(proposalState.startTime).toEqual(proposalOptions.startTime)
    expect(proposalState.suggestionsEndTime).toEqual(proposalOptions.suggestionsEndTime)
    expect(proposalState.votingStartTime).toEqual(proposalOptions.votingStartTime)
    expect(proposalState.alreadyRedeemedEthPeriods).toEqual(0)
    expect(proposalState.ethReward).toEqual(ethReward)
    expect(proposalState.nativeTokenReward).toEqual(nativeTokenReward)
    expect(proposalState.name).toEqual('ContributionRewardExt')

    // accept the proposal by voting for et
    await voteToPassProposal(proposal)

    const lastStatePlugin = lastState().plugin.entity

    if(!lastStatePlugin.coreState) throw new Error('Plugin coreState not defined')

    // check sanity for scheme
    expect(pluginState.address).toEqual(lastStatePlugin.coreState.address)

    // redeem the proposal
    await proposal.fetchState()
    await proposal.redeemRewards().send()

    // find the competition
    const competitions = await Proposal.search(arc, { where: { id: proposal.id } }).pipe(first()).toPromise() as CompetitionProposal[]
    expect(competitions.length).toEqual(1)
    const competition = competitions[0]
    expect(competition).toBeInstanceOf(CompetitionProposal)
    expect(competition.id).toEqual(proposal.id)

    // lets create some suggestions
    const suggestion1Options = {
      beneficiary: address1,
      description: 'descxription',
      proposal: proposal.id,
      tags: ['tag1', 'tag2'],
      title: 'title',
      url: 'https://somewhere.some.place'
    }

    const receipt1 = await competition.createSuggestion(suggestion1Options).send()
    const suggestion1 = receipt1.result as CompetitionSuggestion
    expect(suggestion1).toBeDefined()
    expect(suggestion1).toBeInstanceOf(CompetitionSuggestion)
    expect(suggestion1.id).toBeDefined()
    const suggestion2Options = { ...suggestion1Options, title: 'suggestion nr 2' }
    const receipt2 = await competition.createSuggestion(suggestion2Options).send()
    const suggestion2 = receipt2.result as CompetitionSuggestion
    // we now should find 2 suggestions
    let suggestionIds: string[] = []
    sub = competition.suggestions()
      .subscribe((ls: CompetitionSuggestion[]) => {
        suggestionIds = [...suggestionIds, ...ls.map(x => x.id)]
      })

    await waitUntilTrue(() => suggestionIds.indexOf(suggestion2.id) > -1)
    sub.unsubscribe()

    const suggestion1State = await suggestion1.fetchState()
    
    expect(suggestion1State.beneficiary).toEqual(address1)
    expect(suggestion1State.id).toEqual(suggestion1.id)
    expect(suggestion1State.redeemedAt).not.toBeTruthy()
    expect(suggestion1State.rewardPercentage).toEqual(0)
    expect(suggestion1State.suggester).toEqual(address0)
    expect(suggestion1State.tags).toEqual(['tag1', 'tag2'])
    expect(suggestion1State.title).toEqual('title')
    expect(suggestion1State.totalVotes).toEqual(new BN(0))
    expect(suggestion1State.description).toEqual(suggestion1Options.description)
    expect(suggestion1State.url).toEqual(suggestion1Options.url)
    expect(suggestion1State.proposal.id).toEqual(suggestion1Options.proposal)

    expect(inspect(suggestion1State)).toEqual(inspect(await suggestion1.fetchState()))
    // filter suggestions by id, suggestionId, and proposal.id works
    expect(
      (await competition.suggestions({ where: { proposal: competition.id } }).pipe(first()).toPromise()).length)
      .toEqual(2)
    expect(
      (await competition.suggestions({ where: { id: suggestion2.id } }).pipe(first()).toPromise()).length)
      .toEqual(1)
    expect(
      (await competition.suggestions({ where: { suggestionId: suggestion1State.suggestionId } })
        .pipe(first()).toPromise()).length)
      .toEqual(1)
    // // and lets vote for the first suggestion
    
    const voteReceipt = await competition.voteSuggestion({ suggestionId: suggestion2.suggestionId as number }).send()
    const vote = voteReceipt.result
    // // the vote should be counted
    expect(vote).toBeInstanceOf(CompetitionVote)

    // we can also vote from the suggestion itself
    const vote1receipt = await suggestion1.vote().send()
    const vote1 = vote1receipt.result
    expect(vote1).toBeInstanceOf(CompetitionVote)

    // if we vote twice we get an error
    expect(suggestion1.vote().send()).rejects.toThrow(
      'already voted on this suggestion'
    )

    let competitionVotes: CompetitionVote[] = []
    sub = CompetitionVote.search(arc, { where: { suggestion: suggestion2.id } }).subscribe(
      (votes) => { competitionVotes = votes }
    )
    await waitUntilTrue(() => competitionVotes.length > 0)
    sub.unsubscribe()
    expect(competitionVotes.length).toEqual(1)

    // we can also find the votes on the suggestion
    const votesFromSuggestion: CompetitionVote[] = await suggestion2.votes().pipe(first()).toPromise()
    expect(votesFromSuggestion.map((r) => r.id)).toEqual(competitionVotes.map((r) => r.id))

    // if we claim our reward now, it should fail because the competion has not ended yet
    await expect(suggestion1.redeem().send()).rejects.toThrow(
      /competition is still on/i
    )
    await advanceTimeAndBlock(4000)

    if(!arc.web3) throw new Error('Web3 provider not set')

    // get the current balance of addres1 (who we will send the rewards to)

    try {
      await suggestion1.redeem().send()
    } catch (err) { }

    const afterBalanceBigNum = await arc.web3.getBalance(address1)
    const balanceAfter = new BN(afterBalanceBigNum.toString())
    const balanceDelta = balanceAfter.sub(balanceBefore)
    expect(balanceDelta.toString()).not.toEqual('0')
  })

  it(`Rewards left are updated correctly`, async () => {
    // before any votes are cast, all suggesitons are winnners
    const { competition } = await createCompetition()
    const proposal = new CompetitionProposal(arc, competition.id)
    let competitionState: ICompetitionProposalState = await proposal.fetchState()

    const sub = proposal.state({}).subscribe(
      (state) => {
        if(state)
        competitionState = state
      }
    )
    await waitUntilTrue(() => !!competitionState)
    // redeem the proposal
    await proposal.redeemRewards().send()
    // wait for indexing to be done
    await waitUntilTrue(() => {
      return competitionState && competitionState.ethRewardLeft !== null
    })

    expect(competitionState.ethRewardLeft).toEqual(ethReward)
    expect(competitionState.externalTokenRewardLeft).toEqual(new BN(0))
    expect(competitionState.nativeTokenRewardLeft).toEqual(new BN(0))
    expect(competitionState.reputationChangeLeft).toEqual(reputationReward)

    sub.unsubscribe()
  })

  it('Vote state works', async () => {
    const { competition, suggestions } = await createCompetition()

    await suggestions[0].fetchState()

    await suggestions[0].vote().send()
    let voteIsIndexed = false
    const sub = suggestions[0].state().subscribe((s: ICompetitionSuggestionState) => {
      voteIsIndexed = (s.positionInWinnerList !== null)
    })
    await waitUntilTrue(() => voteIsIndexed)
    sub.unsubscribe()

    const votes = await competition.competitionVotes().pipe(first()).toPromise()
    expect(votes.length).toEqual(1)
    const vote = votes[0]
    const voteState = await vote.fetchState()

    expect(voteState.id).toEqual(vote.id)
    expect(voteState.proposal).toEqual(competition.id)
    expect(voteState.suggestion).toEqual(suggestions[0].id)
  })

  it(`No votes is no winners`, async () => {
    // before any votes are cast, all suggesitons are winnners
    const { suggestions } = await createCompetition()
    expect(await getPosition(suggestions[0])).toEqual(null)
    expect(await getPosition(suggestions[3])).toEqual(null)
    // let's try to redeem
    await advanceTimeAndBlock(2000)
    expect(suggestions[0].redeem().send()).rejects.toThrow(
      'not in winners list'
    )
  })

  it('position is calculated correctly and redemptions work', async () => {
    let voteIsIndexed: boolean
    const { suggestions } = await createCompetition()

    if (!arc.web3) throw new Error('Web3 provider not set')

    const beneficiary = address1
    const beforeBalanceBigNum = (await arc.web3.getBalance(beneficiary)).toString()
    let balanceBefore = new BN(beforeBalanceBigNum)

    // vote and wait until it is indexed
    await suggestions[0].vote().send()
    voteIsIndexed = false
    let sub = suggestions[0].state().subscribe((s: ICompetitionSuggestionState) => {
      voteIsIndexed = (s.positionInWinnerList !== null)
    })
    await waitUntilTrue(() => voteIsIndexed)
    sub.unsubscribe()

    expect(await getPosition(suggestions[0])).toEqual(0)
    expect(await getPosition(suggestions[3])).toEqual(null)

    // vote and wait until it is indexed
    voteIsIndexed = false
    await suggestions[1].vote().send()
    sub = suggestions[1].state().subscribe((s: ICompetitionSuggestionState) => {
      voteIsIndexed = (s.positionInWinnerList !== null)
    })
    await waitUntilTrue(() => voteIsIndexed)
    sub.unsubscribe()

    expect(await getPosition(suggestions[0])).toEqual(0)
    expect(await getPosition(suggestions[1])).toEqual(0)
    expect(await getPosition(suggestions[2])).toEqual(null)
    expect(await getPosition(suggestions[3])).toEqual(null)

    await advanceTimeAndBlock(2000)

    if(!arc.web3) throw new Error('Web3 provider not set')

    const crExtBalanceBefore = await (await contributionRewardExt.ethBalance()).pipe(first()).toPromise()

    try {
      await suggestions[0].redeem().send()
    } catch (e) { }

    const afterBalanceBigNum = (await arc.web3.getBalance(beneficiary)).toString()
    let balanceAfter = new BN(afterBalanceBigNum)
    let balanceDelta = balanceAfter.sub(balanceBefore)
    expect(balanceDelta.toString()).toEqual('150')

    const crExtBalanceAfter = await (await contributionRewardExt.ethBalance()).pipe(first()).toPromise()
    const crExtBalanceDelta = new BN(crExtBalanceBefore).sub(new BN(crExtBalanceAfter))
    expect(crExtBalanceDelta.toString()).toEqual('150')

    // the reward _is_ redeemed
    await expect(suggestions[0].redeem().send()).rejects.toThrow(
      'suggestion was already redeemed'
    )

    const beforeBalanceBigNum2 = await arc.web3.getBalance(beneficiary)
    balanceBefore = new BN(beforeBalanceBigNum2.toString())
    await suggestions[1].redeem().send()

    const afterBalanceBigNum2 = await arc.web3.getBalance(beneficiary)
    balanceAfter = new BN(afterBalanceBigNum2.toString())
    balanceDelta = balanceAfter.sub(balanceBefore)
    expect(balanceDelta.toString()).toEqual('150')

    expect(await isWinner(suggestions[0])).toEqual(true)
    expect(await isWinner(suggestions[1])).toEqual(true)
    expect(await isWinner(suggestions[2])).toEqual(false)
    expect(await isWinner(suggestions[3])).toEqual(false)
  })

  it('position is calculated correctly (2)', async () => {
    const { competition, suggestions } = await createCompetition()
    await suggestions[0].vote().send()
    arc.setAccount(address0)
    await suggestions[2].vote().send()
    arc.setAccount(address1)
    await suggestions[2].vote().send()
    arc.setAccount(address0)
    await suggestions[1].vote().send()

    // wait until last vote is indexed
    let voteIsIndexed = false
    const sub = suggestions[1].state().subscribe((s: ICompetitionSuggestionState) => {
      voteIsIndexed = (s.positionInWinnerList !== null)
    })
    await waitUntilTrue(() => voteIsIndexed)
    sub.unsubscribe()

    expect(await getPosition(suggestions[1])).toEqual(1)
    expect(await getPosition(suggestions[0])).toEqual(1)
    expect(await getPosition(suggestions[2])).toEqual(0)
    expect(await getPosition(suggestions[3])).toEqual(null)

    await advanceTimeAndBlock(2000)

    const beneficiary = address1

    if(!arc.web3) throw new Error('Web3 provider not set')

    const beforeBalanceBigNum = await arc.web3.getBalance(beneficiary)
    let balanceBefore = new BN(beforeBalanceBigNum.toString())
    await suggestions[2].redeem().send()

    const afterBalanceBigNum = await arc.web3.getBalance(beneficiary)
    let balanceAfter = new BN(afterBalanceBigNum.toString())
    let balanceDelta = balanceAfter.sub(balanceBefore)
    expect(balanceDelta.toString()).toEqual((new BN(240)).toString())

    const beforeBalanceBigNum2 = await arc.web3.getBalance(beneficiary)
    balanceBefore = new BN(beforeBalanceBigNum2.toString())
    await suggestions[0].redeem().send()

    const afterBalanceBigNum2 = await arc.web3.getBalance(beneficiary)
    balanceAfter = new BN(afterBalanceBigNum2.toString())
    balanceDelta = balanceAfter.sub(balanceBefore)

    expect(suggestions[3].redeem().send()).rejects.toThrow(
      'not in winners list'
    )

    expect(await isWinner(suggestions[0])).toEqual(true)
    expect(await isWinner(suggestions[1])).toEqual(true)
    expect(await isWinner(suggestions[2])).toEqual(true)
    expect(await isWinner(suggestions[3])).toEqual(false)

    // if we get the list of winners, it should contain exactly these 3 suggestions
    const winnerList = await competition.suggestions({ where: { positionInWinnerList_not: null } })
      .pipe(first()).toPromise()
    expect(winnerList.map((s: CompetitionSuggestion) => s.id).sort()).toEqual(
      [suggestions[0].id, suggestions[1].id, suggestions[2].id].sort()
    )

  })

  it('winner is identified correctly also if there are less actual than possible winners', async () => {
    const { suggestions } = await createCompetition({ rewardSplit: [40, 40, 20] })
    await suggestions[0].vote().send()
    // wait until the vote is indexed
    let voteIsIndexed = false
    const sub = suggestions[0].state().subscribe((s: ICompetitionSuggestionState) => {
      voteIsIndexed = (s.positionInWinnerList !== null)
    })
    await waitUntilTrue(() => voteIsIndexed)
    sub.unsubscribe()

    const suggestion1State = await suggestions[0].fetchState()
    expect(suggestion1State.positionInWinnerList).toEqual(0)
    expect(suggestion1State.totalVotes).not.toEqual(new BN(0))
    expect(suggestion1State.isWinner).toEqual(true)

    const suggestion2State = await suggestions[1].fetchState()
    expect(suggestion2State.positionInWinnerList).toEqual(null)
    expect(suggestion2State.totalVotes).toEqual(new BN(0))

    const suggestion3State = await suggestions[2].fetchState()
    expect(suggestion3State.positionInWinnerList).toEqual(null)
    expect(suggestion3State.totalVotes).toEqual(new BN(0))
    expect(suggestion3State.isWinner).toEqual(false)

    const suggestion4State = await suggestions[3].fetchState()
    expect(suggestion4State.positionInWinnerList).toEqual(null)
    expect(suggestion4State.totalVotes).toEqual(new BN(0))
  })

  //TODO: Is this test really necessary?
  it.skip('CompetionScheme is recognized', async () => {
    // we'll get a `ContributionRewardExt` contract that has a Compietion contract as a rewarder
    const contributionRewardExts = await arc
      .plugins({ where: { name: "ContributionRewardExt" } }).pipe(first()).toPromise()
    expect(contributionRewardExts.length).toEqual(1)
    const scheme = contributionRewardExts[0]
    expect(scheme).toBeInstanceOf(CompetitionPlugin)
  })

  it('Can create a proposal using dao.createProposal', async () => {
    if (!arc.web3) throw Error('Web3 provider not set')
    const now = await getBlockTime(arc.web3)
    const startTime = addSeconds(now, 3)
    const competitionId = Plugin.calculateId({ daoAddress: dao.id, contractAddress: contributionRewardExtAddress })
    const proposalOptions: IProposalCreateOptionsComp = {
      dao: dao.id,
      endTime: addSeconds(startTime, 3000),
      ethReward,
      externalTokenAddress: undefined,
      externalTokenReward: toWei('0'),
      nativeTokenReward: toWei('1'),
      numberOfVotesPerVoter: 3,
      reputationReward: toWei('10'),
      rewardSplit: [10, 10, 80],
      plugin: competitionId,
      startTime,
      suggestionsEndTime: addSeconds(startTime, 100),
      votingStartTime: addSeconds(startTime, 0)
    }

    const plugin = new CompetitionPlugin(arc, competitionId)
    const tx = await plugin.createProposal(proposalOptions).send()

    if(!tx.result) throw new Error('Create proposal yielded no results')

    const proposal = new CompetitionProposal(arc, tx.result.id)
    expect(proposal).toBeInstanceOf(Proposal)
  })

  it(`Beneficiary is recognized and different from suggestor`, async () => {
    // lets create some suggestions
    const { competition } =  await createCompetition()
    const suggestionOptions = {
      beneficiary: address1,
      description: 'descxription',
      proposal: competition.id,
      tags: ['tag1', 'tag2'],
      title: 'title',
      url: 'https://somewhere.some.place'
    }

    const receipt1 = await competition.createSuggestion(suggestionOptions).send()
    const suggestion = receipt1.result as CompetitionSuggestion
    // wait until suggestion is indexed

    let suggestionIds: string[] = []
    const subscription = competition.suggestions()
      .subscribe((ls: CompetitionSuggestion[]) => {
        suggestionIds = ls.map((x: CompetitionSuggestion) => x.id)
      }
    )

    await waitUntilTrue(() => suggestionIds.indexOf(suggestion.id) > -1)
    subscription.unsubscribe()

    let suggestionState = await suggestion.fetchState()

    expect(suggestionState.proposal.id).toEqual(suggestionOptions.proposal)
    expect(suggestionState.beneficiary).toEqual(suggestionOptions.beneficiary)
    expect(suggestionState.description).toEqual(suggestionOptions.description)
    expect(suggestionState.tags).toEqual(suggestionOptions.tags)
    expect(suggestionState.title).toEqual(suggestionOptions.title)
    expect(suggestionState.url).toEqual(suggestionOptions.url)
    
    expect(suggestionState).toMatchObject({
      id: suggestion.id,
      redeemedAt: null,
      rewardPercentage: 0,
      suggester: address0,
      totalVotes: new BN(0)
    })
  })

  it(`proposerIsAdmin behaves as expected`, async () => {
    const { competition } = await createCompetition({proposerIsAdmin: true})
    // accounts other than proposer cannot suggest

    arc.setAccount(address1)
    const suggestionOptions = {
      beneficiary: address1,
      description: 'descxription',
      title: 'title',
      url: 'https://somewhere.some.place'
    }

    await expect(competition.createSuggestion(suggestionOptions).send())
      .rejects.toThrow(
        /only admin/
      )
    arc.setAccount(address0)
  })

  describe('pre-fetching', () => {
    it('competition.suggestions works', async () => {
      // find a proposal in a scheme that has > 1 votes
      const { competition } = await createCompetition()
      // check if the competition has indeed some suggestions
  
      const suggestions = await competition.suggestions().pipe(first()).toPromise()
      expect(suggestions.length).toBeGreaterThan(0)
  
      // now we have our objects, reset the cache
      await (arc.apolloClient as any).cache.reset()
      expect((arc.apolloClient as any).cache.data.data).toEqual({})
  
        // // construct our superquery that will fill the cache
      const query = gql`query {
          proposals (where: { id: "${competition.id}"}) {
            ...ProposalFields
            id
            competition {
              id
              suggestions {
                ...CompetitionSuggestionFields
                }
            }
          }
        }
        ${Proposal.baseFragment}
        ${Plugin.baseFragment}
        ${CompetitionSuggestion.fragments.CompetitionSuggestionFields}
        `
  
      await arc.sendQuery(query)
  
        // now see if we can get our informatino directly from the cache
      const cachedSuggestions = await competition.suggestions({}, { fetchPolicy: 'cache-only'})
          .pipe(first()).toPromise()
      expect(cachedSuggestions.map((v: CompetitionSuggestion) => v.id))
          .toEqual(suggestions.map((v: CompetitionSuggestion) => v.id))
  
      const cachedSuggestionState = await cachedSuggestions[0]
        .fetchState()
      expect(cachedSuggestionState.id).toEqual(cachedSuggestions[0].id)
  
    })
  
    it('competition.suggestions works also without resetting the cache', async () => {
      // find a proposal in a scheme that has > 1 votes
      const { competition } =  await createCompetition()
      // check if the competition has indeed some suggestions
  
      const suggestions = await competition.suggestions().pipe(first()).toPromise()
      expect(suggestions.length).toBeGreaterThan(0)
  
      // add some exiting data to the cache to seeif we can mess things up
      await new CompetitionProposal(arc, competition.id).state({}).pipe(first()).toPromise()
  
      // construct our superquery that will fill the cache
      const query = gql`query {
          proposals (where: { id: "${competition.id}"}) {
            # id
            ...ProposalFields
            competition {
              id
              suggestions {
                ...CompetitionSuggestionFields
                }
            }
          }
        }
        ${Proposal.baseFragment}
        ${Plugin.baseFragment}
        ${CompetitionSuggestion.fragments.CompetitionSuggestionFields}
        `
  
      await arc.sendQuery(query)
  
        // now see if we can get our informatino directly from the cache
      const cachedSuggestions = await competition.suggestions({}, { fetchPolicy: 'cache-only'})
          .pipe(first()).toPromise()
      expect(cachedSuggestions.map((v: CompetitionSuggestion) => v.id))
          .toEqual(suggestions.map((v: CompetitionSuggestion) => v.id))
  
      const cachedSuggestionState = await cachedSuggestions[0]
        .state({ fetchPolicy: 'cache-only'}).pipe(first()).toPromise()
      expect(cachedSuggestionState.id).toEqual(cachedSuggestions[0].id)
  
    })

    it('suggestion.votes works', async () => {
      // find a proposal in a scheme that has > 1 votes
      const { suggestions } = await createCompetition()
  
      await suggestions[0].vote().send()
      let voteIsIndexed = false
      const sub = suggestions[0].state().subscribe((s: ICompetitionSuggestionState) => {
        voteIsIndexed = (s.positionInWinnerList !== null)
      })
      await waitUntilTrue(() => voteIsIndexed)
      sub.unsubscribe()
  
      // check if the competition has indeed some suggestions
  
      const votes = await suggestions[0].votes().pipe(first()).toPromise()
      expect(votes.length).toBeGreaterThan(0)
  
      // now we have our objects, reset the cache
      await (arc.apolloClient as any).cache.reset()
      expect((arc.apolloClient as any).cache.data.data).toEqual({})
  
      // // construct our superquery that will fill the cache
      const query = gql`query
        {
          competitionSuggestion(id: "${suggestions[0].id}") {
            id
            votes {
              ...CompetitionVoteFields
            }
          }
        }
        ${Proposal.baseFragment}
        ${Plugin.baseFragment}
        ${CompetitionSuggestion.fragments.CompetitionSuggestionFields}
        ${CompetitionVote.fragments.CompetitionVoteFields}
      `
  
      await arc.sendQuery(query)
  
      const cachedVotes = await suggestions[0].votes({}, { fetchPolicy: 'cache-only'})
        .pipe(first()).toPromise()
      expect(cachedVotes.map((v: CompetitionVote) => v.id))
        .toEqual(votes.map((v: CompetitionVote) => v.id))
  
      const cachedVoteState = await cachedVotes[0].state({ fetchPolicy: 'cache-only'})
        .pipe(first()).toPromise()
      expect(cachedVoteState.id).toEqual(cachedVotes[0].id)
    })
  })
})
