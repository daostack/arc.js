import BN from 'bn.js'
import { Address, IApolloQueryOptions } from "../../types";
import { IProposalBaseCreateOptions, IProposalQueryOptions } from "../../proposal";
import { ProposalPlugin } from "../../proposalPlugin";
import { Arc } from "../../arc";
import { IPluginState, Plugin } from "../../plugin";
import { ITransaction, transactionResultHandler, transactionErrorHandler, ITransactionReceipt, getEventArgs } from "../../operation";
import { Observable } from "rxjs";
import gql from "graphql-tag";
import { ICompetitionSuggestionQueryOptions, CompetitionSuggestion } from './suggestion';
import { IVoteQueryOptions } from '../../vote';
import { getBlockTime, dateToSecondsSinceEpoch, NULL_ADDRESS } from '../../utils';
import { CompetitionVote } from './vote';
import { CompetitionProposal } from './proposal';

export interface ICompetitionState extends IPluginState { }

export interface IProposalCreateOptionsComp extends IProposalBaseCreateOptions {
  // beneficiary: Address
  endTime: Date,
  reputationReward?: BN
  ethReward?: BN
  externalTokenReward?: BN
  externalTokenAddress?: Address
  // proposer: Address,
  rewardSplit: number[]
  nativeTokenReward?: BN
  numberOfVotesPerVoter: number
  proposerIsAdmin?: boolean, // true if new suggestions are limited to the proposer
  startTime: Date | null
  suggestionsEndTime: Date
  votingStartTime: Date
}

export class Competition extends ProposalPlugin {

  coreState: ICompetitionState

  constructor(public context: Arc, idOrOpts: Address | ICompetitionState) {
    super()
    this.context = context
    if (typeof idOrOpts === 'string') {
      this.id = idOrOpts as string
      this.id = this.id.toLowerCase()
    } else {
      this.setState(idOrOpts)
      this.id = this.coreState.id
    }
  }

  public static fragments = {
    schemeParams: { 
      name: 'GenericSchemeParams',
      fragment: gql` fragment GenericSchemeParams on ControllerScheme {
      genericSchemeParams {
        votingMachine
        contractToCall
        voteParams {
          queuedVoteRequiredPercentage
          queuedVotePeriodLimit
          boostedVotePeriodLimit
          preBoostedVotePeriodLimit
          thresholdConst
          limitExponentValue
          quietEndingPeriod
          proposingRepReward
          votersReputationLossRatio
          minimumDaoBounty
          daoBountyConst
          activationTime
          voteOnBehalf
        }
      }`
    }
  }

  public static itemMap(arc: Arc, item: any): Competition | null {
    if (!item) {
      return null
    }

    let name = item.name
    if (!name) {

      try {
        name = arc.getContractInfo(item.address).name
      } catch (err) {
        if (err.message.match(/no contract/ig)) {
          // continue
        } else {
          throw err
        }
      }
    }
    
    return new Competition(arc, {
        address: item.address,
        canDelegateCall: item.canDelegateCall,
        canManageGlobalConstraints: item.canManageGlobalConstraints,
        canRegisterSchemes: item.canRegisterSchemes,
        canUpgradeController: item.canUpgradeController,
        dao: item.dao.id,
        id: item.id,
        name,
        numberOfBoostedProposals: Number(item.numberOfBoostedProposals),
        numberOfPreBoostedProposals: Number(item.numberOfPreBoostedProposals),
        numberOfQueuedProposals: Number(item.numberOfQueuedProposals),
        paramsHash: item.paramsHash,
        version: item.version
      }
    )
  }

  public static getCompetitionContract(arc: Arc, schemeState: ISchemeState) {
    if (schemeState === null) {
      throw Error(`No scheme was provided`)
    }
    const rewarder = schemeState.contributionRewardExtParams && schemeState.contributionRewardExtParams.rewarder
    if (!rewarder) {
      throw Error(`This scheme's rewarder is not set, and so no compeittion contract could be found`)
    }
  
    if (!Competition.isCompetitionScheme(arc, schemeState)) {
      throw Error(`We did not find a Competition contract at the rewarder address ${rewarder}`)
    }
    const contract = arc.getContract(rewarder as Address)
    return contract
  }

  public static isCompetitionScheme(arc: Arc, item: any) {
    if (item.contributionRewardExtParams) {
      const contractInfo = arc.getContractInfo(item.contributionRewardExtParams.rewarder)
      const versionNumber = Number(contractInfo.version.split('rc.')[1])
      if (versionNumber < 39) {
        throw Error(`Competition contracts of version < 0.0.1-rc.39 are not supported`)
      }
      return contractInfo.name === 'Competition'
    } else {
      return false
    }
  }

  public state(apolloQueryOptions: IApolloQueryOptions = {}): Observable<ICompetitionState> {
    const query = gql`query SchemeStateById
      {
        controllerScheme (id: "${this.id}") {
          ...SchemeFields
        }
      }
      ${Plugin.baseFragment.SchemeFields}
    `
    const itemMap = (item: any) => Competition.itemMap(this.context, item)
    return this.context.getObservableObject(query, itemMap, apolloQueryOptions) as Observable<ICompetitionState>
  }

  //TODO: Get competition contract

  public getPermissions(): Permissions {
    throw new Error("Method not implemented.");
  }

  public proposals(options: IProposalQueryOptions, apolloQueryOptions: IApolloQueryOptions): Observable<any[]> {
    throw new Error("Method not implemented.");
  }

  public suggestions(
    options: ICompetitionSuggestionQueryOptions = {},
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable<CompetitionSuggestion[]> {
    if (!options.where) { options.where = {} }
    options.where.proposal = this.id
    return CompetitionSuggestion.search(this.context, options, apolloQueryOptions)
  }

  public votes(
    options: IVoteQueryOptions = {},
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable<CompetitionVote[]> {
    if (!options.where) { options.where = {} }
    options.where.proposal = this.id
    return CompetitionVote.search(this.context, options, apolloQueryOptions)
  }

  protected async createProposalTransaction(options: IProposalCreateOptionsComp): Promise<ITransaction> {
    const context = this.context
    const schemeState = await this.fetchState()
    if (!schemeState) {
      throw Error(`No scheme was found with this id: ${this.id}`)
    }

    const contract = Competition.getCompetitionContract(this.context, schemeState)

    // check sanity -- is the competition contract actually c
    const contributionRewardExtAddress = await contract.contributionRewardExt()
    if (contributionRewardExtAddress.toLowerCase() !== schemeState.address) {
      throw Error(`This ContributionRewardExt/Competition combo is malconfigured: expected ${contributionRewardExtAddress.toLowerCase()} to equal ${schemeState.address}`)
    }

    options.descriptionHash = await context.saveIPFSData(options)
    if (!options.rewardSplit) {
      throw Error(`Rewardsplit was not given..`)
    } else {
      if (options.rewardSplit.reduce((a: number, b: number) => a + b) !== 100) {
        throw Error(`Rewardsplit must sum 100 (they sum to  ${options.rewardSplit.reduce((a: number, b: number) => a + b)})`)
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
        options.reputationReward && options.reputationReward.toString() || 0,
        [
          options.nativeTokenReward && options.nativeTokenReward.toString() || 0,
          options.ethReward && options.ethReward.toString() || 0,
          options.externalTokenReward && options.externalTokenReward.toString() || 0
        ],
        options.externalTokenAddress || NULL_ADDRESS,
        options.rewardSplit,
        competitionParams,
        proposerIsAdmin
      ]
    }
}

  protected createProposalTransactionMap(): transactionResultHandler<CompetitionProposal> {
    return (receipt: ITransactionReceipt) => {
      const args = getEventArgs(receipt, 'NewCompetitionProposal', 'Competition.createProposal')
      const proposalId = args[0]
      return new CompetitionProposal(this.context, proposalId)
    }
  }

  protected createProposalErrorHandler(options: IProposalCreateOptionsComp): transactionErrorHandler {
    return async (err) => {
      if (err.message.match(/startTime should be greater than proposing time/ig)) {
        if (!this.context.web3) {
          throw Error('Web3 provider not set')
        }
        return Error(`${err.message} - startTime is ${options.startTime}, current block time is ${await getBlockTime(this.context.web3)}`)
      } else {
        const msg = `Error creating proposal: ${err.message}`
        return Error(msg)
      }
    }
  }

}