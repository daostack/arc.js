[@daostack/client - v2.0.0-experimental.1](../README.md) › [Globals](../globals.md) › [Token](token.md)

# Class: Token

## Hierarchy

* **Token**

## Implements

* [IStateful](../interfaces/istateful.md)‹[ITokenState](../interfaces/itokenstate.md)›

## Index

### Constructors

* [constructor](token.md#constructor)

### Properties

* [address](token.md#address)
* [context](token.md#context)
* [id](token.md#id)

### Methods

* [allowance](token.md#allowance)
* [approveForStaking](token.md#approveforstaking)
* [balanceOf](token.md#balanceof)
* [contract](token.md#contract)
* [fetchState](token.md#fetchstate)
* [mint](token.md#mint)
* [state](token.md#state)
* [transfer](token.md#transfer)
* [search](token.md#static-search)

## Constructors

###  constructor

\+ **new Token**(`context`: [Arc](arc.md), `id`: [Address](../globals.md#address)): *[Token](token.md)*

*Defined in [src/token.ts:88](https://github.com/daostack/client/blob/6c661ff/src/token.ts#L88)*

**Parameters:**

Name | Type |
------ | ------ |
`context` | [Arc](arc.md) |
`id` | [Address](../globals.md#address) |

**Returns:** *[Token](token.md)*

## Properties

###  address

• **address**: *string*

*Defined in [src/token.ts:88](https://github.com/daostack/client/blob/6c661ff/src/token.ts#L88)*

___

###  context

• **context**: *[Arc](arc.md)*

*Defined in [src/token.ts:90](https://github.com/daostack/client/blob/6c661ff/src/token.ts#L90)*

___

###  id

• **id**: *[Address](../globals.md#address)*

*Defined in [src/token.ts:90](https://github.com/daostack/client/blob/6c661ff/src/token.ts#L90)*

## Methods

###  allowance

▸ **allowance**(`owner`: [Address](../globals.md#address), `spender`: [Address](../globals.md#address)): *Observable‹BN›*

*Defined in [src/token.ts:195](https://github.com/daostack/client/blob/6c661ff/src/token.ts#L195)*

**Parameters:**

Name | Type |
------ | ------ |
`owner` | [Address](../globals.md#address) |
`spender` | [Address](../globals.md#address) |

**Returns:** *Observable‹BN›*

___

###  approveForStaking

▸ **approveForStaking**(`spender`: [Address](../globals.md#address), `amount`: BN): *[IOperationObservable](../interfaces/ioperationobservable.md)‹[ITransactionUpdate](../interfaces/itransactionupdate.md)‹undefined››*

*Defined in [src/token.ts:238](https://github.com/daostack/client/blob/6c661ff/src/token.ts#L238)*

**Parameters:**

Name | Type |
------ | ------ |
`spender` | [Address](../globals.md#address) |
`amount` | BN |

**Returns:** *[IOperationObservable](../interfaces/ioperationobservable.md)‹[ITransactionUpdate](../interfaces/itransactionupdate.md)‹undefined››*

___

###  balanceOf

▸ **balanceOf**(`owner`: string): *Observable‹BN›*

*Defined in [src/token.ts:140](https://github.com/daostack/client/blob/6c661ff/src/token.ts#L140)*

**Parameters:**

Name | Type |
------ | ------ |
`owner` | string |

**Returns:** *Observable‹BN›*

___

###  contract

▸ **contract**(): *Contract‹›*

*Defined in [src/token.ts:133](https://github.com/daostack/client/blob/6c661ff/src/token.ts#L133)*

**Returns:** *Contract‹›*

___

###  fetchState

▸ **fetchState**(`apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Promise‹[ITokenState](../interfaces/itokenstate.md)›*

*Defined in [src/token.ts:98](https://github.com/daostack/client/blob/6c661ff/src/token.ts#L98)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Promise‹[ITokenState](../interfaces/itokenstate.md)›*

___

###  mint

▸ **mint**(`beneficiary`: [Address](../globals.md#address), `amount`: BN): *[IOperationObservable](../interfaces/ioperationobservable.md)‹[ITransactionUpdate](../interfaces/itransactionupdate.md)‹undefined››*

*Defined in [src/token.ts:222](https://github.com/daostack/client/blob/6c661ff/src/token.ts#L222)*

**Parameters:**

Name | Type |
------ | ------ |
`beneficiary` | [Address](../globals.md#address) |
`amount` | BN |

**Returns:** *[IOperationObservable](../interfaces/ioperationobservable.md)‹[ITransactionUpdate](../interfaces/itransactionupdate.md)‹undefined››*

___

###  state

▸ **state**(`apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[ITokenState](../interfaces/itokenstate.md)›*

*Defined in [src/token.ts:102](https://github.com/daostack/client/blob/6c661ff/src/token.ts#L102)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Observable‹[ITokenState](../interfaces/itokenstate.md)›*

___

###  transfer

▸ **transfer**(`beneficiary`: [Address](../globals.md#address), `amount`: BN): *[IOperationObservable](../interfaces/ioperationobservable.md)‹[ITransactionUpdate](../interfaces/itransactionupdate.md)‹undefined››*

*Defined in [src/token.ts:230](https://github.com/daostack/client/blob/6c661ff/src/token.ts#L230)*

**Parameters:**

Name | Type |
------ | ------ |
`beneficiary` | [Address](../globals.md#address) |
`amount` | BN |

**Returns:** *[IOperationObservable](../interfaces/ioperationobservable.md)‹[ITransactionUpdate](../interfaces/itransactionupdate.md)‹undefined››*

___

### `Static` search

▸ **search**(`context`: [Arc](arc.md), `options`: [ITokenQueryOptions](../interfaces/itokenqueryoptions.md), `apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[Token](token.md)[]›*

*Defined in [src/token.ts:53](https://github.com/daostack/client/blob/6c661ff/src/token.ts#L53)*

Token.search(context, options) searches for token entities

**Parameters:**

Name | Type | Default | Description |
------ | ------ | ------ | ------ |
`context` | [Arc](arc.md) | - | an Arc instance that provides connection information |
`options` | [ITokenQueryOptions](../interfaces/itokenqueryoptions.md) |  {} | the query options, cf. ITokenQueryOptions |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} | - |

**Returns:** *Observable‹[Token](token.md)[]›*

an observable of Token objects
