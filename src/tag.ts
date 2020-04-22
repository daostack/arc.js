import gql from 'graphql-tag'
import { Observable } from 'rxjs'
import {
  Arc,
  IApolloQueryOptions,
  createGraphQlQuery,
  Entity,
  IEntityRef,
  Proposals,
  AnyProposal,
  ICommonQueryOptions
} from './index'
import { DocumentNode } from 'graphql'

export interface ITagState {
  id: string
  numberOfProposals: number
  proposals?: IEntityRef<AnyProposal>[]
}

export interface ITagQueryOptions extends ICommonQueryOptions {
  where?: {
    id?: string,
    proposal?: string
  }
}

export class Tag extends Entity<ITagState> {
  public static fragments = {
    TagFields: gql`fragment TagFields on Tag {
      id
      numberOfProposals
      proposals { 
        id
        scheme {
          id
          name
        }
      }
    }`
  }

  public static search(
    context: Arc,
    options: ITagQueryOptions = {},
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable <Tag[]> {
    if (!options.where) { options.where = {}}
    let where = ''

    const itemMap = (context: Arc, item: any, query: DocumentNode) => {
      const state = Tag.itemMap(context, item, query)
      return new Tag(context, state)
    }

    const proposalId = options.where.proposal
    // if we are searching for stakes on a specific proposal (a common case), we
    // will structure the query so that stakes are stored in the cache together wit the proposal
    if (proposalId) {
      delete options.where.proposal
    }

    for (const key of Object.keys(options.where)) {
      if (options.where[key] === undefined) {
        continue
      }
      where += `${key}: "${options.where[key] as string}"\n`
    }

    let query: DocumentNode

    if (proposalId) {
      query = gql`query TagsSearchFromProposal
        {
          proposal (id: "${proposalId}") {
            id
            scheme {
              id
              name
            }
            tags ${createGraphQlQuery(options, where)} {
              ...TagFields
            }
          }
        }
        ${Tag.fragments.TagFields}
      `

      return context.getObservableObject(
        context,
        query,
        (context: Arc, r: any, query: DocumentNode) => {
          if (r === null) { // no such proposal was found
            return []
          }
          const itemMap = (item: any) => {
            const state = Tag.itemMap(context, item, query)
            return new Tag(context, state)
          }
          return r.tags.map(itemMap)
        },
        apolloQueryOptions
      ) as Observable<Tag[]>
    } else {
      query = gql`query TagsSearch
        {
          tags ${createGraphQlQuery(options, where)} {
              ...TagFields
          }
        }
        ${Tag.fragments.TagFields}
      `

      return context.getObservableList(
        context,
        query,
        itemMap,
        apolloQueryOptions
      ) as Observable<Tag[]>
    }
  }

  public static itemMap = (context: Arc, item: any, query: DocumentNode): ITagState => {
    if (item === null) {
      throw Error(`Tag ItemMap failed. Query: ${query.loc?.source.body}`)
    }

    return {
      id: item.id,
      numberOfProposals: Number(item.numberOfProposals),
      proposals: item.proposals.map((proposal: any) => {
        return {
          id: proposal.id,
          entity: new Proposals[proposal.scheme.name](context, proposal.id)
        }
      })
    }
  }

  public state(apolloQueryOptions: IApolloQueryOptions = {}): Observable<ITagState> {
    const query = gql`query TagState
      {
        tag (id: "${this.id}") {
          ...TagFields
        }
      }
      ${Tag.fragments.TagFields}
    `

    return this.context.getObservableObject(this.context, query, Tag.itemMap, apolloQueryOptions)
  }
}
