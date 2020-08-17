import { first } from 'rxjs/operators'
import BN from 'bn.js'
import {
  Arc,
  DAO,
  IProposalStage,
  Proposal,
  TokenTrade,
  IProposalCreateOptionsTokenTrade,
  ITokenTradeProposalState,
  TokenTradeProposal,
  fromWei,
  Token,
  IInitParamsCR,
  PluginManagerPlugin,
  LATEST_ARC_VERSION,
  IProposalCreateOptionsPM,
  AnyPlugin
} from '../src'
import {
  newArc,
  voteToPassProposal,
  waitUntilTrue,
  firstResult,
  createAddProposal
 } from './utils'


jest.setTimeout(60000)

/**
 * Proposal test
 */
describe('TokenTrade', () => {
  let arc: Arc

  beforeAll(async () => {
    arc = await newArc()
  })

  it('Create a proposal and trade tokens between user and DAO', async () => {

    const dao = (await DAO.search(arc, { where: { name: 'My DAO'}}).pipe(first()).toPromise())[0]
        
    const plugin = (await dao.proposalPlugins({ where: { name: 'SchemeFactory'}}).pipe(first()).toPromise())[0] as PluginManagerPlugin
    const easyVotingParams = [
      50,
      604800,
      129600,
      43200, 
      1200,
      86400, 
      10, 
      1, 
      50,
      10,
      0
    ];
    
    const initData: IInitParamsCR = {
      daoId: dao.id,
      votingMachine: arc.getContractInfoByName("GenesisProtocol", LATEST_ARC_VERSION).address,
      votingParams: easyVotingParams,
      voteOnBehalf: "0x0000000000000000000000000000000000000000",
      voteParamsHash: '0xbae7a296c10a84748217360a27d4cf641bb78018e623cc382f571821bd7f4bb6'
    }

    const options: IProposalCreateOptionsPM = {
      dao: dao.id,
      add: {
        permissions: '0x0000001f',
        pluginName: 'TokenTrade',
        pluginInitParams: initData
      }
    }
    
    const createdPlugin = await createAddProposal(arc, dao, plugin, options)

    if(!createdPlugin[0].coreState) throw new Error('New Plugin has no state set')
    expect(createdPlugin[1].pluginToRegisterDecodedData.params[2].value.map(Number)).toMatchObject(easyVotingParams)
    expect(createdPlugin).toBeTruthy()
    expect(createdPlugin[0]).toBeInstanceOf(TokenTrade)
    expect(createdPlugin[0].coreState.name).toEqual('TokenTrade')
    expect(createdPlugin[0].coreState.pluginParams.voteParams).toMatchObject({
      boostedVotePeriodLimit: 129600,
      daoBountyConst: 10,
      preBoostedVotePeriodLimit: 43200,
      queuedVotePeriodLimit: 604800,
      queuedVoteRequiredPercentage: 50,
      quietEndingPeriod: 86400,
      votersReputationLossRatio: 1,
      activationTime: 0
    })

    const tokenTradePlugin = (await dao.plugins({ where: { isRegistered: true } }).pipe(first()).toPromise()).find((plugin: AnyPlugin) => plugin.coreState!.name === "TokenTrade") as TokenTrade

    // Verify user has 150 'DutchX Tokens' to trade with

    const dutchX = (await DAO.search(arc, { where: { name: 'DutchX DAO'}}).pipe(first()).toPromise())[0]
    const dutchXToken = (await Token.search(arc, { where: { dao: dutchX.id}}).pipe(first()).toPromise())[0]
    

    const genToken = arc.GENToken().contract()
    await genToken.mint(dao.id, 1000000)

    const userAddress = await (await arc.getSigner().pipe(first()).toPromise()).getAddress()
    const newUserBalance = new BN(fromWei(await dutchXToken.balanceOf(userAddress).pipe(first()).toPromise()))
    expect(newUserBalance.gte(new BN(150)))

    const userGenTokenBalance = new BN(await firstResult(arc.GENToken().balanceOf(userAddress)))
    const daoDutchTokenBalance = new BN(await firstResult(await dutchXToken.balanceOf(dao.id)))
    // Propose exchanging 150 'DutchX Tokens' for 50 'GEN Tokens'
    await dutchXToken.approveForStaking(tokenTradePlugin.coreState!.address, new BN(250)).send()

    const tokenTradeProposalOptions: IProposalCreateOptionsTokenTrade = {
      dao: dao.id,
      descriptionHash: '',
      sendTokenAddress: dutchXToken.address,
      sendTokenAmount: 150,
      receiveTokenAddress: genToken.address,
      receiveTokenAmount: 50
    }

    const tx = await tokenTradePlugin.createProposal(tokenTradeProposalOptions).send()
    if (!tx.result) { throw new Error('Create proposal yielded no results') }

    const proposal = new TokenTradeProposal(arc, tx.result.id)
    expect(proposal).toBeInstanceOf(Proposal)

    const states: ITokenTradeProposalState[] = []
    const lastState = (): ITokenTradeProposalState => states[states.length - 1]
    proposal.state({}).subscribe((pState: ITokenTradeProposalState) => {
      states.push(pState)
    })
    await waitUntilTrue(() => !!lastState())

    expect(lastState()).toMatchObject({
      stage: IProposalStage.Queued,
      executed: false,
    })

    await voteToPassProposal(proposal)

    await waitUntilTrue(async () => {
      const proposalState  = await proposal.fetchState({fetchPolicy: 'no-cache'}, true)
      states.push(proposalState)
      return proposalState.stage === IProposalStage.Executed
    })

    expect(lastState()).toMatchObject({
      stage: IProposalStage.Executed
    })

    // now we can redeem the proposal, which should make the user have 50 additional GEN tokens and
    // make the Test DAO have 150 additional DutchX Tokens
    await proposal.redeem().send()

    await waitUntilTrue(async () => {
      const updatedUserGenTokenBalance = new BN(await firstResult(arc.GENToken().balanceOf(userAddress)))
      const updateDAODutchTokenBalance = new BN(await firstResult(await dutchXToken.balanceOf(dao.id)))
      const expectedUserBalance = new BN(userGenTokenBalance.add(new BN(50)))
      const expectedDaoBalance = new BN(daoDutchTokenBalance.add(new BN(150)))

      return (
        updatedUserGenTokenBalance.eq(expectedUserBalance) &&
        updateDAODutchTokenBalance.eq(expectedDaoBalance)
      )
    })

  })
})
