[@daostack/arc.js - v2.0.0-experimental.1](../README.md) › [Globals](../globals.md) › [CompetitionVote](competitionvote.md)

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

*Defined in [src/schemes/competition.ts:861](https://github.com/daostack/arc.js/blob/6c661ff/src/schemes/competition.ts#L861)*

**Parameters:**

Name | Type |
------ | ------ |
`context` | [Arc](arc.md) |
`idOrOpts` | string &#124; [ICompetitionVoteState](../interfaces/icompetitionvotestate.md) |

**Returns:** *[CompetitionVote](competitionvote.md)*

## Properties

###  context

• **context**: *[Arc](arc.md)*

*Defined in [src/schemes/competition.ts:863](https://github.com/daostack/arc.js/blob/6c661ff/src/schemes/competition.ts#L863)*

___

### `Optional` coreState

• **coreState**? : *[ICompetitionVoteState](../interfaces/icompetitionvotestate.md)*

*Defined in [src/schemes/competition.ts:861](https://github.com/daostack/arc.js/blob/6c661ff/src/schemes/competition.ts#L861)*

___

### `Optional` id

• **id**? : *undefined | string*

*Defined in [src/schemes/competition.ts:860](https://github.com/daostack/arc.js/blob/6c661ff/src/schemes/competition.ts#L860)*

## Methods

###  fetchState

▸ **fetchState**(`apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Promise‹[ICompetitionVoteState](../interfaces/icompetitionvotestate.md)›*

*Defined in [src/schemes/competition.ts:873](https://github.com/daostack/arc.js/blob/6c661ff/src/schemes/competition.ts#L873)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Promise‹[ICompetitionVoteState](../interfaces/icompetitionvotestate.md)›*

___

###  setState

▸ **setState**(`opts`: [ICompetitionVoteState](../interfaces/icompetitionvotestate.md)): *void*

*Defined in [src/schemes/competition.ts:879](https://github.com/daostack/arc.js/blob/6c661ff/src/schemes/competition.ts#L879)*

**Parameters:**

Name | Type |
------ | ------ |
`opts` | [ICompetitionVoteState](../interfaces/icompetitionvotestate.md) |

**Returns:** *void*

___

###  state

▸ **state**(`apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[ICompetitionVoteState](../interfaces/icompetitionvotestate.md)›*

*Defined in [src/schemes/competition.ts:884](https://github.com/daostack/arc.js/blob/6c661ff/src/schemes/competition.ts#L884)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Observable‹[ICompetitionVoteState](../interfaces/icompetitionvotestate.md)›*

___

### `Static` itemMap

▸ **itemMap**(`item`: any): *object*

*Defined in [src/schemes/competition.ts:848](https://github.com/daostack/arc.js/blob/6c661ff/src/schemes/competition.ts#L848)*

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

*Defined in [src/schemes/competition.ts:795](https://github.com/daostack/arc.js/blob/6c661ff/src/schemes/competition.ts#L795)*

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

*Defined in [src/schemes/competition.ts:784](https://github.com/daostack/arc.js/blob/6c661ff/src/schemes/competition.ts#L784)*

###  CompetitionVoteFields

• **CompetitionVoteFields**: *DocumentNode* =  gql`fragment CompetitionVoteFields on CompetitionVote {
      id
      createdAt
      reputation
      voter
      proposal { id }
      suggestion { id }
    }`

*Defined in [src/schemes/competition.ts:785](https://github.com/daostack/arc.js/blob/6c661ff/src/schemes/competition.ts#L785)*
