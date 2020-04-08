import { IProposalState, Proposal } from "../../proposal"
import { IEntityRef } from "../../entity"
import { Arc } from "../../arc"
import { secondSinceEpochToDate } from "../../utils"
import { IApolloQueryOptions, Address } from "../../types"
import { Observable, from } from "rxjs"
import gql from "graphql-tag"
import { CompetitionVote } from "./vote"
import { ITransactionReceipt, getEventArgs, ITransaction, toIOperationObservable, Operation } from "../../operation"
import { CompetitionSuggestion } from "./suggestion"
import { DAO } from "../../dao"
import { first, concatMap } from "rxjs/operators"
import { Competition } from "./plugin"
import { Plugin } from "../../plugin"
import { IContributionRewardExtState } from "../contributionRewardExt/plugin"

export interface ICompetitionProposalState extends IProposalState { 
  id: string
  admin: Address
  contract: Address
  endTime: Date
  numberOfWinners: number
  rewardSplit: number[]
  startTime: Date
  votingStartTime: Date
  suggestionsEndTime: Date
  numberOfVotesPerVoter: number
  scheme: IEntityRef<Competition>
  snapshotBlock: number
  createdAt: Date
  totalVotes: number
  totalSuggestions: number
  numberOfWinningSuggestions: number
}

export class CompetitionProposal extends Proposal {

  coreState: ICompetitionProposalState

  constructor(
    context: Arc,
    idOrOpts: string | ICompetitionProposalState
  ) {
    super()
    this.context = context
    if (typeof idOrOpts === 'string') {
      this.id = idOrOpts
    } else {
      this.id = idOrOpts.id
      this.setState(idOrOpts)
    }
    this.context = context
  }

  static itemMap (context: Arc, item: any): CompetitionProposal | null {

    if (item === null || item === undefined) return null
    
    if (!item.contributionReward) throw new Error(`Unexpected proposal state: competition is set, but contributionReward is not`)
    
    const competition = Competition.itemMap(context, item) as Competition
    const competitionProposal = new CompetitionProposal(context, item.id)

    const baseState = Proposal.itemMapToBaseState(
      context,
      item,
      competition,
      competitionProposal,
      "Competition"
    )
    
    const state: ICompetitionProposalState = {
      ...baseState,
      admin: item.competition.admin,
      contract: item.competition.contract,
      createdAt: secondSinceEpochToDate(item.competition.createdAt),
      endTime: secondSinceEpochToDate(item.competition.endTime),
      id: item.competition.id,
      numberOfVotesPerVoter: Number(item.competition.numberOfVotesPerVoters),
      numberOfWinners: Number(item.competition.numberOfWinners),
      numberOfWinningSuggestions: Number(item.competition.numberOfWinningSuggestions),
      rewardSplit: item.competition.rewardSplit.map((perc: string) => Number(perc)),
      scheme: {
        id: competition.id,
        entity: competition
      },
      snapshotBlock: item.competition.snapshotBlock,
      startTime: secondSinceEpochToDate(item.competition.startTime),
      suggestionsEndTime: secondSinceEpochToDate(item.competition.suggestionsEndTime),
      totalSuggestions: Number(item.competition.totalSuggestions),
      totalVotes: Number(item.competition.totalVotes),
      votingStartTime: secondSinceEpochToDate(item.competition.votingStartTime)
    }

    return new CompetitionProposal(context, state)
  }

  public state(apolloQueryOptions: IApolloQueryOptions): Observable<IProposalState> {
    const query = gql`query ProposalState
      {
        proposal(id: "${this.id}") {
          ...ProposalFields
          votes {
            id
          }
          stakes {
            id
          }
        }
      }
      ${Proposal.fragments.ProposalFields}
      ${Plugin.baseFragment.SchemeFields}
    `

    const itemMap = (item: any) => CompetitionProposal.itemMap(this.context, item)

    const result = this.context.getObservableObject(query, itemMap, apolloQueryOptions) as Observable<ICompetitionProposalState>
    return result
  }

  public createSuggestion(options: {
    title: string,
    description: string,
    beneficiary?: Address,
    tags?: string[],
    url?: string
  }): Operation<CompetitionSuggestion> {

    const mapReceipt = async (receipt: ITransactionReceipt) => {
      const schemeState = await this.coreState.scheme.entity.fetchState({}, true) as IContributionRewardExtState
      const args = getEventArgs(receipt, 'NewSuggestion', 'Competition.createSuggestion')
      const suggestionId = args[1]
      return new CompetitionSuggestion(this.context, {
        scheme: (schemeState).id,
        suggestionId
      })
    }

    const errorHandler = async (err: Error) => {
      const schemeState = await this.coreState.scheme.entity.fetchState({}, true) as IContributionRewardExtState
      const contract = Competition.getCompetitionContract(this.context, schemeState)
      const proposal = await contract.proposals(this.id)
      if (!proposal) {
        throw Error(`A proposal with id ${this.id} does not exist`)
      }
      throw err
    }

    const createTransaction = async (): Promise<ITransaction> => {
      if (!options.beneficiary) {
        options.beneficiary = await this.context.getAccount().pipe(first()).toPromise()
      }
      const schemeState = await this.coreState.scheme.entity.fetchState({}, true) as IContributionRewardExtState
      const contract = Competition.getCompetitionContract(this.context, schemeState)
      const descriptionHash = await this.context.saveIPFSData(options)
      return {
        contract,
        method: 'suggest',
        args: [ this.id, descriptionHash, options.beneficiary ]
      }
    }

    const observable = from(createTransaction()).pipe(
      concatMap((transaction) => {
        return this.context.sendTransaction(
          transaction, mapReceipt, errorHandler
        )
      })
    )

    return toIOperationObservable(observable)
  }

  public voteSuggestion(options: {
    suggestionId: number // this is the suggestion COUNTER
  }): Operation<CompetitionVote> {

    const mapReceipt = (receipt: ITransactionReceipt) => {
      const [
        proposal,
        suggestionId,
        voter,
        reputation
      ] = getEventArgs(receipt, 'NewVote', 'Competition.voteSuggestion')

      const suggestion = CompetitionSuggestion.calculateId({
        scheme: this.id,
        suggestionId
      })

      return new CompetitionVote(this.context, {
        //TODO: where to get this ID?
        id: '',
        proposal,
        reputation,
        suggestion,
        voter
      })
    }

    const errorHandler = async (err: Error) => {
      const schemeState = await this.coreState.scheme.entity.fetchState({}, true) as IContributionRewardExtState
      const contract = await Competition.getCompetitionContract(this.context, schemeState)
      // see if the suggestionId does exist in the contract
      const suggestion = await contract.suggestions(options.suggestionId)
      if (suggestion.proposalId === '0x0000000000000000000000000000000000000000000000000000000000000000') {
        throw Error(`A suggestion with suggestionId ${options.suggestionId} does not exist`)
      }

      // check if the sender has reputation in the DAO
      const state = await this.fetchState()
      const dao = new DAO(this.context, state.dao.entity.coreState)
      const reputation = await dao.nativeReputation().pipe(first()).toPromise()
      const sender = await this.context.getAccount().pipe(first()).toPromise()
      const reputationOfUser = await reputation.reputationOf(sender).pipe(first()).toPromise()
      if (reputationOfUser.isZero()) {
        throw Error(`Cannot vote because the user ${sender} does not have any reputation in the DAO at ${dao.id}`)
      }
      return err
    }

    const createTransaction = async (): Promise<ITransaction> => {
      const schemeState = await this.coreState.scheme.entity.fetchState({}, true) as IContributionRewardExtState
      const contract = await Competition.getCompetitionContract(this.context, schemeState)
      return {
        contract,
        method: 'vote',
        args: [ options.suggestionId ]
      }
    }

    const observable = from(createTransaction()).pipe(
      concatMap((transaction) => {
        return this.context.sendTransaction(transaction, mapReceipt, errorHandler)
      })
    )

    return toIOperationObservable(observable)
  }

  public redeemSuggestion(options: {
    suggestionId: number // this is the suggestion COUNTER
  }): Operation<boolean> {

    const mapReceipt = (receipt: ITransactionReceipt) => {
      if (!receipt.events || receipt.events.length === 0) {
        throw Error('Competition.redeemSuggestion: missing events in receipt')
      } else {
        return true
      }
    }

    const errorHandler = async (err: Error) => {
      const schemeState = await this.coreState.scheme.entity.fetchState({}, true) as IContributionRewardExtState
      const contract = await Competition.getCompetitionContract(this.context, schemeState)
      // see if the suggestionId does exist in the contract
      const suggestion = await contract.suggestions(options.suggestionId)
      if (suggestion.proposalId === '0x0000000000000000000000000000000000000000000000000000000000000000') {
        throw Error(`A suggestion with suggestionId ${options.suggestionId} does not exist`)
      }
      return err
    }

    const createTransaction = async (): Promise<ITransaction> => {
      const schemeState = await this.coreState.scheme.entity.fetchState({}, true) as IContributionRewardExtState
      const contract = await Competition.getCompetitionContract(this.context, schemeState)
      return {
        contract,
        method: 'redeem',
        args: [ options.suggestionId ]
      }
    }

    const observable = from(createTransaction()).pipe(
      concatMap((transaction) => {
        return this.context.sendTransaction(transaction, mapReceipt, errorHandler)
      })
    )

    return toIOperationObservable(observable)
  }

  public mapReceipt = async (receipt: ITransactionReceipt) => {
    const args = getEventArgs(receipt, 'NewSuggestion', 'Competition.createSuggestion')
    const suggestionId = args[1]
    return new CompetitionSuggestion(this.context, suggestionId)
  }

  public errorHandler = async (err: Error) => {
    const schemeState = await this.coreState.scheme.entity.fetchState({}, true) as IContributionRewardExtState
    const contract = Competition.getCompetitionContract(this.context, schemeState)
    const proposal = await contract.proposals(this.id)
    if (!proposal) {
      throw Error(`A proposal with id ${this.id} does not exist`)
    }
    throw err
  }

}