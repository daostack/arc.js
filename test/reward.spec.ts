import { getAddress } from 'ethers/utils'
import { first } from 'rxjs/operators'
import { Arc, Reward, IRewardState, DAO, IProposalCreateOptionsCR } from '../src'
import { getTestDAO, newArc, toWei, createCRProposal, getTestScheme } from './utils'

/**
 * Reward test
 */
describe('Reward', () => {

  let arc: Arc
  let dao: DAO

  beforeAll(async () => {
    arc = await newArc()
    dao = await getTestDAO()
  })

  it('Reward is instantiable', () => {
    const id = 'some-id'
    const reward = new Reward(arc, id)
    expect(reward).toBeInstanceOf(Reward)
  })

  it('Rewards are searchable and have a state', async () => {

    // create a proposal with some rewards
    const beneficiary = '0xffcf8fdee72ac11b5c542428b35eef5769c409f0'

    const options: IProposalCreateOptionsCR = {
      beneficiary,
      dao: dao.id,
      ethReward: toWei('300'),
      externalTokenAddress: undefined,
      externalTokenReward: toWei('0'),
      nativeTokenReward: toWei('1'),
      plugin: getTestScheme("ContributionReward")
    }

    const proposal = await createCRProposal(arc, options)

    expect(proposal).toBeDefined()

    let result: Reward[]
    result = await Reward.search(arc)
        .pipe(first()).toPromise()
    expect(result.length).toBeGreaterThan(0)

    // search does not care about case in the address
    result = await Reward.search(arc, { where: {beneficiary}})
        .pipe(first()).toPromise()
    expect(result.length).toBeGreaterThan(0)

    result = await Reward.search(arc, { where: {beneficiary: getAddress(beneficiary)}})
        .pipe(first()).toPromise()
    expect(result.length).toBeGreaterThan(0)

    expect(() => Reward.search(arc, {where: {beneficiary: ''}})).toThrowError(
      /not a valid address/i
    )

    // get the reward state
    const reward = result[0]
    const rewardState = await reward.fetchState()
    expect(rewardState.id).toEqual(reward.id)
  })

  it('paging and sorting works', async () => {
    const ls1 = await Reward.search(arc, { first: 3, orderBy: 'id' }).pipe(first()).toPromise()
    expect(ls1.length).toEqual(3)
    expect(Number(ls1[0].id)).toBeLessThan(Number(ls1[1].id))

    const ls2 = await Reward.search(arc, { first: 2, skip: 2, orderBy: 'id' }).pipe(first()).toPromise()
    expect(ls2.length).toEqual(2)
    expect(Number(ls1[2].id)).toEqual(Number(ls2[0].id))

    const ls3 = await Reward.search(arc, {  orderBy: 'id', orderDirection: 'desc'}).pipe(first()).toPromise()
    expect(Number(ls3[0].id)).toBeGreaterThanOrEqual(Number(ls3[1].id))
  })

  it('fetchState works as expected', async () => {
    const rewards = await Reward.search(arc).pipe(first()).toPromise()
    const reward = rewards[0]
    // staticState should be set on search
    expect(reward.coreState).toBeTruthy()
    const rewardFromId = new Reward(arc, reward.id)
    expect(rewardFromId.coreState).not.toBeTruthy()
    await rewardFromId.fetchState()
    expect(rewardFromId.coreState).toBeTruthy()
    const  rewardFromStaticState = new Reward(arc, reward.coreState as IRewardState)
    expect(rewardFromStaticState.coreState).toBeTruthy()
  })
})
