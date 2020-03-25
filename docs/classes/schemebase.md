[@daostack/client - v0.2.64](../README.md) › [Globals](../globals.md) › [SchemeBase](schemebase.md)

# Class: SchemeBase

A Scheme represents a scheme instance that is registered at a DAO

## Hierarchy

* **SchemeBase**

  ↳ [CompetitionScheme](competitionscheme.md)

  ↳ [Scheme](scheme.md)

## Implements

* [IStateful](../interfaces/istateful.md)‹[ISchemeState](../interfaces/ischemestate.md)›

## Index

### Constructors

* [constructor](schemebase.md#constructor)

### Properties

* [ReputationFromToken](schemebase.md#reputationfromtoken)
* [context](schemebase.md#context)
* [coreState](schemebase.md#corestate)
* [id](schemebase.md#id)

### Methods

* [createProposal](schemebase.md#createproposal)
* [createProposalErrorHandler](schemebase.md#protected-abstract-createproposalerrorhandler)
* [createProposalTransaction](schemebase.md#protected-abstract-createproposaltransaction)
* [createProposalTransactionMap](schemebase.md#protected-abstract-createproposaltransactionmap)
* [fetchState](schemebase.md#fetchstate)
* [proposals](schemebase.md#proposals)
* [setState](schemebase.md#setstate)
* [state](schemebase.md#abstract-state)

### Object literals

* [fragments](schemebase.md#static-fragments)

## Constructors

###  constructor

\+ **new SchemeBase**(`context`: [Arc](arc.md), `idOrOpts`: [Address](../globals.md#address) | [ISchemeState](../interfaces/ischemestate.md)): *[SchemeBase](schemebase.md)*

*Defined in [src/schemes/base.ts:240](https://github.com/dorgtech/client/blob/19b4373/src/schemes/base.ts#L240)*

**Parameters:**

Name | Type |
------ | ------ |
`context` | [Arc](arc.md) |
`idOrOpts` | [Address](../globals.md#address) &#124; [ISchemeState](../interfaces/ischemestate.md) |

**Returns:** *[SchemeBase](schemebase.md)*

## Properties

###  ReputationFromToken

• **ReputationFromToken**: *[ReputationFromTokenScheme](reputationfromtokenscheme.md) | null* =  null

*Defined in [src/schemes/base.ts:240](https://github.com/dorgtech/client/blob/19b4373/src/schemes/base.ts#L240)*

___

###  context

• **context**: *[Arc](arc.md)*

*Defined in [src/schemes/base.ts:242](https://github.com/dorgtech/client/blob/19b4373/src/schemes/base.ts#L242)*

___

###  coreState

• **coreState**: *[ISchemeState](../interfaces/ischemestate.md) | null* =  null

*Defined in [src/schemes/base.ts:239](https://github.com/dorgtech/client/blob/19b4373/src/schemes/base.ts#L239)*

___

###  id

• **id**: *[Address](../globals.md#address)*

*Defined in [src/schemes/base.ts:238](https://github.com/dorgtech/client/blob/19b4373/src/schemes/base.ts#L238)*

## Methods

###  createProposal

▸ **createProposal**(`options`: [IProposalCreateOptions](../globals.md#iproposalcreateoptions)): *[Operation](../globals.md#operation)‹[Proposal](proposal.md)›*

*Defined in [src/schemes/base.ts:273](https://github.com/dorgtech/client/blob/19b4373/src/schemes/base.ts#L273)*

**Parameters:**

Name | Type |
------ | ------ |
`options` | [IProposalCreateOptions](../globals.md#iproposalcreateoptions) |

**Returns:** *[Operation](../globals.md#operation)‹[Proposal](proposal.md)›*

___

### `Protected` `Abstract` createProposalErrorHandler

▸ **createProposalErrorHandler**(`options`: [IProposalCreateOptions](../globals.md#iproposalcreateoptions)): *[transactionErrorHandler](../globals.md#transactionerrorhandler)*

*Defined in [src/schemes/base.ts:316](https://github.com/dorgtech/client/blob/19b4373/src/schemes/base.ts#L316)*

**Parameters:**

Name | Type |
------ | ------ |
`options` | [IProposalCreateOptions](../globals.md#iproposalcreateoptions) |

**Returns:** *[transactionErrorHandler](../globals.md#transactionerrorhandler)*

___

### `Protected` `Abstract` createProposalTransaction

▸ **createProposalTransaction**(`options`: [IProposalCreateOptions](../globals.md#iproposalcreateoptions)): *Promise‹[ITransaction](../interfaces/itransaction.md)›*

*Defined in [src/schemes/base.ts:310](https://github.com/dorgtech/client/blob/19b4373/src/schemes/base.ts#L310)*

create a new proposal in this scheme
TODO: move this to the schemes - we should call proposal.scheme.createProposal

**Parameters:**

Name | Type |
------ | ------ |
`options` | [IProposalCreateOptions](../globals.md#iproposalcreateoptions) |

**Returns:** *Promise‹[ITransaction](../interfaces/itransaction.md)›*

a Proposal instance

___

### `Protected` `Abstract` createProposalTransactionMap

▸ **createProposalTransactionMap**(): *[transactionResultHandler](../globals.md#transactionresulthandler)‹[Proposal](proposal.md)›*

*Defined in [src/schemes/base.ts:314](https://github.com/dorgtech/client/blob/19b4373/src/schemes/base.ts#L314)*

**Returns:** *[transactionResultHandler](../globals.md#transactionresulthandler)‹[Proposal](proposal.md)›*

___

###  fetchState

▸ **fetchState**(`apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Promise‹[ISchemeState](../interfaces/ischemestate.md)›*

*Defined in [src/schemes/base.ts:257](https://github.com/dorgtech/client/blob/19b4373/src/schemes/base.ts#L257)*

fetch the static state from the subgraph

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Promise‹[ISchemeState](../interfaces/ischemestate.md)›*

the statatic state

___

###  proposals

▸ **proposals**(`options`: [IProposalQueryOptions](../interfaces/iproposalqueryoptions.md), `apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[Proposal](proposal.md)[]›*

*Defined in [src/schemes/base.ts:295](https://github.com/dorgtech/client/blob/19b4373/src/schemes/base.ts#L295)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`options` | [IProposalQueryOptions](../interfaces/iproposalqueryoptions.md) |  {} |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Observable‹[Proposal](proposal.md)[]›*

___

###  setState

▸ **setState**(`opts`: [ISchemeState](../interfaces/ischemestate.md)): *void*

*Defined in [src/schemes/base.ts:269](https://github.com/dorgtech/client/blob/19b4373/src/schemes/base.ts#L269)*

**Parameters:**

Name | Type |
------ | ------ |
`opts` | [ISchemeState](../interfaces/ischemestate.md) |

**Returns:** *void*

___

### `Abstract` state

▸ **state**(`apolloQueryOptions?`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[ISchemeState](../interfaces/ischemestate.md)›*

*Defined in [src/schemes/base.ts:293](https://github.com/dorgtech/client/blob/19b4373/src/schemes/base.ts#L293)*

**Parameters:**

Name | Type |
------ | ------ |
`apolloQueryOptions?` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |

**Returns:** *Observable‹[ISchemeState](../interfaces/ischemestate.md)›*

## Object literals

### `Static` fragments

### ▪ **fragments**: *object*

*Defined in [src/schemes/base.ts:107](https://github.com/dorgtech/client/blob/19b4373/src/schemes/base.ts#L107)*

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

*Defined in [src/schemes/base.ts:108](https://github.com/dorgtech/client/blob/19b4373/src/schemes/base.ts#L108)*
