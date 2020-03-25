[@daostack/client - v0.2.64](../README.md) › [Globals](../globals.md) › [CompetitionVote](competitionvote.md)

# Class: CompetitionVote

## Hierarchy

* **CompetitionVote**

## Implements

* [IStateful](../interfaces/istateful.md)‹[ICompetitionVoteState](../interfaces/icompetitionvotestate.md)›

## Index

### Constructors

* [constructor](competitionvote.md#constructor)

### Properties

* [context](competitionvote.md#context)
* [coreState](competitionvote.md#optional-corestate)
* [id](competitionvote.md#optional-id)

### Methods

* [fetchState](competitionvote.md#fetchstate)
* [setState](competitionvote.md#setstate)
* [state](competitionvote.md#state)
* [itemMap](competitionvote.md#static-itemmap)
* [search](competitionvote.md#static-search)

### Object literals

* [fragments](competitionvote.md#static-fragments)

## Constructors

###  constructor

\+ **new CompetitionVote**(`context`: [Arc](arc.md), `idOrOpts`: string | [ICompetitionVoteState](../interfaces/icompetitionvotestate.md)): *[CompetitionVote](competitionvote.md)*

*Defined in [src/schemes/competition.ts:849](https://github.com/dorgtech/client/blob/19b4373/src/schemes/competition.ts#L849)*

**Parameters:**

Name | Type |
------ | ------ |
`context` | [Arc](arc.md) |
`idOrOpts` | string &#124; [ICompetitionVoteState](../interfaces/icompetitionvotestate.md) |

**Returns:** *[CompetitionVote](competitionvote.md)*

## Properties

###  context

• **context**: *[Arc](arc.md)*

*Defined in [src/schemes/competition.ts:851](https://github.com/dorgtech/client/blob/19b4373/src/schemes/competition.ts#L851)*

___

### `Optional` coreState

• **coreState**? : *[ICompetitionVoteState](../interfaces/icompetitionvotestate.md)*

*Defined in [src/schemes/competition.ts:849](https://github.com/dorgtech/client/blob/19b4373/src/schemes/competition.ts#L849)*

___

### `Optional` id

• **id**? : *undefined | string*

*Defined in [src/schemes/competition.ts:848](https://github.com/dorgtech/client/blob/19b4373/src/schemes/competition.ts#L848)*

## Methods

###  fetchState

▸ **fetchState**(`apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Promise‹[ICompetitionVoteState](../interfaces/icompetitionvotestate.md)›*

*Defined in [src/schemes/competition.ts:861](https://github.com/dorgtech/client/blob/19b4373/src/schemes/competition.ts#L861)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Promise‹[ICompetitionVoteState](../interfaces/icompetitionvotestate.md)›*

___

###  setState

▸ **setState**(`opts`: [ICompetitionVoteState](../interfaces/icompetitionvotestate.md)): *void*

*Defined in [src/schemes/competition.ts:867](https://github.com/dorgtech/client/blob/19b4373/src/schemes/competition.ts#L867)*

**Parameters:**

Name | Type |
------ | ------ |
`opts` | [ICompetitionVoteState](../interfaces/icompetitionvotestate.md) |

**Returns:** *void*

___

###  state

▸ **state**(`apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[ICompetitionVoteState](../interfaces/icompetitionvotestate.md)›*

*Defined in [src/schemes/competition.ts:872](https://github.com/dorgtech/client/blob/19b4373/src/schemes/competition.ts#L872)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Observable‹[ICompetitionVoteState](../interfaces/icompetitionvotestate.md)›*

___

### `Static` itemMap

▸ **itemMap**(`item`: any): *object*

*Defined in [src/schemes/competition.ts:836](https://github.com/dorgtech/client/blob/19b4373/src/schemes/competition.ts#L836)*

**Parameters:**

Name | Type |
------ | ------ |
`item` | any |

**Returns:** *object*

* **createdAt**: *Date* =  secondSinceEpochToDate(item.createdAt)

* **id**: *any* =  item.id

* **proposal**: *any* =  item.proposal.id

* **reputation**: *any* =  item.reputation

* **suggestion**: *any* =  item.suggestion.id

* **voter**: *any* =  item.voter

___

### `Static` search

▸ **search**(`context`: [Arc](arc.md), `options`: [ICompetitionVoteQueryOptions](../interfaces/icompetitionvotequeryoptions.md), `apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[CompetitionVote](competitionvote.md)[]›*

*Defined in [src/schemes/competition.ts:783](https://github.com/dorgtech/client/blob/19b4373/src/schemes/competition.ts#L783)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`context` | [Arc](arc.md) | - |
`options` | [ICompetitionVoteQueryOptions](../interfaces/icompetitionvotequeryoptions.md) |  {} |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Observable‹[CompetitionVote](competitionvote.md)[]›*

## Object literals

### `Static` fragments

### ▪ **fragments**: *object*

*Defined in [src/schemes/competition.ts:772](https://github.com/dorgtech/client/blob/19b4373/src/schemes/competition.ts#L772)*

###  CompetitionVoteFields

• **CompetitionVoteFields**: *DocumentNode* =  gql`fragment CompetitionVoteFields on CompetitionVote {
      id
      createdAt
      reputation
      voter
      proposal { id }
      suggestion { id }
    }`

*Defined in [src/schemes/competition.ts:773](https://github.com/dorgtech/client/blob/19b4373/src/schemes/competition.ts#L773)*
