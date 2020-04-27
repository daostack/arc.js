import { first} from 'rxjs/operators'
import { Address, Arc, Token  } from '../src'
import BN = require('bn.js')
import { fromWei, getTestAddresses, ITestAddresses,
   newArc, toWei, waitUntilTrue } from './utils'

jest.setTimeout(20000)
/**
 * Token test
 */
describe('Token', () => {
  let addresses: ITestAddresses
  let arc: Arc
  let address: Address

  beforeAll(async () => {
    arc = await newArc()
    addresses = getTestAddresses()
    address = addresses.dao.DAOToken
  })

  it('Token is instantiable', () => {
    const token = new Token(arc, address)
    expect(token).toBeInstanceOf(Token)
    expect(token.address).toBe(address)
  })

  it('get the token state', async () => {
    const token = new Token(arc, address)
    const state = await token.fetchState()
    expect(Object.keys(state)).toEqual(['address', 'name', 'owner', 'symbol', 'totalSupply'])
    const expected = {
       address: address.toLowerCase(),
       owner: addresses.dao.Avatar.toLowerCase()
    }
    expect(state).toMatchObject(expected)
  })

  it('throws a reasonable error if the contract does not exist', async () => {
    expect.assertions(1)
    const token = new Token(arc, '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1')
    await expect(token.state().toPromise()).rejects.toThrow(
      'Could not find a token contract with address 0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1'
    )
  })

  it('throws a reasonable error if the constructor gets an invalid address', async () => {
    await expect(() => new Token(arc, '0xinvalid')).toThrow(
      'Not a valid address: 0xinvalid'
    )
  })

  it('get someones balance', async () => {
    const token = new Token(arc, address)
    const balanceOf = await token.balanceOf('0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1')
      .pipe(first()).toPromise()
    expect(fromWei(balanceOf)).toEqual('1000.0')
  })

  it('mint some new tokens', async () => {
    const token = new Token(arc, addresses.organs.DemoDAOToken)
    const account = '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1'
    // check if the currentAccount is the owner of the contract
    const balances: Array<BN> = []
    const amount = new BN('1234')
    token.balanceOf(account).subscribe((next: BN) => balances.push(next))
    await token.mint(account, amount).send()
    await waitUntilTrue(() => balances.length > 1)
    expect(balances[1].sub(balances[0]).toString()).toEqual(amount.toString())
  })

  it('balanceOf GEN token works', async () => {
    const token = arc.GENToken()
    const account = '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1'
    const balances: Array<BN> = []
    const amountToMint = new BN('12345')
    token.balanceOf(account).subscribe((next: BN) => balances.push(next))
    await waitUntilTrue(() => balances.length > 0)
    expect(typeof balances[0]).toEqual(typeof new BN(0))
    await token.mint(account, amountToMint).send()
    await waitUntilTrue(() => balances.length > 1)
    expect(balances[1].sub(balances[0]).toString()).toEqual(amountToMint.toString())
    const amountToSend = new BN('23456')
    await token.transfer('0x72939947e7a1c4ac94bb840e3304b322237ad1a8', amountToSend).send()
    await waitUntilTrue(() => balances.length > 2)
    expect(balances[1].sub(balances[2]).toString()).toEqual(amountToSend.toString())
  })

  it('approveForStaking() and allowance() work', async () => {
    const token = arc.GENToken()
    const amount = toWei('31415')
    const allowances: Array<BN> = []
    const lastAllowance = () => allowances[allowances.length - 1]
    const someAddress = '0xffcf8fdee72ac11b5c542428b35eef5769c409f0'

    if(!arc.web3) throw new Error("Web3 provider not set")

    let defaultAccount = await arc.getDefaultAddress()
    
    if (!defaultAccount) {
      defaultAccount = await arc.web3.getSigner().getAddress()
    }

    token.allowance(defaultAccount, someAddress).subscribe(
      (next: any) => allowances.push(next)
    )

    await token.approveForStaking(someAddress, amount).send()

    await waitUntilTrue(() => allowances.length > 0 && lastAllowance().gte(amount))
    expect(lastAllowance()).toMatchObject(amount)
  })

  it('get balance of a non-existing token', async () => {
    const token = new Token(arc, '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1')
    const promise = token.balanceOf('0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1')
      .pipe(first()).toPromise()
    await expect(promise).rejects.toThrow(new RegExp("^contract not deployed"))
  })

  it('paging and sorting works', async () => {
    const ls1 = await Token.search(arc, { first: 3, orderBy: 'id' }).pipe(first()).toPromise()
    expect(ls1.length).toEqual(3)
    expect(ls1[0].id <= ls1[1].id).toBeTruthy()

    const ls2 = await Token.search(arc, { first: 2, skip: 2, orderBy: 'id' }).pipe(first()).toPromise()
    expect(ls2.length).toEqual(2)
    expect(ls1[2].id).toEqual(ls2[0].id)

    const ls3 = await Token.search(arc, {  orderBy: 'id', orderDirection: 'desc'}).pipe(first()).toPromise()
    expect(ls3[0].id >= ls3[1].id).toBeTruthy()
  })

})
