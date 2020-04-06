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

*Defined in [src/schemes/competition.ts:842](https://github.com/daostack/client/blob/9d69996/src/schemes/competition.ts#L842)*

**Parameters:**

Name | Type |
------ | ------ |
`context` | [Arc](arc.md) |
`idOrOpts` | string &#124; [ICompetitionVoteState](../interfaces/icompetitionvotestate.md) |

**Returns:** *[CompetitionVote](competitionvote.md)*

## Properties

###  context

• **context**: *[Arc](arc.md)*

*Defined in [src/schemes/competition.ts:844](https://github.com/daostack/client/blob/9d69996/src/schemes/competition.ts#L844)*

___

### `Optional` coreState

• **coreState**? : *[ICompetitionVoteState](../interfaces/icompetitionvotestate.md)*

*Defined in [src/schemes/competition.ts:842](https://github.com/daostack/client/blob/9d69996/src/schemes/competition.ts#L842)*

___

### `Optional` id

• **id**? : *undefined | string*

*Defined in [src/schemes/competition.ts:841](https://github.com/daostack/client/blob/9d69996/src/schemes/competition.ts#L841)*

## Methods

###  fetchState

▸ **fetchState**(`apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Promise‹[ICompetitionVoteState](../interfaces/icompetitionvotestate.md)›*

*Defined in [src/schemes/competition.ts:854](https://github.com/daostack/client/blob/9d69996/src/schemes/competition.ts#L854)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Promise‹[ICompetitionVoteState](../interfaces/icompetitionvotestate.md)›*

___

###  setState

▸ **setState**(`opts`: [ICompetitionVoteState](../interfaces/icompetitionvotestate.md)): *void*

*Defined in [src/schemes/competition.ts:860](https://github.com/daostack/client/blob/9d69996/src/schemes/competition.ts#L860)*

**Parameters:**

Name | Type |
------ | ------ |
`opts` | [ICompetitionVoteState](../interfaces/icompetitionvotestate.md) |

**Returns:** *void*

___

###  state

▸ **state**(`apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[ICompetitionVoteState](../interfaces/icompetitionvotestate.md)›*

*Defined in [src/schemes/competition.ts:865](https://github.com/daostack/client/blob/9d69996/src/schemes/competition.ts#L865)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Observable‹[ICompetitionVoteState](../interfaces/icompetitionvotestate.md)›*

___

### `Static` itemMap

▸ **itemMap**(`item`: any): *object*

*Defined in [src/schemes/competition.ts:829](https://github.com/daostack/client/blob/9d69996/src/schemes/competition.ts#L829)*

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

*Defined in [src/schemes/competition.ts:776](https://github.com/daostack/client/blob/9d69996/src/schemes/competition.ts#L776)*

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

*Defined in [src/schemes/competition.ts:765](https://github.com/daostack/client/blob/9d69996/src/schemes/competition.ts#L765)*

###  CompetitionVoteFields

• **CompetitionVoteFields**: *DocumentNode* =  gql`fragment CompetitionVoteFields on CompetitionVote {
      id
      createdAt
      reputation
      voter
      proposal { id }
      suggestion { id }
    }`

*Defined in [src/schemes/competition.ts:766](https://github.com/daostack/client/blob/9d69996/src/schemes/competition.ts#L766)*
