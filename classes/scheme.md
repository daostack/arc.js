[@daostack/client](../README.md) › [Globals](../globals.md) › [Scheme](scheme.md)

# Class: Scheme

A Scheme represents a scheme instance that is registered at a DAO

## Hierarchy

* **Scheme**

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
* [fetchStaticState](scheme.md#fetchstaticstate)
* [proposals](scheme.md#proposals)
* [setStaticState](scheme.md#setstaticstate)
* [state](scheme.md#state)
* [search](scheme.md#static-search)

### Object literals

* [fragments](scheme.md#static-fragments)

## Constructors

###  constructor

\+ **new Scheme**(`idOrOpts`: [Address](../globals.md#address) | [ISchemeStaticState](../interfaces/ischemestaticstate.md), `context`: [Arc](arc.md)): *[Scheme](scheme.md)*

*Defined in [scheme.ts:261](https://github.com/daostack/client/blob/e663b6a/src/scheme.ts#L261)*

**Parameters:**

Name | Type |
------ | ------ |
`idOrOpts` | [Address](../globals.md#address) &#124; [ISchemeStaticState](../interfaces/ischemestaticstate.md) |
`context` | [Arc](arc.md) |

**Returns:** *[Scheme](scheme.md)*

## Properties

###  ReputationFromToken

• **ReputationFromToken**: *[ReputationFromTokenScheme](reputationfromtokenscheme.md) | null* =  null

*Defined in [scheme.ts:261](https://github.com/daostack/client/blob/e663b6a/src/scheme.ts#L261)*

___

###  context

• **context**: *[Arc](arc.md)*

*Defined in [scheme.ts:263](https://github.com/daostack/client/blob/e663b6a/src/scheme.ts#L263)*

___

###  id

• **id**: *[Address](../globals.md#address)*

*Defined in [scheme.ts:259](https://github.com/daostack/client/blob/e663b6a/src/scheme.ts#L259)*

___

###  staticState

• **staticState**: *[ISchemeStaticState](../interfaces/ischemestaticstate.md) | null* =  null

*Defined in [scheme.ts:260](https://github.com/daostack/client/blob/e663b6a/src/scheme.ts#L260)*

## Methods

###  createProposal

▸ **createProposal**(`options`: [IProposalCreateOptions](../globals.md#iproposalcreateoptions)): *[Operation](../globals.md#operation)‹[Proposal](proposal.md)›*

*Defined in [scheme.ts:383](https://github.com/daostack/client/blob/e663b6a/src/scheme.ts#L383)*

create a new proposal in this DAO
TODO: move this to the schemes - we should call proposal.scheme.createProposal

**Parameters:**

Name | Type |
------ | ------ |
`options` | [IProposalCreateOptions](../globals.md#iproposalcreateoptions) |

**Returns:** *[Operation](../globals.md#operation)‹[Proposal](proposal.md)›*

a Proposal instance

___

###  fetchStaticState

▸ **fetchStaticState**(): *Promise‹[ISchemeStaticState](../interfaces/ischemestaticstate.md)›*

*Defined in [scheme.ts:282](https://github.com/daostack/client/blob/e663b6a/src/scheme.ts#L282)*

fetch the static state from the subgraph

**Returns:** *Promise‹[ISchemeStaticState](../interfaces/ischemestaticstate.md)›*

the statatic state

___

###  proposals

▸ **proposals**(`options`: [IProposalQueryOptions](../interfaces/iproposalqueryoptions.md), `apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[Proposal](proposal.md)[]›*

*Defined in [scheme.ts:434](https://github.com/daostack/client/blob/e663b6a/src/scheme.ts#L434)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`options` | [IProposalQueryOptions](../interfaces/iproposalqueryoptions.md) |  {} |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Observable‹[Proposal](proposal.md)[]›*

___

###  setStaticState

▸ **setStaticState**(`opts`: [ISchemeStaticState](../interfaces/ischemestaticstate.md)): *void*

*Defined in [scheme.ts:274](https://github.com/daostack/client/blob/e663b6a/src/scheme.ts#L274)*

**Parameters:**

Name | Type |
------ | ------ |
`opts` | [ISchemeStaticState](../interfaces/ischemestaticstate.md) |

**Returns:** *void*

___

###  state

▸ **state**(`apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[ISchemeState](../interfaces/ischemestate.md)›*

*Defined in [scheme.ts:305](https://github.com/daostack/client/blob/e663b6a/src/scheme.ts#L305)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Observable‹[ISchemeState](../interfaces/ischemestate.md)›*

___

### `Static` search

▸ **search**(`context`: [Arc](arc.md), `options`: [ISchemeQueryOptions](../interfaces/ischemequeryoptions.md), `apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[Scheme](scheme.md)[]›*

*Defined in [scheme.ts:210](https://github.com/daostack/client/blob/e663b6a/src/scheme.ts#L210)*

Scheme.search(context, options) searches for scheme entities

**Parameters:**

Name | Type | Default | Description |
------ | ------ | ------ | ------ |
`context` | [Arc](arc.md) | - | an Arc instance that provides connection information |
`options` | [ISchemeQueryOptions](../interfaces/ischemequeryoptions.md) |  {} | the query options, cf. ISchemeQueryOptions |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} | - |

**Returns:** *Observable‹[Scheme](scheme.md)[]›*

an observable of Scheme objects

## Object literals

### `Static` fragments

### ▪ **fragments**: *object*

*Defined in [scheme.ts:97](https://github.com/daostack/client/blob/e663b6a/src/scheme.ts#L97)*

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
      paramsHash
      contributionRewardParams {
        votingMachine
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

*Defined in [scheme.ts:98](https://github.com/daostack/client/blob/e663b6a/src/scheme.ts#L98)*
