import { Proposal, IProposalQueryOptions, IProposalBaseCreateOptions, IProposalState } from "./proposal"
import { IApolloQueryOptions } from "../types";
import { Observable } from "rxjs";
import { Operation, toIOperationObservable, ITransaction, transactionErrorHandler, transactionResultHandler } from "../operation";
import { Plugin, IPluginQueryOptions, IPluginState } from './plugin'
import { Arc } from "../arc";

export abstract class ProposalPlugin<TPluginState extends IPluginState, TProposalState extends IProposalState> extends Plugin<TPluginState> {

  protected abstract async createProposalTransaction(
    options: IProposalBaseCreateOptions
  ): Promise<ITransaction>

  //TODO: optional parameter 'options'?
  protected abstract createProposalTransactionMap(options?: IProposalBaseCreateOptions): transactionResultHandler<Proposal<TProposalState>>


  //TODO: do we need this method? 

  // protected abstract createProposalErrorHandler(
  //   options: IProposalBaseCreateOptions
  // ): transactionErrorHandler

  //The old implementation in scheme.ts was:
  protected createProposalErrorHandler(
    options: IProposalBaseCreateOptions
  ): transactionErrorHandler {
    throw Error('this should never be called')
  }

  public static search<TPluginState extends IPluginState, TProposalState extends IProposalState>(
    context: Arc,
    options: IPluginQueryOptions = {},
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable<ProposalPlugin<TPluginState, TProposalState>[]> {

    const proposalPluginOptions = {
      ...options
      //TODO: query to get only Plugins that can create proposals
    }

    return Plugin.search(context, proposalPluginOptions, apolloQueryOptions) as Observable<ProposalPlugin<TPluginState, TProposalState>[]>
  }

  public createProposal(options: IProposalBaseCreateOptions): Operation<Proposal<TProposalState>>  {
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