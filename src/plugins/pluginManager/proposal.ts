import gql from 'graphql-tag'
import { Observable } from 'rxjs'
import {
  Arc,
  DAO,
  IApolloQueryOptions,
  IEntityRef,
  IProposalState,
  Logger,
  Plugin,
  PluginManagerPlugin,
  Proposal
} from '../../index'

export interface IPluginManagerProposalState extends IProposalState {
  dao: IEntityRef<DAO>
  pluginToRegisterName: string
  pluginToRegisterData: string
  pluginToRegisterPackageVersion: string[]
  pluginToRegisterPermission: string
  pluginToRemove: string
  decision: string
  pluginRegistered: boolean
  pluginRemoved: boolean
}

export class PluginManagerProposal extends Proposal<IPluginManagerProposalState> {
  public static fragment = {
    name: 'PluginManagerProposalFields',
    fragment: gql`
      fragment PluginManagerProposalFields on Proposal {
        schemeFactory {
          id
          dao {
            id
            schemes {
              id
              address
            }
          }
          schemeToRegisterName
          schemeToRegisterData
          schemeToRegisterPackageVersion
          schemeToRegisterPermission
          schemeToRemove
          decision
          schemeRegistered
          schemeRemoved
        }
      }
    `
  }

  public static itemMap(
    context: Arc,
    item: any,
    queriedId?: string
  ): IPluginManagerProposalState | null {
    if (!item) {
      Logger.debug(`PluginManagerProposal ItemMap failed.
        ${queriedId && `Could not find PluginManagerProposal with id '${queriedId}'`}`)
      return null
    }

    const pluginManagerState = PluginManagerPlugin.itemMap(context, item.scheme, queriedId)

    if (!pluginManagerState) {
      return null
    }

    const pluginManager = new PluginManagerPlugin(context, pluginManagerState)
    const pluginManagerProposal = new PluginManagerProposal(context, item.id)

    const baseState = Proposal.itemMapToBaseState(
      context,
      item,
      pluginManager,
      pluginManagerProposal,
      'SchemeFactory'
    )

    if (!baseState) {
      return null
    }

    return {
      ...baseState,
      pluginRegistered: item.schemeFactory.schemeRegistered,
      pluginRemoved: item.schemeFactory.schemeRemoved,
      pluginToRegisterData: item.schemeFactory.schemeToRegisterData,
      pluginToRegisterName: item.schemeFactory.schemeToRegisterName,
      pluginToRegisterPackageVersion: item.schemeFactory.schemeToRegisterPackageVersion,
      pluginToRegisterPermission: item.schemeFactory.schemeToRegisterPermission,
      pluginToRemove: item.schemeFactory.schemeToRemove,
      decision: item.schemeFactory.decision,
      dao: {
        id: item.dao.id,
        entity: new DAO(context, item.dao.id)
      }
    }
  }

  public state(apolloQueryOptions: IApolloQueryOptions): Observable<IPluginManagerProposalState> {
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
      PluginManagerProposal.itemMap,
      this.id,
      apolloQueryOptions
    ) as Observable<IPluginManagerProposalState>
    return result
  }
}
