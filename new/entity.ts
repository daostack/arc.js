import { Observable } from "rxjs"
import { first } from 'rxjs/operators'
import { IApolloQueryOptions, Address } from "./types"
import { Arc } from "./arc"

// Vote, Competition, Member, Vote, Stake, Plugin, Proposal, DAO, Tag, Event, Reward

interface IEntityState {
  id: string
}

export interface IEntityRef<Entity> {
  id: Address,
  entity: Entity
}

export abstract class Entity<TEntityState extends IEntityState> {
  id: string
  name: string
  context: Arc
  coreState: TEntityState | undefined

  abstract state(apolloQueryOptions: IApolloQueryOptions): Observable<TEntityState>
  
  // abstract search<TState, TQueryOptions>(
  //   context: Arc,
  //   options: TQueryOptions,
  //   apolloQueryOptions: IApolloQueryOptions
  // ): Entity<TState>

  setState(entityState: TEntityState): void {
    this.coreState = entityState
  }

  async fetchState(apolloQueryOptions: IApolloQueryOptions = {}, refetch?: boolean): Promise<TEntityState> {

    if(this.coreState === undefined || refetch) {
      const state = await this.state(apolloQueryOptions).pipe(first()).toPromise()
      this.setState(state)

      return state
    }

    return this.coreState
  }

  // searchRelatedEntity<TRelatedEntity, TRelatedEntityQueryOptions>(
  //   options: TRelatedEntityQueryOptions,
  //   apolloQueryOptions: IApolloQueryOptions = {},
  //   staticSearchMethod:
  // ): Observable<TRelatedEntity[]> {
  //   if (!options.where) { options.where = {}}
  //   options.where.scheme = this.id
  //   return Proposal.search(this.context, options, apolloQueryOptions)
  // }
}