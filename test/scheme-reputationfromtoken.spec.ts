import { first } from 'rxjs/operators'
import { newArc } from './utils'

jest.setTimeout(60000)
/**
 * Scheme test
 */
describe('Scheme', () => {

  it('Test the whole flow', async () => {
    const arc = await newArc()
    const schemeContractInfo = arc.getContractInfoByName('ReputationFromToken', '0.0.1-rc.32')
    const schemes = await arc.schemes({ where: {address: schemeContractInfo.address}})
      .pipe(first()).toPromise()
    const scheme = schemes[0]
    expect(scheme.ReputationFromToken).not.toBeFalsy()
    if (scheme.ReputationFromToken) {
      // const amount = await scheme.ReputationFromToken.redemptionAmount(arc.web3.eth.defaultAccount)
      // expect(amount).toEqual(0)
      await scheme.ReputationFromToken.redeem(arc.web3.eth.defaultAccount)
    }
  })

})
