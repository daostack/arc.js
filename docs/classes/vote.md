[@daostack/client - v2.0.0-experimental.1](../README.md) › [Globals](../globals.md) › [Vote](vote.md)

# Class: Vote

## Hierarchy

* **Vote**

## Implements

* [IStateful](../interfaces/istateful.md)‹[IVoteState](../interfaces/ivotestate.md)›

## Index

### Constructors

* [constructor](vote.md#constructor)

### Properties

* [context](vote.md#context)
* [coreState](vote.md#corestate)
* [id](vote.md#id)

### Methods

* [fetchState](vote.md#fetchstate)
* [setState](vote.md#setstate)
* [state](vote.md#state)
* [search](vote.md#static-search)

### Object literals

* [fragments](vote.md#static-fragments)

## Constructors

###  constructor

\+ **new Vote**(`context`: [Arc](arc.md), `idOrOpts`: string | [IVoteState](../interfaces/ivotestate.md)): *[Vote](vote.md)*

*Defined in [src/vote.ts:153](https://github.com/daostack/client/blob/6c661ff/src/vote.ts#L153)*

**Parameters:**

Name | Type |
------ | ------ |
`context` | [Arc](arc.md) |
`idOrOpts` | string &#124; [IVoteState](../interfaces/ivotestate.md) |

**Returns:** *[Vote](vote.md)*

## Properties

###  context

• **context**: *[Arc](arc.md)*

*Defined in [src/vote.ts:155](https://github.com/daostack/client/blob/6c661ff/src/vote.ts#L155)*

___

###  coreState

• **coreState**: *[IVoteState](../interfaces/ivotestate.md) | undefined*

*Defined in [src/vote.ts:153](https://github.com/daostack/client/blob/6c661ff/src/vote.ts#L153)*

___

###  id

• **id**: *string | undefined*

*Defined in [src/vote.ts:152](https://github.com/daostack/client/blob/6c661ff/src/vote.ts#L152)*

## Methods

###  fetchState

▸ **fetchState**(`apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Promise‹[IVoteState](../interfaces/ivotestate.md)›*

*Defined in [src/vote.ts:206](https://github.com/daostack/client/blob/6c661ff/src/vote.ts#L206)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Promise‹[IVoteState](../interfaces/ivotestate.md)›*

___

###  setState

▸ **setState**(`opts`: [IVoteState](../interfaces/ivotestate.md)): *void*

*Defined in [src/vote.ts:202](https://github.com/daostack/client/blob/6c661ff/src/vote.ts#L202)*

**Parameters:**

Name | Type |
------ | ------ |
`opts` | [IVoteState](../interfaces/ivotestate.md) |

**Returns:** *void*

___

###  state

▸ **state**(`apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[IVoteState](../interfaces/ivotestate.md)›*

*Defined in [src/vote.ts:165](https://github.com/daostack/client/blob/6c661ff/src/vote.ts#L165)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Observable‹[IVoteState](../interfaces/ivotestate.md)›*

___

### `Static` search

▸ **search**(`context`: [Arc](arc.md), `options`: [IVoteQueryOptions](../interfaces/ivotequeryoptions.md), `apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[Vote](vote.md)[]›*

*Defined in [src/vote.ts:54](https://github.com/daostack/client/blob/6c661ff/src/vote.ts#L54)*

Vote.search(context, options) searches for vote entities

**Parameters:**

Name | Type | Default | Description |
------ | ------ | ------ | ------ |
`context` | [Arc](arc.md) | - | an Arc instance that provides connection information |
`options` | [IVoteQueryOptions](../interfaces/ivotequeryoptions.md) |  {} | the query options, cf. IVoteQueryOptions |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} | - |

**Returns:** *Observable‹[Vote](vote.md)[]›*

an observable of Vote objects

## Object literals

### `Static` fragments

### ▪ **fragments**: *object*

*Defined in [src/vote.ts:32](https://github.com/daostack/client/blob/6c661ff/src/vote.ts#L32)*

###  VoteFields

• **VoteFields**: *DocumentNode* =  gql`fragment VoteFields on ProposalVote {
      id
      createdAt
      dao {
        id
      }
      voter
      proposal {
        id
      }
      outcome
      reputation
    }`

*Defined in [src/vote.ts:33](https://github.com/daostack/client/blob/6c661ff/src/vote.ts#L33)*
