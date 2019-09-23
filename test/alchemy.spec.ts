// tests that simulate what alchemy is doing
import { getMainDefinition } from 'apollo-utilities'
// import gql from 'graphql-tag'
import { first } from 'rxjs/operators'
import { Arc } from '../src/arc'
import { createApolloClient } from '../src/graphnode'
// import { Member } from '../src/member'
// import { Proposal } from '../src/proposal'
import { getContractAddressesFromMigration } from '../src/utils'
// import { Vote } from '../src/vote'
import { graphqlHttpProvider, graphqlWsProvider, waitUntilTrue } from './utils'

/**
 * Tests to see if the apollo cache works as expected
 */
describe('Checks for patterns in Alchemy Pages', () => {

  let arc: any
  let networkSubscriptions: any[] = []
  let networkQueries: any[] = []

  beforeEach(async () => {
    networkSubscriptions = []
    networkQueries = []
    arc = new Arc({
      contractInfos: getContractAddressesFromMigration('private'),
      graphqlHttpProvider,
      graphqlSubscribeToQueries: false,
      graphqlWsProvider,
      ipfsProvider: '',
      web3Provider: 'ws://127.0.0.1:8545'
    })

    arc.apolloClient = createApolloClient({
      graphqlHttpProvider,
      graphqlPrefetchHook: (query: any) => {
        const definition = getMainDefinition(query)
        // console.log(query)
        // @ts-ignore
        if (definition.operation === 'subscription') {
          networkSubscriptions.push(definition)
        } else {
          networkQueries.push(definition)
        }
        // console.log(definition)
      },
      graphqlWsProvider
    })
  })

  it('DaosPage (homepage)', async () => {
    // const client = arc.apolloClient
    // get all DAOs

    let fetched = 0
    let daos: any
    await arc.daos({}, { fetchAllData: true, subscribe: true }).subscribe((next: any) => {
      daos = next
      fetched += 1
    })
    await waitUntilTrue(() => !!fetched)
    // we will still hit the server when getting the DAO state, because the previous query did not fetch all state data
    // so the next line with 'cache-only' will throw an Error

    // now we have all data in the cache - and we can get the whole state from the cache without error
    await arc.dao(daos[0].id).state({ fetchPolicy: 'cache-only'}).pipe(first()).toPromise()
  })
})
