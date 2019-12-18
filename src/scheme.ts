import gql from 'graphql-tag'
import { Observable } from 'rxjs'
import { first } from 'rxjs/operators'
import { Arc, IApolloQueryOptions } from './arc'
import { DAO } from './dao'
import { IGenesisProtocolParams, mapGenesisProtocolParams } from './genesisProtocol'
import { Operation, toIOperationObservable } from './operation'
import { IProposalCreateOptions, IProposalQueryOptions, Proposal } from './proposal'
import * as Competition from './schemes/competition'
import * as ContributionReward from './schemes/contributionReward'
import * as ContributionRewardExt from './schemes/contributionRewardExt'
import * as GenericScheme from './schemes/genericScheme'
import { ReputationFromTokenScheme } from './schemes/reputationFromToken'
import * as SchemeRegistrar from './schemes/schemeRegistrar'
import * as UGenericScheme from './schemes/uGenericScheme'
import { Address, ICommonQueryOptions, IStateful } from './types'
import { createGraphQlQuery } from './utils'

export interface ISchemeStaticState {
  id: string
  address: Address
  dao: Address
  name: string
  paramsHash: string
  version: string
}

export interface ISchemeState extends ISchemeStaticState {
  canDelegateCall: boolean
  canRegisterSchemes: boolean
  canUpgradeController: boolean
  canManageGlobalConstraints: boolean
  dao: Address
  paramsHash: string
  contributionRewardParams?: IContributionRewardParams
  contributionRewardExtParams?: IContributionRewardExtParams
  genericSchemeParams?: IGenericSchemeParams
  schemeRegistrarParams?: {
    votingMachine: Address
    voteRemoveParams: IGenesisProtocolParams
    voteRegisterParams: IGenesisProtocolParams
  } | null
  numberOfQueuedProposals: number
  numberOfPreBoostedProposals: number
  numberOfBoostedProposals: number
  uGenericSchemeParams?: IGenericSchemeParams
  schemeParams?: IGenericSchemeParams | IContributionRewardParams | IContributionRewardExtParams | ISchemeRegisterParams
}

export interface IGenericSchemeParams {
  votingMachine: Address
  contractToCall: Address
  voteParams: IGenesisProtocolParams
}

export interface IContributionRewardParams {
  votingMachine: Address
  voteParams: IGenesisProtocolParams
}
export interface IContributionRewardExtParams {
  votingMachine: Address
  voteParams: IGenesisProtocolParams
  rewarder: Address
}

export interface ISchemeRegisterParams {
  votingMachine: Address
  contractToCall: Address
  voteParams: IGenesisProtocolParams
}

export interface ISchemeQueryOptions extends ICommonQueryOptions {
  where?: {
    address?: Address
    canDelegateCall?: boolean
    canRegisterSchemes?: boolean
    canUpgradeController?: boolean
    canManageGlobalConstraints?: boolean
    dao?: Address
    id?: string
    name?: string
    paramsHash?: string
    [key: string]: any
  }
}

export interface ISchemeQueryOptions extends ICommonQueryOptions {
  where?: {
    address?: Address
    canDelegateCall?: boolean
    canRegisterSchemes?: boolean
    canUpgradeController?: boolean
    canManageGlobalConstraints?: boolean
    dao?: Address
    id?: string
    name?: string
    paramsHash?: string
    [key: string]: any
  }
}

/**
 * A Scheme represents a scheme instance that is registered at a DAO
 */
export class Scheme implements IStateful<ISchemeState> {
  public static fragments = {
    SchemeFields: gql`
    fragment SchemeFields on ControllerScheme {
      id
      address
      name
      dao { id }
      canDelegateCall
      canRegisterSchemes
      canUpgradeController
      canManageGlobalConstraints
      paramsHash
      contributionRewardParams {
        votingMachine
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
      }
      contributionRewardExtParams {
        votingMachine
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
        rewarder
      }
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
      }
      schemeRegistrarParams {
        votingMachine
        voteRemoveParams {
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
        voteRegisterParams {
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
      }
      numberOfQueuedProposals
      numberOfPreBoostedProposals
      numberOfBoostedProposals
      uGenericSchemeParams {
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
      }
      version
    }`
  }
  /**
   * Scheme.search(context, options) searches for scheme entities
   * @param  context an Arc instance that provides connection information
   * @param  options the query options, cf. ISchemeQueryOptions
   * @return         an observable of Scheme objects
   */
  public static search(
    context: Arc,
    options: ISchemeQueryOptions = {},
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable<Scheme[]> {
    let query
    if (apolloQueryOptions.fetchAllData === true) {
      query = gql`query SchemeSearchAllData {
        controllerSchemes ${createGraphQlQuery(options)}
        {
          ...SchemeFields
        }
      }
      ${Scheme.fragments.SchemeFields}`
    } else {
      query = gql`query SchemeSearch {
        controllerSchemes ${createGraphQlQuery(options)}
        {
            id
            address
            name
            dao { id }
            paramsHash
            version
        }
      }`
    }

    const itemMap = (item: any): Scheme|null => {
      if (!options.where) { options.where = {}}

      const scheme = new Scheme({
        address: item.address,
        dao: item.dao.id,
        id: item.id,
        name: item.name,
        paramsHash: item.paramsHash,
        version: item.version
      }, context)
      return scheme
    }

    return context.getObservableList(
      query,
      itemMap,
      apolloQueryOptions
    ) as Observable<Scheme[]>
  }

  public id: Address
  public staticState: ISchemeStaticState | null = null
  public ReputationFromToken: ReputationFromTokenScheme | null = null

  constructor(idOrOpts: Address | ISchemeStaticState, public context: Arc) {
    this.context = context
    if (typeof idOrOpts === 'string') {
      this.id = idOrOpts as string
      this.id = this.id.toLowerCase()
    } else {
      this.setStaticState(idOrOpts)
      this.id = (this.staticState as ISchemeStaticState).id
    }
  }

  public setStaticState(opts: ISchemeStaticState) {
    this.staticState = opts
  }

  /**
   * fetch the static state from the subgraph
   * @return the statatic state
   */
  public async fetchStaticState(): Promise < ISchemeStaticState > {
    if (!!this.staticState) {
      return this.staticState
    } else {
      const state = await this.state({ subscribe: false}).pipe(first()).toPromise()
      if (state === null) {
        throw Error(`No scheme with id ${this.id} was found in the subgraph`)
      }
      this.staticState = {
        address: state.address,
        dao: state.dao,
        id: this.id,
        name: state.name,
        paramsHash: state.paramsHash,
        version: state.version
      }
      if (this.staticState.name ===  'ReputationFromToken') {
        this.ReputationFromToken = new ReputationFromTokenScheme(this)
      }
      return state
    }
  }

  public state(apolloQueryOptions: IApolloQueryOptions = {}): Observable<ISchemeState> {
    const query = gql`query SchemeState
      {
        controllerScheme (id: "${this.id}") {
          ...SchemeFields
        }
      }
      ${Scheme.fragments.SchemeFields}
    `

    const itemMap = (item: any): ISchemeState|null => {
      if (!item) {
        return null
      }

      let name = item.name
      if (!name) {

        try {
          name = this.context.getContractInfo(item.address).name
        } catch (err) {
          if (err.message.match(/no contract/ig)) {
            // continue
          } else {
            throw err
          }
        }
      }
      const uGenericSchemeParams = item.uGenericSchemeParams && {
        contractToCall: item.uGenericSchemeParams.contractToCall,
        voteParams: mapGenesisProtocolParams(item.uGenericSchemeParams.voteParams),
        votingMachine: item.uGenericSchemeParams.votingMachine
      }
      const contributionRewardParams = item.contributionRewardParams && {
        voteParams: mapGenesisProtocolParams(item.contributionRewardParams.voteParams),
        votingMachine: item.contributionRewardParams.votingMachine
      }
      const contributionRewardExtParams = item.contributionRewardExtParams && {
        rewarder: item.contributionRewardExtParams.rewarder,
        voteParams: mapGenesisProtocolParams(item.contributionRewardExtParams.voteParams),
        votingMachine: item.contributionRewardExtParams.votingMachine
      }
      const schemeRegistrarParams = item.schemeRegistrarParams && {
        voteRegisterParams: mapGenesisProtocolParams(item.schemeRegistrarParams.voteRegisterParams),
        voteRemoveParams: mapGenesisProtocolParams(item.schemeRegistrarParams.voteRemoveParams),
        votingMachine: item.schemeRegistrarParams.votingMachine
      }
      const genericSchemeParams = item.genericSchemeParams  && {
        contractToCall: item.genericSchemeParams.contractToCall,
        voteParams: mapGenesisProtocolParams(item.genericSchemeParams.voteParams),
        votingMachine: item.genericSchemeParams.votingMachine
      }
      const schemeParams = (
        uGenericSchemeParams || contributionRewardParams ||
        schemeRegistrarParams || genericSchemeParams || contributionRewardExtParams
      )
      return {
        address: item.address,
        canDelegateCall: item.canDelegateCall,
        canManageGlobalConstraints: item.canManageGlobalConstraints,
        canRegisterSchemes: item.canRegisterSchemes,
        canUpgradeController: item.canUpgradeController,
        contributionRewardExtParams,
        contributionRewardParams,
        dao: item.dao.id,
        genericSchemeParams,
        id: item.id,
        name,
        numberOfBoostedProposals: Number(item.numberOfBoostedProposals),
        numberOfPreBoostedProposals: Number(item.numberOfPreBoostedProposals),
        numberOfQueuedProposals: Number(item.numberOfQueuedProposals),
        paramsHash: item.paramsHash,
        schemeParams,
        schemeRegistrarParams,
        uGenericSchemeParams,
        version: item.version
      }
    }
    return  this.context.getObservableObject(query, itemMap, apolloQueryOptions) as Observable<ISchemeState>
  }

  /**
   * create a new proposal in this DAO
   * TODO: move this to the schemes - we should call proposal.scheme.createProposal
   * @param  options [description ]
   * @return a Proposal instance
   */
  public createProposal(options: IProposalCreateOptions): Operation<Proposal>  {
    const observable = Observable.create(async (observer: any) => {
      let msg: string
      const context = this.context
      let createTransaction: () => any = () => null
      let map: any
      let errHandler = (err: Error) => err
      const state = await this.fetchStaticState()

      switch (state.name) {
        case 'ContributionReward':
          createTransaction  = ContributionReward.createProposal(options, this.context)
          map = ContributionReward.createTransactionMap(options, this.context)
          break
        case 'ContributionRewardExt':
          // TODO: ContributionRewardExt can also be used to create a Competition proposal
          // For now, we explicitly pass this in the options, but in reality (once 36-4 is released) we
          // should be able to sniff this: if the rewarder of the scheme is a Contribution.sol instance....
          if (options.proposalType === 'competition') {
            createTransaction = Competition.createProposal(options, this.context)
            map = Competition.createTransactionMap(options, this.context),
            errHandler = Competition.createProposalErrorHandler
          } else {
            createTransaction  = ContributionRewardExt.createProposal(options, this.context)
            map = ContributionRewardExt.createTransactionMap(options, this.context)
          }
          break

        case 'UGenericScheme':
            createTransaction  = UGenericScheme.createTransaction(options, this.context)
            map = UGenericScheme.createTransactionMap(options, this.context)
            break

        case 'GenericScheme':
          const versionNumber = Number(state.version.split('rc.')[1])
          if (versionNumber < 23) {
            // the pre-24 " GenericScheme" contracts have beeen renamed to UGenericScheme
            createTransaction  = UGenericScheme.createTransaction(options, this.context)
            map = UGenericScheme.createTransactionMap(options, this.context)
            break
          } else {
            createTransaction  = GenericScheme.createTransaction(options, this.context)
            map = GenericScheme.createTransactionMap(options, this.context)
            break
          }

        case 'SchemeRegistrar':
          createTransaction  = SchemeRegistrar.createTransaction(options, this.context)
          map = SchemeRegistrar.createTransactionMap(options, this.context)
          break

        default:
          msg = `Unknown proposal scheme: '${state.name}'`
          msg = `${state.name} ${state.name === 'ContributionRewardExt'}`
          throw Error(msg)
      }

      const sendTransactionObservable = context.sendTransaction(createTransaction, map, errHandler)
      const sub = sendTransactionObservable.subscribe(observer)

      return () => sub.unsubscribe()
    })

    return toIOperationObservable(observable)
  }

  public proposals(
    options: IProposalQueryOptions = {},
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable<Proposal[]> {
    if (!options.where) { options.where = {}}
    options.where.scheme = this.id
    return Proposal.search(this.context, options, apolloQueryOptions)
  }

  /**
   * Return a list of competitions in this scheme.
   * @param options
   * @param apolloQueryOptions
   */
  public competitions(
    options: IProposalQueryOptions = {},
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable<Competition.Competition[]> {
    // TODO: This function will error if the current scheme is not a competiion scheme
    // const staticState = await this.fetchStaticState()
    // if (staticState.name !== `ContributionRewardExt`) {
    //   // TODO: we should also check if the calling
    //   throw Error(`This scheme is not a competition scheme - so no competitions can be found`)
    // }
    if (!options.where) { options.where = {}}
    options.where = { ...options.where, competition_not: null}
    return Competition.Competition.search(this.context, options, apolloQueryOptions)
  }

  /**
   *
   */
  public competitionCreateSuggestion(options: {
    proposalId: string,
    title: string,
    description: string,
    tags: string[],
    url: string
  }): Operation<any> {
    const createTransaction = async () => {
      const contract = await this.competionGetContract()
      const descriptionHash = await this.context.saveIPFSData(options)
      const transaction = contract.methods.suggest(options.proposalId, descriptionHash)
      return transaction
    }

    const map = (receipt: any) => {
      if (Object.keys(receipt.events).length === 0) {
        // this does not mean that anything failed
        return receipt
      } else {
        const eventName = 'NewSuggestion'
        const suggestionId = receipt.events[eventName].returnValues._suggestionId
        // const competitionSuggestionId = Competition.CompetitionSuggestion.calculateId({
        //   scheme: this.id,
        //   suggestionId
        // })
        return new Competition.CompetitionSuggestion({scheme: this.id, suggestionId}, this.context)
      }
    }
    const errorHandler = async (err: Error) => {
      // we got an error
      // see if the proposalId does exist in the contract
      const contract = await this.competionGetContract()
      const proposal = await contract.methods.proposals(options.proposalId).call()
      if (!proposal) {
        throw Error(`A proposal with id ${options.proposalId} does not exist`)
      }
      return err
    }
    const observable = this.context.sendTransaction(createTransaction, map, errorHandler)
    return toIOperationObservable(observable)
  }

  public async competionGetContract() {
    const state = await this.state().pipe(first()).toPromise()
    if (state === null) {
      throw Error(`No scheme was found with id ${this.id}`)
    }
    const rewarder = state.contributionRewardExtParams && state.contributionRewardExtParams.rewarder
    const contractInfo = this.context.getContractInfo(rewarder as Address)
    if (contractInfo.name !== 'Competition') {
      throw Error(`We did not find a Competition contract at the rewarder address ${rewarder}, found ${contractInfo.name} instead`)
    }
    const contract = this.context.getContract(rewarder as Address)
    return contract
  }

  public competitionVote(options: {
    suggestionId: string // this is the suggestion COUNTER
  }): Operation<any> {
    const createTransaction = async () => {
      const contract = await this.competionGetContract()
      const transaction = contract.methods.vote(options.suggestionId)
      return transaction
    }

    const map = (receipt: any) => {
      if (Object.keys(receipt.events).length === 0) {
        // this does not mean that anything failed
        return receipt
      } else {
        const eventName = 'NewVote'
        // emit NewVote(proposalId, _suggestionId, msg.sender, reputation);
        // const suggestionId = receipt.events[eventName].returnValues._suggestionId
        const voter = receipt.events[eventName].returnValues._voter
        const reputation = receipt.events[eventName].returnValues._reputation
        return new Competition.CompetitionVote({
          reputation,
          voter
        }, this.context)
      }
    }
    const errorHandler = async (err: Error) => {
      const contract = await this.competionGetContract()
      // see if the suggestionId does exist in the contract
      const suggestion = await contract.methods.suggestions(options.suggestionId).call()
      if (suggestion.proposalId === '0x0000000000000000000000000000000000000000000000000000000000000000') {
        throw Error(`A suggestion with suggestionId ${options.suggestionId} does not exist`)
      }

      // check if the sender has reputation in the DAO
      const state = await this.state().pipe(first()).toPromise()
      const dao = new DAO(state.dao, this.context)
      const reputation = await dao.nativeReputation().pipe(first()).toPromise()
      const sender = await this.context.getAccount().pipe(first()).toPromise()
      const reputationOfUser = await reputation.reputationOf(sender).pipe(first()).toPromise()
      if (reputationOfUser.isZero()) {
        throw Error(`Cannot vote because the user ${sender} does not have any reputation in the DAO at ${dao.id}`)
      }
      return err
    }
    const observable = this.context.sendTransaction(createTransaction, map, errorHandler)
    return toIOperationObservable(observable)
  }
}
