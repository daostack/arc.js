import {
  Plugin,
  IPluginState,
  Arc,
  DAO,
  IApolloQueryOptions
} from '../index'
import { DocumentNode } from 'graphql'
import { Observable } from 'rxjs'
import gql from 'graphql-tag'

export class UnknownPlugin extends Plugin<IPluginState> {

  public static itemMap(context: Arc, item: any, query: DocumentNode): IPluginState | null {
    if (!item) {
      console.log(`Uknown Plugin ItemMap failed. Query: ${query.loc?.source.body}`)
      return null
    }

    let name = item.name
    if (!name) {

      try {
        name = context.getContractInfo(item.address).name
      } catch (err) {
        if (err.message.match(/no contract/ig)) {
          // continue
        } else {
          throw err
        }
      }
    }
    
    return {
        address: item.address,
        canDelegateCall: item.canDelegateCall,
        canManageGlobalConstraints: item.canManageGlobalConstraints,
        canRegisterPlugins: item.canRegisterSchemes,
        canUpgradeController: item.canUpgradeController,
        dao: {
          id: item.dao.id,
          entity: new DAO(context, item.dao.id)
        },
        id: item.id,
        name,
        numberOfBoostedProposals: Number(item.numberOfBoostedProposals),
        numberOfPreBoostedProposals: Number(item.numberOfPreBoostedProposals),
        numberOfQueuedProposals: Number(item.numberOfQueuedProposals),
        version: item.version
      }
  }

  public state(apolloQueryOptions: IApolloQueryOptions = {}): Observable<IPluginState> {
    const query = gql`query SchemeStateById
      {
        controllerScheme (id: "${this.id}") {
          ...PluginFields
        }
      }
      ${Plugin.baseFragment}
    `
    return this.context.getObservableObject(this.context, query, UnknownPlugin.itemMap, apolloQueryOptions) as Observable<IPluginState>
  }

}