import { Proposal, IProposalState } from "../proposal";
import { Address, IApolloQueryOptions } from "../../types";
import { Arc } from "../../arc";
import { Plugin } from '../plugin'
import { Observable } from "rxjs";
import gql from "graphql-tag";
import { UGenericScheme } from "./plugin";

interface IUGenericSchemeProposalState extends IProposalState { 
  id: string
  contractToCall: Address
  callData: string
  executed: boolean
  returnValue: string
}

export class UGenericSchemeProposal extends Proposal {

  coreState: IUGenericSchemeProposalState| undefined

  static itemMap (context: Arc, item: any): UGenericSchemeProposal | null {

    if (item === null || item === undefined) return null
    
    const uGenericScheme = UGenericScheme.itemMap(context, item) as UGenericScheme
    const uGenericSchemeProposal = new UGenericSchemeProposal(context, item.id)

    const baseState = Proposal.itemMapToBaseState(
      context,
      item,
      uGenericScheme,
      uGenericSchemeProposal,
      "UGenericScheme"
    )

    if(baseState == null) return null
    
    const state: IUGenericSchemeProposalState = {
      ...baseState,
      callData: item.genericScheme.callData,
      contractToCall: item.genericScheme.contractToCall,
      executed: item.genericScheme.executed,
      returnValue: item.genericScheme.returnValue
    }

    return new UGenericSchemeProposal(context, state)
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
      ${Proposal.baseFragment}
      ${Plugin.baseFragment}
    `

    const result = this.context.getObservableObject(this.context, query, UGenericSchemeProposal.itemMap, apolloQueryOptions) as Observable<IUGenericSchemeProposalState>
    return result
  }

}