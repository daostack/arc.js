import BN from 'bn.js'
import gql from 'graphql-tag'
import { Observable } from 'rxjs'
import {
  Address,
  AnyPlugin,
  Arc,
  createGraphQlQuery,
  DAO,
  Entity,
  IApolloQueryOptions,
  ICommonQueryOptions,
  IEntityRef,
  IPluginState,
  isAddress,
  Plugin,
  Plugins,
  realMathToNumber
} from './index'

export interface IQueueState {
  dao: IEntityRef<DAO>
  id: string
  name: string
  plugin: IEntityRef<AnyPlugin>
  threshold: number
  votingMachine: Address
}

export interface IQueueQueryOptions extends ICommonQueryOptions {
  where?: {
    dao?: Address
    votingMachine?: Address
    plugin?: Address
    [key: string]: any
  }
}

export class Queue extends Entity<IQueueState> {
  public static search(
    context: Arc,
    options: IQueueQueryOptions = {},
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable<Queue[]> {
    if (!options.where) {
      options.where = {}
    }
    let where = ''

    for (const key of Object.keys(options.where)) {
      if (options[key] === undefined) {
        continue
      }

      if (key === 'dao' || key === 'votingMaching' || key === 'scheme') {
        const option = options[key] as string
        isAddress(option)
        options[key] = option.toLowerCase()
      }

      where += `${key}: "${options[key] as string}"\n`
    }

    // use the following query once https://github.com/daostack/subgraph/issues/217 is resolved
    const query = gql`query QueueSearch
      {
        gpqueues ${createGraphQlQuery(options, where)} {
          id
          dao {
            id
          }
          scheme {
            ...PluginFields
          }
        }
      }

      ${Plugin.baseFragment}
    `

    const itemMap = (arc: Arc, item: any, queriedId?: string) =>
      new Queue(arc, item.id, new DAO(arc, item.dao.id))

    return context.getObservableList(context, query, itemMap, options.where?.id, apolloQueryOptions) as Observable<
      Queue[]
    >
  }

  public static itemMap(context: Arc, item: any, queriedId?: string): IQueueState {
    if (!item) {
      throw Error(`Queue ItemMap failed. ${queriedId && `Could not find Queue with id '${queriedId}'`}`)
    }
    const threshold = realMathToNumber(new BN(item.threshold))

    const pluginState: IPluginState = Plugins[item.scheme.name].itemMap(
      context,
      item.scheme,
      queriedId
    )

    if (!pluginState) {
      throw new Error('Queue\'s plugin state is null')
    }

    const plugin = new Plugins[item.scheme.name](context, pluginState)
    const dao = new DAO(context, item.dao.id)
    return {
      dao: {
        id: dao.id,
        entity: dao
      },
      id: item.id,
      name: item.scheme.name,
      plugin: {
        id: item.scheme.id,
        entity: plugin
      },
      threshold,
      votingMachine: item.votingMachine
    }
  }

  constructor(context: Arc, idOrOpts: string | IQueueState, public dao: DAO) {
    super(context, idOrOpts)
    this.context = context
    if (typeof idOrOpts === 'string') {
      this.id = idOrOpts
    } else {
      this.id = idOrOpts.id
      this.setState(idOrOpts as IQueueState)
    }
  }

  public state(apolloQueryOptions: IApolloQueryOptions = {}): Observable<IQueueState> {
    const query = gql`query QueueState
      {
        gpqueue (id: "${this.id}") {
          id
          dao {
            id
          }
          scheme {
            ...PluginFields
          }
          votingMachine
          threshold
        }
      }
      ${Plugin.baseFragment}
    `

    return this.context.getObservableObject(
      this.context,
      query,
      Queue.itemMap,
      this.id,
      apolloQueryOptions
    ) as Observable<IQueueState>
  }
}
