import 'ethers/dist/shims'

import BN from 'bn.js'
import { Contract, Signer } from 'ethers'
import { JsonRpcProvider, Web3Provider as EthersWeb3JsProvider } from 'ethers/providers'
import { BigNumber } from 'ethers/utils'
import gql from 'graphql-tag'
import { Observable, Observer, of } from 'rxjs'
import {
  ABI_DIR,
  Address,
  AnyPlugin,
  AnyProposal,
  DAO,
  Event,
  GraphNodeObserver,
  IApolloQueryOptions,
  IDAOQueryOptions,
  IEventQueryOptions,
  IPFSClient,
  IPFSProvider,
  IPluginQueryOptions,
  IProposalQueryOptions,
  IRewardQueryOptions,
  isAddress,
  IStakeQueryOptions,
  ITagQueryOptions,
  ITransaction,
  ITransactionReceipt,
  Logger,
  Operation,
  Plugin,
  PluginName,
  Plugins,
  Proposal,
  Reward,
  sendTransaction,
  Stake,
  Tag,
  Token,
  transactionErrorHandler,
  transactionResultHandler,
  Web3Client,
  Web3Provider
} from './index'

export interface IArcOptions {
  /** Information about the contracts. Cf. [[setContractInfos]] and [[fetchContractInfos]] */
  contractInfos?: IContractInfo[]
  graphqlHttpProvider?: string
  graphqlWsProvider?: string
  ipfsProvider?: IPFSProvider
  web3Provider?: Web3Provider
  /** this function will be called before a query is sent to the graphql provider */
  graphqlPrefetchHook?: (query: any) => void
  /** determines whether a query should subscribe to updates from the graphProvider. Default is true.  */
  graphqlSubscribeToQueries?: boolean
  /** an apollo-retry-link instance as https://www.apollographql.com/docs/link/links/retry/#default-configuration */
  graphqlRetryLink?: any,
  graphqlErrHandler?: any
}

/**
 * The Arc class holds all configuration.
 * Any useage of the library typically will start with instantiating a new Arc instance
 * @return an instance of Arc
 */
export class Arc extends GraphNodeObserver {

  public defaultAccount: string | Signer | undefined = undefined
  public pendingOperations: Observable<Array<Operation<any>>> = of()

  public ipfsProvider: IPFSProvider
  public ipfs: IPFSClient | undefined = undefined

  public get web3Provider(): Web3Provider {
    return this._web3Provider
  }

  public get web3(): Web3Client | undefined {
    return this._web3
  }

  /**
   * a mapping of contrct names to contract addresses
   */
  public contractInfos: IContractInfo[]

  // accounts observed by ethBalance
  public observedAccounts: {
    [address: string]: {
      observable?: Observable<BN>;
      observer?: Observer<BN>;
      lastBalance?: string;
      subscriptionsCount: number;
    };
  } = {}

  private _web3Provider: Web3Provider = ''
  private _web3: Web3Client | undefined = undefined

  constructor(options: IArcOptions) {
    super({
      errHandler: options.graphqlErrHandler,
      graphqlHttpProvider: options.graphqlHttpProvider,
      graphqlSubscribeToQueries: options.graphqlSubscribeToQueries,
      graphqlWsProvider: options.graphqlWsProvider,
      prefetchHook: options.graphqlPrefetchHook,
      retryLink: options.graphqlRetryLink
    })
    this.ipfsProvider = options.ipfsProvider || ''

    if (options.web3Provider) {
      this.setWeb3(options.web3Provider)
    }

    this.contractInfos = options.contractInfos || []
    if (!this.contractInfos) {
      Logger.warn(
        'No contract addresses given to the Arc.constructor: expect most write operations to fail!'
      )
    }

    if (this.ipfsProvider) {
      this.ipfs = new IPFSClient(this.ipfsProvider)
    }

    // by default, we do not subscribe to queries
    if (options.graphqlSubscribeToQueries === undefined) {
      options.graphqlSubscribeToQueries = false
    }
  }

  public setWeb3(provider: Web3Provider) {
    if (typeof provider === 'string') {
      this._web3 = new JsonRpcProvider(provider)
    } else if (Signer.isSigner(provider)) {
      const signer: Signer = provider

      if (!signer.provider) {
        throw Error(
          'Ethers Signer is missing a provider, please set one. More info here: https://docs.ethers.io/ethers.js/html/api-wallet.html'
        )
      }

      this._web3 = signer.provider as JsonRpcProvider
      this.defaultAccount = signer
    } else {
      this._web3 = new EthersWeb3JsProvider(provider)
    }

    this._web3Provider = provider
  }

  public async getDefaultAddress(): Promise<string | undefined> {
    if (Signer.isSigner(this.defaultAccount)) {
      return await this.defaultAccount.getAddress()
    } else {
      return this.defaultAccount
    }
  }

  /**
   * set the contract addresses
   * @param  contractInfos a list of IContractInfo objects
   * @return
   */
  public async setContractInfos(contractInfos: IContractInfo[]) {
    this.contractInfos = contractInfos
  }

  /**
   * fetch contractInfos from the subgraph
   * @return a list of IContractInfo instances
   */
  public async fetchContractInfos(
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Promise<IContractInfo[]> {
    const query = gql`
      query AllContractInfos {
        contractInfos(first: 1000) {
          id
          name
          version
          address
        }
      }
    `
    // const result = await this.getObservableList(query, itemMap, apolloQueryOptions).pipe(first()).toPromise()
    const response = await this.sendQuery(query, apolloQueryOptions)
    const result = response.data.contractInfos as IContractInfo[]
    this.setContractInfos(result)
    return result
  }

  /**
   * get a DAO instance from an address
   * @param  address address of the dao Avatar
   * @return an instance of a DAO
   */
  public dao(address: Address): DAO {
    isAddress(address)
    return new DAO(this, address)
  }

  /**
   * return an observable of the list of DAOs
   * @param options options to pass on to the query
   * @return [description]
   */
  public daos(
    options: IDAOQueryOptions = {},
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable<DAO[]> {
    return DAO.search(this, options, apolloQueryOptions)
  }

  public tags(
    options: ITagQueryOptions = {},
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable<Tag[]> {
    return Tag.search(this, options, apolloQueryOptions)
  }

  public plugin(id: string, name: PluginName): AnyPlugin {
    return new Plugins[name](this, id)
  }

  public plugins(
    options: IPluginQueryOptions = {},
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable<AnyPlugin[]> {
    return Plugin.search(this, options, apolloQueryOptions)
  }

  public proposals(
    options: IProposalQueryOptions = {},
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable<AnyProposal[]> {
    return Proposal.search(this, options, apolloQueryOptions)
  }

  public events(
    options: IEventQueryOptions = {},
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable<Event[]> {
    return Event.search(this, options, apolloQueryOptions)
  }

  public rewards(
    options: IRewardQueryOptions = {},
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable<Reward[]> {
    return Reward.search(this, options, apolloQueryOptions)
  }

  public stakes(
    options: IStakeQueryOptions = {},
    apolloQueryOptions: IApolloQueryOptions = {}
  ): Observable<Stake[]> {
    return Stake.search(this, options, apolloQueryOptions)
  }

  public ethBalance(owner: Address): Observable<BN> {
    if (!this.observedAccounts[owner]) {
      this.observedAccounts[owner] = {
        subscriptionsCount: 1
      }
    }
    if (this.observedAccounts[owner].observable) {
      this.observedAccounts[owner].subscriptionsCount += 1
      return this.observedAccounts[owner].observable as Observable<BN>
    }

    const observable: Observable<BN> = Observable.create((observer: Observer<BN>) => {
      this.observedAccounts[owner].observer = observer

      // get the current balance and return it
      if (!this.web3) {
        throw new Error('Web3 provider not defined')
      }

      this.web3
        .getBalance(owner)
        .then((currentBalance: BigNumber) => {
          const balance = currentBalance.toString()
          const obs = this.observedAccounts[owner].observer as Observer<BN>
          obs.next(new BN(balance))
          this.observedAccounts[owner].lastBalance = balance
        })
        .catch((err: Error) => observer.error(err))

      // called whenever the account balance changes
      const onBalanceChange = (balance: BigNumber) => {
        const accInfo = this.observedAccounts[owner]
        if (accInfo && balance.toString() !== accInfo.lastBalance) {
          (accInfo.observer as Observer<BN>).next(new BN(balance.toString()))
          accInfo.lastBalance = balance.toString()
        }
      }
      this.web3.on(owner, onBalanceChange)

      // unsubscribe
      return () => {
        this.observedAccounts[owner].subscriptionsCount -= 1
        if (this.observedAccounts[owner].subscriptionsCount <= 0) {
          if (this.web3) {
            this.web3.removeListener(owner, onBalanceChange)
          }
          delete this.observedAccounts[owner]
        }
      }
    })

    this.observedAccounts[owner].observable = observable
    return observable
  }

  /**
   * return information about the contract
   * @param  address [description]
   * @return      an IContractInfo instance
   */
  public getContractInfo(address: Address) {
    isAddress(address)
    for (const contractInfo of this.contractInfos) {
      if (contractInfo.address.toLowerCase() === address.toLowerCase()) {
        return contractInfo
      }
    }
    if (!this.contractInfos) {
      throw Error(`no contract info was found - did you call "arc.setContractInfos()"?`)
    }
    throw Error(`No contract with address ${address} is known`)
  }

  public getContractInfoByName(name: string, version: string) {
    for (const contractInfo of this.contractInfos) {
      if (contractInfo.name === name && contractInfo.version === version) {
        return contractInfo
      }
    }
    if (!this.contractInfos) {
      throw Error(`no contract info was found - did you call "arc.setContractInfos(...)"?`)
    }
    throw Error(`No contract with name ${name}  and version ${version} is known`)
  }

  public getABI(opts: { address?: Address; abiName?: string; version?: string }): any[] {
    if (Object.values(opts).filter((value) => value !== undefined).length === 0) {
      throw Error('getABI needs at least one parameter passed')
    }

    const { address } = opts
    let { abiName, version } = opts

    if ((address && !abiName) || !version) {
      const contractInfo = this.getContractInfo(address as Address)
      abiName = contractInfo.name
      version = contractInfo.version
      if (abiName === 'GEN') {
        abiName = 'DAOToken'
      }
    }

    let artefact = require(`${ABI_DIR}/${version}/${abiName}.json`)
    if (artefact.rootVersion) {
      artefact = require(`${ABI_DIR}/${artefact.rootVersion}/${abiName}.json`)
    }
    return artefact.abi
  }

  /**
   * return a web3 Contract instance.
   * @param  address address of the contract to look up in self.contractInfos
   * @param  [abiName] (optional) name of the ABI (i.e. 'Avatar' or 'SchemeRegistrar').
   * @param  [version] (optional) Arc version of contract (https://www.npmjs.com/package/@daostack/arc)
   * @return   a web3 contract instance
   */
  public getContract(address: Address, abi?: any[]): Contract {
    if (!abi) {
      abi = this.getABI({ address })
    }
    if (!this.web3) {
      throw new Error('Web3 provider not set')
    }

    if (Signer.isSigner(this.defaultAccount)) {
      return new Contract(address, abi, this.defaultAccount)
    } else {
      return new Contract(address, abi, this.web3.getSigner(this.defaultAccount))
    }
  }

  /**
   * get the GEN Token
   * @return a Token instance
   */
  public GENToken() {
    if (this.contractInfos) {
      for (const contractInfo of this.contractInfos) {
        if (contractInfo.name === 'GEN') {
          return new Token(this, contractInfo.address)
        }
      }
      throw Error(`Cannot find address of GEN Token - did you call setContractInfos?`)
    } else {
      throw Error(`No contract addresses known - did you run arc.setContractInfos()?`)
    }
  }

  public getAccount(): Observable<Address> {
    // this complex logic is to get the correct account both from the Web3 as well as from the Metamaask provider
    // This polls for changes. But polling is Evil!
    // cf. https://github.com/MetaMask/faq/blob/master/DEVELOPERS.md#ear-listening-for-selected-account-changes
    return Observable.create(async (observer: Observer<Address>) => {
      if (Signer.isSigner(this.defaultAccount)) {
        observer.next(await this.defaultAccount.getAddress())
      } else {
        const interval = 1000 /// poll once a second
        let account: Address
        let prevAccount: Address
        const web3 = this.web3

        if (this.defaultAccount) {
          observer.next(this.defaultAccount)
          prevAccount = this.defaultAccount
        }

        const timeout = setInterval(() => {
          if (!web3) {
            throw new Error('Web3 provider not set')
          }

          web3.listAccounts().then((accounts: string[]) => {
            if (this.defaultAccount && typeof this.defaultAccount === 'string') {
              account = this.defaultAccount
            } else if (accounts) {
              account = accounts[0]
            }
            if (prevAccount !== account && account) {
              observer.next(account)
              prevAccount = account
            }
          })
        }, interval)
        return () => clearTimeout(timeout)
      }
    })
  }

  public setAccount(address: Address) {
    if (Signer.isSigner(this.defaultAccount)) {
      throw Error(
        'The account cannot be set post-initialization when a custom Signer is being used'
      )
    }
    this.defaultAccount = address
  }

  public getSigner(): Observable<Signer> {
    return Observable.create((observer: Observer<Signer>) => {
      if (Signer.isSigner(this.defaultAccount)) {
        observer.next(this.defaultAccount)
      } else {
        const subscription = this.getAccount().subscribe((address) => {
          if (!this.web3) {
            throw new Error('Web3 provider not set')
          }
          observer.next(
            this.web3.getSigner(address)
          )
        })

        return () => subscription.unsubscribe()
      }
    })
  }

  public approveForStaking(spender: Address, amount: BN) {
    return this.GENToken().approveForStaking(spender, amount)
  }

  /**
   * How much GEN spender may spend on behalve of the owner
   * @param  owner Address of the owner of the tokens
   * @param  spender Address of the spender
   * @return
   */
  public allowance(owner: Address, spender: Address): Observable<BN> {
    return this.GENToken().allowance(owner, spender)
  }

  /**
   * send an Ethereum transaction
   * @param  transaction  [description]
   * @param  mapToObject  [description]
   * @param  errorHandler [description]
   * @return  An observable of
   */
  public sendTransaction<T = undefined>(
    transaction: ITransaction,
    mapToObject: transactionResultHandler<T> = (receipt: ITransactionReceipt) => undefined,
    errorHandler: transactionErrorHandler = async (err: Error) => {
      throw err
    }
  ): Operation<T> {
    return sendTransaction(this, transaction, mapToObject, errorHandler)
  }

  /**
   * save data of a proposal to IPFS, return  the IPFS hash
   * @param  options an Object to save. This object must have title, url and desction defined
   * @return  a Promise that resolves in the IPFS Hash where the file is saved
   */
  public async saveIPFSData(options: {
    title?: string;
    url?: string;
    description?: string;
    tags?: string[];
  }): Promise<string> {
    let ipfsDataToSave: object = {}
    if (options.title || options.url || options.description || options.tags !== undefined) {
      if (!this.ipfsProvider) {
        throw Error(`No ipfsProvider set on Arc instance - cannot save data on IPFS`)
      }
      ipfsDataToSave = {
        description: options.description,
        tags: options.tags,
        title: options.title,
        url: options.url
      }
    }
    Logger.debug('Saving data on IPFS...')
    if (!this.ipfs) {
      throw Error('IPFS provider not set')
    }
    const descriptionHash = await this.ipfs.addString(JSON.stringify(ipfsDataToSave))
    // pin the file
    await this.ipfs.pinHash(descriptionHash)
    Logger.debug(`Data saved successfully as ${descriptionHash}`)
    return descriptionHash
  }
}

export interface IContractInfo {
  id: string
  version: string
  address: Address
  name: string
}
