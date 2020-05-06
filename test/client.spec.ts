import { NormalizedCacheObject } from 'apollo-cache-inmemory'
import { ApolloClient } from 'apollo-client'
import gql from 'graphql-tag'
import { Arc, createApolloClient } from '../src'
import { getContractAddressesFromMigration, graphqlHttpProvider,
  graphqlWsProvider, mintSomeReputation, waitUntilTrue } from './utils'

function getClient() {
  const apolloClient = createApolloClient({
    graphqlHttpProvider,
    graphqlWsProvider
  })
  return apolloClient
}

jest.setTimeout(20000)
/**
 * Token test
 */
describe('apolloClient', () => {
  let client: ApolloClient<NormalizedCacheObject>

  it('can be instantiated', () => {
    client = getClient()
    expect(client).toBeInstanceOf(ApolloClient)
  })

  it('handles querying', async () => {
    client = getClient()
    const query = gql`
      {
          reputationMints {
            contract
            amount
            address
        }
      }
    `
    const result = await client.query({ query })
    expect(result.networkStatus).toEqual(7)
    expect(typeof result.data).toEqual(typeof [])
  })

  it('handles subscriptions', async () => {
    client = getClient()
    const query = gql`
      subscription {
        reputationMints {
          contract
          amount
          address
        }
      }
    `

    const returnedData: object[] = []
    let cntr: number = 0

    // client.subscribe returns a zenObservable
    const subscription = client.subscribe({ query, fetchPolicy: 'no-cache' })
      .subscribe(
        (eventData: any) => {
          // Do something on receipt of the event
          cntr += 1
          returnedData.push(eventData.data)
        },
        (err: any) => {
          throw err
        }
      )

    await mintSomeReputation()
    await mintSomeReputation()

    // we should have received two reputation events
    await waitUntilTrue(() => cntr >= 2 )

    expect(returnedData.length).toBeGreaterThan(0)
    expect(cntr).toBeGreaterThanOrEqual(2)
    subscription.unsubscribe()
  })

  it('getObservable works', async () => {
    const arc = new Arc({
      contractInfos: getContractAddressesFromMigration('private'),
      graphqlHttpProvider,
      graphqlWsProvider,
      ipfsProvider: '',
      web3Provider: 'http://127.0.0.1:8545'
    })
    const query = gql`{
        reputationMints {
          contract
          amount
          address
        }
      }
    `

    const observable = arc.getObservable(query)

    const returnedData: object[] = []

    const subscription = observable.subscribe(
      (eventData: any) => {
        // Do something on receipt of the event
        returnedData.push(eventData.data)
      },
      (err: any) => {
        throw err
      }
    )

    await mintSomeReputation()
    await mintSomeReputation()

    await waitUntilTrue(() => returnedData.length >= 2 )
    // expect(cntr).toEqual(3)
    subscription.unsubscribe()
  })

  it('subscribe manually', async () => {
    const arc = new Arc({
      contractInfos: getContractAddressesFromMigration('private'),
      graphqlHttpProvider,
      graphqlWsProvider,
      ipfsProvider: '',
      web3Provider: 'http://127.0.0.1:8545'
    })
    const query = gql`{
        reputationMints {
          contract
          amount
          address
        }
      }
    `

    const observable = arc.getObservable(query, {fetchPolicy: 'cache-only'})

    const returnedData: object[] = []

    const subscription = observable.subscribe(
      (eventData: any) => {
        // Do something on receipt of the event
        returnedData.push(eventData.data)
      },
      (err: any) => {
        throw err
      }
    )

    await mintSomeReputation()
    await mintSomeReputation()

    await waitUntilTrue(() => returnedData.length >= 2 )
    // expect(cntr).toEqual(3)
    subscription.unsubscribe()
  })
})
