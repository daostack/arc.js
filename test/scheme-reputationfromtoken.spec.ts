import { first } from 'rxjs/operators'
import { Arc, ReputationFromTokenPlugin } from '../src'
import { newArc } from './utils'

jest.setTimeout(60000)
/**
 * Scheme test
 */

describe('Scheme', () => {

  let arc: Arc
  beforeAll(async () => {
    arc = await newArc()
  })

  it('Redeem Works', async () => {
    const plugins = await arc.plugins({ where: {name: 'ReputationFromToken'}})
      .pipe(first()).toPromise()
    const reputationFromToken = plugins[0] as ReputationFromTokenPlugin
    expect(reputationFromToken).not.toBeFalsy()

    if (!arc.web3) { throw new Error('Web3 provider not set') }
    let defaultAccount = await arc.getDefaultAddress()

    if (!defaultAccount) {
      defaultAccount = await arc.web3.getSigner().getAddress()
    }

    const redemptionPromise = reputationFromToken.redeem(defaultAccount).send()
    expect(redemptionPromise).rejects.toThrow()
  })
})
