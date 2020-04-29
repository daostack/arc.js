import BN from 'bn.js'
import { DocumentNode } from 'graphql'
import gql from 'graphql-tag'
import { Observable } from 'rxjs'
import { IEntityRef } from '../../entity'
import {
  Address,
  Arc,
  DAO,
  IApolloQueryOptions,
  IProposalState,
  JoinAndQuit,
  Plugin,
  Proposal
} from '../../index'

export interface IJoinAndQuitProposalState extends IProposalState {
  proposedMember: Address
  dao: IEntityRef<DAO>
  funding: BN,
  executed: boolean,
  reputationMinted: BN
}

export class JoinAndQuitProposal extends Proposal<IJoinAndQuitProposalState> {

  public static get fragment() {
    if (!this.fragmentField) {
      this.fragmentField = {
        name: 'JoinAndQuitProposalFields',
        fragment: gql`
          fragment JoinAndQuitProposalFields on Proposal {
            joinAndQuit {
              id
              dao { id }
              proposedMember
              funding
              executed
              reputationMinted
            }
          }
        `
      }
    }

    return this.fragmentField
  }

  public static itemMap(context: Arc, item: any, query: DocumentNode): IJoinAndQuitProposalState | null {

    if (!item) { return null }

    const joinAndQuitState = JoinAndQuit.itemMap(context, item.scheme, query)

    if (!joinAndQuitState) { return null }

    const joinAndQuit = new JoinAndQuit(context, joinAndQuitState)
    const joinAndQuitProposal = new JoinAndQuitProposal(context, item.id)

    const baseState = Proposal.itemMapToBaseState(
      context,
      item,
      joinAndQuit,
      joinAndQuitProposal,
      'JoinAndQuit'
    )

    if (baseState == null) { return null }

    return {
      ...baseState,
      proposedMember: item.joinAndQuit.proposedMember,
      funding: new BN(item.joinAndQuit.funding),
      executed: item.joinAndQuit.executed,
      reputationMinted: new BN(item.joinAndQuit.reputationMinted)
    }
  }

  private static fragmentField: { name: string, fragment: DocumentNode } | undefined

  public state(apolloQueryOptions: IApolloQueryOptions): Observable<IJoinAndQuitProposalState> {
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

    const result = this.context.getObservableObject(
      this.context, query, JoinAndQuitProposal.itemMap, apolloQueryOptions
      ) as Observable<IJoinAndQuitProposalState>
    return result
  }
}
