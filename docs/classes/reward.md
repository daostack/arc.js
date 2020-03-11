[@daostack/client - v0.2.64](../README.md) › [Globals](../globals.md) › [Reward](reward.md)

# Class: Reward

## Hierarchy

* **Reward**

## Implements

* [IStateful](../interfaces/istateful.md)‹[IRewardState](../interfaces/irewardstate.md)›

## Index

### Constructors

* [constructor](reward.md#constructor)

### Properties

* [context](reward.md#context)
* [coreState](reward.md#corestate)
* [id](reward.md#id)
* [idOrOpts](reward.md#idoropts)

### Methods

* [fetchState](reward.md#fetchstate)
* [setState](reward.md#setstate)
* [state](reward.md#state)
* [search](reward.md#static-search)

### Object literals

* [fragments](reward.md#static-fragments)

## Constructors

###  constructor

\+ **new Reward**(`context`: [Arc](arc.md), `idOrOpts`: string | [IRewardState](../interfaces/irewardstate.md)): *[Reward](reward.md)*

*Defined in [src/reward.ts:156](https://github.com/daostack/client/blob/ca3cbac/src/reward.ts#L156)*

**Parameters:**

Name | Type |
------ | ------ |
`context` | [Arc](arc.md) |
`idOrOpts` | string &#124; [IRewardState](../interfaces/irewardstate.md) |

**Returns:** *[Reward](reward.md)*

## Properties

###  context

• **context**: *[Arc](arc.md)*

*Defined in [src/reward.ts:158](https://github.com/daostack/client/blob/ca3cbac/src/reward.ts#L158)*

___

###  coreState

• **coreState**: *[IRewardState](../interfaces/irewardstate.md) | undefined*

*Defined in [src/reward.ts:156](https://github.com/daostack/client/blob/ca3cbac/src/reward.ts#L156)*

___

###  id

• **id**: *string*

*Defined in [src/reward.ts:155](https://github.com/daostack/client/blob/ca3cbac/src/reward.ts#L155)*

___

###  idOrOpts

• **idOrOpts**: *string | [IRewardState](../interfaces/irewardstate.md)*

*Defined in [src/reward.ts:158](https://github.com/daostack/client/blob/ca3cbac/src/reward.ts#L158)*

## Methods

###  fetchState

▸ **fetchState**(`apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Promise‹[IRewardState](../interfaces/irewardstate.md)›*

*Defined in [src/reward.ts:207](https://github.com/daostack/client/blob/ca3cbac/src/reward.ts#L207)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Promise‹[IRewardState](../interfaces/irewardstate.md)›*

___

###  setState

▸ **setState**(`opts`: [IRewardState](../interfaces/irewardstate.md)): *void*

*Defined in [src/reward.ts:203](https://github.com/daostack/client/blob/ca3cbac/src/reward.ts#L203)*

**Parameters:**

Name | Type |
------ | ------ |
`opts` | [IRewardState](../interfaces/irewardstate.md) |

**Returns:** *void*

___

###  state

▸ **state**(`apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[IRewardState](../interfaces/irewardstate.md)›*

*Defined in [src/reward.ts:168](https://github.com/daostack/client/blob/ca3cbac/src/reward.ts#L168)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Observable‹[IRewardState](../interfaces/irewardstate.md)›*

___

### `Static` search

▸ **search**(`context`: [Arc](arc.md), `options`: [IRewardQueryOptions](../interfaces/irewardqueryoptions.md), `apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[Reward](reward.md)[]›*

*Defined in [src/reward.ts:68](https://github.com/daostack/client/blob/ca3cbac/src/reward.ts#L68)*

Reward.search(context, options) searches for reward entities

**Parameters:**

Name | Type | Default | Description |
------ | ------ | ------ | ------ |
`context` | [Arc](arc.md) | - | an Arc instance that provides connection information |
`options` | [IRewardQueryOptions](../interfaces/irewardqueryoptions.md) |  {} | the query options, cf. IRewardQueryOptions |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} | - |

**Returns:** *Observable‹[Reward](reward.md)[]›*

an observable of Reward objects

## Object literals

### `Static` fragments

### ▪ **fragments**: *object*

*Defined in [src/reward.ts:39](https://github.com/daostack/client/blob/ca3cbac/src/reward.ts#L39)*

###  RewardFields

• **RewardFields**: *DocumentNode* =  gql`fragment RewardFields on GPReward {
      id
      createdAt
      dao {
        id
      }
      beneficiary
      daoBountyForStaker
      proposal {
         id
      }
      reputationForVoter
      reputationForVoterRedeemedAt
      reputationForProposer
      reputationForProposerRedeemedAt
      tokenAddress
      tokensForStaker
      tokensForStakerRedeemedAt
      daoBountyForStakerRedeemedAt
    }`

*Defined in [src/reward.ts:40](https://github.com/daostack/client/blob/ca3cbac/src/reward.ts#L40)*
