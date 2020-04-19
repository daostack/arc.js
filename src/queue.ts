import BN from 'bn.js'
import gql from 'graphql-tag'
import { Observable } from 'rxjs'
import {
  Arc,
  IApolloQueryOptions,
  DAO,
  createGraphQlQuery,
  isAddress,
  realMathToNumber,
  Entity,
  IEntityRef,
  Plugin,
  Plugins,
  AnyPlugin,
  Address,
  ICommonQueryOptions
} from './index'
import { DocumentNode } from 'graphql'

export interface IQueueState {
  dao: DAO
  id: string
  name: string
  //TODO: any type of plugin or a specific type?
  plugin: IEntityRef<AnyPlugin>
  threshold: number
  votingMachine: Address
}

export interface IQueueQueryOptions extends ICommonQueryOptions {
  where?: {
    dao?: Address,
    votingMachine?: Address
    plugin?: Address
    [key: string]: any
  }
}

export class Queue extends Entity<IQueueState> {

  constructor(
    context: Arc,
    idOrOpts: string|IQueueState,
    public dao: DAO
  ) {
    super(context, idOrOpts)
    this.context = context
    if (typeof idOrOpts === 'string') {
      this.id = idOrOpts
    } else {
      this.id = idOrOpts.id
      this.setState(idOrOpts as IQueueState)
    }
  }

  public static search(
    context: Arc,
    options: IQueueQueryOptions = {},
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable<Queue[]> {
    if (!options.where) { options.where = {} }
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
            id
            address
            name
            numberOfBoostedProposals
            numberOfPreBoostedProposals
            numberOfQueuedProposals
          }
        }
      }
    `

    const itemMap = (context: Arc, item: any, query: DocumentNode): Queue|null => new Queue(context, item.id, new DAO(context, item.dao.id))

    return context.getObservableList(context, query, itemMap, apolloQueryOptions) as Observable<Queue[]>
  }

  public static itemMap(context: Arc, item: any, query: DocumentNode): Queue {
    if (!item) {
      throw Error(`Queue ItemMap failed. Query: ${query.loc?.source.body}`)
    }
    const threshold = realMathToNumber(new BN(item.threshold))
    const plugin = new Plugins[item.scheme.name](context, item.scheme.id)
    const dao = new DAO(context, item.dao.id)
    return new Queue(context, {
      dao,
      id: item.id,
      name: plugin.name,
      plugin: {
        id: item.scheme.id,
        entity: plugin
      },
      threshold,
      votingMachine: item.votingMachine
    }, dao)
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

    return this.context.getObservableObject(this.context, query, Queue.itemMap, apolloQueryOptions) as Observable<IQueueState>
  }
}
