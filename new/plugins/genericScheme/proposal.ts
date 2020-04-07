import { Proposal, IProposalState } from "../../proposal";
import { Address, IApolloQueryOptions } from "../../types";
import { Arc } from "../../arc";
import { Plugin } from '../../plugin'
import { Observable } from "rxjs";
import gql from "graphql-tag";
import { GenericScheme } from "./plugin";

interface IGenericSchemeProposalState extends IProposalState { 
  id: string
  contractToCall: Address
  callData: string
  executed: boolean
  returnValue: string
}

// TODO: Scheme => Plugin
export class GenericSchemeProposal extends Proposal {

  /*
    TODO:
    const entity = new Entity()
    const entityState = entity.fetchState()
    const sub = entity.state().subscribe()
    const current = entity.currentState
    const current = entity.fetchState()
  */
  coreState: IGenericSchemeProposalState

  constructor(
    context: Arc,
    idOrOpts: string | IGenericSchemeProposalState
  ) {
    super()
    this.context = context
    if (typeof idOrOpts === 'string') {
      this.id = idOrOpts
    } else {
      this.id = idOrOpts.id
      this.setState(idOrOpts)
    }
    this.context = context
  }

  static itemMap (context: Arc, item: any): GenericSchemeProposal | null {

    if (item === null || item === undefined) return null
    
    const genericScheme = GenericScheme.itemMap(context, item)
    const genericSchemeProposal = new GenericSchemeProposal(context, item.id)

    const baseState = Proposal.itemMapToBaseState(
      context,
      item,
      genericScheme,
      genericSchemeProposal,
      "GenericScheme"
    )
    
    const state: IGenericSchemeProposalState = {
      ...baseState,
      callData: item.genericScheme.callData,
      contractToCall: item.genericScheme.contractToCall,
      executed: item.genericScheme.executed,
      returnValue: item.genericScheme.returnValue
    }

    return new GenericSchemeProposal(context, state)
  }

  public state(apolloQueryOptions: IApolloQueryOptions): Observable<IProposalState> {
    const query = gql`query ProposalState
      {
        proposal(id: "${this.id}") {
          ...ProposalFields
          votes {
            id
          }
          stakes {
            id
          }
        }
      }
      ${Proposal.fragments.ProposalFields}
      ${Plugin.baseFragment.SchemeFields}
    `

    const itemMap = (item: any) => GenericSchemeProposal.itemMap(this.context, item)

    const result = this.context.getObservableObject(query, itemMap, apolloQueryOptions) as Observable<IGenericSchemeProposalState>
    return result
  }

}