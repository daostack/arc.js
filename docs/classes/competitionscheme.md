[@daostack/client - v0.2.64](../README.md) › [Globals](../globals.md) › [CompetitionScheme](competitionscheme.md)

# Class: CompetitionScheme

## Hierarchy

* [SchemeBase](schemebase.md)

  ↳ **CompetitionScheme**

## Implements

* [IStateful](../interfaces/istateful.md)‹[ISchemeState](../interfaces/ischemestate.md)›

## Index

### Constructors

* [constructor](competitionscheme.md#constructor)

### Properties

* [ReputationFromToken](competitionscheme.md#reputationfromtoken)
* [context](competitionscheme.md#context)
* [coreState](competitionscheme.md#corestate)
* [id](competitionscheme.md#id)

### Methods

* [competitions](competitionscheme.md#competitions)
* [createProposal](competitionscheme.md#createproposal)
* [createProposalErrorHandler](competitionscheme.md#protected-createproposalerrorhandler)
* [createProposalTransaction](competitionscheme.md#protected-createproposaltransaction)
* [createProposalTransactionMap](competitionscheme.md#protected-createproposaltransactionmap)
* [fetchState](competitionscheme.md#fetchstate)
* [getCompetitionContract](competitionscheme.md#getcompetitioncontract)
* [proposals](competitionscheme.md#proposals)
* [redeemSuggestion](competitionscheme.md#redeemsuggestion)
* [setState](competitionscheme.md#setstate)
* [state](competitionscheme.md#state)
* [voteSuggestion](competitionscheme.md#votesuggestion)

### Object literals

* [fragments](competitionscheme.md#static-fragments)

## Constructors

###  constructor

\+ **new CompetitionScheme**(`context`: [Arc](arc.md), `idOrOpts`: [Address](../globals.md#address) | [ISchemeState](../interfaces/ischemestate.md)): *[CompetitionScheme](competitionscheme.md)*

*Inherited from [SchemeBase](schemebase.md).[constructor](schemebase.md#constructor)*

*Defined in [src/schemes/base.ts:210](https://github.com/daostack/client/blob/9d69996/src/schemes/base.ts#L210)*

**Parameters:**

Name | Type |
------ | ------ |
`context` | [Arc](arc.md) |
`idOrOpts` | [Address](../globals.md#address) &#124; [ISchemeState](../interfaces/ischemestate.md) |

**Returns:** *[CompetitionScheme](competitionscheme.md)*

## Properties

###  ReputationFromToken

• **ReputationFromToken**: *[ReputationFromTokenScheme](reputationfromtokenscheme.md) | null* =  null

*Inherited from [SchemeBase](schemebase.md).[ReputationFromToken](schemebase.md#reputationfromtoken)*

*Defined in [src/schemes/base.ts:210](https://github.com/daostack/client/blob/9d69996/src/schemes/base.ts#L210)*

___

###  context

• **context**: *[Arc](arc.md)*

*Inherited from [SchemeBase](schemebase.md).[context](schemebase.md#context)*

*Defined in [src/schemes/base.ts:212](https://github.com/daostack/client/blob/9d69996/src/schemes/base.ts#L212)*

___

###  coreState

• **coreState**: *[ISchemeState](../interfaces/ischemestate.md) | null* =  null

*Inherited from [SchemeBase](schemebase.md).[coreState](schemebase.md#corestate)*

*Defined in [src/schemes/base.ts:209](https://github.com/daostack/client/blob/9d69996/src/schemes/base.ts#L209)*

___

###  id

• **id**: *[Address](../globals.md#address)*

*Inherited from [SchemeBase](schemebase.md).[id](schemebase.md#id)*

*Defined in [src/schemes/base.ts:208](https://github.com/daostack/client/blob/9d69996/src/schemes/base.ts#L208)*

## Methods

###  competitions

▸ **competitions**(`options`: [IProposalQueryOptions](../interfaces/iproposalqueryoptions.md), `apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[Competition](competition.md)[]›*

*Defined in [src/schemes/competition.ts:180](https://github.com/daostack/client/blob/9d69996/src/schemes/competition.ts#L180)*

Return a list of competitions in this scheme.

**Parameters:**

Name | Type | Default | Description |
------ | ------ | ------ | ------ |
`options` | [IProposalQueryOptions](../interfaces/iproposalqueryoptions.md) |  {} | - |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |   |

**Returns:** *Observable‹[Competition](competition.md)[]›*

___

###  createProposal

▸ **createProposal**(`options`: [IProposalCreateOptionsComp](../interfaces/iproposalcreateoptionscomp.md)): *[Operation](../globals.md#operation)‹[Proposal](proposal.md)›*

*Overrides [SchemeBase](schemebase.md).[createProposal](schemebase.md#createproposal)*

*Defined in [src/schemes/competition.ts:196](https://github.com/daostack/client/blob/9d69996/src/schemes/competition.ts#L196)*

create a proposal for starting a Competition

**`memberof`** CompetitionScheme

**Parameters:**

Name | Type |
------ | ------ |
`options` | [IProposalCreateOptionsComp](../interfaces/iproposalcreateoptionscomp.md) |

**Returns:** *[Operation](../globals.md#operation)‹[Proposal](proposal.md)›*

___

### `Protected` createProposalErrorHandler

▸ **createProposalErrorHandler**(`options`: [IProposalCreateOptionsComp](../interfaces/iproposalcreateoptionscomp.md)): *[transactionErrorHandler](../globals.md#transactionerrorhandler)*

*Overrides [SchemeBase](schemebase.md).[createProposalErrorHandler](schemebase.md#protected-abstract-createproposalerrorhandler)*

*Defined in [src/schemes/competition.ts:392](https://github.com/daostack/client/blob/9d69996/src/schemes/competition.ts#L392)*

**Parameters:**

Name | Type |
------ | ------ |
`options` | [IProposalCreateOptionsComp](../interfaces/iproposalcreateoptionscomp.md) |

**Returns:** *[transactionErrorHandler](../globals.md#transactionerrorhandler)*

___

### `Protected` createProposalTransaction

▸ **createProposalTransaction**(`options`: [IProposalCreateOptionsComp](../interfaces/iproposalcreateoptionscomp.md)): *Promise‹[ITransaction](../interfaces/itransaction.md)›*

*Overrides [SchemeBase](schemebase.md).[createProposalTransaction](schemebase.md#protected-abstract-createproposaltransaction)*

*Defined in [src/schemes/competition.ts:323](https://github.com/daostack/client/blob/9d69996/src/schemes/competition.ts#L323)*

**Parameters:**

Name | Type |
------ | ------ |
`options` | [IProposalCreateOptionsComp](../interfaces/iproposalcreateoptionscomp.md) |

**Returns:** *Promise‹[ITransaction](../interfaces/itransaction.md)›*

___

### `Protected` createProposalTransactionMap

▸ **createProposalTransactionMap**(): *[transactionResultHandler](../globals.md#transactionresulthandler)‹[Proposal](proposal.md)›*

*Overrides [SchemeBase](schemebase.md).[createProposalTransactionMap](schemebase.md#protected-abstract-createproposaltransactionmap)*

*Defined in [src/schemes/competition.ts:384](https://github.com/daostack/client/blob/9d69996/src/schemes/competition.ts#L384)*

**Returns:** *[transactionResultHandler](../globals.md#transactionresulthandler)‹[Proposal](proposal.md)›*

___

###  fetchState

▸ **fetchState**(`apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Promise‹[ISchemeState](../interfaces/ischemestate.md)›*

*Inherited from [SchemeBase](schemebase.md).[fetchState](schemebase.md#fetchstate)*

*Defined in [src/schemes/base.ts:227](https://github.com/daostack/client/blob/9d69996/src/schemes/base.ts#L227)*

fetch the static state from the subgraph

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Promise‹[ISchemeState](../interfaces/ischemestate.md)›*

the statatic state

___

###  getCompetitionContract

▸ **getCompetitionContract**(): *Promise‹Contract‹››*

*Defined in [src/schemes/competition.ts:200](https://github.com/daostack/client/blob/9d69996/src/schemes/competition.ts#L200)*

**Returns:** *Promise‹Contract‹››*

___

###  proposals

▸ **proposals**(`options`: [IProposalQueryOptions](../interfaces/iproposalqueryoptions.md), `apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[Proposal](proposal.md)[]›*

*Inherited from [SchemeBase](schemebase.md).[proposals](schemebase.md#proposals)*

*Defined in [src/schemes/base.ts:262](https://github.com/daostack/client/blob/9d69996/src/schemes/base.ts#L262)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`options` | [IProposalQueryOptions](../interfaces/iproposalqueryoptions.md) |  {} |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Observable‹[Proposal](proposal.md)[]›*

___

###  redeemSuggestion

▸ **redeemSuggestion**(`options`: object): *[Operation](../globals.md#operation)‹boolean›*

*Defined in [src/schemes/competition.ts:278](https://github.com/daostack/client/blob/9d69996/src/schemes/competition.ts#L278)*

**Parameters:**

▪ **options**: *object*

Name | Type |
------ | ------ |
`suggestionId` | number |

**Returns:** *[Operation](../globals.md#operation)‹boolean›*

___

###  setState

▸ **setState**(`opts`: [ISchemeState](../interfaces/ischemestate.md)): *void*

*Inherited from [SchemeBase](schemebase.md).[setState](schemebase.md#setstate)*

*Defined in [src/schemes/base.ts:236](https://github.com/daostack/client/blob/9d69996/src/schemes/base.ts#L236)*

**Parameters:**

Name | Type |
------ | ------ |
`opts` | [ISchemeState](../interfaces/ischemestate.md) |

**Returns:** *void*

___

###  state

▸ **state**(`apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[ISchemeState](../interfaces/ischemestate.md)›*

*Overrides [SchemeBase](schemebase.md).[state](schemebase.md#abstract-state)*

*Defined in [src/schemes/competition.ts:102](https://github.com/daostack/client/blob/9d69996/src/schemes/competition.ts#L102)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Observable‹[ISchemeState](../interfaces/ischemestate.md)›*

___

###  voteSuggestion

▸ **voteSuggestion**(`options`: object): *[Operation](../globals.md#operation)‹[CompetitionVote](competitionvote.md)›*

*Defined in [src/schemes/competition.ts:215](https://github.com/daostack/client/blob/9d69996/src/schemes/competition.ts#L215)*

Vote for the suggestion that is, in the current scheme, identified by  suggestionId

**`memberof`** CompetitionScheme

**Parameters:**

▪ **options**: *object*

Name | Type |
------ | ------ |
`suggestionId` | number |

**Returns:** *[Operation](../globals.md#operation)‹[CompetitionVote](competitionvote.md)›*

## Object literals

### `Static` fragments

### ▪ **fragments**: *object*

*Inherited from [SchemeBase](schemebase.md).[fragments](schemebase.md#static-fragments)*

*Defined in [src/schemes/base.ts:97](https://github.com/daostack/client/blob/9d69996/src/schemes/base.ts#L97)*

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

*Defined in [src/schemes/base.ts:98](https://github.com/daostack/client/blob/9d69996/src/schemes/base.ts#L98)*
