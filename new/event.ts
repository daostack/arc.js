import gql from 'graphql-tag'
import { Observable } from 'rxjs'
import { Arc, IApolloQueryOptions } from './arc'
import { Address, ICommonQueryOptions } from './types'
import { createGraphQlQuery } from './utils'
import { Entity } from './entity'

export interface IEventState {
  id: string
  dao: string
  proposal: string
  user: string
  type: string
  data: {[key: string]: any}
  timestamp: string
}

export interface IEventQueryOptions extends ICommonQueryOptions {
  where?: {
    id?: string,
    dao?: Address,
    proposal?: string,
    user?: Address
    [key: string]: any
  }
}

export class Event extends Entity<IEventState> {

  public static fragments = {
    EventFields: gql`fragment EventFields on Event {
      id
      dao {
        id
      }
      type
      data
      user
      proposal {
        id
      }
      timestamp
    }`
  }

  constructor(public context: Arc, public idOrOpts: string | IEventState) {
    super()
    this.context = context
    if (typeof idOrOpts === 'string') {
      this.id = idOrOpts
    } else {
      this.id = idOrOpts.id
      this.setState(idOrOpts)
    }
  }

  public static search(
    context: Arc,
    options: IEventQueryOptions = {},
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable<Event[]> {

    const itemMap = (item: any) => new Event(context, {
      dao: item.dao.id,
      data: JSON.parse(item.data),
      id: item.id,
      proposal: item.proposal && item.proposal.id,
      timestamp: item.timestamp,
      type: item.type,
      user: item.user
    })

    let query
    query = gql`query EventSearch
      {
        events ${createGraphQlQuery(options)} {
          ...EventFields
        }
      }
      ${Event.fragments.EventFields}
      `

    return context.getObservableList(
      query,
      itemMap,
      apolloQueryOptions
    ) as Observable<Event[]>
  }

  public static itemMap(context: Arc, item: any): Event {
    return new Event(context, {
      dao: item.dao.id,
      data: JSON.parse(item.data),
      id: item.id,
      proposal: item.proposal && item.proposal.id,
      timestamp: item.timestamp,
      type: item.type,
      user: item.user
    })
  }

  public state(apolloQueryOptions: IApolloQueryOptions = {}): Observable < IEventState > {

    const query = gql`
      query EventState {
        event (id: "${this.id}")
        {
          ...EventFields
        }
      }
      ${Event.fragments.EventFields}
    `

    const itemMap = (item: any) => Event.itemMap(this.context, item)

    return this.context.getObservableObject(query, itemMap, apolloQueryOptions)
  }
}
