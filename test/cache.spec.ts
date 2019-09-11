import { first } from 'rxjs/operators'
import { Arc } from '../src/arc'
import { Member } from '../src/member'
import { Proposal } from '../src/proposal'
import { getContractAddressesFromMigration } from '../src/utils'
import { graphqlHttpProvider, graphqlWsProvider } from './utils'

jest.setTimeout(20000)
/**
 * Tests to see if the apollo cache works as expected
 */
describe('apolloClient caching checks', () => {

  it.skip('pre-fetching DAOs works', async () => {
    const arc = new Arc({
      contractInfos: getContractAddressesFromMigration('private'),
      graphqlHttpProvider,
      graphqlWsProvider,
      ipfsProvider: '',
      web3Provider: 'ws://127.0.0.1:8545'
    })

    // const client = arc.apolloClient
    // get all DAOs
    const daos = await arc.daos().pipe(first()).toPromise()

    // we will still hit the server when getting the DAO state, because the previous query did not fetch all state data
    // so the next line with 'cache-only' will throw an Error
    const p = arc.dao(daos[0].id).state({ fetchPolicy: 'cache-only'}).pipe(first()).toPromise()
    expect(p).rejects.toThrow()

    // now get all the DAOs with defailed data
    await arc.daos({}, { fetchAllData: true }).pipe(first()).toPromise()
    // now we have all data in the cache - and we can get the whole state from the cache without error
    await arc.dao(daos[0].id).state({ fetchPolicy: 'cache-only'}).pipe(first()).toPromise()
  })

  it.skip('pre-fetching Proposals works', async () => {
    const arc = new Arc({
      contractInfos: getContractAddressesFromMigration('private'),
      graphqlHttpProvider,
      graphqlWsProvider,
      ipfsProvider: '',
      web3Provider: 'ws://127.0.0.1:8545'
    })

    const proposals = Proposal.search(arc).pipe(first()).toPromise()
    const proposal = proposals[0]
    // so the next line with 'cache-only' will throw an Error
    const p = proposal.state({ fetchPolicy: 'cache-only'}).pipe(first()).toPromise()
    expect(p).rejects.toThrow()

    // now get all the DAOs with defailed data
    await Proposal.search(arc, {}, { fetchAllData: true }).pipe(first()).toPromise()
    // now we have all data in the cache - and we can get the whole state from the cache without error
    await proposal.state({ fetchPolicy: 'cache-only'}).pipe(first()).toPromise()
  })

  it('pre-fetching Members with Member.search() works', async () => {
    const arc = new Arc({
      contractInfos: getContractAddressesFromMigration('private'),
      graphqlHttpProvider,
      graphqlWsProvider,
      ipfsProvider: '',
      web3Provider: 'ws://127.0.0.1:8545'
    })

    // get all members of the dao
    const members = await Member.search(arc).pipe(first()).toPromise()
    const member = members[0]

    // we will still hit the server when getting the DAO state, because the previous query did not fetch all state data
    // so the next line with 'cache-only' will throw an Error
    expect(member.id).toBeTruthy()
    // await new Member(member.id as string , arc).state().pipe(first()).toPromise()
    await new Member(member.id as string , arc).state({ fetchPolicy: 'cache-only'}).pipe(first()).toPromise()
  })

  it('pre-fetching Members with dao.members() works', async () => {
    const arc = new Arc({
      contractInfos: getContractAddressesFromMigration('private'),
      graphqlHttpProvider,
      graphqlWsProvider,
      ipfsProvider: '',
      web3Provider: 'ws://127.0.0.1:8545'
    })

    // const client = arc.apolloClient
    // get all DAOs
    const daos = await arc.daos().pipe(first()).toPromise()
    const dao = daos[0]
    // get all members of the dao
    const members = await dao.members().pipe(first()).toPromise()
    const member = members[0]

    // we will still hit the server when getting the DAO state, because the previous query did not fetch all state data
    // so the next line with 'cache-only' will throw an Error
    expect(member.id).toBeTruthy()
    // await new Member(member.id as string , arc).state().pipe(first()).toPromise()
    await new Member(member.id as string , arc).state({ fetchPolicy: 'cache-only'}).pipe(first()).toPromise()
  })

})
