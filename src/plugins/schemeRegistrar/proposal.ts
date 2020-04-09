import { Proposal, IProposalState } from "../proposal";
import { Address, IApolloQueryOptions } from "../../types";
import { Arc } from "../../arc";
import { Plugin } from '../plugin'
import { Observable } from "rxjs";
import gql from "graphql-tag";
import { SchemeRegistrar } from "./plugin";

interface ISchemeRegistrarProposalState extends IProposalState { 
  id: string
  schemeToRegister: Address
  schemeToRegisterParamsHash: string
  schemeToRegisterPermission: string
  schemeToRemove: string
  decision: number
  schemeRegistered: boolean
  schemeRemoved: boolean
}

export type SchemeRegistrarProposalTypes = 'SchemeRegistrarAdd' | 'SchemeRegistrarEdit' | 'SchemeRegistrarRemove'

export class SchemeRegistrarProposal extends Proposal {

  public static fragment = {
    name: 'SchemeRegistrarProposalFields',
    fragment: gql`
      fragment SchemeRegistrarProposalFields on Proposal {
        schemeRegistrar {
          id
          schemeToRegister
          schemeToRegisterParamsHash
          schemeToRegisterPermission
          schemeToRemove
          decision
          schemeRegistered
          schemeRemoved
        }
      }
    `
  }
  
  coreState: ISchemeRegistrarProposalState| undefined

  constructor(
    context: Arc,
    idOrOpts: string | ISchemeRegistrarProposalState
  ) {
    super(context, idOrOpts)
    this.context = context
    if (typeof idOrOpts === 'string') {
      this.id = idOrOpts
    } else {
      this.id = idOrOpts.id
      this.setState(idOrOpts)
    }
    this.context = context
  }

  protected static itemMap (
    context: Arc,
    item: any
  ): ISchemeRegistrarProposalState | null {

    if (item === null || item === undefined) return null

    let type: SchemeRegistrarProposalTypes

    if (item.schemeRegistrar.schemeToRegister) {
      // TODO: this is failing bc of https://github.com/daostack/subgraph/issues/224
      if (item.dao.schemes.map((s: any) => s.address.toLowerCase())
        .includes(item.schemeRegistrar.schemeToRegister.toLowerCase())) {
        type = "SchemeRegistrarEdit"
      } else {
        type = "SchemeRegistrarAdd"
      }
    } else if (item.schemeRegistrar.schemeToRemove) {
      type = "SchemeRegistrarRemove"
    } else {
      throw Error(`Unknown proposal type: schemeRegistrar without a scheme to register or to remove`)
    }
    
    const schemeRegistrar = SchemeRegistrar.itemMap(context, item) as SchemeRegistrar
    const schemeRegistrarProposal = new SchemeRegistrarProposal(context, item.id)

    const baseState = Proposal.itemMapToBaseState(
      context,
      item,
      schemeRegistrar,
      schemeRegistrarProposal,
      type
    )

    if(baseState === null) return null
    
    return {
      ...baseState,
      decision: item.schemeRegistrar.decision,
      schemeRegistered: item.schemeRegistrar.schemeRegistered,
      schemeRemoved: item.schemeRegistrar.schemeRemoved,
      schemeToRegister: item.schemeRegistrar.schemeToRegister,
      schemeToRegisterParamsHash: item.schemeRegistrar.schemeToRegisterParamsHash,
      schemeToRegisterPermission: item.schemeRegistrar.schemeToRegisterPermission,
      schemeToRemove: item.schemeRegistrar.schemeToRemove
    }
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

    const itemMap = (item: any) => SchemeRegistrarProposal.itemMap(this.context, item)

    return this.context.getObservableObject(query, itemMap, apolloQueryOptions) as Observable<ISchemeRegistrarProposalState>
  }

}