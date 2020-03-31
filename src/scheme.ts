import gql from 'graphql-tag'
import { Observable, Observer } from 'rxjs'
import { first } from 'rxjs/operators'
import { Arc, IApolloQueryOptions } from './arc'
import { IGenesisProtocolParams, mapGenesisProtocolParams } from './genesisProtocol'
import {
  ITransaction,
  ITransactionUpdate,
  Operation,
  toIOperationObservable,
  transactionErrorHandler,
  transactionResultHandler
} from './operation'
import { IProposalCreateOptions, IProposalQueryOptions, Proposal } from './proposal'
import { SchemeBase } from './schemes/base'
import { CompetitionScheme, isCompetitionScheme } from './schemes/competition'
import * as Competition from './schemes/competition'
import * as ContributionReward from './schemes/contributionReward'
import * as ContributionRewardExt from './schemes/contributionRewardExt'
import * as GenericScheme from './schemes/genericScheme'
import { ReputationFromTokenScheme } from './schemes/reputationFromToken'
import * as SchemeRegistrar from './schemes/schemeRegistrar'
import * as UGenericScheme from './schemes/uGenericScheme'
import { Address, ICommonQueryOptions } from './types'
import { createGraphQlQuery } from './utils'

export interface ISchemeState {
  id: string
  address: Address
  dao: Address
  name: string
  paramsHash: string
  version: string
  canDelegateCall: boolean
  canRegisterSchemes: boolean
  canUpgradeController: boolean
  canManageGlobalConstraints: boolean
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
export class Scheme extends SchemeBase  {

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
  ): Observable<SchemeBase[]> {
    let query
    if (apolloQueryOptions.fetchAllData === true) {
      query = gql`query SchemeSearchAllData {
        controllerSchemes ${createGraphQlQuery(options)}
        {
          ...SchemeFields
        }
      }
      ${SchemeBase.fragments.SchemeFields}`
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
            contributionRewardExtParams {
              id
              rewarder
            }
        }
      }`
    }

    const itemMap = (item: any): SchemeBase|null => {
      if (!options.where) {
        options.where = {}
      }

      if (isCompetitionScheme(context, item)) {
        return new Competition.CompetitionScheme(context, {
          address: item.address,
          canDelegateCall: item.canDelegateCall,
          canManageGlobalConstraints: item.canManageGlobalConstraints,
          canRegisterSchemes: item.canRegisterSchemes,
          canUpgradeController: item.canUpgradeController,
          dao: item.dao.id,
          id: item.id,
          name: item.name,
          numberOfBoostedProposals: Number(item.numberOfBoostedProposals),
          numberOfPreBoostedProposals: Number(item.numberOfPreBoostedProposals),
          numberOfQueuedProposals: Number(item.numberOfQueuedProposals),
          paramsHash: item.paramsHash,
          version: item.version
        })
      } else {
        const scheme = new Scheme(context, {
          address: item.address,
          canDelegateCall: item.canDelegateCall,
          canManageGlobalConstraints: item.canManageGlobalConstraints,
          canRegisterSchemes: item.canRegisterSchemes,
          canUpgradeController: item.canUpgradeController,
          dao: item.dao.id,
          id: item.id,
          name: item.name,
          numberOfBoostedProposals: Number(item.numberOfBoostedProposals),
          numberOfPreBoostedProposals: Number(item.numberOfPreBoostedProposals),
          numberOfQueuedProposals: Number(item.numberOfQueuedProposals),
          paramsHash: item.paramsHash,
          version: item.version
        })
        return scheme
      }
    }

    return context.getObservableList(
      query,
      itemMap,
      apolloQueryOptions
    ) as Observable<Scheme[]>
  }

  /**
   * map an apollo query result to ISchemeState
   *
   * @static
   * @param {*} item
   * @param {Arc} arc
   * @returns {(ISchemeState|null)}
   * @memberof Scheme
   */
  public static itemMap(arc: Arc, item: any): ISchemeState|null {
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

  public id: Address
  public coreState: ISchemeState | null = null
  public ReputationFromToken: ReputationFromTokenScheme | null = null

  constructor(public context: Arc, idOrOpts: Address | ISchemeState) {
    super(context, idOrOpts)
    this.context = context
    if (typeof idOrOpts === 'string') {
      this.id = idOrOpts as string
      this.id = this.id.toLowerCase()
    } else {
      this.setState(idOrOpts)
      this.id = (this.coreState as ISchemeState).id
    }
  }

  public setState(opts: ISchemeState) {
    this.coreState = opts
    if (this.coreState.name ===  'ReputationFromToken') {
      this.ReputationFromToken = new ReputationFromTokenScheme(this)
    }
  }

  /**
   * fetch the static state from the subgraph
   * @return the statatic state
   */
  public async fetchState(apolloQueryOptions: IApolloQueryOptions = {}): Promise<ISchemeState> {
    const state = await this.state(apolloQueryOptions).pipe(first()).toPromise()
    this.setState(state)
    return state
  }

  public state(apolloQueryOptions: IApolloQueryOptions = {}): Observable<ISchemeState> {
    const query = gql`query SchemeStateById
      {
        controllerScheme (id: "${this.id}") {
          ...SchemeFields
        }
      }
      ${SchemeBase.fragments.SchemeFields}
    `
    const itemMap = (item: any) => Scheme.itemMap(this.context, item)
    return this.context.getObservableObject(query, itemMap, apolloQueryOptions) as Observable<ISchemeState>
  }

  /**
   * create a new proposal in this Scheme
   * @param  options [description ]
   * @return a Proposal instance
   */
  public createProposal(options: IProposalCreateOptions): Operation<Proposal>  {
    const observable = Observable.create(async (observer: Observer<ITransactionUpdate<Proposal>>) => {
      try {
        let msg: string
        const context = this.context
        let transaction: ITransaction
        let map: transactionResultHandler<Proposal>
        const state = await this.fetchState()

        switch (state.name) {
          case 'ContributionReward': {
            const opts = options as ContributionReward.IProposalCreateOptionsCR
            transaction = await ContributionReward.createProposalTransaction(this.context, opts)
            map = ContributionReward.createProposalTransactionMap(this.context, opts)
            break
          }
          case 'ContributionRewardExt': {
            // TODO: ContributionRewardExt can also be used to create a Competition proposal
            // For now, we explicitly pass this in the options, but in reality (once 36-4 is released) we
            // should be able to sniff this: if the rewarder of the scheme is a Contribution.sol instance....
            if (options.proposalType === 'competition') {
              const competitionScheme = new CompetitionScheme(this.context, this.id)
              const opts = options as Competition.IProposalCreateOptionsComp
              return await competitionScheme.createProposal(opts)
            } else {
              const opts = options as ContributionRewardExt.IProposalCreateOptionsCRExt
              transaction = await ContributionRewardExt.createProposalTransaction(this.context, opts)
              map = ContributionRewardExt.createProposalTransactionMap(this.context, opts)
            }
            break
          }
          case 'UGenericScheme': {
            const opts = options as UGenericScheme.IProposalCreateOptionsGS
            transaction = await UGenericScheme.createProposalTransaction(this.context, opts)
            map = UGenericScheme.createProposalTransactionMap(this.context, opts)
            break
          }
          case 'GenericScheme': {
            const versionNumber = Number(state.version.split('rc.')[1])
            if (versionNumber < 23) {
              // the pre-24 " GenericScheme" contracts have beeen renamed to UGenericScheme
              const opts = options as UGenericScheme.IProposalCreateOptionsGS
              transaction = await UGenericScheme.createProposalTransaction(this.context, opts)
              map = UGenericScheme.createProposalTransactionMap(this.context, opts)
              break
            } else {
              const opts = options as GenericScheme.IProposalCreateOptionsGS
              transaction = await GenericScheme.createProposalTransaction(this.context, opts)
              map = GenericScheme.createProposalTransactionMap(this.context, opts)
              break
            }
          }
          case 'SchemeRegistrar': {
            const opts = options as SchemeRegistrar.IProposalCreateOptionsSR
            transaction = await SchemeRegistrar.createProposalTransaction(this.context, opts)
            map = SchemeRegistrar.createTransactionMap(this.context, opts)
            break
          }
          default:
            msg = `Unknown proposal scheme: '${state.name}'`
            throw Error(msg)
        }

        const sendTransactionObservable = context.sendTransaction(transaction, map)
        const sub = sendTransactionObservable.subscribe(observer)

        return () => sub.unsubscribe()
      } catch (e) {
        observer.error(e)
      }
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

  protected async createProposalTransaction(
    options: IProposalCreateOptions
  ): Promise<ITransaction> {
    throw Error('this should never be called')
  }

  protected createProposalTransactionMap(): transactionResultHandler<Proposal> {
    throw Error('this should never be called')
  }

  protected createProposalErrorHandler(
    options: IProposalCreateOptions
  ): transactionErrorHandler {
    throw Error('this should never be called')
  }
}
