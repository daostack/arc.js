import { Proposal } from "../proposal/proposal"

export abstract class ProposalPlugin<TProposal extends Proposal, TProposalOptions extends IProposalOptions> extends Plugin {
  protected abstract async createProposalTransaction(
    options: IProposalCreateOptions
  ): Promise<ITransaction>

  protected abstract createProposalTransactionMap(): transactionResultHandler<Proposal>

  protected abstract createProposalErrorHandler(
    options: IProposalCreateOptions
  ): transactionErrorHandler


  public abstract proposals(
    options: IProposalQueryOptions = {},
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable < Proposal[] >
}