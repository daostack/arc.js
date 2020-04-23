[@daostack/client - v2.0.0-experimental.1](../README.md) › [Globals](../globals.md) › [CompetitionSuggestion](competitionsuggestion.md)

# Class: CompetitionSuggestion

## Hierarchy

* **CompetitionSuggestion**

## Implements

* [IStateful](../interfaces/istateful.md)‹[ICompetitionSuggestionState](../interfaces/icompetitionsuggestionstate.md)›

## Index

### Constructors

* [constructor](competitionsuggestion.md#constructor)

### Properties

* [context](competitionsuggestion.md#context)
* [coreState](competitionsuggestion.md#optional-corestate)
* [id](competitionsuggestion.md#id)
* [suggestionId](competitionsuggestion.md#optional-suggestionid)

### Methods

* [fetchState](competitionsuggestion.md#fetchstate)
* [getPosition](competitionsuggestion.md#getposition)
* [isWinner](competitionsuggestion.md#iswinner)
* [redeem](competitionsuggestion.md#redeem)
* [setState](competitionsuggestion.md#setstate)
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

\+ **new CompetitionSuggestion**(`context`: [Arc](arc.md), `idOrOpts`: string | object | [ICompetitionSuggestionState](../interfaces/icompetitionsuggestionstate.md)): *[CompetitionSuggestion](competitionsuggestion.md)*

*Defined in [src/schemes/competition.ts:681](https://github.com/daostack/client/blob/6c661ff/src/schemes/competition.ts#L681)*

**Parameters:**

Name | Type |
------ | ------ |
`context` | [Arc](arc.md) |
`idOrOpts` | string &#124; object &#124; [ICompetitionSuggestionState](../interfaces/icompetitionsuggestionstate.md) |

**Returns:** *[CompetitionSuggestion](competitionsuggestion.md)*

## Properties

###  context

• **context**: *[Arc](arc.md)*

*Defined in [src/schemes/competition.ts:684](https://github.com/daostack/client/blob/6c661ff/src/schemes/competition.ts#L684)*

___

### `Optional` coreState

• **coreState**? : *[ICompetitionSuggestionState](../interfaces/icompetitionsuggestionstate.md)*

*Defined in [src/schemes/competition.ts:681](https://github.com/daostack/client/blob/6c661ff/src/schemes/competition.ts#L681)*

___

###  id

• **id**: *string*

*Defined in [src/schemes/competition.ts:679](https://github.com/daostack/client/blob/6c661ff/src/schemes/competition.ts#L679)*

___

### `Optional` suggestionId

• **suggestionId**? : *undefined | number*

*Defined in [src/schemes/competition.ts:680](https://github.com/daostack/client/blob/6c661ff/src/schemes/competition.ts#L680)*

## Methods

###  fetchState

▸ **fetchState**(`apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Promise‹[ICompetitionSuggestionState](../interfaces/icompetitionsuggestionstate.md)›*

*Defined in [src/schemes/competition.ts:708](https://github.com/daostack/client/blob/6c661ff/src/schemes/competition.ts#L708)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Promise‹[ICompetitionSuggestionState](../interfaces/icompetitionsuggestionstate.md)›*

___

###  getPosition

▸ **getPosition**(): *Promise‹null | number›*

*Defined in [src/schemes/competition.ts:748](https://github.com/daostack/client/blob/6c661ff/src/schemes/competition.ts#L748)*

**Returns:** *Promise‹null | number›*

___

###  isWinner

▸ **isWinner**(): *Promise‹boolean›*

*Defined in [src/schemes/competition.ts:754](https://github.com/daostack/client/blob/6c661ff/src/schemes/competition.ts#L754)*

**Returns:** *Promise‹boolean›*

___

###  redeem

▸ **redeem**(): *[Operation](../globals.md#operation)‹boolean›*

*Defined in [src/schemes/competition.ts:760](https://github.com/daostack/client/blob/6c661ff/src/schemes/competition.ts#L760)*

**Returns:** *[Operation](../globals.md#operation)‹boolean›*

___

###  setState

▸ **setState**(`opts`: [ICompetitionSuggestionState](../interfaces/icompetitionsuggestionstate.md)): *void*

*Defined in [src/schemes/competition.ts:704](https://github.com/daostack/client/blob/6c661ff/src/schemes/competition.ts#L704)*

**Parameters:**

Name | Type |
------ | ------ |
`opts` | [ICompetitionSuggestionState](../interfaces/icompetitionsuggestionstate.md) |

**Returns:** *void*

___

###  state

▸ **state**(`apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[ICompetitionSuggestionState](../interfaces/icompetitionsuggestionstate.md)›*

*Defined in [src/schemes/competition.ts:714](https://github.com/daostack/client/blob/6c661ff/src/schemes/competition.ts#L714)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Observable‹[ICompetitionSuggestionState](../interfaces/icompetitionsuggestionstate.md)›*

___

###  vote

▸ **vote**(): *[Operation](../globals.md#operation)‹[CompetitionVote](competitionvote.md)›*

*Defined in [src/schemes/competition.ts:728](https://github.com/daostack/client/blob/6c661ff/src/schemes/competition.ts#L728)*

**Returns:** *[Operation](../globals.md#operation)‹[CompetitionVote](competitionvote.md)›*

___

###  votes

▸ **votes**(`options`: [ICompetitionVoteQueryOptions](../interfaces/icompetitionvotequeryoptions.md), `apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[CompetitionVote](competitionvote.md)[]›*

*Defined in [src/schemes/competition.ts:739](https://github.com/daostack/client/blob/6c661ff/src/schemes/competition.ts#L739)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`options` | [ICompetitionVoteQueryOptions](../interfaces/icompetitionvotequeryoptions.md) |  {} |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Observable‹[CompetitionVote](competitionvote.md)[]›*

___

### `Static` calculateId

▸ **calculateId**(`opts`: object): *string*

*Defined in [src/schemes/competition.ts:586](https://github.com/daostack/client/blob/6c661ff/src/schemes/competition.ts#L586)*

**Parameters:**

▪ **opts**: *object*

Name | Type |
------ | ------ |
`scheme` | [Address](../globals.md#address) |
`suggestionId` | number |

**Returns:** *string*

___

### `Static` `Private` mapItemToObject

▸ **mapItemToObject**(`context`: [Arc](arc.md), `item`: any): *[ICompetitionSuggestionState](../interfaces/icompetitionsuggestionstate.md) | null*

*Defined in [src/schemes/competition.ts:645](https://github.com/daostack/client/blob/6c661ff/src/schemes/competition.ts#L645)*

**Parameters:**

Name | Type |
------ | ------ |
`context` | [Arc](arc.md) |
`item` | any |

**Returns:** *[ICompetitionSuggestionState](../interfaces/icompetitionsuggestionstate.md) | null*

___

### `Static` search

▸ **search**(`context`: [Arc](arc.md), `options`: [ICompetitionSuggestionQueryOptions](../interfaces/icompetitionsuggestionqueryoptions.md), `apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[CompetitionSuggestion](competitionsuggestion.md)[]›*

*Defined in [src/schemes/competition.ts:594](https://github.com/daostack/client/blob/6c661ff/src/schemes/competition.ts#L594)*

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

*Defined in [src/schemes/competition.ts:560](https://github.com/daostack/client/blob/6c661ff/src/schemes/competition.ts#L560)*

###  CompetitionSuggestionFields

• **CompetitionSuggestionFields**: *DocumentNode* =  gql`fragment CompetitionSuggestionFields on CompetitionSuggestion {
      id
      suggestionId
      proposal {
       id
      }
      descriptionHash
      title
      description
      url
      tags {
        id
      }
      # fulltext: [string]
      beneficiary
      suggester
      # votes: [CompetitionVote!] @derivedFrom(field: "suggestion")
      totalVotes
      createdAt
      redeemedAt
      rewardPercentage
      positionInWinnerList
    }`

*Defined in [src/schemes/competition.ts:561](https://github.com/daostack/client/blob/6c661ff/src/schemes/competition.ts#L561)*
