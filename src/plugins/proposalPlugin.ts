import { Observable } from 'rxjs'
import {
  Arc,
  IApolloQueryOptions,
  IPluginQueryOptions,
  IPluginState,
  IProposalBaseCreateOptions,
  IProposalQueryOptions,
  IProposalState,
  ITransaction,
  Operation,
  Plugin,
  Proposal,
  toIOperationObservable,
  transactionErrorHandler,
  transactionResultHandler
} from '../index'

export abstract class ProposalPlugin<
  TPluginState extends IPluginState,
  TProposalState extends IProposalState,
  TProposalCreateOptions extends IProposalBaseCreateOptions
> extends Plugin<TPluginState> {

  public static search<
    TPluginState extends IPluginState,
    TProposalState extends IProposalState,
    TProposalCreateOptions extends IProposalBaseCreateOptions
  >(
    context: Arc,
    options: IPluginQueryOptions = {},
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable<Array<ProposalPlugin<TPluginState, TProposalState, TProposalCreateOptions>>> {
    const proposalPluginOptions = {
      ...options
      // TODO: query to get only Plugins that can create proposals
    }

    return Plugin.search(context, proposalPluginOptions, apolloQueryOptions) as Observable<
      Array<ProposalPlugin<TPluginState, TProposalState, TProposalCreateOptions>>
    >
  }

  public createProposal(options: TProposalCreateOptions): Operation<Proposal<TProposalState>> {
    const observable = Observable.create(async (observer: any) => {
      try {
        const createTransaction = await this.createProposalTransaction(options)
        const map = this.createProposalTransactionMap(options)
        const errorHandler = this.createProposalErrorHandler(options)
        const sendTransactionObservable = this.context.sendTransaction(createTransaction, map, errorHandler)
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
  ): Observable<Array<Proposal<TProposalState>>> {
    if (!options.where) {
      options.where = {}
    }
    options.where.scheme = this.id
    return Proposal.search(this.context, options, apolloQueryOptions)
  }

  protected createProposalErrorHandler(
    options: TProposalCreateOptions
  ): transactionErrorHandler {
    return ((err) => err)
  }

  protected abstract async createProposalTransaction(
    options: TProposalCreateOptions
  ): Promise<ITransaction>

  protected abstract createProposalTransactionMap(
    options?: TProposalCreateOptions
  ): transactionResultHandler<Proposal<TProposalState>>
}
