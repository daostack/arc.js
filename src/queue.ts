import BN = require('bn.js')
import gql from 'graphql-tag'
import { Observable } from 'rxjs'
import { Arc, IApolloQueryOptions } from './arc'
import { DAO } from './dao'
import { Address, ICommonQueryOptions } from './types'
import { createGraphQlQuery, isAddress, realMathToNumber } from './utils'
import { Entity, IEntityRef } from './entity'
import { Plugin } from './plugins/plugin'
import { Plugins } from './plugins'

export interface IQueueState {
  dao: DAO
  id: string
  name: string
  scheme: IEntityRef<Plugin>
  threshold: number
  votingMachine: Address
}

export interface IQueueQueryOptions extends ICommonQueryOptions {
  where?: {
    dao?: Address,
    votingMachine?: Address
    scheme?: Address
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

    const itemMap = (item: any): Queue|null => new Queue(context, item.id, new DAO(context, item.dao.id))

    return context.getObservableList(query, itemMap, apolloQueryOptions) as Observable<Queue[]>
  }

  public static itemMap(context: Arc, item: any): Queue {
    if (!item) {
      //TODO: How to get ID for this error msg?
      throw Error(`No gpQueue with id was found`)
    }
    const threshold = realMathToNumber(new BN(item.threshold))
    const scheme = new Plugins[item.scheme.name](context, item.scheme.id)
    const dao = new DAO(context, item.dao.id)
    return new Queue(context, {
      dao,
      id: item.id,
      name: scheme.name,
      scheme: {
        id: item.scheme.id,
        entity: scheme
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
            ...SchemeFields
          }
          votingMachine
          threshold
        }
      }
      ${Plugin.baseFragment.SchemeFields}
    `

    const itemMap = (item: any) => Queue.itemMap(this.context, item)

    return this.context.getObservableObject(query, itemMap, apolloQueryOptions) as Observable<IQueueState>
  }
}
