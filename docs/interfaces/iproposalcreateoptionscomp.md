[@daostack/client - v0.2.64](../README.md) › [Globals](../globals.md) › [IProposalCreateOptionsComp](iproposalcreateoptionscomp.md)

# Interface: IProposalCreateOptionsComp

## Hierarchy

* [IProposalBaseCreateOptions](iproposalbasecreateoptions.md)

  ↳ **IProposalCreateOptionsComp**

## Index

### Properties

* [dao](iproposalcreateoptionscomp.md#dao)
* [description](iproposalcreateoptionscomp.md#optional-description)
* [descriptionHash](iproposalcreateoptionscomp.md#optional-descriptionhash)
* [endTime](iproposalcreateoptionscomp.md#endtime)
* [ethReward](iproposalcreateoptionscomp.md#optional-ethreward)
* [externalTokenAddress](iproposalcreateoptionscomp.md#optional-externaltokenaddress)
* [externalTokenReward](iproposalcreateoptionscomp.md#optional-externaltokenreward)
* [nativeTokenReward](iproposalcreateoptionscomp.md#optional-nativetokenreward)
* [numberOfVotesPerVoter](iproposalcreateoptionscomp.md#numberofvotespervoter)
* [proposalType](iproposalcreateoptionscomp.md#optional-proposaltype)
* [proposerIsAdmin](iproposalcreateoptionscomp.md#optional-proposerisadmin)
* [reputationReward](iproposalcreateoptionscomp.md#optional-reputationreward)
* [rewardSplit](iproposalcreateoptionscomp.md#rewardsplit)
* [scheme](iproposalcreateoptionscomp.md#optional-scheme)
* [startTime](iproposalcreateoptionscomp.md#starttime)
* [suggestionsEndTime](iproposalcreateoptionscomp.md#suggestionsendtime)
* [tags](iproposalcreateoptionscomp.md#optional-tags)
* [title](iproposalcreateoptionscomp.md#optional-title)
* [url](iproposalcreateoptionscomp.md#optional-url)
* [votingStartTime](iproposalcreateoptionscomp.md#votingstarttime)

## Properties

###  dao

• **dao**: *[Address](../globals.md#address)*

*Inherited from [IProposalBaseCreateOptions](iproposalbasecreateoptions.md).[dao](iproposalbasecreateoptions.md#dao)*

*Defined in [src/proposal.ts:959](https://github.com/dorgtech/client/blob/19b4373/src/proposal.ts#L959)*

___

### `Optional` description

• **description**? : *undefined | string*

*Inherited from [IProposalBaseCreateOptions](iproposalbasecreateoptions.md).[description](iproposalbasecreateoptions.md#optional-description)*

*Defined in [src/proposal.ts:960](https://github.com/dorgtech/client/blob/19b4373/src/proposal.ts#L960)*

___

### `Optional` descriptionHash

• **descriptionHash**? : *undefined | string*

*Inherited from [IProposalBaseCreateOptions](iproposalbasecreateoptions.md).[descriptionHash](iproposalbasecreateoptions.md#optional-descriptionhash)*

*Defined in [src/proposal.ts:961](https://github.com/dorgtech/client/blob/19b4373/src/proposal.ts#L961)*

___

###  endTime

• **endTime**: *Date*

*Defined in [src/schemes/competition.ts:56](https://github.com/dorgtech/client/blob/19b4373/src/schemes/competition.ts#L56)*

___

### `Optional` ethReward

• **ethReward**? : *BN*

*Defined in [src/schemes/competition.ts:58](https://github.com/dorgtech/client/blob/19b4373/src/schemes/competition.ts#L58)*

___

### `Optional` externalTokenAddress

• **externalTokenAddress**? : *[Address](../globals.md#address)*

*Defined in [src/schemes/competition.ts:60](https://github.com/dorgtech/client/blob/19b4373/src/schemes/competition.ts#L60)*

___

### `Optional` externalTokenReward

• **externalTokenReward**? : *BN*

*Defined in [src/schemes/competition.ts:59](https://github.com/dorgtech/client/blob/19b4373/src/schemes/competition.ts#L59)*

___

### `Optional` nativeTokenReward

• **nativeTokenReward**? : *BN*

*Defined in [src/schemes/competition.ts:63](https://github.com/dorgtech/client/blob/19b4373/src/schemes/competition.ts#L63)*

___

###  numberOfVotesPerVoter

• **numberOfVotesPerVoter**: *number*

*Defined in [src/schemes/competition.ts:64](https://github.com/dorgtech/client/blob/19b4373/src/schemes/competition.ts#L64)*

___

### `Optional` proposalType

• **proposalType**? : *[IProposalType](../globals.md#const-iproposaltype) | "competition"*

*Inherited from [IProposalBaseCreateOptions](iproposalbasecreateoptions.md).[proposalType](iproposalbasecreateoptions.md#optional-proposaltype)*

*Defined in [src/proposal.ts:966](https://github.com/dorgtech/client/blob/19b4373/src/proposal.ts#L966)*

___

### `Optional` proposerIsAdmin

• **proposerIsAdmin**? : *undefined | false | true*

*Defined in [src/schemes/competition.ts:65](https://github.com/dorgtech/client/blob/19b4373/src/schemes/competition.ts#L65)*

___

### `Optional` reputationReward

• **reputationReward**? : *BN*

*Defined in [src/schemes/competition.ts:57](https://github.com/dorgtech/client/blob/19b4373/src/schemes/competition.ts#L57)*

___

###  rewardSplit

• **rewardSplit**: *number[]*

*Defined in [src/schemes/competition.ts:62](https://github.com/dorgtech/client/blob/19b4373/src/schemes/competition.ts#L62)*

___

### `Optional` scheme

• **scheme**? : *[Address](../globals.md#address)*

*Inherited from [IProposalBaseCreateOptions](iproposalbasecreateoptions.md).[scheme](iproposalbasecreateoptions.md#optional-scheme)*

*Defined in [src/proposal.ts:964](https://github.com/dorgtech/client/blob/19b4373/src/proposal.ts#L964)*

___

###  startTime

• **startTime**: *Date | null*

*Defined in [src/schemes/competition.ts:66](https://github.com/dorgtech/client/blob/19b4373/src/schemes/competition.ts#L66)*

___

###  suggestionsEndTime

• **suggestionsEndTime**: *Date*

*Defined in [src/schemes/competition.ts:67](https://github.com/dorgtech/client/blob/19b4373/src/schemes/competition.ts#L67)*

___

### `Optional` tags

• **tags**? : *string[]*

*Inherited from [IProposalBaseCreateOptions](iproposalbasecreateoptions.md).[tags](iproposalbasecreateoptions.md#optional-tags)*

*Defined in [src/proposal.ts:963](https://github.com/dorgtech/client/blob/19b4373/src/proposal.ts#L963)*

___

### `Optional` title

• **title**? : *undefined | string*

*Inherited from [IProposalBaseCreateOptions](iproposalbasecreateoptions.md).[title](iproposalbasecreateoptions.md#optional-title)*

*Defined in [src/proposal.ts:962](https://github.com/dorgtech/client/blob/19b4373/src/proposal.ts#L962)*

___

### `Optional` url

• **url**? : *undefined | string*

*Inherited from [IProposalBaseCreateOptions](iproposalbasecreateoptions.md).[url](iproposalbasecreateoptions.md#optional-url)*

*Defined in [src/proposal.ts:965](https://github.com/dorgtech/client/blob/19b4373/src/proposal.ts#L965)*

___

###  votingStartTime

• **votingStartTime**: *Date*

*Defined in [src/schemes/competition.ts:68](https://github.com/dorgtech/client/blob/19b4373/src/schemes/competition.ts#L68)*
