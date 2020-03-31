import { from } from 'rxjs'
import { concatMap } from 'rxjs/operators'

import {
  ITransaction,
  Operation,
  toIOperationObservable
} from '../operation'

import { Address } from '../types'

import { SchemeBase } from '../schemes/base'

export class ReputationFromTokenScheme {

  constructor(public scheme: SchemeBase) {

  }

  public async getAgreementHash(): Promise<string> {
    const contract = await this.getContract()
    const result = await contract.getAgreementHash()
    return result
  }

  public redeem(beneficiary: Address, agreementHash?: string): Operation<undefined> {

    const createTransaction = async (): Promise<ITransaction> => {
      const contract = await this.getContract()
      const contractInfo = this.scheme.context.getContractInfo(contract.address)
      const contractVersion = contractInfo.version
      const versionNumber = Number(contractVersion.split('rc.')[1])
      if (versionNumber <= 32) {
        return {
          contract,
          method: 'redeem',
          args: [ beneficiary ]
        }
      } else {
        if (!agreementHash) {
          throw Error(`For ReputationForToken version > rc.32, an "agreementHash" argument must be provided`)
        }
        return {
          contract,
          method: 'redeem',
          args: [ beneficiary, agreementHash ]
        }
      }
    }

    const observable = from(createTransaction()).pipe(
      concatMap((transaction) => {
        return this.scheme.context.sendTransaction(transaction)
      })
    )

    return toIOperationObservable(observable)
  }

  public async getContract() {
    const state = await this.scheme.fetchState()
    const contract = this.scheme.context.getContract(state.address)
    return contract
  }

}
