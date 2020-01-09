[@daostack/client](../README.md) › [Globals](../globals.md) › [CompetitionSuggestion](competitionsuggestion.md)

# Class: CompetitionSuggestion

## Hierarchy

* **CompetitionSuggestion**

## Index

### Constructors

* [constructor](competitionsuggestion.md#constructor)

### Properties

* [context](competitionsuggestion.md#context)
* [id](competitionsuggestion.md#id)
* [staticState](competitionsuggestion.md#optional-staticstate)
* [suggestionId](competitionsuggestion.md#optional-suggestionid)

### Methods

* [fetchStaticState](competitionsuggestion.md#fetchstaticstate)
* [getPosition](competitionsuggestion.md#getposition)
* [isWinner](competitionsuggestion.md#iswinner)
* [redeem](competitionsuggestion.md#redeem)
* [setStaticState](competitionsuggestion.md#setstaticstate)
* [state](competitionsuggestion.md#state)
* [vote](competitionsuggestion.md#vote)
* [votes](competitionsuggestion.md#votes)
* [calculateId](competitionsuggestion.md#static-calculateid)
* [mapItemToObject](competitionsuggestion.md#static-private-mapitemtoobject)
* [search](competitionsuggestion.md#static-search)

### Object literals

* [fragments](competitionsuggestion.md#static-fragments)

## Constructors

###  constructor

\+ **new CompetitionSuggestion**(`idOrOpts`: string | object | [ICompetitionSuggestion](../interfaces/icompetitionsuggestion.md), `context`: [Arc](arc.md)): *[CompetitionSuggestion](competitionsuggestion.md)*

*Defined in [schemes/competition.ts:590](https://github.com/daostack/client/blob/84a7af3/src/schemes/competition.ts#L590)*

**Parameters:**

Name | Type |
------ | ------ |
`idOrOpts` | string &#124; object &#124; [ICompetitionSuggestion](../interfaces/icompetitionsuggestion.md) |
`context` | [Arc](arc.md) |

**Returns:** *[CompetitionSuggestion](competitionsuggestion.md)*

## Properties

###  context

• **context**: *[Arc](arc.md)*

*Defined in [schemes/competition.ts:592](https://github.com/daostack/client/blob/84a7af3/src/schemes/competition.ts#L592)*

___

###  id

• **id**: *string*

*Defined in [schemes/competition.ts:588](https://github.com/daostack/client/blob/84a7af3/src/schemes/competition.ts#L588)*

___

### `Optional` staticState

• **staticState**? : *[ICompetitionSuggestion](../interfaces/icompetitionsuggestion.md)*

*Defined in [schemes/competition.ts:590](https://github.com/daostack/client/blob/84a7af3/src/schemes/competition.ts#L590)*

___

### `Optional` suggestionId

• **suggestionId**? : *undefined | number*

*Defined in [schemes/competition.ts:589](https://github.com/daostack/client/blob/84a7af3/src/schemes/competition.ts#L589)*

## Methods

###  fetchStaticState

▸ **fetchStaticState**(): *Promise‹[ICompetitionSuggestion](../interfaces/icompetitionsuggestion.md)›*

*Defined in [schemes/competition.ts:614](https://github.com/daostack/client/blob/84a7af3/src/schemes/competition.ts#L614)*

**Returns:** *Promise‹[ICompetitionSuggestion](../interfaces/icompetitionsuggestion.md)›*

___

###  getPosition

▸ **getPosition**(): *Promise‹number›*

*Defined in [schemes/competition.ts:652](https://github.com/daostack/client/blob/84a7af3/src/schemes/competition.ts#L652)*

**Returns:** *Promise‹number›*

___

###  isWinner

▸ **isWinner**(): *Promise‹boolean›*

*Defined in [schemes/competition.ts:663](https://github.com/daostack/client/blob/84a7af3/src/schemes/competition.ts#L663)*

**Returns:** *Promise‹boolean›*

___

###  redeem

▸ **redeem**(`beneficiary`: [Address](../globals.md#address)): *[Operation](../globals.md#operation)‹boolean›*

*Defined in [schemes/competition.ts:673](https://github.com/daostack/client/blob/84a7af3/src/schemes/competition.ts#L673)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`beneficiary` | [Address](../globals.md#address) |  NULL_ADDRESS |

**Returns:** *[Operation](../globals.md#operation)‹boolean›*

___

###  setStaticState

▸ **setStaticState**(`opts`: [ICompetitionSuggestion](../interfaces/icompetitionsuggestion.md)): *void*

*Defined in [schemes/competition.ts:610](https://github.com/daostack/client/blob/84a7af3/src/schemes/competition.ts#L610)*

**Parameters:**

Name | Type |
------ | ------ |
`opts` | [ICompetitionSuggestion](../interfaces/icompetitionsuggestion.md) |

**Returns:** *void*

___

###  state

▸ **state**(`apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[ICompetitionSuggestion](../interfaces/icompetitionsuggestion.md)›*

*Defined in [schemes/competition.ts:618](https://github.com/daostack/client/blob/84a7af3/src/schemes/competition.ts#L618)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Observable‹[ICompetitionSuggestion](../interfaces/icompetitionsuggestion.md)›*

___

###  vote

▸ **vote**(): *[Operation](../globals.md#operation)‹[CompetitionVote](competitionvote.md)›*

*Defined in [schemes/competition.ts:632](https://github.com/daostack/client/blob/84a7af3/src/schemes/competition.ts#L632)*

**Returns:** *[Operation](../globals.md#operation)‹[CompetitionVote](competitionvote.md)›*

___

###  votes

▸ **votes**(`options`: [ICompetitionVoteQueryOptions](../interfaces/icompetitionvotequeryoptions.md), `apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[CompetitionVote](competitionvote.md)[]›*

*Defined in [schemes/competition.ts:643](https://github.com/daostack/client/blob/84a7af3/src/schemes/competition.ts#L643)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`options` | [ICompetitionVoteQueryOptions](../interfaces/icompetitionvotequeryoptions.md) |  {} |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Observable‹[CompetitionVote](competitionvote.md)[]›*

___

### `Static` calculateId

▸ **calculateId**(`opts`: object): *string*

*Defined in [schemes/competition.ts:521](https://github.com/daostack/client/blob/84a7af3/src/schemes/competition.ts#L521)*

**Parameters:**

▪ **opts**: *object*

Name | Type |
------ | ------ |
`scheme` | [Address](../globals.md#address) |
`suggestionId` | number |

**Returns:** *string*

___

### `Static` `Private` mapItemToObject

▸ **mapItemToObject**(`item`: any, `context`: [Arc](arc.md)): *[ICompetitionSuggestion](../interfaces/icompetitionsuggestion.md) | null*

*Defined in [schemes/competition.ts:562](https://github.com/daostack/client/blob/84a7af3/src/schemes/competition.ts#L562)*

**Parameters:**

Name | Type |
------ | ------ |
`item` | any |
`context` | [Arc](arc.md) |

**Returns:** *[ICompetitionSuggestion](../interfaces/icompetitionsuggestion.md) | null*

___

### `Static` search

▸ **search**(`context`: [Arc](arc.md), `options`: [ICompetitionSuggestionQueryOptions](../interfaces/icompetitionsuggestionqueryoptions.md), `apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[CompetitionSuggestion](competitionsuggestion.md)[]›*

*Defined in [schemes/competition.ts:529](https://github.com/daostack/client/blob/84a7af3/src/schemes/competition.ts#L529)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`context` | [Arc](arc.md) | - |
`options` | [ICompetitionSuggestionQueryOptions](../interfaces/icompetitionsuggestionqueryoptions.md) |  {} |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Observable‹[CompetitionSuggestion](competitionsuggestion.md)[]›*

## Object literals

### `Static` fragments

### ▪ **fragments**: *object*

*Defined in [schemes/competition.ts:500](https://github.com/daostack/client/blob/84a7af3/src/schemes/competition.ts#L500)*

###  CompetitionSuggestionFields

• **CompetitionSuggestionFields**: *any* =  gql`fragment CompetitionSuggestionFields on CompetitionSuggestion {
      id
      suggestionId
      proposal {
        id
      }
      descriptionHash
      title
      description
      url
      # fulltext: [string]
      suggester
      # votes: [CompetitionVote!] @derivedFrom(field: "suggestion")
      totalVotes
      createdAt
      redeemedAt
      rewardPercentage
    }`

*Defined in [schemes/competition.ts:501](https://github.com/daostack/client/blob/84a7af3/src/schemes/competition.ts#L501)*
