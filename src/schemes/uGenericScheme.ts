import { Arc } from '../arc'
import { Proposal, IProposalBaseCreateOptions } from '../proposal'
import { Address } from '../types'
import {
  ITransaction,
  ITransactionReceipt,
  getEventArgs
} from '../operation'

export interface IUGenericSchemeInfo {
  id: string
  contractToCall: Address
  votingMachine: Address
}

export interface IUGenericScheme {
  id: string
  contractToCall: Address
  callData: string
  executed: boolean
  returnValue: string
}

export interface IProposalCreateOptionsGS extends IProposalBaseCreateOptions {
  callData?: string
  value?: number
}

export enum IProposalType {
  GenericScheme = 'UGenericScheme'
}

export async function createProposalTransaction(context: Arc, options: IProposalCreateOptionsGS): Promise<ITransaction> {
  if (options.callData === undefined) {
    throw new Error(`Missing argument "callData" for UGenericScheme in Proposal.create()`)
  }
  if (options.value === undefined) {
    throw new Error(`Missing argument "value" for UGenericScheme in Proposal.create()`)
  }
  if (options.scheme === undefined) {
    throw new Error(`Missing argument "scheme" for GenericScheme in Proposal.create()`)
  }

  options.descriptionHash = await context.saveIPFSData(options)

  return {
    contract: context.getContract(options.scheme),
    method: 'proposeCall',
    args: [
      options.dao,
      options.callData,
      options.value,
      options.descriptionHash
    ]
  }
}

/**
 * map the transaction receipt of the createTransaction call to a nice result
 * @param  context an Arc instance
 * @param  options  the options passed to the createProposal call
 * @return         [description]
 */
export function createProposalTransactionMap(context: Arc, options: IProposalCreateOptionsGS) {
  return async (receipt: ITransactionReceipt) => {
    const args = getEventArgs(receipt, 'NewCallProposal', 'UGenericScheme.createProposal')
    const proposalId = args[1]
    return new Proposal(context, proposalId)
  }
}
