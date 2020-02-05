import { RetryLink } from 'apollo-link-retry'
import { getMainDefinition } from 'apollo-utilities'
import { Arc } from '../src'
import { createApolloClient } from '../src/graphnode'

jest.setTimeout(20000)
/**
 * Tests to see if the apollo cache works as expected
 */
describe('client handles errors', () => {

  let arc: any
  let networkSubscriptions: any[] = []
  let networkQueries: any[] = []

  beforeEach(async () => {
    networkSubscriptions = []
    networkQueries = []
 })

  it('will retry on failed connection', async () => {
    // get all DAOs
    const graphqlHttpProvider = 'http://127.0.0.1:8000/name/doesnotexist'
    const graphqlWsProvider = 'http://127.0.0.1:8001/name/doesnotexist'

    arc = new Arc({
      graphqlHttpProvider,
      graphqlWsProvider,
      ipfsProvider: '',
      web3Provider: 'ws://127.0.0.1:8545'
    })

    let retries = 0
    const retryLink = new RetryLink({
      attempts: {
        max: 3, // max number of retry attempts
        retryIf: (error, _operation) => {
          retries += 1
          return !!error
        }
      },
      delay: {
        initial: 100,
        jitter: true,
        max: 300 // can be Infinity
      }
    })
    const options = {
      graphqlHttpProvider,
      graphqlPrefetchHook: (query: any) => {
        const definition = getMainDefinition(query)
        // @ts-ignore
        if (definition.operation === 'subscription') {
          networkSubscriptions.push(definition)
        } else {
          networkQueries.push(definition)
        }
        // console.log(definition)
      },
      graphqlWsProvider,
      retryLink
    }
    arc.apolloClient = createApolloClient(options)

    // the call to fetchContractInfos() will fail because the graphqlHttp endpoint is not reposding
    await expect(arc.fetchContractInfos()).rejects.toThrow()
    expect(retries).toEqual(2) // we set attempts.max to 3, so we have retried twice before throwing the error
  })
})
