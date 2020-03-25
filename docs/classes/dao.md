[@daostack/client - v0.2.64](../README.md) › [Globals](../globals.md) › [DAO](dao.md)

# Class: DAO

## Hierarchy

* **DAO**

## Implements

* [IStateful](../interfaces/istateful.md)‹[IDAOState](../interfaces/idaostate.md)›

## Index

### Constructors

* [constructor](dao.md#constructor)

### Properties

* [context](dao.md#context)
* [id](dao.md#id)
* [staticState](dao.md#staticstate)

### Methods

* [createProposal](dao.md#createproposal)
* [ethBalance](dao.md#ethbalance)
* [fetchStaticState](dao.md#fetchstaticstate)
* [member](dao.md#member)
* [members](dao.md#members)
* [nativeReputation](dao.md#nativereputation)
* [proposal](dao.md#proposal)
* [proposals](dao.md#proposals)
* [rewards](dao.md#rewards)
* [scheme](dao.md#scheme)
* [schemes](dao.md#schemes)
* [setStaticState](dao.md#setstaticstate)
* [stakes](dao.md#stakes)
* [state](dao.md#state)
* [votes](dao.md#votes)
* [search](dao.md#static-search)

### Object literals

* [fragments](dao.md#static-fragments)

## Constructors

###  constructor

\+ **new DAO**(`idOrOpts`: [Address](../globals.md#address) | [IDAOStaticState](../interfaces/idaostaticstate.md), `context`: [Arc](arc.md)): *[DAO](dao.md)*

*Defined in [src/dao.ts:137](https://github.com/dorgtech/client/blob/74940d1/src/dao.ts#L137)*

**Parameters:**

Name | Type |
------ | ------ |
`idOrOpts` | [Address](../globals.md#address) &#124; [IDAOStaticState](../interfaces/idaostaticstate.md) |
`context` | [Arc](arc.md) |

**Returns:** *[DAO](dao.md)*

## Properties

###  context

• **context**: *[Arc](arc.md)*

*Defined in [src/dao.ts:139](https://github.com/dorgtech/client/blob/74940d1/src/dao.ts#L139)*

___

###  id

• **id**: *[Address](../globals.md#address)*

*Defined in [src/dao.ts:136](https://github.com/dorgtech/client/blob/74940d1/src/dao.ts#L136)*

___

###  staticState

• **staticState**: *[IDAOStaticState](../interfaces/idaostaticstate.md) | undefined*

*Defined in [src/dao.ts:137](https://github.com/dorgtech/client/blob/74940d1/src/dao.ts#L137)*

## Methods

###  createProposal

▸ **createProposal**(`options`: [IProposalCreateOptions](../globals.md#iproposalcreateoptions)): *[IOperationObservable](../interfaces/ioperationobservable.md)‹[ITransactionUpdate](../interfaces/itransactionupdate.md)‹[Proposal](proposal.md)‹›››*

*Defined in [src/dao.ts:272](https://github.com/dorgtech/client/blob/74940d1/src/dao.ts#L272)*

create a new proposal in this DAO

**Parameters:**

Name | Type |
------ | ------ |
`options` | [IProposalCreateOptions](../globals.md#iproposalcreateoptions) |

**Returns:** *[IOperationObservable](../interfaces/ioperationobservable.md)‹[ITransactionUpdate](../interfaces/itransactionupdate.md)‹[Proposal](proposal.md)‹›››*

a Proposal instance

___

###  ethBalance

▸ **ethBalance**(): *Observable‹BN›*

*Defined in [src/dao.ts:347](https://github.com/dorgtech/client/blob/74940d1/src/dao.ts#L347)*

get (an observable of) the Ether balance of the DAO from the web3Provider

**Returns:** *Observable‹BN›*

an observable stream of BN number instances

___

###  fetchStaticState

▸ **fetchStaticState**(): *Promise‹[IDAOStaticState](../interfaces/idaostaticstate.md)›*

*Defined in [src/dao.ts:152](https://github.com/dorgtech/client/blob/74940d1/src/dao.ts#L152)*

**Returns:** *Promise‹[IDAOStaticState](../interfaces/idaostaticstate.md)›*

___

###  member

▸ **member**(`address`: [Address](../globals.md#address)): *[Member](member.md)*

*Defined in [src/dao.ts:257](https://github.com/dorgtech/client/blob/74940d1/src/dao.ts#L257)*

**Parameters:**

Name | Type |
------ | ------ |
`address` | [Address](../globals.md#address) |

**Returns:** *[Member](member.md)*

___

###  members

▸ **members**(`options`: [IMemberQueryOptions](../interfaces/imemberqueryoptions.md), `apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[Member](member.md)[]›*

*Defined in [src/dao.ts:248](https://github.com/dorgtech/client/blob/74940d1/src/dao.ts#L248)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`options` | [IMemberQueryOptions](../interfaces/imemberqueryoptions.md) |  {} |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Observable‹[Member](member.md)[]›*

___

###  nativeReputation

▸ **nativeReputation**(): *Observable‹[Reputation](reputation.md)›*

*Defined in [src/dao.ts:226](https://github.com/dorgtech/client/blob/74940d1/src/dao.ts#L226)*

**Returns:** *Observable‹[Reputation](reputation.md)›*

___

###  proposal

▸ **proposal**(`proposalId`: string): *[Proposal](proposal.md)*

*Defined in [src/dao.ts:311](https://github.com/dorgtech/client/blob/74940d1/src/dao.ts#L311)*

**Parameters:**

Name | Type |
------ | ------ |
`proposalId` | string |

**Returns:** *[Proposal](proposal.md)*

___

###  proposals

▸ **proposals**(`options`: [IProposalQueryOptions](../interfaces/iproposalqueryoptions.md), `apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[Proposal](proposal.md)[]›*

*Defined in [src/dao.ts:300](https://github.com/dorgtech/client/blob/74940d1/src/dao.ts#L300)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`options` | [IProposalQueryOptions](../interfaces/iproposalqueryoptions.md) |  {} |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Observable‹[Proposal](proposal.md)[]›*

___

###  rewards

▸ **rewards**(`options`: [IRewardQueryOptions](../interfaces/irewardqueryoptions.md), `apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[Reward](reward.md)[]›*

*Defined in [src/dao.ts:315](https://github.com/dorgtech/client/blob/74940d1/src/dao.ts#L315)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`options` | [IRewardQueryOptions](../interfaces/irewardqueryoptions.md) |  {} |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Observable‹[Reward](reward.md)[]›*

___

###  scheme

▸ **scheme**(`options`: ISchemeQueryOptions): *Promise‹[SchemeBase](schemebase.md)›*

*Defined in [src/dao.ts:239](https://github.com/dorgtech/client/blob/74940d1/src/dao.ts#L239)*

**Parameters:**

Name | Type |
------ | ------ |
`options` | ISchemeQueryOptions |

**Returns:** *Promise‹[SchemeBase](schemebase.md)›*

___

###  schemes

▸ **schemes**(`options`: ISchemeQueryOptions, `apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[SchemeBase](schemebase.md)[]›*

*Defined in [src/dao.ts:230](https://github.com/dorgtech/client/blob/74940d1/src/dao.ts#L230)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`options` | ISchemeQueryOptions |  {} |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Observable‹[SchemeBase](schemebase.md)[]›*

___

###  setStaticState

▸ **setStaticState**(`opts`: [IDAOStaticState](../interfaces/idaostaticstate.md)): *void*

*Defined in [src/dao.ts:148](https://github.com/dorgtech/client/blob/74940d1/src/dao.ts#L148)*

**Parameters:**

Name | Type |
------ | ------ |
`opts` | [IDAOStaticState](../interfaces/idaostaticstate.md) |

**Returns:** *void*

___

###  stakes

▸ **stakes**(`options`: [IStakeQueryOptions](../interfaces/istakequeryoptions.md), `apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[Stake](stake.md)[]›*

*Defined in [src/dao.ts:333](https://github.com/dorgtech/client/blob/74940d1/src/dao.ts#L333)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`options` | [IStakeQueryOptions](../interfaces/istakequeryoptions.md) |  {} |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Observable‹[Stake](stake.md)[]›*

___

###  state

▸ **state**(`apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[IDAOState](../interfaces/idaostate.md)›*

*Defined in [src/dao.ts:176](https://github.com/dorgtech/client/blob/74940d1/src/dao.ts#L176)*

get the current state of the DAO

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Observable‹[IDAOState](../interfaces/idaostate.md)›*

an Observable of IDAOState

___

###  votes

▸ **votes**(`options`: [IVoteQueryOptions](../interfaces/ivotequeryoptions.md), `apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[Vote](vote.md)[]›*

*Defined in [src/dao.ts:324](https://github.com/dorgtech/client/blob/74940d1/src/dao.ts#L324)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`options` | [IVoteQueryOptions](../interfaces/ivotequeryoptions.md) |  {} |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Observable‹[Vote](vote.md)[]›*

___

### `Static` search

▸ **search**(`context`: [Arc](arc.md), `options`: [IDAOQueryOptions](../interfaces/idaoqueryoptions.md), `apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[DAO](dao.md)[]›*

*Defined in [src/dao.ts:72](https://github.com/dorgtech/client/blob/74940d1/src/dao.ts#L72)*

DAO.search(context, options) searches for DAO entities

**Parameters:**

Name | Type | Default | Description |
------ | ------ | ------ | ------ |
`context` | [Arc](arc.md) | - | an Arc instance that provides connection information |
`options` | [IDAOQueryOptions](../interfaces/idaoqueryoptions.md) |  {} | the query options, cf. IDAOQueryOptions |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} | - |

**Returns:** *Observable‹[DAO](dao.md)[]›*

an observable of DAO objects

## Object literals

### `Static` fragments

### ▪ **fragments**: *object*

*Defined in [src/dao.ts:51](https://github.com/dorgtech/client/blob/74940d1/src/dao.ts#L51)*

###  DAOFields

• **DAOFields**: *DocumentNode* =  gql`
      fragment DAOFields on DAO {
        id
        name
        nativeReputation { id, totalSupply }
        nativeToken { id, name, symbol, totalSupply }
        numberOfQueuedProposals
        numberOfPreBoostedProposals
        numberOfBoostedProposals
        register
        reputationHoldersCount
    }`

*Defined in [src/dao.ts:52](https://github.com/dorgtech/client/blob/74940d1/src/dao.ts#L52)*
