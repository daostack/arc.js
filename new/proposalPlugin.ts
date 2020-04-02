import { Proposal, IProposalQueryOptions, IProposalBaseCreateOptions } from "./proposal"
import { IApolloQueryOptions } from "./types";
import { Observable } from "rxjs";
import { Operation, toIOperationObservable, ITransaction, transactionErrorHandler, transactionResultHandler } from "./operation";
import { Plugin, IPluginQueryOptions } from './plugin'
import { Arc } from "./arc";

export abstract class ProposalPlugin extends Plugin {

  protected abstract async createProposalTransaction(
    options: IProposalBaseCreateOptions
  ): Promise<ITransaction>

  protected abstract createProposalTransactionMap(): transactionResultHandler<Proposal>

  protected abstract createProposalErrorHandler(
    options: IProposalBaseCreateOptions
  ): transactionErrorHandler

  public createProposal(options: IProposalBaseCreateOptions): Operation<Proposal>  {
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
  ): Observable <Proposal[]> {
    if (!options.where) { options.where = {}}
    options.where.scheme = this.id
    return Proposal.search(this.context, options, apolloQueryOptions)
  }
}