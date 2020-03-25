[@daostack/client - v0.2.64](../README.md) › [Globals](../globals.md) › [GraphNodeObserver](graphnodeobserver.md)

# Class: GraphNodeObserver

handles connections with the Graph

**`param`** 

## Hierarchy

* **GraphNodeObserver**

  ↳ [Arc](arc.md)

## Index

### Constructors

* [constructor](graphnodeobserver.md#constructor)

### Properties

* [Logger](graphnodeobserver.md#logger)
* [apolloClient](graphnodeobserver.md#optional-apolloclient)
* [graphqlHttpProvider](graphnodeobserver.md#optional-graphqlhttpprovider)
* [graphqlSubscribeToQueries](graphnodeobserver.md#optional-graphqlsubscribetoqueries)
* [graphqlWsProvider](graphnodeobserver.md#optional-graphqlwsprovider)

### Methods

* [getObservable](graphnodeobserver.md#getobservable)
* [getObservableList](graphnodeobserver.md#getobservablelist)
* [getObservableListWithFilter](graphnodeobserver.md#getobservablelistwithfilter)
* [getObservableObject](graphnodeobserver.md#getobservableobject)
* [sendQuery](graphnodeobserver.md#sendquery)

## Constructors

###  constructor

\+ **new GraphNodeObserver**(`options`: object): *[GraphNodeObserver](graphnodeobserver.md)*

*Defined in [src/graphnode.ts:159](https://github.com/dorgtech/client/blob/74940d1/src/graphnode.ts#L159)*

**Parameters:**

▪ **options**: *object*

Name | Type |
------ | ------ |
`errHandler?` | any |
`graphqlHttpProvider?` | undefined &#124; string |
`graphqlSubscribeToQueries?` | undefined &#124; false &#124; true |
`graphqlWsProvider?` | undefined &#124; string |
`prefetchHook?` | any |
`retryLink?` | any |

**Returns:** *[GraphNodeObserver](graphnodeobserver.md)*

## Properties

###  Logger

• **Logger**: *GlobalLogger* =  Logger

*Defined in [src/graphnode.ts:157](https://github.com/dorgtech/client/blob/74940d1/src/graphnode.ts#L157)*

___

### `Optional` apolloClient

• **apolloClient**? : *ApolloClient‹object›*

*Defined in [src/graphnode.ts:158](https://github.com/dorgtech/client/blob/74940d1/src/graphnode.ts#L158)*

___

### `Optional` graphqlHttpProvider

• **graphqlHttpProvider**? : *undefined | string*

*Defined in [src/graphnode.ts:155](https://github.com/dorgtech/client/blob/74940d1/src/graphnode.ts#L155)*

___

### `Optional` graphqlSubscribeToQueries

• **graphqlSubscribeToQueries**? : *undefined | false | true*

*Defined in [src/graphnode.ts:159](https://github.com/dorgtech/client/blob/74940d1/src/graphnode.ts#L159)*

___

### `Optional` graphqlWsProvider

• **graphqlWsProvider**? : *undefined | string*

*Defined in [src/graphnode.ts:156](https://github.com/dorgtech/client/blob/74940d1/src/graphnode.ts#L156)*

## Methods

###  getObservable

▸ **getObservable**(`query`: any, `apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *any*

*Defined in [src/graphnode.ts:189](https://github.com/dorgtech/client/blob/74940d1/src/graphnode.ts#L189)*

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

*Defined in [src/graphnode.ts:290](https://github.com/dorgtech/client/blob/74940d1/src/graphnode.ts#L290)*

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

*Defined in [src/graphnode.ts:329](https://github.com/dorgtech/client/blob/74940d1/src/graphnode.ts#L329)*

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

*Defined in [src/graphnode.ts:346](https://github.com/dorgtech/client/blob/74940d1/src/graphnode.ts#L346)*

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

###  sendQuery

▸ **sendQuery**(`query`: any, `apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Promise‹object›*

*Defined in [src/graphnode.ts:366](https://github.com/dorgtech/client/blob/74940d1/src/graphnode.ts#L366)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`query` | any | - |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Promise‹object›*
