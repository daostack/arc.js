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
  PluginRegistrarPlugin
} from '../../index'

export interface IPluginRegistrarProposalState extends IProposalState {
  id: string
  pluginToRegister: Address
  pluginToRegisterPermission: string
  pluginToRemove: string
  decision: number
  pluginRegistered: boolean
  pluginRemoved: boolean
}

export class PluginRegistrarProposal extends Proposal<IPluginRegistrarProposalState> {

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
  ): IPluginRegistrarProposalState | null {
    if (!item) {
      Logger.debug(`PluginRegistrarProposal ItemMap failed. ${queriedId ? `Could not find PluginRegistrarProposal with id '${queriedId}'` : ''}`)
      return null
    }

    let type: ProposalName

    if (item.schemeRegistrar.schemeToRegister) {
      // TODO: this is failing bc of https://github.com/daostack/subgraph/issues/224
      type = 'SchemeRegistrarAdd'
    } else if (item.schemeRegistrar.schemeToRemove) {
      type = 'SchemeRegistrarRemove'
    } else {
      throw Error(
        `Unknown proposal type: pluginRegistrar without a plugin to register or to remove`
      )
    }

    const pluginRegistrarState = PluginRegistrarPlugin.itemMap(context, item.scheme, queriedId)

    if (!pluginRegistrarState) {
      return null
    }

    const pluginRegistrar = new PluginRegistrarPlugin(context, pluginRegistrarState)
    const pluginRegistrarProposal = new PluginRegistrarProposal(context, item.id)

    const baseState = Proposal.itemMapToBaseState(
      context,
      item,
      pluginRegistrar,
      pluginRegistrarProposal,
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

  public state(apolloQueryOptions: IApolloQueryOptions): Observable<IPluginRegistrarProposalState> {
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
      PluginRegistrarProposal.itemMap,
      this.id,
      apolloQueryOptions
    ) as Observable<IPluginRegistrarProposalState>
  }
}
