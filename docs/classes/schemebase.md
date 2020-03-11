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
* [createProposalErrorHandler](schemebase.md#createproposalerrorhandler)
* [createProposalTransaction](schemebase.md#createproposaltransaction)
* [createProposalTransactionMap](schemebase.md#createproposaltransactionmap)
* [fetchStaticState](schemebase.md#fetchstaticstate)
* [proposals](schemebase.md#proposals)
* [setStaticState](schemebase.md#setstaticstate)
* [state](schemebase.md#abstract-state)

### Object literals

* [fragments](schemebase.md#static-fragments)

## Constructors

###  constructor

\+ **new SchemeBase**(`idOrOpts`: [Address](../globals.md#address) | [ISchemeStaticState](../interfaces/ischemestaticstate.md), `context`: [Arc](arc.md)): *[SchemeBase](schemebase.md)*

*Defined in [src/schemes/base.ts:208](https://github.com/daostack/client/blob/b547acc/src/schemes/base.ts#L208)*

**Parameters:**

Name | Type |
------ | ------ |
`idOrOpts` | [Address](../globals.md#address) &#124; [ISchemeStaticState](../interfaces/ischemestaticstate.md) |
`context` | [Arc](arc.md) |

**Returns:** *[SchemeBase](schemebase.md)*

## Properties

###  ReputationFromToken

• **ReputationFromToken**: *[ReputationFromTokenScheme](reputationfromtokenscheme.md) | null* =  null

*Defined in [src/schemes/base.ts:208](https://github.com/daostack/client/blob/b547acc/src/schemes/base.ts#L208)*

___

###  context

• **context**: *[Arc](arc.md)*

*Defined in [src/schemes/base.ts:210](https://github.com/daostack/client/blob/b547acc/src/schemes/base.ts#L210)*

___

###  id

• **id**: *[Address](../globals.md#address)*

*Defined in [src/schemes/base.ts:206](https://github.com/daostack/client/blob/b547acc/src/schemes/base.ts#L206)*

___

###  staticState

• **staticState**: *[ISchemeStaticState](../interfaces/ischemestaticstate.md) | null* =  null

*Defined in [src/schemes/base.ts:207](https://github.com/daostack/client/blob/b547acc/src/schemes/base.ts#L207)*

## Methods

###  createProposal

▸ **createProposal**(`options`: [IProposalCreateOptions](../globals.md#iproposalcreateoptions)): *[Operation](../globals.md#operation)‹[Proposal](proposal.md)›*

*Defined in [src/schemes/base.ts:269](https://github.com/daostack/client/blob/b547acc/src/schemes/base.ts#L269)*

**Parameters:**

Name | Type |
------ | ------ |
`options` | [IProposalCreateOptions](../globals.md#iproposalcreateoptions) |

**Returns:** *[Operation](../globals.md#operation)‹[Proposal](proposal.md)›*

___

###  createProposalErrorHandler

▸ **createProposalErrorHandler**(`options?`: any): *function | undefined*

*Defined in [src/schemes/base.ts:264](https://github.com/daostack/client/blob/b547acc/src/schemes/base.ts#L264)*

**Parameters:**

Name | Type |
------ | ------ |
`options?` | any |

**Returns:** *function | undefined*

___

###  createProposalTransaction

▸ **createProposalTransaction**(`options`: any): *function*

*Defined in [src/schemes/base.ts:256](https://github.com/daostack/client/blob/b547acc/src/schemes/base.ts#L256)*

create a new proposal in this scheme
TODO: move this to the schemes - we should call proposal.scheme.createProposal

**Parameters:**

Name | Type |
------ | ------ |
`options` | any |

**Returns:** *function*

a Proposal instance

▸ (): *Promise‹any›*

___

###  createProposalTransactionMap

▸ **createProposalTransactionMap**(): *function*

*Defined in [src/schemes/base.ts:260](https://github.com/daostack/client/blob/b547acc/src/schemes/base.ts#L260)*

**Returns:** *function*

▸ (`receipt`: any): *any*

**Parameters:**

Name | Type |
------ | ------ |
`receipt` | any |

___

###  fetchStaticState

▸ **fetchStaticState**(): *Promise‹[ISchemeStaticState](../interfaces/ischemestaticstate.md)›*

*Defined in [src/schemes/base.ts:225](https://github.com/daostack/client/blob/b547acc/src/schemes/base.ts#L225)*

fetch the static state from the subgraph

**Returns:** *Promise‹[ISchemeStaticState](../interfaces/ischemestaticstate.md)›*

the statatic state

___

###  proposals

▸ **proposals**(`options`: [IProposalQueryOptions](../interfaces/iproposalqueryoptions.md), `apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[Proposal](proposal.md)[]›*

*Defined in [src/schemes/base.ts:288](https://github.com/daostack/client/blob/b547acc/src/schemes/base.ts#L288)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`options` | [IProposalQueryOptions](../interfaces/iproposalqueryoptions.md) |  {} |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Observable‹[Proposal](proposal.md)[]›*

___

###  setStaticState

▸ **setStaticState**(`opts`: [ISchemeStaticState](../interfaces/ischemestaticstate.md)): *void*

*Defined in [src/schemes/base.ts:247](https://github.com/daostack/client/blob/b547acc/src/schemes/base.ts#L247)*

**Parameters:**

Name | Type |
------ | ------ |
`opts` | [ISchemeStaticState](../interfaces/ischemestaticstate.md) |

**Returns:** *void*

___

### `Abstract` state

▸ **state**(`apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[ISchemeState](../interfaces/ischemestate.md)›*

*Defined in [src/schemes/base.ts:286](https://github.com/daostack/client/blob/b547acc/src/schemes/base.ts#L286)*

**Parameters:**

Name | Type |
------ | ------ |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |

**Returns:** *Observable‹[ISchemeState](../interfaces/ischemestate.md)›*

## Object literals

### `Static` fragments

### ▪ **fragments**: *object*

*Defined in [src/schemes/base.ts:95](https://github.com/daostack/client/blob/b547acc/src/schemes/base.ts#L95)*

###  SchemeFields

• **SchemeFields**: *any* =  gql`
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

*Defined in [src/schemes/base.ts:96](https://github.com/daostack/client/blob/b547acc/src/schemes/base.ts#L96)*
