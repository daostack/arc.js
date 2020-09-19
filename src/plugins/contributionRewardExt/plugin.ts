import { BigNumber } from 'ethers'
import gql from 'graphql-tag'
import { Observable } from 'rxjs'
import {
  Address,
  Arc,
  ContributionRewardExtProposal,
  getEventArgs,
  IContributionRewardExtProposalState,
  IGenesisProtocolParams,
  IPluginState,
  IProposalBaseCreateOptions,
  ITransaction,
  ITransactionReceipt,
  Logger,
  mapGenesisProtocolParams,
  NULL_ADDRESS,
  Plugin,
  ProposalPlugin
} from '../../index'

export interface IContributionRewardExtState extends IPluginState {
  pluginParams: {
    votingMachine: Address
    voteParams: IGenesisProtocolParams
    rewarder: Address
  }
}

export interface IProposalCreateOptionsCRExt extends IProposalBaseCreateOptions {
  beneficiary: Address
  nativeTokenReward?: BigNumber
  reputationReward?: BigNumber
  ethReward?: BigNumber
  externalTokenReward?: BigNumber
  externalTokenAddress?: Address
  proposer: Address
}

export interface IInitParamsCRExt {
  daoId: string
  votingMachine: string
  votingParams: number[]
  voteOnBehalf: string
  voteParamsHash: string
  daoFactory: string,
  packageVersion: number[]
  rewarderName: string
}

export class ContributionRewardExtPlugin extends ProposalPlugin<
  IContributionRewardExtState,
  IContributionRewardExtProposalState,
  IProposalCreateOptionsCRExt
> {
  public static fragment = {
    name: 'ContributionRewardExtParams',
    fragment: gql`
      fragment ContributionRewardExtParams on ControllerScheme {
        contributionRewardExtParams {
          id
          votingMachine
          voteParams {
            id
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
          rewarder
        }
      }
    `
  }

  public static initializeParamsMap(initParams: IInitParamsCRExt) {

    Object.keys(initParams).forEach((key) => {
      if (initParams[key] === undefined) {
        throw new Error(`ContributionRewardExt's initialize parameter '${key}' cannot be undefined`)
      }
    })

    return [
      initParams.daoId,
      initParams.votingMachine,
      initParams.votingParams,
      initParams.voteOnBehalf,
      initParams.voteParamsHash,
      initParams.daoFactory,
      initParams.packageVersion,
      initParams.rewarderName
    ]
  }

  public static itemMap(
    context: Arc,
    item: any,
    queriedId?: string
  ): IContributionRewardExtState | null {
    if (!item) {
      Logger.debug(`ContributionRewardExtPlugin ItemMap failed. ${queriedId ? `Could not find ContributionRewardExtPlugin with id '${queriedId}'` : ''}`)
      return null
    }

    if (!item.contributionRewardExtParams) {
      throw new Error(`Plugin ${queriedId ? `with id '${queriedId}'` : ''}wrongly instantiated as ContributionRewardExt Plugin`)
    }

    const baseState = Plugin.itemMapToBaseState(context, item)

    const contributionRewardExtParams = {
      rewarder: item.contributionRewardExtParams.rewarder,
      voteParams: mapGenesisProtocolParams(item.contributionRewardExtParams.voteParams),
      votingMachine: item.contributionRewardExtParams.votingMachine
    }

    return {
      ...baseState,
      pluginParams: contributionRewardExtParams
    }
  }

  public async createProposalTransaction(
    options: IProposalCreateOptionsCRExt
  ): Promise<ITransaction> {
    if (!options.proposer) {
      options.proposer = NULL_ADDRESS
    }
    if (!options.descriptionHash) {
      options.descriptionHash = await this.context.saveIPFSData(options)
    }

    return {
      contract: this.context.getContract(options.plugin as string),
      method: 'proposeContributionReward(string,int256,uint256[5],address,address)',
      args: [
        options.descriptionHash || '',
        (options.reputationReward && options.reputationReward.toString()) || 0,
        [
          (options.nativeTokenReward && options.nativeTokenReward.toString()) || 0,
          (options.ethReward && options.ethReward.toString()) || 0,
          (options.externalTokenReward && options.externalTokenReward.toString()) || 0
        ],
        options.externalTokenAddress || NULL_ADDRESS,
        options.beneficiary,
        options.proposer
      ]
    }
  }

  public createProposalTransactionMap() {
    return (receipt: ITransactionReceipt) => {
      const args = getEventArgs(
        receipt,
        'NewContributionProposal',
        'ContributionRewardExt.createProposal'
      )
      const proposalId = args[1]
      return new ContributionRewardExtProposal(this.context, proposalId)
    }
  }

  public async ethBalance(): Promise<Observable<BigNumber>> {
    let state

    if (!this.coreState) {
      state = await this.fetchState()
    } else {
      state = this.coreState
    }

    const contributionRewardExt = this.context.getContract(state.address)
    return this.context.ethBalance(await contributionRewardExt.vault())
  }
}
