[@daostack/client - v0.2.64](../README.md) › [Globals](../globals.md) › [Proposal](proposal.md)

# Class: Proposal

## Hierarchy

* **Proposal**

## Implements

* [IStateful](../interfaces/istateful.md)‹[IProposalState](../interfaces/iproposalstate.md)›

## Index

### Constructors

* [constructor](proposal.md#constructor)

### Properties

* [context](proposal.md#context)
* [coreState](proposal.md#corestate)
* [id](proposal.md#id)

### Methods

* [execute](proposal.md#execute)
* [executeBoosted](proposal.md#executeboosted)
* [fetchState](proposal.md#fetchstate)
* [redeemRewards](proposal.md#redeemrewards)
* [redeemerContract](proposal.md#redeemercontract)
* [rewards](proposal.md#rewards)
* [scheme](proposal.md#scheme)
* [setState](proposal.md#setstate)
* [stake](proposal.md#stake)
* [stakes](proposal.md#stakes)
* [stakingToken](proposal.md#stakingtoken)
* [state](proposal.md#state)
* [vote](proposal.md#vote)
* [votes](proposal.md#votes)
* [votingMachine](proposal.md#votingmachine)
* [search](proposal.md#static-search)

### Object literals

* [fragments](proposal.md#static-fragments)

## Constructors

###  constructor

\+ **new Proposal**(`context`: [Arc](arc.md), `idOrOpts`: string | [IProposalState](../interfaces/iproposalstate.md)): *[Proposal](proposal.md)*

*Defined in [src/proposal.ts:334](https://github.com/dorgtech/client/blob/19b4373/src/proposal.ts#L334)*

**Parameters:**

Name | Type |
------ | ------ |
`context` | [Arc](arc.md) |
`idOrOpts` | string &#124; [IProposalState](../interfaces/iproposalstate.md) |

**Returns:** *[Proposal](proposal.md)*

## Properties

###  context

• **context**: *[Arc](arc.md)*

*Defined in [src/proposal.ts:332](https://github.com/dorgtech/client/blob/19b4373/src/proposal.ts#L332)*

___

###  coreState

• **coreState**: *[IProposalState](../interfaces/iproposalstate.md) | undefined*

*Defined in [src/proposal.ts:334](https://github.com/dorgtech/client/blob/19b4373/src/proposal.ts#L334)*

___

###  id

• **id**: *string*

*Defined in [src/proposal.ts:333](https://github.com/dorgtech/client/blob/19b4373/src/proposal.ts#L333)*

## Methods

###  execute

▸ **execute**(): *[Operation](../globals.md#operation)‹undefined›*

*Defined in [src/proposal.ts:863](https://github.com/dorgtech/client/blob/19b4373/src/proposal.ts#L863)*

call the 'execute()' function on the votingMachine.
the main purpose of this function is to set the stage of the proposals
this call may (or may not) "execute" the proposal itself (i.e. do what the proposal proposes)

**Returns:** *[Operation](../globals.md#operation)‹undefined›*

an Operation that, when sucessful, will contain the receipt of the transaction

___

###  executeBoosted

▸ **executeBoosted**(): *[Operation](../globals.md#operation)‹undefined›*

*Defined in [src/proposal.ts:897](https://github.com/dorgtech/client/blob/19b4373/src/proposal.ts#L897)*

**Returns:** *[Operation](../globals.md#operation)‹undefined›*

___

###  fetchState

▸ **fetchState**(`apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Promise‹[IProposalState](../interfaces/iproposalstate.md)›*

*Defined in [src/proposal.ts:352](https://github.com/dorgtech/client/blob/19b4373/src/proposal.ts#L352)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Promise‹[IProposalState](../interfaces/iproposalstate.md)›*

___

###  redeemRewards

▸ **redeemRewards**(`beneficiary?`: [Address](../globals.md#address)): *[Operation](../globals.md#operation)‹boolean›*

*Defined in [src/proposal.ts:799](https://github.com/dorgtech/client/blob/19b4373/src/proposal.ts#L799)*

[redeemRewards description] Execute the proposal and distribute the rewards
to the beneficiary.
This uses the Redeemer.sol helper contract

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`beneficiary?` | [Address](../globals.md#address) | Addresss of the beneficiary, optional,    if undefined will only redeem the ContributionReward rewards |

**Returns:** *[Operation](../globals.md#operation)‹boolean›*

an Operation

___

###  redeemerContract

▸ **redeemerContract**(): *Contract‹›*

*Defined in [src/proposal.ts:605](https://github.com/dorgtech/client/blob/19b4373/src/proposal.ts#L605)*

[redeemerContract description]

**Returns:** *Contract‹›*

a web3 Contract instance

___

###  rewards

▸ **rewards**(`options`: [IRewardQueryOptions](../interfaces/irewardqueryoptions.md), `apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[Reward](reward.md)[]›*

*Defined in [src/proposal.ts:782](https://github.com/dorgtech/client/blob/19b4373/src/proposal.ts#L782)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`options` | [IRewardQueryOptions](../interfaces/irewardqueryoptions.md) |  {} |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Observable‹[Reward](reward.md)[]›*

___

###  scheme

▸ **scheme**(): *Promise‹Contract‹››*

*Defined in [src/proposal.ts:588](https://github.com/dorgtech/client/blob/19b4373/src/proposal.ts#L588)*

**Returns:** *Promise‹Contract‹››*

the scheme Contract

___

###  setState

▸ **setState**(`opts`: [IProposalState](../interfaces/iproposalstate.md)): *void*

*Defined in [src/proposal.ts:348](https://github.com/dorgtech/client/blob/19b4373/src/proposal.ts#L348)*

**Parameters:**

Name | Type |
------ | ------ |
`opts` | [IProposalState](../interfaces/iproposalstate.md) |

**Returns:** *void*

___

###  stake

▸ **stake**(`outcome`: [IProposalOutcome](../enums/iproposaloutcome.md), `amount`: BN): *[Operation](../globals.md#operation)‹[Stake](stake.md)›*

*Defined in [src/proposal.ts:708](https://github.com/dorgtech/client/blob/19b4373/src/proposal.ts#L708)*

Stake on this proposal

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`outcome` | [IProposalOutcome](../enums/iproposaloutcome.md) | the outcome that is staked on, of type IProposalOutcome |
`amount` | BN | the amount, in GEN, to stake |

**Returns:** *[Operation](../globals.md#operation)‹[Stake](stake.md)›*

An observable that can be sent, or subscribed to

___

###  stakes

▸ **stakes**(`options`: [IStakeQueryOptions](../interfaces/istakequeryoptions.md), `apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[Stake](stake.md)[]›*

*Defined in [src/proposal.ts:696](https://github.com/dorgtech/client/blob/19b4373/src/proposal.ts#L696)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`options` | [IStakeQueryOptions](../interfaces/istakequeryoptions.md) |  {} |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Observable‹[Stake](stake.md)[]›*

___

###  stakingToken

▸ **stakingToken**(): *[Token](token.md)‹›*

*Defined in [src/proposal.ts:692](https://github.com/dorgtech/client/blob/19b4373/src/proposal.ts#L692)*

**Returns:** *[Token](token.md)‹›*

___

###  state

▸ **state**(`apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[IProposalState](../interfaces/iproposalstate.md)›*

*Defined in [src/proposal.ts:363](https://github.com/dorgtech/client/blob/19b4373/src/proposal.ts#L363)*

`state` is an observable of the proposal state

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Observable‹[IProposalState](../interfaces/iproposalstate.md)›*

___

###  vote

▸ **vote**(`outcome`: [IProposalOutcome](../enums/iproposaloutcome.md), `amount`: number): *[Operation](../globals.md#operation)‹[Vote](vote.md) | null›*

*Defined in [src/proposal.ts:633](https://github.com/dorgtech/client/blob/19b4373/src/proposal.ts#L633)*

Vote for this proposal

**Parameters:**

Name | Type | Default | Description |
------ | ------ | ------ | ------ |
`outcome` | [IProposalOutcome](../enums/iproposaloutcome.md) | - | one of IProposalOutcome.Pass (0) or IProposalOutcome.FAIL (1) |
`amount` | number | 0 | the amount of reputation to vote with. Defaults to 0 - in that case,  all the sender's rep will be used |

**Returns:** *[Operation](../globals.md#operation)‹[Vote](vote.md) | null›*

an observable Operation<Vote>

___

###  votes

▸ **votes**(`options`: [IVoteQueryOptions](../interfaces/ivotequeryoptions.md), `apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[Vote](vote.md)[]›*

*Defined in [src/proposal.ts:620](https://github.com/dorgtech/client/blob/19b4373/src/proposal.ts#L620)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`options` | [IVoteQueryOptions](../interfaces/ivotequeryoptions.md) |  {} |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} |

**Returns:** *Observable‹[Vote](vote.md)[]›*

___

###  votingMachine

▸ **votingMachine**(): *Promise‹Contract‹››*

*Defined in [src/proposal.ts:597](https://github.com/dorgtech/client/blob/19b4373/src/proposal.ts#L597)*

[votingMachine description]

**Returns:** *Promise‹Contract‹››*

a web3 Contract instance

___

### `Static` search

▸ **search**(`context`: [Arc](arc.md), `options`: [IProposalQueryOptions](../interfaces/iproposalqueryoptions.md), `apolloQueryOptions`: [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md)): *Observable‹[Proposal](proposal.md)[]›*

*Defined in [src/proposal.ts:243](https://github.com/dorgtech/client/blob/19b4373/src/proposal.ts#L243)*

Search for proposals

**Parameters:**

Name | Type | Default | Description |
------ | ------ | ------ | ------ |
`context` | [Arc](arc.md) | - | An instance of Arc |
`options` | [IProposalQueryOptions](../interfaces/iproposalqueryoptions.md) |  {} | Search options, must implemeent IProposalQueryOptions |
`apolloQueryOptions` | [IApolloQueryOptions](../interfaces/iapolloqueryoptions.md) |  {} | - |

**Returns:** *Observable‹[Proposal](proposal.md)[]›*

An observable of lists of results

For example:
   Proposal.search({ stage: IProposalStage.Queued})

## Object literals

### `Static` fragments

### ▪ **fragments**: *object*

*Defined in [src/proposal.ts:110](https://github.com/dorgtech/client/blob/19b4373/src/proposal.ts#L110)*

###  ProposalFields

• **ProposalFields**: *DocumentNode* =  gql`fragment ProposalFields on Proposal {
      id
      accountsWithUnclaimedRewards
      boostedAt
      closingAt
      confidenceThreshold
      competition {
        id
        admin
        endTime
        contract
        suggestionsEndTime
        createdAt
        numberOfWinningSuggestions
        numberOfVotesPerVoters
        numberOfWinners
        rewardSplit
        snapshotBlock
        startTime
        totalSuggestions
        totalVotes
        votingStartTime

      }
      contributionReward {
        id
        beneficiary
        ethReward
        ethRewardLeft
        externalToken
        externalTokenReward
        externalTokenRewardLeft
        nativeTokenReward
        nativeTokenRewardLeft
        periods
        periodLength
        reputationReward
        reputationChangeLeft
        alreadyRedeemedReputationPeriods
        alreadyRedeemedExternalTokenPeriods
        alreadyRedeemedNativeTokenPeriods
        alreadyRedeemedEthPeriods
      }
      createdAt
      dao {
        id
        schemes {
          id
          address
        }
      }
      description
      descriptionHash
      executedAt
      executionState
      expiresInQueueAt
      genericScheme {
        id
        contractToCall
        callData
        executed
        returnValue
      }
      genesisProtocolParams {
        id
        activationTime
        boostedVotePeriodLimit
        daoBountyConst
        limitExponentValue
        minimumDaoBounty
        preBoostedVotePeriodLimit
        proposingRepReward
        queuedVotePeriodLimit
        queuedVoteRequiredPercentage
        quietEndingPeriod
        thresholdConst
        votersReputationLossRatio
      }
      gpRewards {
        id
      }
      scheme {
        ...SchemeFields
      }
      gpQueue {
        id
        threshold
        votingMachine
      }
      organizationId
      preBoostedAt
      proposer
      quietEndingPeriodBeganAt
      schemeRegistrar {
        id
        schemeToRegister
        schemeToRegisterParamsHash
        schemeToRegisterPermission
        schemeToRemove
        decision
        schemeRegistered
        schemeRemoved
      }
      stage
      # stakes { id }
      stakesFor
      stakesAgainst
      tags {
        id
      }
      totalRepWhenCreated
      totalRepWhenExecuted
      title
      url
      # votes { id }
      votesAgainst
      votesFor
      votingMachine
      winningOutcome
    }`

*Defined in [src/proposal.ts:111](https://github.com/dorgtech/client/blob/19b4373/src/proposal.ts#L111)*
