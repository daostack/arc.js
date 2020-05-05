import { Observable } from 'rxjs'
import { first } from 'rxjs/operators'
import { Address, Arc, IApolloQueryOptions } from './index'

export interface IEntityState {
  id: string
}

export interface IEntityRef<TEntity> {
  id: Address
  entity: TEntity
}

export abstract class Entity<TEntityState extends IEntityState> {
  public id: string
  public context: Arc
  public coreState: TEntityState | undefined

  constructor(context: Arc, idOrOpts: string | TEntityState) {
    this.context = context
    if (typeof idOrOpts === 'string') {
      this.id = idOrOpts.toLowerCase()
    } else {
      this.id = idOrOpts.id
      this.setState(idOrOpts)
    }
  }

  public abstract state(apolloQueryOptions: IApolloQueryOptions): Observable<TEntityState>

  public async fetchState(
    apolloQueryOptions: IApolloQueryOptions = {},
    refetch?: boolean
  ): Promise<TEntityState> {
    if (!this.coreState || refetch) {
      const state = await this.state(apolloQueryOptions).pipe(first()).toPromise()

      if (!state) {
        throw new Error(
          'Fetch state returned null. Entity not indexed yet or does not exist with this id.'
        )
      }

      this.setState(state)

      return state
    }

    return this.coreState
  }

  protected setState(entityState: TEntityState): void {
    this.coreState = entityState
  }
}
