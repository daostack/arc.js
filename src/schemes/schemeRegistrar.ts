import { Arc } from '../arc'
import { Proposal } from '../proposal'
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

export interface IProposalCreateOptionsSR {
  parametersHash?: string
  permissions?: string
  schemeToRegister?: Address
}

export enum IProposalType {
  SchemeRegistrarAdd = 'SchemeRegistrarAdd', // propose to register to schme
  SchemeRegistrarEdit = 'SchemeRegistrarEdit', // propose to edit a registered scheme
  SchemeRegistrarRemove = 'SchemeRegistrarRemove' // propose to remove a registered scheme
}

export function createTransaction(context: Arc, options: any): () => any {
  let msg: string
  switch (options.type) {
    case IProposalType.SchemeRegistrarAdd:
    case IProposalType.SchemeRegistrarEdit:
     if (!options.scheme) {
        msg = `Missing argument "scheme" for SchemeRegistrar in Proposal.create()`
        throw Error(msg)
      }
     if (!options.parametersHash) {
        msg = `Missing argument "parametersHash" for SchemeRegistrar in Proposal.create()`
        throw Error(msg)
      }
     if (!options.permissions) {
        msg = `Missing argument "permissions" for SchemeRegistrar in Proposal.create()`
        throw Error(msg)
      }
     return async () => {
        const schemeRegistrar = context.getContract(options.scheme)
        options.descriptionHash = await context.saveIPFSData(options)

        const transaction = schemeRegistrar.proposeScheme(
          options.dao,
          options.schemeToRegister,
          options.parametersHash,
          options.permissions,
          options.descriptionHash
        )
        return transaction
      }
    case 'SchemeRegistrarRemove':
     if (!options.scheme) {
        msg = `Missing argument "scheme" for SchemeRegistrar`
        throw Error(msg)
     }
     return async () => {
        const schemeRegistrar = context.getContract(options.scheme)
        options.descriptionHash = await context.saveIPFSData(options)
        const transaction = schemeRegistrar.proposeToRemoveScheme(
          options.dao,
          options.schemeToRegister,
          options.descriptionHash
        )
        return transaction
      }
  }
  throw Error('For a schemeregistrar proposal, you must specifcy proposal.type')
}

export function createTransactionMap(context: Arc, options: any) {
  let eventName: string
  switch (options.type) {
    case IProposalType.SchemeRegistrarAdd:
    case IProposalType.SchemeRegistrarEdit:
       eventName = 'NewSchemeProposal'
       break
    case 'SchemeRegistrarRemove':
       eventName = 'RemoveSchemeProposal'
  }
  const map = (receipt: any) => {
    const proposalId = receipt.events.find((event: any) => event.event === eventName).args._proposalId
    return new Proposal(context, proposalId
      // options.dao as string, options.scheme, votingMachineAddress,
      )
  }
  return map
}
