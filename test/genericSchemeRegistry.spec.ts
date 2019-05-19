const Web3 = require('web3')
import { GenericSchemeRegistry, IActionSpec } from '../src/schemes/genericSchemeRegistry'

jest.setTimeout(10000)

/**
 * Arc test
 */
describe('GenericSchemeRegistry ', () => {
  it('is sane', () => {
    const registry = new GenericSchemeRegistry()
    const dxDao = registry.genericSchemeInfo('dxDAO')
    const actions = dxDao.actions()
    expect(actions.length).toBeGreaterThan(0)

  })
  it('encode/decode works', () => {
    const registry = new GenericSchemeRegistry()
    const dxDao = registry.genericSchemeInfo('dxDAO')
    const action1 = dxDao.action('updateMasterCopy')
    const action2 = dxDao.action('addOrRemoveTokens')

    const actions: Array<[IActionSpec, any[]]> = [
      [action1, ['0xCeFe7377b3E97e94426F9C8e178def3E3AE56375']],
      [action1, ['0xCeFe7377B3e97E94426f9C8E178DEF3E3Ae56377']],
      [action2, [['0xCeFe7377b3E97e94426F9C8e178def3E3AE56375'], true]],
      [action2, [['0xCeFe7377b3E97e94426F9C8e178def3E3AE56375'], false]]
    ]

    for (const action of actions) {
      const callData = dxDao.encodeABI(action[0], action[1])
      const decodedAction = dxDao.decodeCallData(callData)
      expect(decodedAction.action).toEqual(action[0])
      expect(decodedAction.values).toMatchObject(action[1])
    }

  })
})
