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
* [id](competitionscheme.md#id)
* [staticState](competitionscheme.md#staticstate)

### Methods

* [competitions](competitionscheme.md#competitions)
* [createProposal](competitionscheme.md#createproposal)
* [createProposalErrorHandler](competitionscheme.md#protected-createproposalerrorhandler)
* [createProposalTransaction](competitionscheme.md#protected-createproposaltransaction)
* [createProposalTransactionMap](competitionscheme.md#protected-createproposaltransactionmap)
* [fetchStaticState](competitionscheme.md#fetchstaticstate)
* [getCompetitionContract](competitionscheme.md#getcompetitioncontract)
* [proposals](competitionscheme.md#proposals)
* [redeemSuggestion](competitionscheme.md#redeemsuggestion)
* [setStaticState](competitionscheme.md#setstaticstate)
* [state](competitionscheme.md#state)
* [voteSuggestion](competitionscheme.md#votesuggestion)

### Object literals

* [fragments](competitionscheme.md#static-fragments)

## Constructors

###  constructor

\+ **new CompetitionScheme**(`idOrOpts`: [Address](../globals.md#address) | [ISchemeStaticState](../interfaces/ischemestaticstate.md), `context`: [Arc](arc.md)): *[CompetitionScheme](competitionscheme.md)*

*Inherited from [SchemeBase](schemebase.md).[constructor](schemebase.md#constructor)*

*Defined in [src/schemes/base.ts:245](https://github.com/dorgtech/client/blob/74940d1/src/schemes/base.ts#L245)*

**Parameters:**

Name | Type |
------ | ------ |
`idOrOpts` | [Address](../globals.md#address) &#124; [ISchemeStaticState](../interfaces/ischemestaticstate.md) |
`context` | [Arc](arc.md) |

**Returns:** *[CompetitionScheme](competitionscheme.md)*

## Properties

###  ReputationFromToken

• **ReputationFromToken**: *[ReputationFromTokenScheme](reputationfromtokenscheme.md) | null* =  null

*Inherited from [SchemeBase](schemebase.md).[ReputationFromToken](schemebase.md#reputationfromtoken)*

*Defined in [src/schemes/base.ts:245](https://github.com/dorgtech/client/blob/74940d1/src/schemes/base.ts#L245)*

___

###  context

• **context**: *[Arc](arc.md)*

*Inherited from [SchemeBase](schemebase.md).[context](schemebase.md#context)*

*Defined in [src/schemes/base.ts:247](https://github.com/dorgtech/client/blob/74940d1/src/schemes/base.ts#L247)*

___

###  id

• **id**: *[Address](../globals.md#address)*

*Inherited from [SchemeBase](schemebase.md).[id](schemebase.md#id)*

*Defined in [src/schemes/base.ts:243](https://github.com/dorgtech/client/blob/74940d1/src/schemes/base.ts#L243)*

___

###  staticState

• **staticState**: *[ISchemeStaticState](../interfaces/ischemestaticstate.md) | null* =  null

*Inherited from [SchemeBase](schemebase.md).[staticState](schemebase.md#staticstate)*

*Defined in [src/schemes/base.ts:244](https://github.com/dorgtech/client/blob/74940d1/src/schemes/base.ts#L244)*

## Methods

###  competitions

▸ **competitions**(`options`: [IProposalQueryOptions](../interfaces/iproposalqueryoptions.md), `apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[Competition](competition.md)[]›*

*Defined in [src/schemes/competition.ts:187](https://github.com/dorgtech/client/blob/74940d1/src/schemes/competition.ts#L187)*

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

*Defined in [src/schemes/competition.ts:289](https://github.com/dorgtech/client/blob/74940d1/src/schemes/competition.ts#L289)*

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

*Defined in [src/schemes/competition.ts:270](https://github.com/dorgtech/client/blob/74940d1/src/schemes/competition.ts#L270)*

**Parameters:**

Name | Type |
------ | ------ |
`options` | [IProposalCreateOptionsComp](../interfaces/iproposalcreateoptionscomp.md) |

**Returns:** *[transactionErrorHandler](../globals.md#transactionerrorhandler)*

___

### `Protected` createProposalTransaction

▸ **createProposalTransaction**(`options`: [IProposalCreateOptionsComp](../interfaces/iproposalcreateoptionscomp.md)): *Promise‹[ITransaction](../interfaces/itransaction.md)›*

*Overrides [SchemeBase](schemebase.md).[createProposalTransaction](schemebase.md#protected-abstract-createproposaltransaction)*

*Defined in [src/schemes/competition.ts:201](https://github.com/dorgtech/client/blob/74940d1/src/schemes/competition.ts#L201)*

**Parameters:**

Name | Type |
------ | ------ |
`options` | [IProposalCreateOptionsComp](../interfaces/iproposalcreateoptionscomp.md) |

**Returns:** *Promise‹[ITransaction](../interfaces/itransaction.md)›*

___

### `Protected` createProposalTransactionMap

▸ **createProposalTransactionMap**(): *[transactionResultHandler](../globals.md#transactionresulthandler)‹[Proposal](proposal.md)›*

*Overrides [SchemeBase](schemebase.md).[createProposalTransactionMap](schemebase.md#protected-abstract-createproposaltransactionmap)*

*Defined in [src/schemes/competition.ts:262](https://github.com/dorgtech/client/blob/74940d1/src/schemes/competition.ts#L262)*

**Returns:** *[transactionResultHandler](../globals.md#transactionresulthandler)‹[Proposal](proposal.md)›*

___

###  fetchStaticState

▸ **fetchStaticState**(): *Promise‹[ISchemeStaticState](../interfaces/ischemestaticstate.md)›*

*Inherited from [SchemeBase](schemebase.md).[fetchStaticState](schemebase.md#fetchstaticstate)*

*Defined in [src/schemes/base.ts:262](https://github.com/dorgtech/client/blob/74940d1/src/schemes/base.ts#L262)*

fetch the static state from the subgraph

**Returns:** *Promise‹[ISchemeStaticState](../interfaces/ischemestaticstate.md)›*

the statatic state

___

###  getCompetitionContract

▸ **getCompetitionContract**(): *Promise‹Contract‹››*

*Defined in [src/schemes/competition.ts:293](https://github.com/dorgtech/client/blob/74940d1/src/schemes/competition.ts#L293)*

**Returns:** *Promise‹Contract‹››*

___

###  proposals

▸ **proposals**(`options`: [IProposalQueryOptions](../interfaces/iproposalqueryoptions.md), `apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[Proposal](proposal.md)[]›*

*Inherited from [SchemeBase](schemebase.md).[proposals](schemebase.md#proposals)*

*Defined in [src/schemes/base.ts:327](https://github.com/dorgtech/client/blob/74940d1/src/schemes/base.ts#L327)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`options` | [IProposalQueryOptions](../interfaces/iproposalqueryoptions.md) |  {} |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Observable‹[Proposal](proposal.md)[]›*

___

###  redeemSuggestion

▸ **redeemSuggestion**(`options`: object): *[Operation](../globals.md#operation)‹boolean›*

*Defined in [src/schemes/competition.ts:371](https://github.com/dorgtech/client/blob/74940d1/src/schemes/competition.ts#L371)*

**Parameters:**

▪ **options**: *object*

Name | Type |
------ | ------ |
`suggestionId` | number |

**Returns:** *[Operation](../globals.md#operation)‹boolean›*

___

###  setStaticState

▸ **setStaticState**(`opts`: [ISchemeStaticState](../interfaces/ischemestaticstate.md)): *void*

*Inherited from [SchemeBase](schemebase.md).[setStaticState](schemebase.md#setstaticstate)*

*Defined in [src/schemes/base.ts:285](https://github.com/dorgtech/client/blob/74940d1/src/schemes/base.ts#L285)*

**Parameters:**

Name | Type |
------ | ------ |
`opts` | [ISchemeStaticState](../interfaces/ischemestaticstate.md) |

**Returns:** *void*

___

###  state

▸ **state**(`apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[ISchemeState](../interfaces/ischemestate.md)›*

*Overrides [SchemeBase](schemebase.md).[state](schemebase.md#abstract-state)*

*Defined in [src/schemes/competition.ts:102](https://github.com/dorgtech/client/blob/74940d1/src/schemes/competition.ts#L102)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Observable‹[ISchemeState](../interfaces/ischemestate.md)›*

___

###  voteSuggestion

▸ **voteSuggestion**(`options`: object): *[Operation](../globals.md#operation)‹[CompetitionVote](competitionvote.md)›*

*Defined in [src/schemes/competition.ts:308](https://github.com/dorgtech/client/blob/74940d1/src/schemes/competition.ts#L308)*

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
