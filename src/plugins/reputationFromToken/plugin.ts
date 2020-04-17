import { from } from 'rxjs'
import { concatMap } from 'rxjs/operators'
import {
  ITransaction,
  Operation,
  toIOperationObservable
} from '../../index'
import { Address } from '../../types'
import { AnyPlugin } from '..'

export class ReputationFromTokenScheme {

  constructor(public plugin: AnyPlugin) { }

  public async getAgreementHash(): Promise<string> {
    const contract = await this.getContract()
    const result = await contract.getAgreementHash()
    return result
  }

  public redeem(beneficiary: Address, agreementHash?: string): Operation<undefined> {

    const createTransaction = async (): Promise<ITransaction> => {
      const contract = await this.getContract()
      const contractInfo = this.plugin.context.getContractInfo(contract.address)
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
        return this.plugin.context.sendTransaction(transaction)
      })
    )

    return toIOperationObservable(observable)
  }

  public async getContract() {
    const state = await this.plugin.fetchState()
    const contract = this.plugin.context.getContract(state.address)
    return contract
  }

}
