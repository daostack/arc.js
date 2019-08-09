import { DAOTOKEN_CONTRACT_VERSION } from './settings'
import { Token } from './token'

export class GENToken extends Token {
  /*
   * get a web3 contract instance for this token
   */
  public contract(mode?: 'readonly') {
    const abi = require(`@daostack/migration/abis/${DAOTOKEN_CONTRACT_VERSION}/ERC827Token.json`)
    return this.context.getContract(this.address, abi, mode)
  }
}
