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
* [id](competitionvote.md#optional-id)
* [staticState](competitionvote.md#optional-staticstate)

### Methods

* [setStaticState](competitionvote.md#setstaticstate)
* [state](competitionvote.md#state)
* [itemMap](competitionvote.md#static-itemmap)
* [search](competitionvote.md#static-search)

### Object literals

* [fragments](competitionvote.md#static-fragments)

## Constructors

###  constructor

\+ **new CompetitionVote**(`idOrOpts`: string | [ICompetitionVoteState](../interfaces/icompetitionvotestate.md), `context`: [Arc](arc.md)): *[CompetitionVote](competitionvote.md)*

*Defined in [src/schemes/competition.ts:837](https://github.com/daostack/client/blob/b547acc/src/schemes/competition.ts#L837)*

**Parameters:**

Name | Type |
------ | ------ |
`idOrOpts` | string &#124; [ICompetitionVoteState](../interfaces/icompetitionvotestate.md) |
`context` | [Arc](arc.md) |

**Returns:** *[CompetitionVote](competitionvote.md)*

## Properties

###  context

• **context**: *[Arc](arc.md)*

*Defined in [src/schemes/competition.ts:839](https://github.com/daostack/client/blob/b547acc/src/schemes/competition.ts#L839)*

___

### `Optional` id

• **id**? : *undefined | string*

*Defined in [src/schemes/competition.ts:836](https://github.com/daostack/client/blob/b547acc/src/schemes/competition.ts#L836)*

___

### `Optional` staticState

• **staticState**? : *[ICompetitionVoteState](../interfaces/icompetitionvotestate.md)*

*Defined in [src/schemes/competition.ts:837](https://github.com/daostack/client/blob/b547acc/src/schemes/competition.ts#L837)*

## Methods

###  setStaticState

▸ **setStaticState**(`opts`: [ICompetitionVoteState](../interfaces/icompetitionvotestate.md)): *void*

*Defined in [src/schemes/competition.ts:849](https://github.com/daostack/client/blob/b547acc/src/schemes/competition.ts#L849)*

**Parameters:**

Name | Type |
------ | ------ |
`opts` | [ICompetitionVoteState](../interfaces/icompetitionvotestate.md) |

**Returns:** *void*

___

###  state

▸ **state**(`apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[ICompetitionVoteState](../interfaces/icompetitionvotestate.md)›*

*Defined in [src/schemes/competition.ts:853](https://github.com/daostack/client/blob/b547acc/src/schemes/competition.ts#L853)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Observable‹[ICompetitionVoteState](../interfaces/icompetitionvotestate.md)›*

___

### `Static` itemMap

▸ **itemMap**(`item`: any): *object*

*Defined in [src/schemes/competition.ts:824](https://github.com/daostack/client/blob/b547acc/src/schemes/competition.ts#L824)*

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

*Defined in [src/schemes/competition.ts:772](https://github.com/daostack/client/blob/b547acc/src/schemes/competition.ts#L772)*

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

*Defined in [src/schemes/competition.ts:761](https://github.com/daostack/client/blob/b547acc/src/schemes/competition.ts#L761)*

###  CompetitionVoteFields

• **CompetitionVoteFields**: *any* =  gql`fragment CompetitionVoteFields on CompetitionVote {
      id
      createdAt
      reputation
      voter
      proposal { id }
      suggestion { id }
    }`

*Defined in [src/schemes/competition.ts:762](https://github.com/daostack/client/blob/b547acc/src/schemes/competition.ts#L762)*
