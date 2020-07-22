import BN from 'bn.js'
import gql from 'graphql-tag'
import { Observable } from 'rxjs'
import {
  Address,
  Arc,
  GenericPlugin,
  IApolloQueryOptions,
  IProposalState,
  Logger,
  Plugin,
  Proposal
} from '../../index'

export interface IGenericPluginProposalState extends IProposalState {
  id: string
  contractToCall: Address
  callData: string
  executed: boolean
  returnValue: string
  value: BN
}

export class GenericPluginProposal extends Proposal<IGenericPluginProposalState> {
  public static fragment = {
    name: 'GenericPluginProposalFields',
    fragment: gql`
      fragment GenericPluginProposalFields on Proposal {
        genericScheme {
          id
          contractToCall
          callData
          executed
          returnValue
          value
        }
      }
    `
  }

  public static itemMap(
    context: Arc,
    item: any,
    queriedId?: string
  ): IGenericPluginProposalState | null {
    if (!item) {
      Logger.debug(`GenericPluginProposal ItemMap failed. ${queriedId ? `Could not find GenericPluginProposal with id '${queriedId}'` : ''}`)
      return null
    }

    const genericSchemeState = GenericPlugin.itemMap(context, item.scheme, queriedId)

    if (!genericSchemeState) {
      return null
    }

    const genericScheme = new GenericPlugin(context, genericSchemeState)
    const genericSchemeProposal = new GenericPluginProposal(context, item.id)

    const baseState = Proposal.itemMapToBaseState(
      context,
      item,
      genericScheme,
      genericSchemeProposal,
      'GenericScheme'
    )

    if (!baseState) {
      return null
    }

    return {
      ...baseState,
      callData: item.genericScheme.callData,
      contractToCall: item.genericScheme.contractToCall,
      executed: item.genericScheme.executed,
      returnValue: item.genericScheme.returnValue,
      value: new BN(item.genericScheme.value)
    }
  }

  public state(apolloQueryOptions: IApolloQueryOptions): Observable<IGenericPluginProposalState> {
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
      GenericPluginProposal.itemMap,
      this.id,
      apolloQueryOptions
    ) as Observable<IGenericPluginProposalState>
    return result
  }
}
