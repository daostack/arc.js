[@daostack/arc.js - v2.0.0-experimental.1](../README.md) › [Globals](../globals.md) › [Arc](arc.md)

# Class: Arc

The Arc class holds all configuration.
Any useage of the library typically will start with instantiating a new Arc instance

**`returns`** an instance of Arc

## Hierarchy

* [GraphNodeObserver](graphnodeobserver.md)

  ↳ **Arc**

## Index

### Constructors

* [constructor](arc.md#constructor)

### Properties

* [Logger](arc.md#logger)
* [apolloClient](arc.md#optional-apolloclient)
* [contractInfos](arc.md#contractinfos)
* [defaultAccount](arc.md#defaultaccount)
* [graphqlHttpProvider](arc.md#optional-graphqlhttpprovider)
* [graphqlSubscribeToQueries](arc.md#optional-graphqlsubscribetoqueries)
* [graphqlWsProvider](arc.md#optional-graphqlwsprovider)
* [ipfs](arc.md#ipfs)
* [ipfsProvider](arc.md#ipfsprovider)
* [observedAccounts](arc.md#observedaccounts)
* [pendingOperations](arc.md#pendingoperations)
* [web3](arc.md#web3)
* [web3Provider](arc.md#web3provider)

### Methods

* [GENToken](arc.md#gentoken)
* [allowance](arc.md#allowance)
* [approveForStaking](arc.md#approveforstaking)
* [dao](arc.md#dao)
* [daos](arc.md#daos)
* [ethBalance](arc.md#ethbalance)
* [events](arc.md#events)
* [fetchContractInfos](arc.md#fetchcontractinfos)
* [getABI](arc.md#getabi)
* [getAccount](arc.md#getaccount)
* [getContract](arc.md#getcontract)
* [getContractInfo](arc.md#getcontractinfo)
* [getContractInfoByName](arc.md#getcontractinfobyname)
* [getObservable](arc.md#getobservable)
* [getObservableList](arc.md#getobservablelist)
* [getObservableListWithFilter](arc.md#getobservablelistwithfilter)
* [getObservableObject](arc.md#getobservableobject)
* [getSigner](arc.md#getsigner)
* [proposal](arc.md#proposal)
* [proposals](arc.md#proposals)
* [rewards](arc.md#rewards)
* [saveIPFSData](arc.md#saveipfsdata)
* [scheme](arc.md#scheme)
* [schemes](arc.md#schemes)
* [sendQuery](arc.md#sendquery)
* [sendTransaction](arc.md#sendtransaction)
* [setAccount](arc.md#setaccount)
* [setContractInfos](arc.md#setcontractinfos)
* [stakes](arc.md#stakes)
* [tags](arc.md#tags)

## Constructors

###  constructor

\+ **new Arc**(`options`: object): *[Arc](arc.md)*

*Overrides [GraphNodeObserver](graphnodeobserver.md).[constructor](graphnodeobserver.md#constructor)*

*Defined in [src/arc.ts:61](https://github.com/daostack/arc.js/blob/6c661ff/src/arc.ts#L61)*

**Parameters:**

▪ **options**: *object*

Name | Type | Description |
------ | ------ | ------ |
`contractInfos?` | [IContractInfo](../interfaces/icontractinfo.md)[] | Information about the contracts. Cf. [setContractInfos](arc.md#setcontractinfos) and [fetchContractInfos](arc.md#fetchcontractinfos) |
`graphqlErrHandler?` | any | - |
`graphqlHttpProvider?` | undefined &#124; string | - |
`graphqlPrefetchHook?` | undefined &#124; function | this function will be called before a query is sent to the graphql provider |
`graphqlRetryLink?` | any | an apollo-retry-link instance as https://www.apollographql.com/docs/link/links/retry/#default-configuration |
`graphqlSubscribeToQueries?` | undefined &#124; false &#124; true | determines whether a query should subscribe to updates from the graphProvider. Default is true. |
`graphqlWsProvider?` | undefined &#124; string | - |
`ipfsProvider?` | [IPFSProvider](../globals.md#ipfsprovider) | - |
`web3Provider?` | undefined &#124; string | - |

**Returns:** *[Arc](arc.md)*

## Properties

###  Logger

• **Logger**: *GlobalLogger* =  Logger

*Inherited from [GraphNodeObserver](graphnodeobserver.md).[Logger](graphnodeobserver.md#logger)*

*Defined in [src/graphnode.ts:157](https://github.com/daostack/arc.js/blob/6c661ff/src/graphnode.ts#L157)*

___

### `Optional` apolloClient

• **apolloClient**? : *ApolloClient‹object›*

*Inherited from [GraphNodeObserver](graphnodeobserver.md).[apolloClient](graphnodeobserver.md#optional-apolloclient)*

*Defined in [src/graphnode.ts:158](https://github.com/daostack/arc.js/blob/6c661ff/src/graphnode.ts#L158)*

___

###  contractInfos

• **contractInfos**: *[IContractInfo](../interfaces/icontractinfo.md)[]*

*Defined in [src/arc.ts:51](https://github.com/daostack/arc.js/blob/6c661ff/src/arc.ts#L51)*

a mapping of contrct names to contract addresses

___

###  defaultAccount

• **defaultAccount**: *string | undefined* =  undefined

*Defined in [src/arc.ts:41](https://github.com/daostack/arc.js/blob/6c661ff/src/arc.ts#L41)*

___

### `Optional` graphqlHttpProvider

• **graphqlHttpProvider**? : *undefined | string*

*Inherited from [GraphNodeObserver](graphnodeobserver.md).[graphqlHttpProvider](graphnodeobserver.md#optional-graphqlhttpprovider)*

*Defined in [src/graphnode.ts:155](https://github.com/daostack/arc.js/blob/6c661ff/src/graphnode.ts#L155)*

___

### `Optional` graphqlSubscribeToQueries

• **graphqlSubscribeToQueries**? : *undefined | false | true*

*Inherited from [GraphNodeObserver](graphnodeobserver.md).[graphqlSubscribeToQueries](graphnodeobserver.md#optional-graphqlsubscribetoqueries)*

*Defined in [src/graphnode.ts:159](https://github.com/daostack/arc.js/blob/6c661ff/src/graphnode.ts#L159)*

___

### `Optional` graphqlWsProvider

• **graphqlWsProvider**? : *undefined | string*

*Inherited from [GraphNodeObserver](graphnodeobserver.md).[graphqlWsProvider](graphnodeobserver.md#optional-graphqlwsprovider)*

*Defined in [src/graphnode.ts:156](https://github.com/daostack/arc.js/blob/6c661ff/src/graphnode.ts#L156)*

___

###  ipfs

• **ipfs**: *[IPFSClient](ipfsarc.js.md) | undefined* =  undefined

*Defined in [src/arc.ts:45](https://github.com/daostack/arc.js/blob/6c661ff/src/arc.ts#L45)*

___

###  ipfsProvider

• **ipfsProvider**: *[IPFSProvider](../globals.md#ipfsprovider)*

*Defined in [src/arc.ts:39](https://github.com/daostack/arc.js/blob/6c661ff/src/arc.ts#L39)*

___

###  observedAccounts

• **observedAccounts**: *object*

*Defined in [src/arc.ts:54](https://github.com/daostack/arc.js/blob/6c661ff/src/arc.ts#L54)*

#### Type declaration:

* \[ **address**: *string*\]: object

* **lastBalance**? : *undefined | string*

* **observable**? : *Observable‹BigNumber›*

* **observer**? : *Observer‹BigNumber›*

* **subscriptionsCount**: *number*

___

###  pendingOperations

• **pendingOperations**: *Observable‹Array‹[Operation](../globals.md#operation)‹any›››* =  of()

*Defined in [src/arc.ts:43](https://github.com/daostack/arc.js/blob/6c661ff/src/arc.ts#L43)*

___

###  web3

• **web3**: *JsonRpcProvider | undefined* =  undefined

*Defined in [src/arc.ts:46](https://github.com/daostack/arc.js/blob/6c661ff/src/arc.ts#L46)*

___

###  web3Provider

• **web3Provider**: *[Web3Provider](../globals.md#web3provider)* = ""

*Defined in [src/arc.ts:38](https://github.com/daostack/arc.js/blob/6c661ff/src/arc.ts#L38)*

## Methods

###  GENToken

▸ **GENToken**(): *[Token](token.md)‹›*

*Defined in [src/arc.ts:324](https://github.com/daostack/arc.js/blob/6c661ff/src/arc.ts#L324)*

get the GEN Token

**Returns:** *[Token](token.md)‹›*

a Token instance

___

###  allowance

▸ **allowance**(`owner`: [Address](../globals.md#address), `spender`: [Address](../globals.md#address)): *Observable‹BigNumber›*

*Defined in [src/arc.ts:402](https://github.com/daostack/arc.js/blob/6c661ff/src/arc.ts#L402)*

How much GEN spender may spend on behalve of the owner

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`owner` | [Address](../globals.md#address) | Address of the owner of the tokens |
`spender` | [Address](../globals.md#address) | Address of the spender |

**Returns:** *Observable‹BigNumber›*

___

###  approveForStaking

▸ **approveForStaking**(`spender`: [Address](../globals.md#address), `amount`: BigNumber): *[IOperationObservable](../interfaces/ioperationobservable.md)‹[ITransactionUpdate](../interfaces/itransactionupdate.md)‹undefined››*

*Defined in [src/arc.ts:392](https://github.com/daostack/arc.js/blob/6c661ff/src/arc.ts#L392)*

**Parameters:**

Name | Type |
------ | ------ |
`spender` | [Address](../globals.md#address) |
`amount` | BigNumber |

**Returns:** *[IOperationObservable](../interfaces/ioperationobservable.md)‹[ITransactionUpdate](../interfaces/itransactionupdate.md)‹undefined››*

___

###  dao

▸ **dao**(`address`: [Address](../globals.md#address)): *[DAO](dao.md)*

*Defined in [src/arc.ts:141](https://github.com/daostack/arc.js/blob/6c661ff/src/arc.ts#L141)*

get a DAO instance from an address

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`address` | [Address](../globals.md#address) | address of the dao Avatar |

**Returns:** *[DAO](dao.md)*

an instance of a DAO

___

###  daos

▸ **daos**(`options`: [IDAOQueryOptions](../interfaces/idaoqueryoptions.md), `apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[DAO](dao.md)[]›*

*Defined in [src/arc.ts:151](https://github.com/daostack/arc.js/blob/6c661ff/src/arc.ts#L151)*

return an observable of the list of DAOs

**Parameters:**

Name | Type | Default | Description |
------ | ------ | ------ | ------ |
`options` | [IDAOQueryOptions](../interfaces/idaoqueryoptions.md) |  {} | options to pass on to the query |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} | - |

**Returns:** *Observable‹[DAO](dao.md)[]›*

___

###  ethBalance

▸ **ethBalance**(`owner`: [Address](../globals.md#address)): *Observable‹BigNumber›*

*Defined in [src/arc.ts:202](https://github.com/daostack/arc.js/blob/6c661ff/src/arc.ts#L202)*

**Parameters:**

Name | Type |
------ | ------ |
`owner` | [Address](../globals.md#address) |

**Returns:** *Observable‹BigNumber›*

___

###  events

▸ **events**(`options`: [IEventQueryOptions](../interfaces/ieventqueryoptions.md), `apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[Event](event.md)[]›*

*Defined in [src/arc.ts:181](https://github.com/daostack/arc.js/blob/6c661ff/src/arc.ts#L181)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`options` | [IEventQueryOptions](../interfaces/ieventqueryoptions.md) |  {} |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Observable‹[Event](event.md)[]›*

___

###  fetchContractInfos

▸ **fetchContractInfos**(`apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Promise‹[IContractInfo](../interfaces/icontractinfo.md)[]›*

*Defined in [src/arc.ts:120](https://github.com/daostack/arc.js/blob/6c661ff/src/arc.ts#L120)*

fetch contractInfos from the subgraph

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Promise‹[IContractInfo](../interfaces/icontractinfo.md)[]›*

a list of IContractInfo instances

___

###  getABI

▸ **getABI**(`address?`: [Address](../globals.md#address), `abiName?`: undefined | string, `version?`: undefined | string): *any[]*

*Defined in [src/arc.ts:286](https://github.com/daostack/arc.js/blob/6c661ff/src/arc.ts#L286)*

**Parameters:**

Name | Type |
------ | ------ |
`address?` | [Address](../globals.md#address) |
`abiName?` | undefined &#124; string |
`version?` | undefined &#124; string |

**Returns:** *any[]*

___

###  getAccount

▸ **getAccount**(): *Observable‹[Address](../globals.md#address)›*

*Defined in [src/arc.ts:337](https://github.com/daostack/arc.js/blob/6c661ff/src/arc.ts#L337)*

**Returns:** *Observable‹[Address](../globals.md#address)›*

___

###  getContract

▸ **getContract**(`address`: [Address](../globals.md#address), `abi?`: any[]): *Contract*

*Defined in [src/arc.ts:310](https://github.com/daostack/arc.js/blob/6c661ff/src/arc.ts#L310)*

return a web3 Contract instance.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`address` | [Address](../globals.md#address) | address of the contract to look up in self.contractInfos |
`abi?` | any[] | - |

**Returns:** *Contract*

a web3 contract instance

___

###  getContractInfo

▸ **getContractInfo**(`address`: [Address](../globals.md#address)): *[IContractInfo](../interfaces/icontractinfo.md)*

*Defined in [src/arc.ts:261](https://github.com/daostack/arc.js/blob/6c661ff/src/arc.ts#L261)*

return information about the contract

**Parameters:**

Name | Type |
------ | ------ |
`address` | [Address](../globals.md#address) |

**Returns:** *[IContractInfo](../interfaces/icontractinfo.md)*

an IContractInfo instance

___

###  getContractInfoByName

▸ **getContractInfoByName**(`name`: string, `version`: string): *[IContractInfo](../interfaces/icontractinfo.md)*

*Defined in [src/arc.ts:274](https://github.com/daostack/arc.js/blob/6c661ff/src/arc.ts#L274)*

**Parameters:**

Name | Type |
------ | ------ |
`name` | string |
`version` | string |

**Returns:** *[IContractInfo](../interfaces/icontractinfo.md)*

___

###  getObservable

▸ **getObservable**(`query`: any, `apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *any*

*Inherited from [GraphNodeObserver](graphnodeobserver.md).[getObservable](graphnodeobserver.md#getobservable)*

*Defined in [src/graphnode.ts:189](https://github.com/daostack/arc.js/blob/6c661ff/src/graphnode.ts#L189)*

Given a gql query, will return an observable of query results

**Parameters:**

Name | Type | Default | Description |
------ | ------ | ------ | ------ |
`query` | any | - | a gql query object to execute |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} | options to pass on to Apollo, cf .. |

**Returns:** *any*

an Observable that will first yield the current result, and yields updates every time the data changes

___

###  getObservableList

▸ **getObservableList**(`query`: any, `itemMap`: function, `apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *any*

*Inherited from [GraphNodeObserver](graphnodeobserver.md).[getObservableList](graphnodeobserver.md#getobservablelist)*

*Defined in [src/graphnode.ts:290](https://github.com/daostack/arc.js/blob/6c661ff/src/graphnode.ts#L290)*

Returns an observable that:
- sends a query over http and returns the current list of results
- subscribes over a websocket to changes, and returns the updated list.

**`example:`** 
```
   const query = gql`
   {
     daos {
       id
       address
     }
   }`
   getObservableList(query, (r:any) => new DAO(r.address))
```

**Parameters:**

▪ **query**: *any*

The query to be run

▪`Default value`  **itemMap**: *function*=  (o) => o

(optional) a function that takes elements of the list and creates new objects

▸ (`o`: object): *object | null*

**Parameters:**

Name | Type |
------ | ------ |
`o` | object |

▪`Default value`  **apolloQueryOptions**: *[IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)*=  {}

**Returns:** *any*

an Observable

___

###  getObservableListWithFilter

▸ **getObservableListWithFilter**(`query`: any, `itemMap`: function, `filterFunc`: function, `apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *any*

*Inherited from [GraphNodeObserver](graphnodeobserver.md).[getObservableListWithFilter](graphnodeobserver.md#getobservablelistwithfilter)*

*Defined in [src/graphnode.ts:329](https://github.com/daostack/arc.js/blob/6c661ff/src/graphnode.ts#L329)*

Returns an observable that:
- sends a query over http and returns the current list of results
- subscribes over a websocket to changes, and returns the updated list
example:
   const query = gql`
   {
     daos {
       id
       address
     }
   }`
   getObservableList(query, (r:any) => new DAO(r.address), filter((r:any) => r.address === "0x1234..."))

**Parameters:**

▪ **query**: *any*

The query to be run

▪`Default value`  **itemMap**: *function*=  (o) => o

(optional) a function that takes elements of the list and creates new objects

▸ (`o`: object): *object | null*

**Parameters:**

Name | Type |
------ | ------ |
`o` | object |

▪ **filterFunc**: *function*

▸ (`o`: object): *boolean*

**Parameters:**

Name | Type |
------ | ------ |
`o` | object |

▪`Default value`  **apolloQueryOptions**: *[IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)*=  {}

**Returns:** *any*

___

###  getObservableObject

▸ **getObservableObject**(`query`: any, `itemMap`: function, `apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *any*

*Inherited from [GraphNodeObserver](graphnodeobserver.md).[getObservableObject](graphnodeobserver.md#getobservableobject)*

*Defined in [src/graphnode.ts:346](https://github.com/daostack/arc.js/blob/6c661ff/src/graphnode.ts#L346)*

**Parameters:**

▪ **query**: *any*

▪`Default value`  **itemMap**: *function*=  (o) => o

▸ (`o`: object): *object | null*

**Parameters:**

Name | Type |
------ | ------ |
`o` | object |

▪`Default value`  **apolloQueryOptions**: *[IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)*=  {}

**Returns:** *any*

___

###  getSigner

▸ **getSigner**(): *Observable‹Signer›*

*Defined in [src/arc.ts:377](https://github.com/daostack/arc.js/blob/6c661ff/src/arc.ts#L377)*

**Returns:** *Observable‹Signer›*

___

###  proposal

▸ **proposal**(`id`: string): *[Proposal](proposal.md)*

*Defined in [src/arc.ts:170](https://github.com/daostack/arc.js/blob/6c661ff/src/arc.ts#L170)*

**Parameters:**

Name | Type |
------ | ------ |
`id` | string |

**Returns:** *[Proposal](proposal.md)*

___

###  proposals

▸ **proposals**(`options`: [IProposalQueryOptions](../interfaces/iproposalqueryoptions.md), `apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[Proposal](proposal.md)[]›*

*Defined in [src/arc.ts:174](https://github.com/daostack/arc.js/blob/6c661ff/src/arc.ts#L174)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`options` | [IProposalQueryOptions](../interfaces/iproposalqueryoptions.md) |  {} |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Observable‹[Proposal](proposal.md)[]›*

___

###  rewards

▸ **rewards**(`options`: [IRewardQueryOptions](../interfaces/irewardqueryoptions.md), `apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[Reward](reward.md)[]›*

*Defined in [src/arc.ts:188](https://github.com/daostack/arc.js/blob/6c661ff/src/arc.ts#L188)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`options` | [IRewardQueryOptions](../interfaces/irewardqueryoptions.md) |  {} |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Observable‹[Reward](reward.md)[]›*

___

###  saveIPFSData

▸ **saveIPFSData**(`options`: object): *Promise‹string›*

*Defined in [src/arc.ts:428](https://github.com/daostack/arc.js/blob/6c661ff/src/arc.ts#L428)*

save data of a proposal to IPFS, return  the IPFS hash

**Parameters:**

▪ **options**: *object*

an Object to save. This object must have title, url and desction defined

Name | Type |
------ | ------ |
`description?` | undefined &#124; string |
`tags?` | string[] |
`title?` | undefined &#124; string |
`url?` | undefined &#124; string |

**Returns:** *Promise‹string›*

a Promise that resolves in the IPFS Hash where the file is saved

___

###  scheme

▸ **scheme**(`id`: string): *[Scheme](scheme.md)*

*Defined in [src/arc.ts:159](https://github.com/daostack/arc.js/blob/6c661ff/src/arc.ts#L159)*

**Parameters:**

Name | Type |
------ | ------ |
`id` | string |

**Returns:** *[Scheme](scheme.md)*

___

###  schemes

▸ **schemes**(`options`: ISchemeQueryOptions, `apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[SchemeBase](schemebase.md)[]›*

*Defined in [src/arc.ts:163](https://github.com/daostack/arc.js/blob/6c661ff/src/arc.ts#L163)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`options` | ISchemeQueryOptions |  {} |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Observable‹[SchemeBase](schemebase.md)[]›*

___

###  sendQuery

▸ **sendQuery**(`query`: any, `apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Promise‹object›*

*Inherited from [GraphNodeObserver](graphnodeobserver.md).[sendQuery](graphnodeobserver.md#sendquery)*

*Defined in [src/graphnode.ts:366](https://github.com/daostack/arc.js/blob/6c661ff/src/graphnode.ts#L366)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`query` | any | - |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Promise‹object›*

___

###  sendTransaction

▸ **sendTransaction**<**T**>(`transaction`: [ITransaction](../interfaces/itransaction.md), `mapToObject`: [transactionResultHandler](../globals.md#transactionresulthandler)‹T›, `errorHandler`: [transactionErrorHandler](../globals.md#transactionerrorhandler)): *[Operation](../globals.md#operation)‹T›*

*Defined in [src/arc.ts:413](https://github.com/daostack/arc.js/blob/6c661ff/src/arc.ts#L413)*

send an Ethereum transaction

**Type parameters:**

▪ **T**

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`transaction` | [ITransaction](../interfaces/itransaction.md) | - |
`mapToObject` | [transactionResultHandler](../globals.md#transactionresulthandler)‹T› |  (receipt: ITransactionReceipt) => undefined |
`errorHandler` | [transactionErrorHandler](../globals.md#transactionerrorhandler) |  async (err: Error) => {
      throw err
    } |

**Returns:** *[Operation](../globals.md#operation)‹T›*

An observable of

___

###  setAccount

▸ **setAccount**(`address`: [Address](../globals.md#address)): *void*

*Defined in [src/arc.ts:373](https://github.com/daostack/arc.js/blob/6c661ff/src/arc.ts#L373)*

**Parameters:**

Name | Type |
------ | ------ |
`address` | [Address](../globals.md#address) |

**Returns:** *void*

___

###  setContractInfos

▸ **setContractInfos**(`contractInfos`: [IContractInfo](../interfaces/icontractinfo.md)[]): *Promise‹void›*

*Defined in [src/arc.ts:112](https://github.com/daostack/arc.js/blob/6c661ff/src/arc.ts#L112)*

set the contract addresses

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`contractInfos` | [IContractInfo](../interfaces/icontractinfo.md)[] | a list of IContractInfo objects |

**Returns:** *Promise‹void›*

___

###  stakes

▸ **stakes**(`options`: [IStakeQueryOptions](../interfaces/istakequeryoptions.md), `apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[Stake](stake.md)[]›*

*Defined in [src/arc.ts:195](https://github.com/daostack/arc.js/blob/6c661ff/src/arc.ts#L195)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`options` | [IStakeQueryOptions](../interfaces/istakequeryoptions.md) |  {} |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Observable‹[Stake](stake.md)[]›*

___

###  tags

▸ **tags**(`options`: [ITagQueryOptions](../interfaces/itagqueryoptions.md), `apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[Tag](tag.md)[]›*

*Defined in [src/arc.ts:155](https://github.com/daostack/arc.js/blob/6c661ff/src/arc.ts#L155)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`options` | [ITagQueryOptions](../interfaces/itagqueryoptions.md) |  {} |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Observable‹[Tag](tag.md)[]›*
