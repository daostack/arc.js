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
* [id](schemebase.md#id)
* [staticState](schemebase.md#staticstate)

### Methods

* [createProposal](schemebase.md#createproposal)
* [createProposalErrorHandler](schemebase.md#protected-abstract-createproposalerrorhandler)
* [createProposalTransaction](schemebase.md#protected-abstract-createproposaltransaction)
* [createProposalTransactionMap](schemebase.md#protected-abstract-createproposaltransactionmap)
* [fetchStaticState](schemebase.md#fetchstaticstate)
* [proposals](schemebase.md#proposals)
* [setStaticState](schemebase.md#setstaticstate)
* [state](schemebase.md#abstract-state)

### Object literals

* [fragments](schemebase.md#static-fragments)

## Constructors

###  constructor

\+ **new SchemeBase**(`idOrOpts`: [Address](../globals.md#address) | [ISchemeStaticState](../interfaces/ischemestaticstate.md), `context`: [Arc](arc.md)): *[SchemeBase](schemebase.md)*

*Defined in [src/schemes/base.ts:245](https://github.com/dorgtech/client/blob/74940d1/src/schemes/base.ts#L245)*

**Parameters:**

Name | Type |
------ | ------ |
`idOrOpts` | [Address](../globals.md#address) &#124; [ISchemeStaticState](../interfaces/ischemestaticstate.md) |
`context` | [Arc](arc.md) |

**Returns:** *[SchemeBase](schemebase.md)*

## Properties

###  ReputationFromToken

• **ReputationFromToken**: *[ReputationFromTokenScheme](reputationfromtokenscheme.md) | null* =  null

*Defined in [src/schemes/base.ts:245](https://github.com/dorgtech/client/blob/74940d1/src/schemes/base.ts#L245)*

___

###  context

• **context**: *[Arc](arc.md)*

*Defined in [src/schemes/base.ts:247](https://github.com/dorgtech/client/blob/74940d1/src/schemes/base.ts#L247)*

___

###  id

• **id**: *[Address](../globals.md#address)*

*Defined in [src/schemes/base.ts:243](https://github.com/dorgtech/client/blob/74940d1/src/schemes/base.ts#L243)*

___

###  staticState

• **staticState**: *[ISchemeStaticState](../interfaces/ischemestaticstate.md) | null* =  null

*Defined in [src/schemes/base.ts:244](https://github.com/dorgtech/client/blob/74940d1/src/schemes/base.ts#L244)*

## Methods

###  createProposal

▸ **createProposal**(`options`: [IProposalCreateOptions](../globals.md#iproposalcreateoptions)): *[Operation](../globals.md#operation)‹[Proposal](proposal.md)›*

*Defined in [src/schemes/base.ts:305](https://github.com/dorgtech/client/blob/74940d1/src/schemes/base.ts#L305)*

**Parameters:**

Name | Type |
------ | ------ |
`options` | [IProposalCreateOptions](../globals.md#iproposalcreateoptions) |

**Returns:** *[Operation](../globals.md#operation)‹[Proposal](proposal.md)›*

___

### `Protected` `Abstract` createProposalErrorHandler

▸ **createProposalErrorHandler**(`options`: [IProposalCreateOptions](../globals.md#iproposalcreateoptions)): *[transactionErrorHandler](../globals.md#transactionerrorhandler)*

*Defined in [src/schemes/base.ts:301](https://github.com/dorgtech/client/blob/74940d1/src/schemes/base.ts#L301)*

**Parameters:**

Name | Type |
------ | ------ |
`options` | [IProposalCreateOptions](../globals.md#iproposalcreateoptions) |

**Returns:** *[transactionErrorHandler](../globals.md#transactionerrorhandler)*

___

### `Protected` `Abstract` createProposalTransaction

▸ **createProposalTransaction**(`options`: [IProposalCreateOptions](../globals.md#iproposalcreateoptions)): *Promise‹[ITransaction](../interfaces/itransaction.md)›*

*Defined in [src/schemes/base.ts:295](https://github.com/dorgtech/client/blob/74940d1/src/schemes/base.ts#L295)*

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

*Defined in [src/schemes/base.ts:299](https://github.com/dorgtech/client/blob/74940d1/src/schemes/base.ts#L299)*

**Returns:** *[transactionResultHandler](../globals.md#transactionresulthandler)‹[Proposal](proposal.md)›*

___

###  fetchStaticState

▸ **fetchStaticState**(): *Promise‹[ISchemeStaticState](../interfaces/ischemestaticstate.md)›*

*Defined in [src/schemes/base.ts:262](https://github.com/dorgtech/client/blob/74940d1/src/schemes/base.ts#L262)*

fetch the static state from the subgraph

**Returns:** *Promise‹[ISchemeStaticState](../interfaces/ischemestaticstate.md)›*

the statatic state

___

###  proposals

▸ **proposals**(`options`: [IProposalQueryOptions](../interfaces/iproposalqueryoptions.md), `apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[Proposal](proposal.md)[]›*

*Defined in [src/schemes/base.ts:327](https://github.com/dorgtech/client/blob/74940d1/src/schemes/base.ts#L327)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`options` | [IProposalQueryOptions](../interfaces/iproposalqueryoptions.md) |  {} |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Observable‹[Proposal](proposal.md)[]›*

___

###  setStaticState

▸ **setStaticState**(`opts`: [ISchemeStaticState](../interfaces/ischemestaticstate.md)): *void*

*Defined in [src/schemes/base.ts:285](https://github.com/dorgtech/client/blob/74940d1/src/schemes/base.ts#L285)*

**Parameters:**

Name | Type |
------ | ------ |
`opts` | [ISchemeStaticState](../interfaces/ischemestaticstate.md) |

**Returns:** *void*

___

### `Abstract` state

▸ **state**(`apolloQueryOptions?`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[ISchemeState](../interfaces/ischemestate.md)›*

*Defined in [src/schemes/base.ts:325](https://github.com/dorgtech/client/blob/74940d1/src/schemes/base.ts#L325)*

**Parameters:**

Name | Type |
------ | ------ |
`apolloQueryOptions?` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |

**Returns:** *Observable‹[ISchemeState](../interfaces/ischemestate.md)›*

## Object literals

### `Static` fragments

### ▪ **fragments**: *object*

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
