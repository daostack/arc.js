import { Observable, from } from 'rxjs'
import gql from 'graphql-tag'
import {
  Arc,
  Plugin,
  Proposal,
  IProposalState,
  GenericScheme,
  Address,
  IApolloQueryOptions,
  CONTRIBUTION_REWARD_DUMMY_VERSION,
  NULL_ADDRESS,
  toIOperationObservable,
  ITransaction,
  ITransactionReceipt,
  Operation,
  REDEEMER_CONTRACT_VERSIONS
} from '../../index'
import { concatMap } from 'rxjs/operators'
import { DocumentNode } from 'graphql'

export interface IGenericSchemeProposalState extends IProposalState { 
  id: string
  contractToCall: Address
  callData: string
  executed: boolean
  returnValue: string
}

export class GenericSchemeProposal extends Proposal<IGenericSchemeProposalState> {

  private static _fragment: { name: string, fragment: DocumentNode } | undefined

  public static get fragment () {
    if(!this._fragment){
      this._fragment = {
      name: 'GenericSchemeProposalFields',
      fragment: gql`
        fragment GenericSchemeProposalFields on Proposal {
          genericScheme {
            id
            contractToCall
            callData
            executed
            returnValue
          }
        }
      `
    }
  }
  
  return this._fragment
  
}

  static itemMap (context: Arc, item: any): GenericSchemeProposal | null {

    if (item === null || item === undefined) return null
    
    const genericScheme = GenericScheme.itemMap(context, item) as GenericScheme
    const genericSchemeProposal = new GenericSchemeProposal(context, item.id)

    const baseState = Proposal.itemMapToBaseState(
      context,
      item,
      genericScheme,
      genericSchemeProposal,
      "GenericScheme"
    )

    if(baseState === null) return null
    
    const state: IGenericSchemeProposalState = {
      ...baseState,
      callData: item.genericScheme.callData,
      contractToCall: item.genericScheme.contractToCall,
      executed: item.genericScheme.executed,
      returnValue: item.genericScheme.returnValue
    }

    return new GenericSchemeProposal(context, state)
  }

  public state(apolloQueryOptions: IApolloQueryOptions): Observable<IGenericSchemeProposalState> {
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

    const result = this.context.getObservableObject(this.context, query, GenericSchemeProposal.itemMap, apolloQueryOptions) as Observable<IGenericSchemeProposalState>
    return result
  }

  public redeemerContract() {
    for (const version of REDEEMER_CONTRACT_VERSIONS) {
      try {
        const contractInfo = this.context.getContractInfoByName('Redeemer', version)
        return this.context.getContract(contractInfo.address)
      } catch (err) {
        if (!err.message.match(/no contract/i)) {
          // if the contract cannot be found, try the next one
          throw err
        }
      }
    }
    throw Error(`No Redeemer contract could be found (search for versions ${REDEEMER_CONTRACT_VERSIONS})`)
  }

  public redeemRewards(beneficiary?: Address): Operation<boolean> {

    const mapReceipt = (receipt: ITransactionReceipt) => true

    const createTransaction = async (): Promise<ITransaction> => {
      if (!beneficiary) {
        beneficiary = NULL_ADDRESS
      }

      const state = await this.fetchState()
      const pluginAddress = this.context.getContractInfoByName('ContributionReward', CONTRIBUTION_REWARD_DUMMY_VERSION).address
      const method = 'redeem'
      const args = [
        pluginAddress,
        state.votingMachine,
        this.id,
        state.dao.id,
        beneficiary
      ]

      return {
        contract: this.redeemerContract(),
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