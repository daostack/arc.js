import { DocumentNode } from 'graphql'
import gql from 'graphql-tag'
import { from, Observable } from 'rxjs'
import { concatMap } from 'rxjs/operators'
import {
  Address,
  Arc,
  CONTRIBUTION_REWARD_DUMMY_VERSION,
  GenericScheme,
  IApolloQueryOptions,
  IProposalState,
  ITransaction,
  ITransactionReceipt,
  Logger,
  NULL_ADDRESS,
  Operation,
  Plugin,
  Proposal,
  REDEEMER_CONTRACT_VERSIONS,
  toIOperationObservable
} from '../../index'

export interface IGenericSchemeProposalState extends IProposalState {
  id: string
  contractToCall: Address
  callData: string
  executed: boolean
  returnValue: string
}

export class GenericSchemeProposal extends Proposal<IGenericSchemeProposalState> {
  public static get fragment() {
    if (!this.fragmentField) {
      this.fragmentField = {
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
    return this.fragmentField
  }

  public static itemMap(
    context: Arc,
    item: any,
    query: DocumentNode
  ): IGenericSchemeProposalState | null {
    if (!item) {
      Logger.debug(`GenericScheme Proposal ItemMap failed. Query: ${query.loc?.source.body}`)
      return null
    }

    const genericSchemeState = GenericScheme.itemMap(context, item.scheme, query)

    if (!genericSchemeState) {
      return null
    }

    const genericScheme = new GenericScheme(context, genericSchemeState)
    const genericSchemeProposal = new GenericSchemeProposal(context, item.id)

    const baseState = Proposal.itemMapToBaseState(
      context,
      item,
      genericScheme,
      genericSchemeProposal,
      'GenericScheme'
    )

    if (!baseState) {
      return null
    }

    return {
      ...baseState,
      callData: item.genericScheme.callData,
      contractToCall: item.genericScheme.contractToCall,
      executed: item.genericScheme.executed,
      returnValue: item.genericScheme.returnValue
    }
  }

  private static fragmentField: { name: string; fragment: DocumentNode } | undefined

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

    const result = this.context.getObservableObject(
      this.context,
      query,
      GenericSchemeProposal.itemMap,
      apolloQueryOptions
    ) as Observable<IGenericSchemeProposalState>
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
    throw Error(
      `No Redeemer contract could be found (search for versions ${REDEEMER_CONTRACT_VERSIONS})`
    )
  }

  public redeemRewards(beneficiary?: Address): Operation<boolean> {
    const mapReceipt = (receipt: ITransactionReceipt) => true

    const createTransaction = async (): Promise<ITransaction> => {
      if (!beneficiary) {
        beneficiary = NULL_ADDRESS
      }

      const state = await this.fetchState()
      const pluginAddress = this.context.getContractInfoByName(
        'ContributionReward',
        CONTRIBUTION_REWARD_DUMMY_VERSION
      ).address
      const method = 'redeem'
      const args = [pluginAddress, state.votingMachine, this.id, beneficiary]

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