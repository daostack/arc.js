import BN from 'bn.js'
import { DocumentNode } from 'graphql'
import gql from 'graphql-tag'
import { from, Observable } from 'rxjs'
import { concatMap } from 'rxjs/operators'
import { IEntityRef } from '../../entity'
import {
  Address,
  Arc,
  DAO,
  IApolloQueryOptions,
  IProposalState,
  ITransaction,
  ITransactionReceipt,
  Join,
  Operation,
  Plugin,
  Proposal,
  toIOperationObservable
} from '../../index'

export interface IJoinProposalState extends IProposalState {
  proposedMember: Address
  dao: IEntityRef<DAO>
  funding: BN,
  executed: boolean,
  reputationMinted: BN
}

export class JoinProposal extends Proposal<IJoinProposalState> {

  public static get fragment() {
    if (!this.fragmentField) {
      this.fragmentField = {
        name: 'JoinProposalFields',
        fragment: gql`
          fragment JoinProposalFields on Proposal {
            join {
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

  public static itemMap(context: Arc, item: any, query?: string): IJoinProposalState | null {

    if (!item) { return null }

    const joinState = Join.itemMap(context, item.scheme, query)

    if (!joinState) { return null }

    const join = new Join(context, joinState)
    const joinProposal = new JoinProposal(context, item.id)

    const baseState = Proposal.itemMapToBaseState(
      context,
      item,
      join,
      joinProposal,
      'Join'
    )

    if (baseState == null) { return null }

    return {
      ...baseState,
      proposedMember: item.join.proposedMember,
      funding: new BN(item.join.funding),
      executed: item.join.executed,
      reputationMinted: new BN(item.join.reputationMinted)
    }
  }

  private static fragmentField: { name: string, fragment: DocumentNode } | undefined

  public state(apolloQueryOptions: IApolloQueryOptions): Observable<IJoinProposalState> {
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
      this.context, query, JoinProposal.itemMap, this.id, apolloQueryOptions
      ) as Observable<IJoinProposalState>
    return result
  }
  /**
   * Redeem this proposal after it was accepted
   */
  public redeem(): Operation<boolean> {
    const mapReceipt = (receipt: ITransactionReceipt) => true

    const createTransaction = async (): Promise<ITransaction> => {

      const state = await this.fetchState()
      const pluginState = await state.plugin.entity.fetchState()
      const pluginAddress = pluginState.address
      //  const pluginAddress = state.plugin.id
      const contract = this.context.getContract(pluginAddress)
      const method = 'redeemReputation'
      const args: any[] = [this.id]

      return {
        contract,
        method,
        args
      }
    }

    const observable = from(createTransaction()).pipe(
      concatMap((transaction) => {
        return this.context.sendTransaction(transaction, mapReceipt)
      })
    )

    return toIOperationObservable(observable)
  }

}
