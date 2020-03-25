[@daostack/client - v0.2.64](../README.md) › [Globals](../globals.md) › [Scheme](scheme.md)

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
* [id](scheme.md#id)
* [staticState](scheme.md#staticstate)

### Methods

* [createProposal](scheme.md#createproposal)
* [createProposalErrorHandler](scheme.md#protected-createproposalerrorhandler)
* [createProposalTransaction](scheme.md#protected-createproposaltransaction)
* [createProposalTransactionMap](scheme.md#protected-createproposaltransactionmap)
* [fetchStaticState](scheme.md#fetchstaticstate)
* [proposals](scheme.md#proposals)
* [setStaticState](scheme.md#setstaticstate)
* [state](scheme.md#state)
* [itemMap](scheme.md#static-itemmap)
* [search](scheme.md#static-search)

### Object literals

* [fragments](scheme.md#static-fragments)

## Constructors

###  constructor

\+ **new Scheme**(`idOrOpts`: [Address](../globals.md#address) | ISchemeStaticState, `context`: [Arc](arc.md)): *[Scheme](scheme.md)*

*Overrides [SchemeBase](schemebase.md).[constructor](schemebase.md#constructor)*

*Defined in [src/scheme.ts:264](https://github.com/dorgtech/client/blob/74940d1/src/scheme.ts#L264)*

**Parameters:**

Name | Type |
------ | ------ |
`idOrOpts` | [Address](../globals.md#address) &#124; ISchemeStaticState |
`context` | [Arc](arc.md) |

**Returns:** *[Scheme](scheme.md)*

## Properties

###  ReputationFromToken

• **ReputationFromToken**: *[ReputationFromTokenScheme](reputationfromtokenscheme.md) | null* =  null

*Overrides [SchemeBase](schemebase.md).[ReputationFromToken](schemebase.md#reputationfromtoken)*

*Defined in [src/scheme.ts:264](https://github.com/dorgtech/client/blob/74940d1/src/scheme.ts#L264)*

___

###  context

• **context**: *[Arc](arc.md)*

*Overrides [SchemeBase](schemebase.md).[context](schemebase.md#context)*

*Defined in [src/scheme.ts:266](https://github.com/dorgtech/client/blob/74940d1/src/scheme.ts#L266)*

___

###  id

• **id**: *[Address](../globals.md#address)*

*Overrides [SchemeBase](schemebase.md).[id](schemebase.md#id)*

*Defined in [src/scheme.ts:262](https://github.com/dorgtech/client/blob/74940d1/src/scheme.ts#L262)*

___

###  staticState

• **staticState**: *ISchemeStaticState | null* =  null

*Overrides [SchemeBase](schemebase.md).[staticState](schemebase.md#staticstate)*

*Defined in [src/scheme.ts:263](https://github.com/dorgtech/client/blob/74940d1/src/scheme.ts#L263)*

## Methods

###  createProposal

▸ **createProposal**(`options`: [IProposalCreateOptions](../globals.md#iproposalcreateoptions)): *[Operation](../globals.md#operation)‹[Proposal](proposal.md)›*

*Overrides [SchemeBase](schemebase.md).[createProposal](schemebase.md#createproposal)*

*Defined in [src/scheme.ts:344](https://github.com/dorgtech/client/blob/74940d1/src/scheme.ts#L344)*

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

*Defined in [src/scheme.ts:333](https://github.com/dorgtech/client/blob/74940d1/src/scheme.ts#L333)*

**Parameters:**

Name | Type |
------ | ------ |
`options` | [IProposalCreateOptions](../globals.md#iproposalcreateoptions) |

**Returns:** *[transactionErrorHandler](../globals.md#transactionerrorhandler)*

___

### `Protected` createProposalTransaction

▸ **createProposalTransaction**(`options`: [IProposalCreateOptions](../globals.md#iproposalcreateoptions)): *Promise‹[ITransaction](../interfaces/itransaction.md)›*

*Overrides [SchemeBase](schemebase.md).[createProposalTransaction](schemebase.md#protected-abstract-createproposaltransaction)*

*Defined in [src/scheme.ts:323](https://github.com/dorgtech/client/blob/74940d1/src/scheme.ts#L323)*

**Parameters:**

Name | Type |
------ | ------ |
`options` | [IProposalCreateOptions](../globals.md#iproposalcreateoptions) |

**Returns:** *Promise‹[ITransaction](../interfaces/itransaction.md)›*

___

### `Protected` createProposalTransactionMap

▸ **createProposalTransactionMap**(): *[transactionResultHandler](../globals.md#transactionresulthandler)‹[Proposal](proposal.md)›*

*Overrides [SchemeBase](schemebase.md).[createProposalTransactionMap](schemebase.md#protected-abstract-createproposaltransactionmap)*

*Defined in [src/scheme.ts:329](https://github.com/dorgtech/client/blob/74940d1/src/scheme.ts#L329)*

**Returns:** *[transactionResultHandler](../globals.md#transactionresulthandler)‹[Proposal](proposal.md)›*

___

###  fetchStaticState

▸ **fetchStaticState**(): *Promise‹ISchemeStaticState›*

*Overrides [SchemeBase](schemebase.md).[fetchStaticState](schemebase.md#fetchstaticstate)*

*Defined in [src/scheme.ts:289](https://github.com/dorgtech/client/blob/74940d1/src/scheme.ts#L289)*

fetch the static state from the subgraph

**Returns:** *Promise‹ISchemeStaticState›*

the statatic state

___

###  proposals

▸ **proposals**(`options`: [IProposalQueryOptions](../interfaces/iproposalqueryoptions.md), `apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[Proposal](proposal.md)[]›*

*Overrides [SchemeBase](schemebase.md).[proposals](schemebase.md#proposals)*

*Defined in [src/scheme.ts:419](https://github.com/dorgtech/client/blob/74940d1/src/scheme.ts#L419)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`options` | [IProposalQueryOptions](../interfaces/iproposalqueryoptions.md) |  {} |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Observable‹[Proposal](proposal.md)[]›*

___

###  setStaticState

▸ **setStaticState**(`opts`: ISchemeStaticState): *void*

*Overrides [SchemeBase](schemebase.md).[setStaticState](schemebase.md#setstaticstate)*

*Defined in [src/scheme.ts:278](https://github.com/dorgtech/client/blob/74940d1/src/scheme.ts#L278)*

**Parameters:**

Name | Type |
------ | ------ |
`opts` | ISchemeStaticState |

**Returns:** *void*

___

###  state

▸ **state**(`apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹ISchemeState›*

*Overrides [SchemeBase](schemebase.md).[state](schemebase.md#abstract-state)*

*Defined in [src/scheme.ts:310](https://github.com/dorgtech/client/blob/74940d1/src/scheme.ts#L310)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Observable‹ISchemeState›*

___

### `Static` itemMap

▸ **itemMap**(`item`: any, `arc`: [Arc](arc.md)): *ISchemeState | null*

*Defined in [src/scheme.ts:193](https://github.com/dorgtech/client/blob/74940d1/src/scheme.ts#L193)*

map an apollo query result to ISchemeState

**`static`** 

**`memberof`** Scheme

**Parameters:**

Name | Type |
------ | ------ |
`item` | any |
`arc` | [Arc](arc.md) |

**Returns:** *ISchemeState | null*

___

### `Static` search

▸ **search**(`context`: [Arc](arc.md), `options`: ISchemeQueryOptions, `apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹Array‹[SchemeBase](schemebase.md)››*

*Defined in [src/scheme.ts:121](https://github.com/dorgtech/client/blob/74940d1/src/scheme.ts#L121)*

Scheme.search(context, options) searches for scheme entities

**Parameters:**

Name | Type | Default | Description |
------ | ------ | ------ | ------ |
`context` | [Arc](arc.md) | - | an Arc instance that provides connection information |
`options` | ISchemeQueryOptions |  {} | the query options, cf. ISchemeQueryOptions |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} | - |

**Returns:** *Observable‹Array‹[SchemeBase](schemebase.md)››*

an observable of Scheme objects

## Object literals

### `Static` fragments

### ▪ **fragments**: *object*

*Inherited from [SchemeBase](schemebase.md).[fragments](schemebase.md#static-fragments)*

*Defined in [src/schemes/base.ts:112](https://github.com/dorgtech/client/blob/74940d1/src/schemes/base.ts#L112)*

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
      paramsHash
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
      uGenericSchemeParams {
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
      version
    }`

*Defined in [src/schemes/base.ts:113](https://github.com/dorgtech/client/blob/74940d1/src/schemes/base.ts#L113)*
