import { Observable } from 'rxjs'
import {
  Arc,
  IApolloQueryOptions,
  Operation,
  toIOperationObservable,
  ITransaction,
  transactionErrorHandler,
  transactionResultHandler,
  Plugin,
  IPluginQueryOptions,
  IPluginState,
  Proposal,
  IProposalQueryOptions,
  IProposalBaseCreateOptions,
  IProposalState
} from '../index'

export abstract class ProposalPlugin<
  TPluginState extends IPluginState,
  TProposalState extends IProposalState,
  TProposalCreateOptions extends IProposalBaseCreateOptions
> extends Plugin<TPluginState> {

  protected abstract async createProposalTransaction(
    options: TProposalCreateOptions
  ): Promise<ITransaction>

  //TODO: optional parameter 'options'?
  protected abstract createProposalTransactionMap(options?: TProposalCreateOptions): transactionResultHandler<Proposal<TProposalState>>


  //TODO: do we need this method? 

  // protected abstract createProposalErrorHandler(
  //   options: TProposalCreateOptions
  // ): transactionErrorHandler

  //The old implementation in scheme.ts was:
  protected createProposalErrorHandler(
    options: TProposalCreateOptions
  ): transactionErrorHandler {
    throw Error('this should never be called')
  }

  public static search<
    TPluginState extends IPluginState,
    TProposalState extends IProposalState,
    TProposalCreateOptions extends IProposalBaseCreateOptions
  > (
    context: Arc,
    options: IPluginQueryOptions = {},
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable<ProposalPlugin<TPluginState, TProposalState, TProposalCreateOptions>[]> {

    const proposalPluginOptions = {
      ...options
      //TODO: query to get only Plugins that can create proposals
    }

    return Plugin.search(context, proposalPluginOptions, apolloQueryOptions) as Observable<ProposalPlugin<TPluginState, TProposalState, TProposalCreateOptions>[]>
  }

  public createProposal(options: TProposalCreateOptions): Operation<Proposal<TProposalState>>  {
    const observable = Observable.create(async (observer: any) => {
      try {
        const createTransaction = await this.createProposalTransaction(options)
        const map = this.createProposalTransactionMap()
        const errHandler = this.createProposalErrorHandler(options)
        const sendTransactionObservable = this.context.sendTransaction(
          createTransaction, map, errHandler
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

  public proposals(
    options: IProposalQueryOptions = {},
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable <Proposal<TProposalState>[]> {
    if (!options.where) { options.where = {}}
    options.where.scheme = this.id
    return Proposal.search(this.context, options, apolloQueryOptions)
  }
}