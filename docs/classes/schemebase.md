[@daostack/arc.js - v2.0.0-experimental.1](../README.md) › [Globals](../globals.md) › [SchemeBase](schemebase.md)

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

*Defined in [src/schemes/base.ts:210](https://github.com/daostack/arc.js/blob/6c661ff/src/schemes/base.ts#L210)*

**Parameters:**

Name | Type |
------ | ------ |
`context` | [Arc](arc.md) |
`idOrOpts` | [Address](../globals.md#address) &#124; [ISchemeState](../interfaces/ischemestate.md) |

**Returns:** *[SchemeBase](schemebase.md)*

## Properties

###  ReputationFromToken

• **ReputationFromToken**: *[ReputationFromTokenScheme](reputationfromtokenscheme.md) | null* =  null

*Defined in [src/schemes/base.ts:210](https://github.com/daostack/arc.js/blob/6c661ff/src/schemes/base.ts#L210)*

___

###  context

• **context**: *[Arc](arc.md)*

*Defined in [src/schemes/base.ts:212](https://github.com/daostack/arc.js/blob/6c661ff/src/schemes/base.ts#L212)*

___

###  coreState

• **coreState**: *[ISchemeState](../interfaces/ischemestate.md) | null* =  null

*Defined in [src/schemes/base.ts:209](https://github.com/daostack/arc.js/blob/6c661ff/src/schemes/base.ts#L209)*

___

###  id

• **id**: *[Address](../globals.md#address)*

*Defined in [src/schemes/base.ts:208](https://github.com/daostack/arc.js/blob/6c661ff/src/schemes/base.ts#L208)*

## Methods

###  createProposal

▸ **createProposal**(`options`: [IProposalCreateOptions](../globals.md#iproposalcreateoptions)): *[Operation](../globals.md#operation)‹[Proposal](proposal.md)›*

*Defined in [src/schemes/base.ts:240](https://github.com/daostack/arc.js/blob/6c661ff/src/schemes/base.ts#L240)*

**Parameters:**

Name | Type |
------ | ------ |
`options` | [IProposalCreateOptions](../globals.md#iproposalcreateoptions) |

**Returns:** *[Operation](../globals.md#operation)‹[Proposal](proposal.md)›*

___

### `Protected` `Abstract` createProposalErrorHandler

▸ **createProposalErrorHandler**(`options`: [IProposalCreateOptions](../globals.md#iproposalcreateoptions)): *[transactionErrorHandler](../globals.md#transactionerrorhandler)*

*Defined in [src/schemes/base.ts:283](https://github.com/daostack/arc.js/blob/6c661ff/src/schemes/base.ts#L283)*

**Parameters:**

Name | Type |
------ | ------ |
`options` | [IProposalCreateOptions](../globals.md#iproposalcreateoptions) |

**Returns:** *[transactionErrorHandler](../globals.md#transactionerrorhandler)*

___

### `Protected` `Abstract` createProposalTransaction

▸ **createProposalTransaction**(`options`: [IProposalCreateOptions](../globals.md#iproposalcreateoptions)): *Promise‹[ITransaction](../interfaces/itransaction.md)›*

*Defined in [src/schemes/base.ts:277](https://github.com/daostack/arc.js/blob/6c661ff/src/schemes/base.ts#L277)*

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

*Defined in [src/schemes/base.ts:281](https://github.com/daostack/arc.js/blob/6c661ff/src/schemes/base.ts#L281)*

**Returns:** *[transactionResultHandler](../globals.md#transactionresulthandler)‹[Proposal](proposal.md)›*

___

###  fetchState

▸ **fetchState**(`apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Promise‹[ISchemeState](../interfaces/ischemestate.md)›*

*Defined in [src/schemes/base.ts:227](https://github.com/daostack/arc.js/blob/6c661ff/src/schemes/base.ts#L227)*

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

*Defined in [src/schemes/base.ts:262](https://github.com/daostack/arc.js/blob/6c661ff/src/schemes/base.ts#L262)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`options` | [IProposalQueryOptions](../interfaces/iproposalqueryoptions.md) |  {} |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Observable‹[Proposal](proposal.md)[]›*

___

###  setState

▸ **setState**(`opts`: [ISchemeState](../interfaces/ischemestate.md)): *void*

*Defined in [src/schemes/base.ts:236](https://github.com/daostack/arc.js/blob/6c661ff/src/schemes/base.ts#L236)*

**Parameters:**

Name | Type |
------ | ------ |
`opts` | [ISchemeState](../interfaces/ischemestate.md) |

**Returns:** *void*

___

### `Abstract` state

▸ **state**(`apolloQueryOptions?`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[ISchemeState](../interfaces/ischemestate.md)›*

*Defined in [src/schemes/base.ts:260](https://github.com/daostack/arc.js/blob/6c661ff/src/schemes/base.ts#L260)*

**Parameters:**

Name | Type |
------ | ------ |
`apolloQueryOptions?` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |

**Returns:** *Observable‹[ISchemeState](../interfaces/ischemestate.md)›*

## Object literals

### `Static` fragments

### ▪ **fragments**: *object*

*Defined in [src/schemes/base.ts:97](https://github.com/daostack/arc.js/blob/6c661ff/src/schemes/base.ts#L97)*

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

*Defined in [src/schemes/base.ts:98](https://github.com/daostack/arc.js/blob/6c661ff/src/schemes/base.ts#L98)*
