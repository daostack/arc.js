import BN = require('bn.js')
import { from } from 'rxjs'
import { concatMap } from 'rxjs/operators'
import { realMathToBN, realMathToNumber } from '../utils'

import {
  Operation,
  toIOperationObservable
} from '../operation'

import { Address } from '../types'

import { Scheme } from '../scheme'

export class CTL4RScheme {

  constructor(public scheme: Scheme) {

  }

  /**
   * getRepuationRewardForBatch
   * according to the formula
   * repPerBatch = _repRewardConstA * ((_repRewardConstB/1000) ** batchIndex)
   * @param  repRewardConstA
   * @param  repRewardConstB
   * @param  batchIndex the batchIndex to calculate
   * @return     RepuationRewardForBatch
   */
  public async getRepuationRewardForBatch(repRewardConstA: string,
                                          repRewardConstB: string,
                                          batchIndex: number)
                                          : Promise<BN> {
    // repRewardConstB is alway a realNumber value < 1 and > 0 so lets convert it to numnber between 0 to 1000
    const constBMull1000 = new BN(Math.round((realMathToNumber(new BN(repRewardConstB)) + Number.EPSILON) * 100) * 10)
    // (repRewardConstA *  (repRewardConstB ** batchIndex) / (1000 ** batchIndex)
    return realMathToBN(new BN(repRewardConstA))
           .mul(constBMull1000.pow(new BN(batchIndex)))
           .div((new BN(1000)).pow(new BN(batchIndex)))
  }

  public async getAgreementHash(): Promise<string> {
    const contract = await this.getContract()
    const result = await contract.methods.getAgreementHash().call()
    return result
  }

  public async getReputationRewardForLockingIds(lockingIds: number[],
                                                batchIndex: number,
                                                repuationRewardForPeriod: BN)
                                                : Promise<BN> {
    let reputation = new BN('0')
    const contract = await this.getContract()
    const lockingTotalScore = new BN(await contract.methods.batches(batchIndex).call())

    if (lockingTotalScore.isZero()) {
      return lockingTotalScore
    }
    for (const lockingId of lockingIds) {
      const lockingIdScore = new BN(await contract.methods.getLockingIdScore(batchIndex, lockingId).call())
      reputation = reputation.add(lockingIdScore.div(lockingTotalScore).mul(repuationRewardForPeriod))
    }
    return reputation
  }

  public lock(amount: BN, period: number, batchIndexToLockIn: number, agreementHash: string): Operation<any> {
    const mapReceipt = (receipt: any) => {
      return receipt
    }

    const observable = from(this.getContract())
      .pipe(
      concatMap((contract) => {
        let transaction: any
        transaction = contract.methods.lock(
          amount,
          period,
          batchIndexToLockIn,
          agreementHash
        )
        const errorHandler = async (error: Error) => {
          try {
            await transaction.call()
          } catch (err) {
            throw err
          }
          return error
        }
        return this.scheme.context.sendTransaction(transaction, mapReceipt, errorHandler)
      })
    )
    return toIOperationObservable(observable)
  }

    public extendLocking(extendPeriod: number,
                         batchIndexToLockIn: number,
                         lockingId: number,
                         agreementHash: string): Operation<any> {
      const mapReceipt = (receipt: any) => {
        return receipt
      }

      const observable = from(this.getContract())
        .pipe(
        concatMap((contract) => {
          let transaction: any
          transaction = contract.methods.extendLocking(
            extendPeriod,
            batchIndexToLockIn,
            lockingId,
            agreementHash
          )
          const errorHandler = async (error: Error) => {
            try {
              await transaction.call()
            } catch (err) {
              throw err
            }
            return error
          }
          return this.scheme.context.sendTransaction(transaction, mapReceipt, errorHandler)
        })
      )
      return toIOperationObservable(observable)
    }
    public release(beneficiary: Address, lockingId: number): Operation<any> {
      const mapReceipt = (receipt: any) => {
        return receipt
      }

      const observable = from(this.getContract())
        .pipe(
        concatMap((contract) => {
          let transaction: any
          transaction = contract.methods.release(
            beneficiary,
            lockingId
          )
          const errorHandler = async (error: Error) => {
            try {
              await transaction.call()
            } catch (err) {
              throw err
            }
            return error
          }
          return this.scheme.context.sendTransaction(transaction, mapReceipt, errorHandler)
        })
      )
      return toIOperationObservable(observable)
    }

  public async getContract() {
    const state = await this.scheme.fetchStaticState()
    await this.scheme.context.fetchContractInfos({fetchPolicy: 'network-only'})
    const contract = this.scheme.context.getContract(state.address)
    return contract
  }

  public getScheme() {
    return this.scheme
  }

}
