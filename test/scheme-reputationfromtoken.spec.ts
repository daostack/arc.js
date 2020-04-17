import { first } from 'rxjs/operators'
import { Arc, ReputationFromTokenScheme } from '../src'
import { newArc } from './utils'

jest.setTimeout(60000)
/**
 * Scheme test
 */
describe('Scheme', () => {

  let arc: Arc
  const agreementHash = '0x0000000000000000000000000000000000000001000000000000000000000000'
  beforeAll(async () => {
    arc = await newArc()
  })

  it('version 0.0.1-rc.32', async () => {
    const pluginContractInfo = arc.getContractInfoByName('ReputationFromToken', '0.0.1-rc.32')
    const plugins = await arc.plugins({ where: {address: pluginContractInfo.address}})
      .pipe(first()).toPromise()
    const plugin = plugins[0]
    expect(plugin.ReputationFromToken).not.toBeFalsy()
    const reputationFromToken = plugin.ReputationFromToken as ReputationFromTokenScheme

    if(!arc.web3) throw new Error("Web3 provider not set")
    const defaultAccount = arc.defaultAccount? arc.defaultAccount: await arc.web3.getSigner().getAddress()

    const redemptionPromise = reputationFromToken.redeem(defaultAccount).send()
    // TODO: the transaction reverts, for erasons to check :-/
    expect(redemptionPromise).rejects.toThrow()
  })
  it('version 0.0.1-rc.34', async () => {
    const pluginContractInfo = arc.getContractInfoByName('ReputationFromToken', '0.0.1-rc.34')
    const plugins = await arc.plugins({ where: {address: pluginContractInfo.address}})
      .pipe(first()).toPromise()
    const plugin = plugins[0]
    const reputationFromToken = plugin.ReputationFromToken as ReputationFromTokenScheme

    if(!arc.web3) throw new Error("Web3 provider not set")
    const defaultAccount = arc.defaultAccount? arc.defaultAccount: await arc.web3.getSigner().getAddress()

    await expect(reputationFromToken.redeem(
      defaultAccount,
      '0x0123400000000000000000000000000000000000000000000000000000000000' // <- wrong hash
    ).send()).rejects.toThrow(
      // TODO: uncomment when Ethers.js supports revert reasons, see thread:
      // https://github.com/ethers-io/ethers.js/issues/446
      /*'must send the right agreementHash'*/
    )

    // TODO: this reverst, would be nice to have a working test
    await expect(reputationFromToken.redeem(
      defaultAccount,
      agreementHash // <- right hash
    ).send()).rejects.toThrow('revert')
   })

  it('getAgreementHash works', async () => {
    const pluginContractInfo = arc.getContractInfoByName('ReputationFromToken', '0.0.1-rc.34')
    const plugins = await arc.plugins({ where: {address: pluginContractInfo.address}})
      .pipe(first()).toPromise()
    const plugin = plugins[0]
    const reputationFromToken = plugin.ReputationFromToken as ReputationFromTokenScheme
    expect(await reputationFromToken.getAgreementHash()).toEqual(agreementHash)

  })
})
