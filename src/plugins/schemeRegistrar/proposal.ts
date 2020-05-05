import { DocumentNode } from 'graphql'
import gql from 'graphql-tag'
import { Observable } from 'rxjs'
import {
  Address,
  Arc,
  IApolloQueryOptions,
  IProposalState,
  Logger,
  Plugin,
  Proposal,
  ProposalName,
  SchemeRegistrarPlugin
} from '../../index'

export interface ISchemeRegistrarProposalState extends IProposalState {
  id: string
  pluginToRegister: Address
  pluginToRegisterPermission: string
  pluginToRemove: string
  decision: number
  pluginRegistered: boolean
  pluginRemoved: boolean
}

export class SchemeRegistrarProposal extends Proposal<ISchemeRegistrarProposalState> {

  public static fragment = {
    name: 'SchemeRegistrarProposalFields',
    fragment: gql`
      fragment SchemeRegistrarProposalFields on Proposal {
        schemeRegistrar {
          id
          schemeToRegister
          schemeToRegisterPermission
          schemeToRemove
          decision
          schemeRegistered
          schemeRemoved
        }
      }
    `
  }
  protected static fragmentField: {
    name: string
    fragment: DocumentNode
  } | undefined

  protected static itemMap(
    context: Arc,
    item: any,
    queriedId?: string
  ): ISchemeRegistrarProposalState | null {
    if (!item) {
      Logger.debug(`SchemeRegistrarProposal ItemMap failed. ${queriedId && `Could not find SchemeRegistrarProposal with id '${queriedId}'`}`)
      return null
    }

    let type: ProposalName

    if (item.schemeRegistrar.schemeToRegister) {
      // TODO: this is failing bc of https://github.com/daostack/subgraph/issues/224
      if (
        item.dao.schemes
          .map((s: any) => s.address.toLowerCase())
          .includes(item.schemeRegistrar.schemeToRegister.toLowerCase())
      ) {
        type = 'SchemeRegistrarEdit'
      } else {
        type = 'SchemeRegistrarAdd'
      }
    } else if (item.schemeRegistrar.schemeToRemove) {
      type = 'SchemeRegistrarRemove'
    } else {
      throw Error(
        `Unknown proposal type: schemeRegistrar without a scheme to register or to remove`
      )
    }

    const schemeRegistrarState = SchemeRegistrarPlugin.itemMap(context, item.scheme, queriedId)

    if (!schemeRegistrarState) {
      return null
    }

    const schemeRegistrar = new SchemeRegistrarPlugin(context, schemeRegistrarState)
    const schemeRegistrarProposal = new SchemeRegistrarProposal(context, item.id)

    const baseState = Proposal.itemMapToBaseState(
      context,
      item,
      schemeRegistrar,
      schemeRegistrarProposal,
      type
    )

    if (!baseState) {
      return null
    }

    return {
      ...baseState,
      decision: item.schemeRegistrar.decision,
      pluginRegistered: item.schemeRegistrar.schemeRegistered,
      pluginRemoved: item.schemeRegistrar.schemeRemoved,
      pluginToRegister: item.schemeRegistrar.schemeToRegister,
      pluginToRegisterPermission: item.schemeRegistrar.schemeToRegisterPermission,
      pluginToRemove: item.schemeRegistrar.schemeToRemove
    }
  }

  public state(apolloQueryOptions: IApolloQueryOptions): Observable<ISchemeRegistrarProposalState> {
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

    return this.context.getObservableObject(
      this.context,
      query,
      SchemeRegistrarProposal.itemMap,
      this.id,
      apolloQueryOptions
    ) as Observable<ISchemeRegistrarProposalState>
  }
}
