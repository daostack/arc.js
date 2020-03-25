[@daostack/client - v0.2.64](../README.md) › [Globals](../globals.md) › [Event](event.md)

# Class: Event

## Hierarchy

* **Event**

## Implements

* [IStateful](../interfaces/istateful.md)‹[IEventState](../interfaces/ieventstate.md)›

## Index

### Constructors

* [constructor](event.md#constructor)

### Properties

* [context](event.md#context)
* [coreState](event.md#corestate)
* [id](event.md#id)
* [idOrOpts](event.md#idoropts)

### Methods

* [fetchState](event.md#fetchstate)
* [setState](event.md#setstate)
* [state](event.md#state)
* [search](event.md#static-search)

### Object literals

* [fragments](event.md#static-fragments)

## Constructors

###  constructor

\+ **new Event**(`context`: [Arc](arc.md), `idOrOpts`: string | [IEventState](../interfaces/ieventstate.md)): *[Event](event.md)*

*Defined in [src/event.ts:86](https://github.com/dorgtech/client/blob/19b4373/src/event.ts#L86)*

**Parameters:**

Name | Type |
------ | ------ |
`context` | [Arc](arc.md) |
`idOrOpts` | string &#124; [IEventState](../interfaces/ieventstate.md) |

**Returns:** *[Event](event.md)*

## Properties

###  context

• **context**: *[Arc](arc.md)*

*Defined in [src/event.ts:88](https://github.com/dorgtech/client/blob/19b4373/src/event.ts#L88)*

___

###  coreState

• **coreState**: *[IEventState](../interfaces/ieventstate.md) | undefined*

*Defined in [src/event.ts:86](https://github.com/dorgtech/client/blob/19b4373/src/event.ts#L86)*

___

###  id

• **id**: *string*

*Defined in [src/event.ts:85](https://github.com/dorgtech/client/blob/19b4373/src/event.ts#L85)*

___

###  idOrOpts

• **idOrOpts**: *string | [IEventState](../interfaces/ieventstate.md)*

*Defined in [src/event.ts:88](https://github.com/dorgtech/client/blob/19b4373/src/event.ts#L88)*

## Methods

###  fetchState

▸ **fetchState**(`apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Promise‹[IEventState](../interfaces/ieventstate.md)›*

*Defined in [src/event.ts:131](https://github.com/dorgtech/client/blob/19b4373/src/event.ts#L131)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Promise‹[IEventState](../interfaces/ieventstate.md)›*

___

###  setState

▸ **setState**(`opts`: [IEventState](../interfaces/ieventstate.md)): *void*

*Defined in [src/event.ts:127](https://github.com/dorgtech/client/blob/19b4373/src/event.ts#L127)*

**Parameters:**

Name | Type |
------ | ------ |
`opts` | [IEventState](../interfaces/ieventstate.md) |

**Returns:** *void*

___

###  state

▸ **state**(`apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[IEventState](../interfaces/ieventstate.md)›*

*Defined in [src/event.ts:98](https://github.com/dorgtech/client/blob/19b4373/src/event.ts#L98)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Observable‹[IEventState](../interfaces/ieventstate.md)›*

___

### `Static` search

▸ **search**(`context`: [Arc](arc.md), `options`: [IEventQueryOptions](../interfaces/ieventqueryoptions.md), `apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[Event](event.md)[]›*

*Defined in [src/event.ts:52](https://github.com/dorgtech/client/blob/19b4373/src/event.ts#L52)*

Event.search(context, options) searches for reward entities

**Parameters:**

Name | Type | Default | Description |
------ | ------ | ------ | ------ |
`context` | [Arc](arc.md) | - | an Arc instance that provides connection information |
`options` | [IEventQueryOptions](../interfaces/ieventqueryoptions.md) |  {} | the query options, cf. IEventQueryOptions |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} | - |

**Returns:** *Observable‹[Event](event.md)[]›*

an observable of Event objects

## Object literals

### `Static` fragments

### ▪ **fragments**: *object*

*Defined in [src/event.ts:30](https://github.com/dorgtech/client/blob/19b4373/src/event.ts#L30)*

###  EventFields

• **EventFields**: *DocumentNode* =  gql`fragment EventFields on Event {
      id
      dao {
        id
      }
      type
      data
      user
      proposal {
        id
      }
      timestamp
    }`

*Defined in [src/event.ts:31](https://github.com/dorgtech/client/blob/19b4373/src/event.ts#L31)*
