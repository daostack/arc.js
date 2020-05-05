[@daostack/arc.js - v2.0.0-experimental.1](../README.md) › [Globals](../globals.md) › [Reputation](reputation.md)

# Class: Reputation

## Hierarchy

* **Reputation**

## Implements

* [IStateful](../interfaces/istateful.md)‹[IReputationState](../interfaces/ireputationstate.md)›

## Index

### Constructors

* [constructor](reputation.md#constructor)

### Properties

* [address](reputation.md#address)
* [context](reputation.md#context)
* [id](reputation.md#id)

### Methods

* [contract](reputation.md#contract)
* [fetchState](reputation.md#fetchstate)
* [mint](reputation.md#mint)
* [reputationOf](reputation.md#reputationof)
* [state](reputation.md#state)
* [search](reputation.md#static-search)

## Constructors

###  constructor

\+ **new Reputation**(`context`: [Arc](arc.md), `id`: [Address](../globals.md#address)): *[Reputation](reputation.md)*

*Defined in [src/reputation.ts:67](https://github.com/daostack/arc.js/blob/6c661ff/src/reputation.ts#L67)*

**Parameters:**

Name | Type |
------ | ------ |
`context` | [Arc](arc.md) |
`id` | [Address](../globals.md#address) |

**Returns:** *[Reputation](reputation.md)*

## Properties

###  address

• **address**: *[Address](../globals.md#address)*

*Defined in [src/reputation.ts:67](https://github.com/daostack/arc.js/blob/6c661ff/src/reputation.ts#L67)*

___

###  context

• **context**: *[Arc](arc.md)*

*Defined in [src/reputation.ts:69](https://github.com/daostack/arc.js/blob/6c661ff/src/reputation.ts#L69)*

___

###  id

• **id**: *[Address](../globals.md#address)*

*Defined in [src/reputation.ts:69](https://github.com/daostack/arc.js/blob/6c661ff/src/reputation.ts#L69)*

## Methods

###  contract

▸ **contract**(): *Contract‹›*

*Defined in [src/reputation.ts:126](https://github.com/daostack/arc.js/blob/6c661ff/src/reputation.ts#L126)*

**Returns:** *Contract‹›*

___

###  fetchState

▸ **fetchState**(`apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Promise‹[IReputationState](../interfaces/ireputationstate.md)›*

*Defined in [src/reputation.ts:98](https://github.com/daostack/arc.js/blob/6c661ff/src/reputation.ts#L98)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Promise‹[IReputationState](../interfaces/ireputationstate.md)›*

___

###  mint

▸ **mint**(`beneficiary`: [Address](../globals.md#address), `amount`: BN): *[Operation](../globals.md#operation)‹undefined›*

*Defined in [src/reputation.ts:130](https://github.com/daostack/arc.js/blob/6c661ff/src/reputation.ts#L130)*

**Parameters:**

Name | Type |
------ | ------ |
`beneficiary` | [Address](../globals.md#address) |
`amount` | BN |

**Returns:** *[Operation](../globals.md#operation)‹undefined›*

___

###  reputationOf

▸ **reputationOf**(`address`: [Address](../globals.md#address)): *Observable‹BN›*

*Defined in [src/reputation.ts:102](https://github.com/daostack/arc.js/blob/6c661ff/src/reputation.ts#L102)*

**Parameters:**

Name | Type |
------ | ------ |
`address` | [Address](../globals.md#address) |

**Returns:** *Observable‹BN›*

___

###  state

▸ **state**(`apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[IReputationState](../interfaces/ireputationstate.md)›*

*Defined in [src/reputation.ts:74](https://github.com/daostack/arc.js/blob/6c661ff/src/reputation.ts#L74)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Observable‹[IReputationState](../interfaces/ireputationstate.md)›*

___

### `Static` search

▸ **search**(`context`: [Arc](arc.md), `options`: [IReputationQueryOptions](../interfaces/ireputationqueryoptions.md), `apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[Reputation](reputation.md)[]›*

*Defined in [src/reputation.ts:31](https://github.com/daostack/arc.js/blob/6c661ff/src/reputation.ts#L31)*

Reputation.search(context, options) searches for reputation entities

**Parameters:**

Name | Type | Default | Description |
------ | ------ | ------ | ------ |
`context` | [Arc](arc.md) | - | an Arc instance that provides connection information |
`options` | [IReputationQueryOptions](../interfaces/ireputationqueryoptions.md) |  {} | the query options, cf. IReputationQueryOptions |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} | - |

**Returns:** *Observable‹[Reputation](reputation.md)[]›*

an observable of Reputation objects
