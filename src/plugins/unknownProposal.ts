import gql from 'graphql-tag'
import { Observable } from 'rxjs'
import {
  Arc,
  IApolloQueryOptions,
  IProposalState,
  Logger,
  Plugin,
  Proposal,
  UnknownPlugin
} from '../index'

export class UnknownProposal extends Proposal<IProposalState> {

  public static itemMap(
    context: Arc,
    item: any,
    queriedId?: string
  ): IProposalState | null {
    if (!item) {
      Logger.debug(`Unknown Proposal ItemMap failed. ${queriedId ? `Could not find Unknown Proposal with id '${queriedId}'` : ''}`)
      return null
    }

    const unknownPluginState = UnknownPlugin.itemMap(context, item.scheme, queriedId)

    if (!unknownPluginState) {
      return null
    }

    const unknownPlugin = new UnknownPlugin(context, unknownPluginState)
    const unknownPluginProposal = new UnknownProposal(context, item.id)

    const baseState = Proposal.itemMapToBaseState(
      context,
      item,
      unknownPlugin,
      unknownPluginProposal,
      'Unknown'
    )

    if (!baseState) {
      return null
    }

    return baseState
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
      ${Proposal.baseFragment}
      ${Plugin.baseFragment}
    `

    const result = this.context.getObservableObject(
      this.context,
      query,
      UnknownProposal.itemMap,
      this.id,
      apolloQueryOptions
    ) as Observable<IProposalState>
    return result
  }
}
