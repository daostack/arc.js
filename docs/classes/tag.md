[@daostack/client - v0.2.64](../README.md) › [Globals](../globals.md) › [Tag](tag.md)

# Class: Tag

## Hierarchy

* **Tag**

## Implements

* [IStateful](../interfaces/istateful.md)‹[ITagState](../interfaces/itagstate.md)›

## Index

### Constructors

* [constructor](tag.md#constructor)

### Properties

* [context](tag.md#context)
* [coreState](tag.md#corestate)
* [id](tag.md#id)

### Methods

* [fetchState](tag.md#fetchstate)
* [setState](tag.md#setstate)
* [state](tag.md#state)
* [search](tag.md#static-search)

### Object literals

* [fragments](tag.md#static-fragments)

## Constructors

###  constructor

\+ **new Tag**(`context`: [Arc](arc.md), `idOrOpts`: string | [ITagState](../interfaces/itagstate.md)): *[Tag](tag.md)*

*Defined in [src/tag.ts:110](https://github.com/daostack/client/blob/ca3cbac/src/tag.ts#L110)*

**Parameters:**

Name | Type |
------ | ------ |
`context` | [Arc](arc.md) |
`idOrOpts` | string &#124; [ITagState](../interfaces/itagstate.md) |

**Returns:** *[Tag](tag.md)*

## Properties

###  context

• **context**: *[Arc](arc.md)*

*Defined in [src/tag.ts:113](https://github.com/daostack/client/blob/ca3cbac/src/tag.ts#L113)*

___

###  coreState

• **coreState**: *[ITagState](../interfaces/itagstate.md) | undefined*

*Defined in [src/tag.ts:110](https://github.com/daostack/client/blob/ca3cbac/src/tag.ts#L110)*

___

###  id

• **id**: *string | undefined*

*Defined in [src/tag.ts:109](https://github.com/daostack/client/blob/ca3cbac/src/tag.ts#L109)*

## Methods

###  fetchState

▸ **fetchState**(`apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Promise‹[ITagState](../interfaces/itagstate.md)›*

*Defined in [src/tag.ts:154](https://github.com/daostack/client/blob/ca3cbac/src/tag.ts#L154)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Promise‹[ITagState](../interfaces/itagstate.md)›*

___

###  setState

▸ **setState**(`opts`: [ITagState](../interfaces/itagstate.md)): *void*

*Defined in [src/tag.ts:150](https://github.com/daostack/client/blob/ca3cbac/src/tag.ts#L150)*

**Parameters:**

Name | Type |
------ | ------ |
`opts` | [ITagState](../interfaces/itagstate.md) |

**Returns:** *void*

___

###  state

▸ **state**(`apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[ITagState](../interfaces/itagstate.md)›*

*Defined in [src/tag.ts:124](https://github.com/daostack/client/blob/ca3cbac/src/tag.ts#L124)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Observable‹[ITagState](../interfaces/itagstate.md)›*

___

### `Static` search

▸ **search**(`context`: [Arc](arc.md), `options`: [ITagQueryOptions](../interfaces/itagqueryoptions.md), `apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[Tag](tag.md)[]›*

*Defined in [src/tag.ts:37](https://github.com/daostack/client/blob/ca3cbac/src/tag.ts#L37)*

Tag.search(context, options) searches for stake entities

**Parameters:**

Name | Type | Default | Description |
------ | ------ | ------ | ------ |
`context` | [Arc](arc.md) | - | an Arc instance that provides connection information |
`options` | [ITagQueryOptions](../interfaces/itagqueryoptions.md) |  {} | the query options, cf. ITagQueryOptions |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} | - |

**Returns:** *Observable‹[Tag](tag.md)[]›*

an observable of Tag objects

## Object literals

### `Static` fragments

### ▪ **fragments**: *object*

*Defined in [src/tag.ts:23](https://github.com/daostack/client/blob/ca3cbac/src/tag.ts#L23)*

###  TagFields

• **TagFields**: *DocumentNode* =  gql`fragment TagFields on Tag {
      id
      numberOfProposals
      proposals { id }
    }`

*Defined in [src/tag.ts:24](https://github.com/daostack/client/blob/ca3cbac/src/tag.ts#L24)*
