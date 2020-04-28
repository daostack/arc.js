
import gql from 'graphql-tag'
import { Observable } from 'rxjs'
import { first } from 'rxjs/operators'
import { DocumentNode } from 'graphql'
import { utils } from 'ethers'
import {
  DAO,
  Plugins,
  createGraphQlQuery,
  concat,
  hexStringToUint8Array,
  Arc,
  Entity,
  IEntityRef,
  Address,
  ICommonQueryOptions,
  IApolloQueryOptions,
  AnyPlugin,
  Logger
} from '../index'

export interface IPluginState {
  id: string
  address: Address
  dao: IEntityRef<DAO>
  name: string
  version: string
  canDelegateCall: boolean
  canUpgradeController: boolean
  canManageGlobalConstraints: boolean
  canRegisterPlugins: boolean
  numberOfQueuedProposals: number
  numberOfPreBoostedProposals: number
  numberOfBoostedProposals: number
}

export interface IPluginQueryOptions extends ICommonQueryOptions {
  where?: {
    address?: Address
    canDelegateCall?: boolean
    canRegisterPlugins?: boolean
    canUpgradeController?: boolean
    canManageGlobalConstraints?: boolean
    dao?: Address
    id?: string
    name?: string
    [key: string]: any
  }
}

export abstract class Plugin<TPluginState extends IPluginState> extends Entity<TPluginState> {

  // @ts-ignore
  "constructor": typeof Plugin

  protected static itemMap: (arc: Arc, item: any, query: DocumentNode) => IPluginState | null

  public static fragment: { name: string, fragment: DocumentNode } | undefined

  public static get baseFragment(): DocumentNode {

    if (!this._baseFragment) {
      this._baseFragment = gql`
        fragment PluginFields on ControllerScheme {
          id
          address
          name
          dao { id }
          canDelegateCall
          canRegisterSchemes
          canUpgradeController
          canManageGlobalConstraints
          numberOfQueuedProposals
          numberOfPreBoostedProposals
          numberOfBoostedProposals
          version
          ${Object.values(Plugins).filter(plugin => plugin.fragment)
            .map(plugin => '...' + plugin.fragment?.name).join('\n')}
        }
        ${Object.values(Plugins).filter(plugin => plugin.fragment)
          .map(plugin => plugin.fragment?.fragment.loc?.source.body).join('\n')}
      `
    }

    return this._baseFragment
  }
  private static _baseFragment: DocumentNode | undefined

  public static search<TPluginState extends IPluginState>(
    context: Arc,
    options: IPluginQueryOptions = {},
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable<Plugin<TPluginState>[]> {
    const query = gql`query SchemeSearchAllData {
        controllerSchemes ${createGraphQlQuery(options)}
        {
          ...PluginFields
        }
      }
      ${Plugin.baseFragment}
    `

    const itemMap = (context: Arc, item: any, query: DocumentNode): AnyPlugin | null => {
      if (!options.where) {
        options.where = {}
      }

      if(!Object.keys(Plugins).includes(item.name)) {
        Logger.debug(`Plugin name '${item.name}' not supported. Instantiating it as Unknown Plugin.`)

        const state = Plugins['unknown'].itemMap(context, item, query)
        if(!state) return null

        return new Plugins['unknown'](context, state)
      } else {

        const state: IPluginState = Plugins[item.name].itemMap(context, item, query)
        if(!state) return null
        
        return new Plugins[item.name](context, state)
      }
    }

    return context.getObservableList(
      context,
      query,
      itemMap,
      apolloQueryOptions
    ) as Observable<Plugin<TPluginState>[]>
  }

  protected static itemMapToBaseState(
    context: Arc,
    item: any
  ): IPluginState {

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

  public static calculateId(opts: { daoAddress: Address, contractAddress: Address}): string {
    const seed = concat(
      hexStringToUint8Array(opts.daoAddress.toLowerCase()),
      hexStringToUint8Array(opts.contractAddress.toLowerCase())
    )
    return utils.keccak256(seed)
  }

  public state(apolloQueryOptions: IApolloQueryOptions = {}): Observable<TPluginState> {
    const query = gql`query SchemeStateById
      {
        controllerScheme (id: "${this.id}") {
          ...PluginFields
        }
      }
      ${Plugin.baseFragment}
    `
    return this.context.getObservableObject(this.context, query, this.constructor.itemMap, apolloQueryOptions) as Observable<TPluginState>
  }

  public async fetchState(apolloQueryOptions: IApolloQueryOptions = {}, refetch?: boolean): Promise <TPluginState> {

    if(this.coreState === undefined || refetch) {
      const state = await this.state(apolloQueryOptions).pipe(first()).toPromise()
      this.setState(state)
      return state
    }
    
    return this.coreState
  }
}