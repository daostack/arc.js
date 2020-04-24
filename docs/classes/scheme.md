[@daostack/client - v2.0.0-experimental.1](../README.md) › [Globals](../globals.md) › [Scheme](scheme.md)

# Class: Scheme

A Scheme represents a scheme instance that is registered at a DAO

## Hierarchy

* [SchemeBase](schemebase.md)

  ↳ **Scheme**

## Implements

* [IStateful](../interfaces/istateful.md)‹[ISchemeState](../interfaces/ischemestate.md)›

## Index

### Constructors

* [constructor](scheme.md#constructor)

### Properties

* [ReputationFromToken](scheme.md#reputationfromtoken)
* [context](scheme.md#context)
* [coreState](scheme.md#corestate)
* [id](scheme.md#id)

### Methods

* [createProposal](scheme.md#createproposal)
* [createProposalErrorHandler](scheme.md#protected-createproposalerrorhandler)
* [createProposalTransaction](scheme.md#protected-createproposaltransaction)
* [createProposalTransactionMap](scheme.md#protected-createproposaltransactionmap)
* [fetchState](scheme.md#fetchstate)
* [proposals](scheme.md#proposals)
* [setState](scheme.md#setstate)
* [state](scheme.md#state)
* [itemMap](scheme.md#static-itemmap)
* [search](scheme.md#static-search)

### Object literals

* [fragments](scheme.md#static-fragments)

## Constructors

###  constructor

\+ **new Scheme**(`context`: [Arc](arc.md), `idOrOpts`: [Address](../globals.md#address) | ISchemeState): *[Scheme](scheme.md)*

*Overrides [SchemeBase](schemebase.md).[constructor](schemebase.md#constructor)*

*Defined in [src/scheme.ts:261](https://github.com/daostack/client/blob/6c661ff/src/scheme.ts#L261)*

**Parameters:**

Name | Type |
------ | ------ |
`context` | [Arc](arc.md) |
`idOrOpts` | [Address](../globals.md#address) &#124; ISchemeState |

**Returns:** *[Scheme](scheme.md)*

## Properties

###  ReputationFromToken

• **ReputationFromToken**: *[ReputationFromTokenScheme](reputationfromtokenscheme.md) | null* =  null

*Overrides [SchemeBase](schemebase.md).[ReputationFromToken](schemebase.md#reputationfromtoken)*

*Defined in [src/scheme.ts:261](https://github.com/daostack/client/blob/6c661ff/src/scheme.ts#L261)*

___

###  context

• **context**: *[Arc](arc.md)*

*Overrides [SchemeBase](schemebase.md).[context](schemebase.md#context)*

*Defined in [src/scheme.ts:263](https://github.com/daostack/client/blob/6c661ff/src/scheme.ts#L263)*

___

###  coreState

• **coreState**: *ISchemeState | null* =  null

*Overrides [SchemeBase](schemebase.md).[coreState](schemebase.md#corestate)*

*Defined in [src/scheme.ts:260](https://github.com/daostack/client/blob/6c661ff/src/scheme.ts#L260)*

___

###  id

• **id**: *[Address](../globals.md#address)*

*Overrides [SchemeBase](schemebase.md).[id](schemebase.md#id)*

*Defined in [src/scheme.ts:259](https://github.com/daostack/client/blob/6c661ff/src/scheme.ts#L259)*

## Methods

###  createProposal

▸ **createProposal**(`options`: [IProposalCreateOptions](../globals.md#iproposalcreateoptions)): *[Operation](../globals.md#operation)‹[Proposal](proposal.md)›*

*Overrides [SchemeBase](schemebase.md).[createProposal](schemebase.md#createproposal)*

*Defined in [src/scheme.ts:310](https://github.com/daostack/client/blob/6c661ff/src/scheme.ts#L310)*

create a new proposal in this Scheme

**Parameters:**

Name | Type |
------ | ------ |
`options` | [IProposalCreateOptions](../globals.md#iproposalcreateoptions) |

**Returns:** *[Operation](../globals.md#operation)‹[Proposal](proposal.md)›*

a Proposal instance

___

### `Protected` createProposalErrorHandler

▸ **createProposalErrorHandler**(`options`: [IProposalCreateOptions](../globals.md#iproposalcreateoptions)): *[transactionErrorHandler](../globals.md#transactionerrorhandler)*

*Overrides [SchemeBase](schemebase.md).[createProposalErrorHandler](schemebase.md#protected-abstract-createproposalerrorhandler)*

*Defined in [src/scheme.ts:389](https://github.com/daostack/client/blob/6c661ff/src/scheme.ts#L389)*

**Parameters:**

Name | Type |
------ | ------ |
`options` | [IProposalCreateOptions](../globals.md#iproposalcreateoptions) |

**Returns:** *[transactionErrorHandler](../globals.md#transactionerrorhandler)*

___

### `Protected` createProposalTransaction

▸ **createProposalTransaction**(`options`: [IProposalCreateOptions](../globals.md#iproposalcreateoptions)): *Promise‹[ITransaction](../interfaces/itransaction.md)›*

*Overrides [SchemeBase](schemebase.md).[createProposalTransaction](schemebase.md#protected-abstract-createproposaltransaction)*

*Defined in [src/scheme.ts:379](https://github.com/daostack/client/blob/6c661ff/src/scheme.ts#L379)*

**Parameters:**

Name | Type |
------ | ------ |
`options` | [IProposalCreateOptions](../globals.md#iproposalcreateoptions) |

**Returns:** *Promise‹[ITransaction](../interfaces/itransaction.md)›*

___

### `Protected` createProposalTransactionMap

▸ **createProposalTransactionMap**(): *[transactionResultHandler](../globals.md#transactionresulthandler)‹[Proposal](proposal.md)›*

*Overrides [SchemeBase](schemebase.md).[createProposalTransactionMap](schemebase.md#protected-abstract-createproposaltransactionmap)*

*Defined in [src/scheme.ts:385](https://github.com/daostack/client/blob/6c661ff/src/scheme.ts#L385)*

**Returns:** *[transactionResultHandler](../globals.md#transactionresulthandler)‹[Proposal](proposal.md)›*

___

###  fetchState

▸ **fetchState**(`apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Promise‹ISchemeState›*

*Overrides [SchemeBase](schemebase.md).[fetchState](schemebase.md#fetchstate)*

*Defined in [src/scheme.ts:286](https://github.com/daostack/client/blob/6c661ff/src/scheme.ts#L286)*

fetch the static state from the subgraph

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Promise‹ISchemeState›*

the statatic state

___

###  proposals

▸ **proposals**(`options`: [IProposalQueryOptions](../interfaces/iproposalqueryoptions.md), `apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[Proposal](proposal.md)[]›*

*Overrides [SchemeBase](schemebase.md).[proposals](schemebase.md#proposals)*

*Defined in [src/scheme.ts:370](https://github.com/daostack/client/blob/6c661ff/src/scheme.ts#L370)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`options` | [IProposalQueryOptions](../interfaces/iproposalqueryoptions.md) |  {} |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Observable‹[Proposal](proposal.md)[]›*

___

###  setState

▸ **setState**(`opts`: ISchemeState): *void*

*Overrides [SchemeBase](schemebase.md).[setState](schemebase.md#setstate)*

*Defined in [src/scheme.ts:275](https://github.com/daostack/client/blob/6c661ff/src/scheme.ts#L275)*

**Parameters:**

Name | Type |
------ | ------ |
`opts` | ISchemeState |

**Returns:** *void*

___

###  state

▸ **state**(`apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹ISchemeState›*

*Overrides [SchemeBase](schemebase.md).[state](schemebase.md#abstract-state)*

*Defined in [src/scheme.ts:292](https://github.com/daostack/client/blob/6c661ff/src/scheme.ts#L292)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Observable‹ISchemeState›*

___

### `Static` itemMap

▸ **itemMap**(`arc`: [Arc](arc.md), `item`: any): *ISchemeState | null*

*Defined in [src/scheme.ts:197](https://github.com/daostack/client/blob/6c661ff/src/scheme.ts#L197)*

map an apollo query result to ISchemeState

**`static`** 

**`memberof`** Scheme

**Parameters:**

Name | Type |
------ | ------ |
`arc` | [Arc](arc.md) |
`item` | any |

**Returns:** *ISchemeState | null*

___

### `Static` search

▸ **search**(`context`: [Arc](arc.md), `options`: ISchemeQueryOptions, `apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[SchemeBase](schemebase.md)[]›*

*Defined in [src/scheme.ts:111](https://github.com/daostack/client/blob/6c661ff/src/scheme.ts#L111)*

Scheme.search(context, options) searches for scheme entities

**Parameters:**

Name | Type | Default | Description |
------ | ------ | ------ | ------ |
`context` | [Arc](arc.md) | - | an Arc instance that provides connection information |
`options` | ISchemeQueryOptions |  {} | the query options, cf. ISchemeQueryOptions |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} | - |

**Returns:** *Observable‹[SchemeBase](schemebase.md)[]›*

an observable of Scheme objects

## Object literals

### `Static` fragments

### ▪ **fragments**: *object*

*Inherited from [SchemeBase](schemebase.md).[fragments](schemebase.md#static-fragments)*

*Defined in [src/schemes/base.ts:97](https://github.com/daostack/client/blob/6c661ff/src/schemes/base.ts#L97)*

###  SchemeFields

• **SchemeFields**: *DocumentNode* =  gql`
    fragment SchemeFields on ControllerScheme {
      id
      address
      name
      dao { id }
      canDelegateCall
      canRegisterSchemes
      canUpgradeController
      canManageGlobalConstraints
      contributionRewardParams {
        id
        votingMachine
        voteParams {
          id
          queuedVoteRequiredPercentage
          queuedVotePeriodLimit
          boostedVotePeriodLimit
          preBoostedVotePeriodLimit
          thresholdConst
          limitExponentValue
          quietEndingPeriod
          proposingRepReward
          votersReputationLossRatio
          minimumDaoBounty
          daoBountyConst
          activationTime
          voteOnBehalf
        }
      }
      contributionRewardExtParams {
        id
        votingMachine
        voteParams {
          id
          queuedVoteRequiredPercentage
          queuedVotePeriodLimit
          boostedVotePeriodLimit
          preBoostedVotePeriodLimit
          thresholdConst
          limitExponentValue
          quietEndingPeriod
          proposingRepReward
          votersReputationLossRatio
          minimumDaoBounty
          daoBountyConst
          activationTime
          voteOnBehalf
        }
        rewarder
      }
      genericSchemeParams {
        votingMachine
        contractToCall
        voteParams {
          queuedVoteRequiredPercentage
          queuedVotePeriodLimit
          boostedVotePeriodLimit
          preBoostedVotePeriodLimit
          thresholdConst
          limitExponentValue
          quietEndingPeriod
          proposingRepReward
          votersReputationLossRatio
          minimumDaoBounty
          daoBountyConst
          activationTime
          voteOnBehalf
        }
      }
      schemeRegistrarParams {
        votingMachine
        voteRemoveParams {
          queuedVoteRequiredPercentage
          queuedVotePeriodLimit
          boostedVotePeriodLimit
          preBoostedVotePeriodLimit
          thresholdConst
          limitExponentValue
          quietEndingPeriod
          proposingRepReward
          votersReputationLossRatio
          minimumDaoBounty
          daoBountyConst
          activationTime
          voteOnBehalf
        }
        voteRegisterParams {
          queuedVoteRequiredPercentage
          queuedVotePeriodLimit
          boostedVotePeriodLimit
          preBoostedVotePeriodLimit
          thresholdConst
          limitExponentValue
          quietEndingPeriod
          proposingRepReward
          votersReputationLossRatio
          minimumDaoBounty
          daoBountyConst
          activationTime
          voteOnBehalf
        }
      }
      numberOfQueuedProposals
      numberOfPreBoostedProposals
      numberOfBoostedProposals
      version
    }`

*Defined in [src/schemes/base.ts:98](https://github.com/daostack/client/blob/6c661ff/src/schemes/base.ts#L98)*
