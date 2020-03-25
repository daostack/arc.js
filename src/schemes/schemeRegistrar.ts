import { Arc } from '../arc'
import {
  getEventArgs,
  ITransaction,
  ITransactionReceipt
} from '../operation'
import { IProposalBaseCreateOptions, Proposal } from '../proposal'
import { Address } from '../types'

export interface ISchemeRegistrar {
  id: string
  schemeToRegister: Address
  schemeToRegisterParamsHash: string
  schemeToRegisterPermission: string
  schemeToRemove: string
  decision: number
  schemeRegistered: boolean
  schemeRemoved: boolean
}

export interface IProposalCreateOptionsSR extends IProposalBaseCreateOptions {
  parametersHash?: string
  permissions?: string
  schemeToRegister?: Address
}

export enum IProposalType {
  SchemeRegistrarAdd = 'SchemeRegistrarAdd', // propose to register to schme
  SchemeRegistrarEdit = 'SchemeRegistrarEdit', // propose to edit a registered scheme
  SchemeRegistrarRemove = 'SchemeRegistrarRemove' // propose to remove a registered scheme
}

export async function createProposalTransaction(
  context: Arc,
  options: IProposalCreateOptionsSR
): Promise<ITransaction> {
  let msg: string
  switch (options.proposalType) {
    case IProposalType.SchemeRegistrarAdd:
    case IProposalType.SchemeRegistrarEdit:
      if (options.scheme === undefined) {
        msg = `Missing argument "scheme" for SchemeRegistrar in Proposal.create()`
        throw Error(msg)
      }
      if (options.parametersHash === undefined) {
        msg = `Missing argument "parametersHash" for SchemeRegistrar in Proposal.create()`
        throw Error(msg)
      }
      if (options.permissions === undefined) {
        msg = `Missing argument "permissions" for SchemeRegistrar in Proposal.create()`
        throw Error(msg)
      }

      options.descriptionHash = await context.saveIPFSData(options)

      return {
        contract: context.getContract(options.scheme),
        method: 'proposeScheme',
        args: [
          options.dao,
          options.schemeToRegister,
          options.parametersHash,
          options.permissions,
          options.descriptionHash
        ]
      }
    case IProposalType.SchemeRegistrarRemove:
      if (options.scheme === undefined) {
        msg = `Missing argument "scheme" for SchemeRegistrar`
        throw Error(msg)
      }

      options.descriptionHash = await context.saveIPFSData(options)

      return {
        contract: context.getContract(options.scheme),
        method: 'proposeToRemoveScheme',
        args: [
          options.dao,
          options.schemeToRegister,
          options.descriptionHash
        ]
      }
  }
  throw Error('For a schemeregistrar proposal, you must specifcy proposal.proposalType')
}

export function createTransactionMap(context: Arc, options: IProposalCreateOptionsSR) {
  return (receipt: ITransactionReceipt) => {
    let eventName: string
    switch (options.proposalType) {
      case IProposalType.SchemeRegistrarAdd:
      case IProposalType.SchemeRegistrarEdit:
        eventName = 'NewSchemeProposal'
        break
      case IProposalType.SchemeRegistrarRemove:
        eventName = 'RemoveSchemeProposal'
        break
      default:
        throw Error(`SchemeRegistrar.createProposal: Unknown proposal type ${options.proposalType}`)
    }
    const args = getEventArgs(receipt, eventName, 'SchemeRegistrar.createProposal')
    const proposalId = args[1]
    return new Proposal(context, proposalId)
  }
}
