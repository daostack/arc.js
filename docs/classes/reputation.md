[@daostack/client - v0.2.64](../README.md) › [Globals](../globals.md) › [Reputation](reputation.md)

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
* [mint](reputation.md#mint)
* [reputationOf](reputation.md#reputationof)
* [state](reputation.md#state)
* [search](reputation.md#static-search)

## Constructors

###  constructor

\+ **new Reputation**(`id`: [Address](../globals.md#address), `context`: [Arc](arc.md)): *[Reputation](reputation.md)*

*Defined in [src/reputation.ts:68](https://github.com/dorgtech/client/blob/74940d1/src/reputation.ts#L68)*

**Parameters:**

Name | Type |
------ | ------ |
`id` | [Address](../globals.md#address) |
`context` | [Arc](arc.md) |

**Returns:** *[Reputation](reputation.md)*

## Properties

###  address

• **address**: *[Address](../globals.md#address)*

*Defined in [src/reputation.ts:68](https://github.com/dorgtech/client/blob/74940d1/src/reputation.ts#L68)*

___

###  context

• **context**: *[Arc](arc.md)*

*Defined in [src/reputation.ts:69](https://github.com/dorgtech/client/blob/74940d1/src/reputation.ts#L69)*

___

###  id

• **id**: *[Address](../globals.md#address)*

*Defined in [src/reputation.ts:69](https://github.com/dorgtech/client/blob/74940d1/src/reputation.ts#L69)*

## Methods

###  contract

▸ **contract**(): *Contract‹›*

*Defined in [src/reputation.ts:121](https://github.com/dorgtech/client/blob/74940d1/src/reputation.ts#L121)*

**Returns:** *Contract‹›*

___

###  mint

▸ **mint**(`beneficiary`: [Address](../globals.md#address), `amount`: BN): *[Operation](../globals.md#operation)‹undefined›*

*Defined in [src/reputation.ts:126](https://github.com/dorgtech/client/blob/74940d1/src/reputation.ts#L126)*

**Parameters:**

Name | Type |
------ | ------ |
`beneficiary` | [Address](../globals.md#address) |
`amount` | BN |

**Returns:** *[Operation](../globals.md#operation)‹undefined›*

___

###  reputationOf

▸ **reputationOf**(`address`: [Address](../globals.md#address)): *Observable‹BN›*

*Defined in [src/reputation.ts:97](https://github.com/dorgtech/client/blob/74940d1/src/reputation.ts#L97)*

**Parameters:**

Name | Type |
------ | ------ |
`address` | [Address](../globals.md#address) |

**Returns:** *Observable‹BN›*

___

###  state

▸ **state**(`apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[IReputationState](../interfaces/ireputationstate.md)›*

*Defined in [src/reputation.ts:73](https://github.com/dorgtech/client/blob/74940d1/src/reputation.ts#L73)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Observable‹[IReputationState](../interfaces/ireputationstate.md)›*

___

### `Static` search

▸ **search**(`context`: [Arc](arc.md), `options`: [IReputationQueryOptions](../interfaces/ireputationqueryoptions.md), `apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[Reputation](reputation.md)[]›*

*Defined in [src/reputation.ts:32](https://github.com/dorgtech/client/blob/74940d1/src/reputation.ts#L32)*

Reputation.search(context, options) searches for reputation entities

**Parameters:**

Name | Type | Default | Description |
------ | ------ | ------ | ------ |
`context` | [Arc](arc.md) | - | an Arc instance that provides connection information |
`options` | [IReputationQueryOptions](../interfaces/ireputationqueryoptions.md) |  {} | the query options, cf. IReputationQueryOptions |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} | - |

**Returns:** *Observable‹[Reputation](reputation.md)[]›*

an observable of Reputation objects
