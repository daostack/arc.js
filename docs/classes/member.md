[@daostack/client - v0.2.64](../README.md) › [Globals](../globals.md) › [Member](member.md)

# Class: Member

Represents an account that holds reputaion in a specific DAO

## Hierarchy

* **Member**

## Implements

* [IStateful](../interfaces/istateful.md)‹[IMemberState](../interfaces/imemberstate.md)›

## Index

### Constructors

* [constructor](member.md#constructor)

### Properties

* [context](member.md#context)
* [coreState](member.md#corestate)
* [id](member.md#id)

### Methods

* [dao](member.md#dao)
* [fetchState](member.md#fetchstate)
* [proposals](member.md#proposals)
* [rewards](member.md#rewards)
* [setState](member.md#setstate)
* [stakes](member.md#stakes)
* [state](member.md#state)
* [votes](member.md#votes)
* [calculateId](member.md#static-calculateid)
* [search](member.md#static-search)

### Object literals

* [fragments](member.md#static-fragments)

## Constructors

###  constructor

\+ **new Member**(`context`: [Arc](arc.md), `idOrOpts`: string | [IMemberState](../interfaces/imemberstate.md)): *[Member](member.md)*

*Defined in [src/member.ts:114](https://github.com/daostack/client/blob/9d69996/src/member.ts#L114)*

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`context` | [Arc](arc.md) | an instance of Arc  |
`idOrOpts` | string &#124; [IMemberState](../interfaces/imemberstate.md) | - |

**Returns:** *[Member](member.md)*

## Properties

###  context

• **context**: *[Arc](arc.md)*

*Defined in [src/member.ts:121](https://github.com/daostack/client/blob/9d69996/src/member.ts#L121)*

an instance of Arc

___

###  coreState

• **coreState**: *[IMemberState](../interfaces/imemberstate.md) | undefined*

*Defined in [src/member.ts:114](https://github.com/daostack/client/blob/9d69996/src/member.ts#L114)*

___

###  id

• **id**: *string | undefined*

*Defined in [src/member.ts:113](https://github.com/daostack/client/blob/9d69996/src/member.ts#L113)*

## Methods

###  dao

▸ **dao**(): *Promise‹[DAO](dao.md)›*

*Defined in [src/member.ts:221](https://github.com/daostack/client/blob/9d69996/src/member.ts#L221)*

**Returns:** *Promise‹[DAO](dao.md)›*

___

###  fetchState

▸ **fetchState**(`apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Promise‹[IMemberState](../interfaces/imemberstate.md)›*

*Defined in [src/member.ts:130](https://github.com/daostack/client/blob/9d69996/src/member.ts#L130)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Promise‹[IMemberState](../interfaces/imemberstate.md)›*

___

###  proposals

▸ **proposals**(`options`: [IProposalQueryOptions](../interfaces/iproposalqueryoptions.md), `apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[Proposal](proposal.md)[]›*

*Defined in [src/member.ts:230](https://github.com/daostack/client/blob/9d69996/src/member.ts#L230)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`options` | [IProposalQueryOptions](../interfaces/iproposalqueryoptions.md) |  {} |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Observable‹[Proposal](proposal.md)[]›*

___

###  rewards

▸ **rewards**(): *Observable‹[Reward](reward.md)[]›*

*Defined in [src/member.ts:226](https://github.com/daostack/client/blob/9d69996/src/member.ts#L226)*

**Returns:** *Observable‹[Reward](reward.md)[]›*

___

###  setState

▸ **setState**(`opts`: [IMemberState](../interfaces/imemberstate.md)): *[IMemberState](../interfaces/imemberstate.md)*

*Defined in [src/member.ts:136](https://github.com/daostack/client/blob/9d69996/src/member.ts#L136)*

**Parameters:**

Name | Type |
------ | ------ |
`opts` | [IMemberState](../interfaces/imemberstate.md) |

**Returns:** *[IMemberState](../interfaces/imemberstate.md)*

___

###  stakes

▸ **stakes**(`options`: [IStakeQueryOptions](../interfaces/istakequeryoptions.md), `apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[Stake](stake.md)[]›*

*Defined in [src/member.ts:246](https://github.com/daostack/client/blob/9d69996/src/member.ts#L246)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`options` | [IStakeQueryOptions](../interfaces/istakequeryoptions.md) |  {} |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Observable‹[Stake](stake.md)[]›*

___

###  state

▸ **state**(`apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[IMemberState](../interfaces/imemberstate.md)›*

*Defined in [src/member.ts:152](https://github.com/daostack/client/blob/9d69996/src/member.ts#L152)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Observable‹[IMemberState](../interfaces/imemberstate.md)›*

___

###  votes

▸ **votes**(`options`: [IVoteQueryOptions](../interfaces/ivotequeryoptions.md), `apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[Vote](vote.md)[]›*

*Defined in [src/member.ts:259](https://github.com/daostack/client/blob/9d69996/src/member.ts#L259)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`options` | [IVoteQueryOptions](../interfaces/ivotequeryoptions.md) |  {} |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Observable‹[Vote](vote.md)[]›*

___

### `Static` calculateId

▸ **calculateId**(`opts`: object): *string*

*Defined in [src/member.ts:105](https://github.com/daostack/client/blob/9d69996/src/member.ts#L105)*

**Parameters:**

▪ **opts**: *object*

Name | Type |
------ | ------ |
`address` | [Address](../globals.md#address) |
`contract` | [Address](../globals.md#address) |

**Returns:** *string*

___

### `Static` search

▸ **search**(`context`: [Arc](arc.md), `options`: [IMemberQueryOptions](../interfaces/imemberqueryoptions.md), `apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[Member](member.md)[]›*

*Defined in [src/member.ts:57](https://github.com/daostack/client/blob/9d69996/src/member.ts#L57)*

Member.search(context, options) searches for member entities

**Parameters:**

Name | Type | Default | Description |
------ | ------ | ------ | ------ |
`context` | [Arc](arc.md) | - | an Arc instance that provides connection information |
`options` | [IMemberQueryOptions](../interfaces/imemberqueryoptions.md) |  {} | the query options, cf. IMemberQueryOptions |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} | - |

**Returns:** *Observable‹[Member](member.md)[]›*

an observable of IRewardState objects

## Object literals

### `Static` fragments

### ▪ **fragments**: *object*

*Defined in [src/member.ts:37](https://github.com/daostack/client/blob/9d69996/src/member.ts#L37)*

###  ReputationHolderFields

• **ReputationHolderFields**: *DocumentNode* =  gql`
      fragment ReputationHolderFields on ReputationHolder {
        id
        address
        contract
        dao {
          id
        }
        balance
      }
    `

*Defined in [src/member.ts:38](https://github.com/daostack/client/blob/9d69996/src/member.ts#L38)*
