import { Observable } from 'rxjs'
import { first } from 'rxjs/operators'
import {
  Arc,
  IApolloQueryOptions,
  Address
} from './index'

interface IEntityState {
  id: string
}

export interface IEntityRef<Entity> {
  id: Address,
  entity: Entity
}

export abstract class Entity<TEntityState extends IEntityState> {
  id: string
  context: Arc
  coreState: TEntityState | undefined

  constructor(
    context: Arc,
    idOrOpts: string|TEntityState,
  ) {
    this.context = context
    if (typeof idOrOpts === 'string') {
      this.id = idOrOpts.toLowerCase()
    } else {
      this.id = idOrOpts.id
      this.setState(idOrOpts)
    }
  }

  abstract state(apolloQueryOptions: IApolloQueryOptions): Observable<TEntityState>

  protected setState(entityState: TEntityState): void {
    this.coreState = entityState
  }

  public async fetchState(apolloQueryOptions: IApolloQueryOptions = {}, refetch?: boolean): Promise<TEntityState> {

    if(this.coreState === undefined || refetch) {
      const state = await this.state(apolloQueryOptions).pipe(first()).toPromise()
      this.setState(state)

      return state
    }

    return this.coreState
  }
}