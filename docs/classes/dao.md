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
* [coreState](dao.md#corestate)
* [id](dao.md#id)

### Methods

* [createProposal](dao.md#createproposal)
* [ethBalance](dao.md#ethbalance)
* [fetchState](dao.md#fetchstate)
* [member](dao.md#member)
* [members](dao.md#members)
* [nativeReputation](dao.md#nativereputation)
* [proposal](dao.md#proposal)
* [proposals](dao.md#proposals)
* [rewards](dao.md#rewards)
* [scheme](dao.md#scheme)
* [schemes](dao.md#schemes)
* [setState](dao.md#setstate)
* [stakes](dao.md#stakes)
* [state](dao.md#state)
* [votes](dao.md#votes)
* [search](dao.md#static-search)

### Object literals

* [fragments](dao.md#static-fragments)

## Constructors

###  constructor

\+ **new DAO**(`context`: [Arc](arc.md), `idOrOpts`: [Address](../globals.md#address) | [IDAOState](../interfaces/idaostate.md)): *[DAO](dao.md)*

*Defined in [src/dao.ts:140](https://github.com/dorgtech/client/blob/19b4373/src/dao.ts#L140)*

**Parameters:**

Name | Type |
------ | ------ |
`context` | [Arc](arc.md) |
`idOrOpts` | [Address](../globals.md#address) &#124; [IDAOState](../interfaces/idaostate.md) |

**Returns:** *[DAO](dao.md)*

## Properties

###  context

• **context**: *[Arc](arc.md)*

*Defined in [src/dao.ts:142](https://github.com/dorgtech/client/blob/19b4373/src/dao.ts#L142)*

___

###  coreState

• **coreState**: *[IDAOState](../interfaces/idaostate.md) | undefined*

*Defined in [src/dao.ts:140](https://github.com/dorgtech/client/blob/19b4373/src/dao.ts#L140)*

___

###  id

• **id**: *[Address](../globals.md#address)*

*Defined in [src/dao.ts:139](https://github.com/dorgtech/client/blob/19b4373/src/dao.ts#L139)*

## Methods

###  createProposal

▸ **createProposal**(`options`: [IProposalCreateOptions](../globals.md#iproposalcreateoptions)): *[IOperationObservable](../interfaces/ioperationobservable.md)‹[ITransactionUpdate](../interfaces/itransactionupdate.md)‹[Proposal](proposal.md)‹›››*

*Defined in [src/dao.ts:257](https://github.com/dorgtech/client/blob/19b4373/src/dao.ts#L257)*

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

*Defined in [src/dao.ts:332](https://github.com/dorgtech/client/blob/19b4373/src/dao.ts#L332)*

get (an observable of) the Ether balance of the DAO from the web3Provider

**Returns:** *Observable‹BN›*

an observable stream of BN number instances

___

###  fetchState

▸ **fetchState**(`apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Promise‹[IDAOState](../interfaces/idaostate.md)›*

*Defined in [src/dao.ts:155](https://github.com/dorgtech/client/blob/19b4373/src/dao.ts#L155)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Promise‹[IDAOState](../interfaces/idaostate.md)›*

___

###  member

▸ **member**(`address`: [Address](../globals.md#address)): *[Member](member.md)*

*Defined in [src/dao.ts:238](https://github.com/dorgtech/client/blob/19b4373/src/dao.ts#L238)*

**Parameters:**

Name | Type |
------ | ------ |
`address` | [Address](../globals.md#address) |

**Returns:** *[Member](member.md)*

___

###  members

▸ **members**(`options`: [IMemberQueryOptions](../interfaces/imemberqueryoptions.md), `apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[Member](member.md)[]›*

*Defined in [src/dao.ts:229](https://github.com/dorgtech/client/blob/19b4373/src/dao.ts#L229)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`options` | [IMemberQueryOptions](../interfaces/imemberqueryoptions.md) |  {} |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Observable‹[Member](member.md)[]›*

___

###  nativeReputation

▸ **nativeReputation**(): *Observable‹[Reputation](reputation.md)›*

*Defined in [src/dao.ts:207](https://github.com/dorgtech/client/blob/19b4373/src/dao.ts#L207)*

**Returns:** *Observable‹[Reputation](reputation.md)›*

___

###  proposal

▸ **proposal**(`proposalId`: string): *[Proposal](proposal.md)*

*Defined in [src/dao.ts:296](https://github.com/dorgtech/client/blob/19b4373/src/dao.ts#L296)*

**Parameters:**

Name | Type |
------ | ------ |
`proposalId` | string |

**Returns:** *[Proposal](proposal.md)*

___

###  proposals

▸ **proposals**(`options`: [IProposalQueryOptions](../interfaces/iproposalqueryoptions.md), `apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[Proposal](proposal.md)[]›*

*Defined in [src/dao.ts:285](https://github.com/dorgtech/client/blob/19b4373/src/dao.ts#L285)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`options` | [IProposalQueryOptions](../interfaces/iproposalqueryoptions.md) |  {} |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Observable‹[Proposal](proposal.md)[]›*

___

###  rewards

▸ **rewards**(`options`: [IRewardQueryOptions](../interfaces/irewardqueryoptions.md), `apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[Reward](reward.md)[]›*

*Defined in [src/dao.ts:300](https://github.com/dorgtech/client/blob/19b4373/src/dao.ts#L300)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`options` | [IRewardQueryOptions](../interfaces/irewardqueryoptions.md) |  {} |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Observable‹[Reward](reward.md)[]›*

___

###  scheme

▸ **scheme**(`options`: ISchemeQueryOptions): *Promise‹[SchemeBase](schemebase.md)›*

*Defined in [src/dao.ts:220](https://github.com/dorgtech/client/blob/19b4373/src/dao.ts#L220)*

**Parameters:**

Name | Type |
------ | ------ |
`options` | ISchemeQueryOptions |

**Returns:** *Promise‹[SchemeBase](schemebase.md)›*

___

###  schemes

▸ **schemes**(`options`: ISchemeQueryOptions, `apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[SchemeBase](schemebase.md)[]›*

*Defined in [src/dao.ts:211](https://github.com/dorgtech/client/blob/19b4373/src/dao.ts#L211)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`options` | ISchemeQueryOptions |  {} |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Observable‹[SchemeBase](schemebase.md)[]›*

___

###  setState

▸ **setState**(`opts`: [IDAOState](../interfaces/idaostate.md)): *void*

*Defined in [src/dao.ts:151](https://github.com/dorgtech/client/blob/19b4373/src/dao.ts#L151)*

**Parameters:**

Name | Type |
------ | ------ |
`opts` | [IDAOState](../interfaces/idaostate.md) |

**Returns:** *void*

___

###  stakes

▸ **stakes**(`options`: [IStakeQueryOptions](../interfaces/istakequeryoptions.md), `apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[Stake](stake.md)[]›*

*Defined in [src/dao.ts:318](https://github.com/dorgtech/client/blob/19b4373/src/dao.ts#L318)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`options` | [IStakeQueryOptions](../interfaces/istakequeryoptions.md) |  {} |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Observable‹[Stake](stake.md)[]›*

___

###  state

▸ **state**(`apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[IDAOState](../interfaces/idaostate.md)›*

*Defined in [src/dao.ts:165](https://github.com/dorgtech/client/blob/19b4373/src/dao.ts#L165)*

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

*Defined in [src/dao.ts:309](https://github.com/dorgtech/client/blob/19b4373/src/dao.ts#L309)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`options` | [IVoteQueryOptions](../interfaces/ivotequeryoptions.md) |  {} |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Observable‹[Vote](vote.md)[]›*

___

### `Static` search

▸ **search**(`context`: [Arc](arc.md), `options`: [IDAOQueryOptions](../interfaces/idaoqueryoptions.md), `apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[DAO](dao.md)[]›*

*Defined in [src/dao.ts:69](https://github.com/dorgtech/client/blob/19b4373/src/dao.ts#L69)*

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

*Defined in [src/dao.ts:48](https://github.com/dorgtech/client/blob/19b4373/src/dao.ts#L48)*

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

*Defined in [src/dao.ts:49](https://github.com/dorgtech/client/blob/19b4373/src/dao.ts#L49)*
