import BN = require('bn.js')
import { Arc } from '../arc'
import { Proposal } from '../proposal'
import { Address } from '../types'

export interface IGenericSchemeMultiCallInfo {
  id: string
  schemeConstraints: Address
 	contractsWhiteList: Array<Address>
  votingMachine: Address
}

export interface IGenericSchemeMultiCall {
  id: string
  contractsToCall: Array<Address>
  callsData: Array<string>
  executed: boolean
  returnValue: Array<string>
  values: Array<BN>
}

export interface IProposalCreateOptionsGSMultiCall {
  contractsToCall?: Array<Address>
  callsData?: Array<string>
  values?: Array<BN>
}

export enum IProposalType {
  GenericSchemeMultiCall = 'GenericSchemeMultiCall' // propose a contributionReward
}

export function createTransaction(options: any, context: Arc) {
  if (!options.callData) {
    throw new Error(`Missing argument "callData" for GenericSchemeMultiCall in Proposal.create()`)
  }
  if (options.value === undefined) {
    throw new Error(`Missing argument "value" for GenericSchemeMultiCall in Proposal.create()`)
  }
  return async () => {
    options.descriptionHash = await context.saveIPFSData(options)

    const genericSchemeMultiCall = context.getContract(options.scheme)
    const transaction = genericSchemeMultiCall.methods.proposeCall(
      options.contractsToCall,
      options.callsData,
      options.values,
      options.descriptionHash
    )
    return transaction
  }
}

/**
 * map the transaction receipt of the createTransaction call to a nice result
 * @param  options  the options passed to the createProposal call
 * @param  context an Arc instance
 * @return         [description]
 */
export function createTransactionMap(options: any, context: Arc) {
  const eventName = 'NewCallProposal'
  const map = async (receipt: any) => {
    const proposalId = receipt.events[eventName].returnValues._proposalId
    return new Proposal(proposalId, context)
  }
  return map
}
