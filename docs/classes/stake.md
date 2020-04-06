[@daostack/client - v0.2.64](../README.md) › [Globals](../globals.md) › [Stake](stake.md)

# Class: Stake

## Hierarchy

* **Stake**

## Implements

* [IStateful](../interfaces/istateful.md)‹[IStakeState](../interfaces/istakestate.md)›

## Index

### Constructors

* [constructor](stake.md#constructor)

### Properties

* [context](stake.md#context)
* [coreState](stake.md#corestate)
* [id](stake.md#id)

### Methods

* [fetchState](stake.md#fetchstate)
* [setState](stake.md#setstate)
* [state](stake.md#state)
* [search](stake.md#static-search)

### Object literals

* [fragments](stake.md#static-fragments)

## Constructors

###  constructor

\+ **new Stake**(`context`: [Arc](arc.md), `idOrOpts`: string | [IStakeState](../interfaces/istakestate.md)): *[Stake](stake.md)*

*Defined in [src/stake.ts:145](https://github.com/daostack/client/blob/9d69996/src/stake.ts#L145)*

**Parameters:**

Name | Type |
------ | ------ |
`context` | [Arc](arc.md) |
`idOrOpts` | string &#124; [IStakeState](../interfaces/istakestate.md) |

**Returns:** *[Stake](stake.md)*

## Properties

###  context

• **context**: *[Arc](arc.md)*

*Defined in [src/stake.ts:148](https://github.com/daostack/client/blob/9d69996/src/stake.ts#L148)*

___

###  coreState

• **coreState**: *[IStakeState](../interfaces/istakestate.md) | undefined*

*Defined in [src/stake.ts:145](https://github.com/daostack/client/blob/9d69996/src/stake.ts#L145)*

___

###  id

• **id**: *string | undefined*

*Defined in [src/stake.ts:144](https://github.com/daostack/client/blob/9d69996/src/stake.ts#L144)*

## Methods

###  fetchState

▸ **fetchState**(`apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Promise‹[IStakeState](../interfaces/istakestate.md)›*

*Defined in [src/stake.ts:207](https://github.com/daostack/client/blob/9d69996/src/stake.ts#L207)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Promise‹[IStakeState](../interfaces/istakestate.md)›*

___

###  setState

▸ **setState**(`opts`: [IStakeState](../interfaces/istakestate.md)): *void*

*Defined in [src/stake.ts:203](https://github.com/daostack/client/blob/9d69996/src/stake.ts#L203)*

**Parameters:**

Name | Type |
------ | ------ |
`opts` | [IStakeState](../interfaces/istakestate.md) |

**Returns:** *void*

___

###  state

▸ **state**(`apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[IStakeState](../interfaces/istakestate.md)›*

*Defined in [src/stake.ts:159](https://github.com/daostack/client/blob/9d69996/src/stake.ts#L159)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Observable‹[IStakeState](../interfaces/istakestate.md)›*

___

### `Static` search

▸ **search**(`context`: [Arc](arc.md), `options`: [IStakeQueryOptions](../interfaces/istakequeryoptions.md), `apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[Stake](stake.md)[]›*

*Defined in [src/stake.ts:53](https://github.com/daostack/client/blob/9d69996/src/stake.ts#L53)*

Stake.search(context, options) searches for stake entities

**Parameters:**

Name | Type | Default | Description |
------ | ------ | ------ | ------ |
`context` | [Arc](arc.md) | - | an Arc instance that provides connection information |
`options` | [IStakeQueryOptions](../interfaces/istakequeryoptions.md) |  {} | the query options, cf. IStakeQueryOptions |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} | - |

**Returns:** *Observable‹[Stake](stake.md)[]›*

an observable of Stake objects

## Object literals

### `Static` fragments

### ▪ **fragments**: *object*

*Defined in [src/stake.ts:31](https://github.com/daostack/client/blob/9d69996/src/stake.ts#L31)*

###  StakeFields

• **StakeFields**: *DocumentNode* =  gql`fragment StakeFields on ProposalStake {
      id
      createdAt
      dao {
        id
      }
      staker
      proposal {
        id
      }
      outcome
      amount
    }`

*Defined in [src/stake.ts:32](https://github.com/daostack/client/blob/9d69996/src/stake.ts#L32)*
