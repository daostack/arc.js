import BN from 'bn.js'
import { Observable } from 'rxjs'
import {
  Address,
  Arc,
  CompetitionProposal,
  CompetitionSuggestion,
  CompetitionVote,
  dateToSecondsSinceEpoch,
  getBlockTime,
  getEventArgs,
  IApolloQueryOptions,
  ICompetitionProposalState,
  ICompetitionSuggestionQueryOptions,
  IContributionRewardExtState,
  IProposalBaseCreateOptions,
  ITransaction,
  ITransactionReceipt,
  IVoteQueryOptions,
  Logger,
  mapGenesisProtocolParams,
  NULL_ADDRESS,
  Operation,
  Plugin,
  Proposal,
  ProposalPlugin,
  toIOperationObservable,
  transactionErrorHandler,
  transactionResultHandler
} from '../../index'

export interface IProposalCreateOptionsComp extends IProposalBaseCreateOptions {
  endTime: Date
  reputationReward?: BN
  ethReward?: BN
  externalTokenReward?: BN
  externalTokenAddress?: Address
  rewardSplit: number[]
  nativeTokenReward?: BN
  numberOfVotesPerVoter: number
  proposerIsAdmin?: boolean // true if new suggestions are limited to the proposer
  startTime: Date | null
  suggestionsEndTime: Date
  votingStartTime: Date
}

export class CompetitionPlugin extends ProposalPlugin<
  IContributionRewardExtState,
  ICompetitionProposalState,
  IProposalCreateOptionsComp
> {
  public static itemMap(context: Arc, item: any, queriedId?: string): IContributionRewardExtState | null {
    if (!item) {
      Logger.debug(`CompetitionPlugin ItemMap failed. ${queriedId && `Could not find CompetitionPlugin with id '${queriedId}'`}`)
      return null
    }

    const baseState = Plugin.itemMapToBaseState(context, item)

    const contributionRewardExtParams = item.contributionRewardExtParams && {
      rewarder: item.contributionRewardExtParams.rewarder,
      voteParams: mapGenesisProtocolParams(item.contributionRewardExtParams.voteParams),
      votingMachine: item.contributionRewardExtParams.votingMachine
    }

    return {
      ...baseState,
      pluginParams: contributionRewardExtParams
    }
  }

  public static getCompetitionContract(arc: Arc, state: IContributionRewardExtState) {
    if (!state) {
      throw Error(`No Plugin was provided`)
    }
    const rewarder = state.pluginParams && state.pluginParams.rewarder
    if (!rewarder) {
      throw Error(
        `This Plugin's rewarder is not set, and so no compeittion contract could be found`
      )
    }

    if (!CompetitionPlugin.isCompetitionPlugin(arc, state)) {
      throw Error(`We did not find a Competition contract at the rewarder address ${rewarder}`)
    }
    const contract = arc.getContract(rewarder)
    return contract
  }

  public static isCompetitionPlugin(arc: Arc, state: IContributionRewardExtState) {
    if (state.pluginParams) {
      const contractInfo = arc.getContractInfo(state.pluginParams.rewarder)
      return contractInfo.name === 'Competition'
    } else {
      return false
    }
  }

  public suggestions(
    options: ICompetitionSuggestionQueryOptions = {},
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable<CompetitionSuggestion[]> {
    if (!options.where) {
      options.where = {}
    }
    options.where.proposal = this.id
    return CompetitionSuggestion.search(this.context, options, apolloQueryOptions)
  }

  public votes(
    options: IVoteQueryOptions = {},
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable<CompetitionVote[]> {
    if (!options.where) {
      options.where = {}
    }
    options.where.proposal = this.id
    return CompetitionVote.search(this.context, options, apolloQueryOptions)
  }

  public async createCompetitionProposalTransaction(
    options: IProposalCreateOptionsComp
  ): Promise<ITransaction> {
    const context = this.context
    const pluginState = await this.fetchState()
    if (!pluginState) {
      throw Error(`No plugin was found with this id: ${this.id}`)
    }

    const contract = CompetitionPlugin.getCompetitionContract(this.context, pluginState)

    // check sanity -- is the competition contract actually
    const contributionRewardExtAddress = await contract.contributionRewardExt()
    if (contributionRewardExtAddress.toLowerCase() !== pluginState.address) {
      throw Error(
        `This ContributionRewardExt/Competition combo is malconfigured: expected ${contributionRewardExtAddress.toLowerCase()} to equal ${
          pluginState.address
        }`
      )
    }

    options.descriptionHash = await context.saveIPFSData(options)
    if (!options.rewardSplit) {
      throw Error(`Rewardsplit was not given..`)
    } else {
      if (options.rewardSplit.reduce((a: number, b: number) => a + b) !== 100) {
        throw Error(
          `Rewardsplit must sum 100 (they sum to  ${options.rewardSplit.reduce(
            (a: number, b: number) => a + b
          )})`
        )
      }
    }

    const competitionParams = [
      (options.startTime && dateToSecondsSinceEpoch(options.startTime)) || 0,
      dateToSecondsSinceEpoch(options.votingStartTime) || 0,
      dateToSecondsSinceEpoch(options.endTime) || 0,
      options.numberOfVotesPerVoter.toString() || 0,
      dateToSecondsSinceEpoch(options.suggestionsEndTime) || 0
    ]
    const proposerIsAdmin = !!options.proposerIsAdmin

    return {
      contract,
      method: 'proposeCompetition',
      args: [
        options.descriptionHash || '',
        (options.reputationReward && options.reputationReward.toString()) || 0,
        [
          (options.nativeTokenReward && options.nativeTokenReward.toString()) || 0,
          (options.ethReward && options.ethReward.toString()) || 0,
          (options.externalTokenReward && options.externalTokenReward.toString()) || 0
        ],
        options.externalTokenAddress || NULL_ADDRESS,
        options.rewardSplit,
        competitionParams,
        proposerIsAdmin
      ]
    }
  }

  public createProposal(
    options: IProposalCreateOptionsComp
  ): Operation<Proposal<ICompetitionProposalState>> {
    const observable = Observable.create(async (observer: any) => {
      try {
        const createTransaction = await this.createProposalTransaction(options)
        const map = this.createProposalTransactionMap()
        const errHandler = this.createProposalErrorHandler(options)
        const sendTransactionObservable = this.context.sendTransaction(
          createTransaction,
          map,
          errHandler
        )
        const sub = sendTransactionObservable.subscribe(observer)
        return () => sub.unsubscribe()
      } catch (e) {
        observer.error(e)
        return
      }
    })

    return toIOperationObservable(observable)
  }

  public createProposalTransactionMap(): transactionResultHandler<CompetitionProposal> {
    return (receipt: ITransactionReceipt) => {
      const args = getEventArgs(receipt, 'NewCompetitionProposal', 'Competition.createProposal')
      const proposalId = args[0]
      return new CompetitionProposal(this.context, proposalId)
    }
  }

  public createProposalErrorHandler(options: IProposalCreateOptionsComp): transactionErrorHandler {
    return async (err) => {
      if (err.message.match(/startTime should be greater than proposing time/gi)) {
        if (!this.context.web3) {
          throw Error('Web3 provider not set')
        }
        return Error(
          `${err.message} - startTime is ${
            options.startTime
          }, current block time is ${await getBlockTime(this.context.web3)}`
        )
      } else {
        const msg = `Error creating proposal: ${err.message}`
        return Error(msg)
      }
    }
  }

  public async ethBalance(): Promise<Observable<BN>> {
    let state

    if (!this.coreState) {
      state = await this.fetchState()
    } else {
      state = this.coreState
    }

    const contributionRewardExt = this.context.getContract(state.address)
    return this.context.ethBalance(await contributionRewardExt.vault())
  }

  protected async createProposalTransaction(
    options: IProposalCreateOptionsComp
  ): Promise<ITransaction> {
    const context = this.context
    const pluginState = await this.fetchState()
    if (!pluginState) {
      throw Error(`No scheme was found with this id: ${this.id}`)
    }

    const contract = CompetitionPlugin.getCompetitionContract(this.context, pluginState)

    // check sanity -- is the competition contract actually c
    const contributionRewardExtAddress = await contract.contributionRewardExt()
    if (contributionRewardExtAddress.toLowerCase() !== pluginState.address) {
      throw Error(
        `This ContributionRewardExt/Competition combo is malconfigured: expected ${contributionRewardExtAddress.toLowerCase()} to equal ${
          pluginState.address
        }`
      )
    }

    options.descriptionHash = await context.saveIPFSData(options)
    if (!options.rewardSplit) {
      throw Error(`Rewardsplit was not given..`)
    } else {
      if (options.rewardSplit.reduce((a: number, b: number) => a + b) !== 100) {
        throw Error(
          `Rewardsplit must sum 100 (they sum to  ${options.rewardSplit.reduce(
            (a: number, b: number) => a + b
          )})`
        )
      }
    }
    // * @param _rewardSplit an array of precentages which specify how to split the rewards
    // *         between the winning suggestions
    // * @param _competitionParams competition parameters :
    // *         _competitionParams[0] - competition startTime
    // *         _competitionParams[1] - _votingStartTime competition voting start time
    // *         _competitionParams[2] - _endTime competition end time
    // *         _competitionParams[3] - _maxNumberOfVotesPerVoter on how many suggestions a voter can vote
    // *         _competitionParams[4] - _suggestionsEndTime suggestion submition end time
    // *         _competitionParams[4] - _suggestionsEndTime suggestion submition end time

    const competitionParams = [
      (options.startTime && dateToSecondsSinceEpoch(options.startTime)) || 0,
      dateToSecondsSinceEpoch(options.votingStartTime) || 0,
      dateToSecondsSinceEpoch(options.endTime) || 0,
      options.numberOfVotesPerVoter.toString() || 0,
      dateToSecondsSinceEpoch(options.suggestionsEndTime) || 0
    ]
    const proposerIsAdmin = !!options.proposerIsAdmin

    return {
      contract,
      method: 'proposeCompetition',
      args: [
        options.descriptionHash || '',
        (options.reputationReward && options.reputationReward.toString()) || 0,
        [
          (options.nativeTokenReward && options.nativeTokenReward.toString()) || 0,
          (options.ethReward && options.ethReward.toString()) || 0,
          (options.externalTokenReward && options.externalTokenReward.toString()) || 0
        ],
        options.externalTokenAddress || NULL_ADDRESS,
        options.rewardSplit,
        competitionParams,
        proposerIsAdmin
      ]
    }
  }
}
