[@daostack/client - v2.0.0-experimental.1](../README.md) › [Globals](../globals.md) › [IProposalCreateOptionsCR](iproposalcreateoptionscr.md)

# Interface: IProposalCreateOptionsCR

## Hierarchy

* [IProposalBaseCreateOptions](iproposalbasecreateoptions.md)

  ↳ **IProposalCreateOptionsCR**

## Index

### Properties

* [beneficiary](iproposalcreateoptionscr.md#beneficiary)
* [dao](iproposalcreateoptionscr.md#dao)
* [description](iproposalcreateoptionscr.md#optional-description)
* [descriptionHash](iproposalcreateoptionscr.md#optional-descriptionhash)
* [ethReward](iproposalcreateoptionscr.md#optional-ethreward)
* [externalTokenAddress](iproposalcreateoptionscr.md#optional-externaltokenaddress)
* [externalTokenReward](iproposalcreateoptionscr.md#optional-externaltokenreward)
* [nativeTokenReward](iproposalcreateoptionscr.md#optional-nativetokenreward)
* [periodLength](iproposalcreateoptionscr.md#optional-periodlength)
* [periods](iproposalcreateoptionscr.md#optional-periods)
* [proposalType](iproposalcreateoptionscr.md#optional-proposaltype)
* [reputationReward](iproposalcreateoptionscr.md#optional-reputationreward)
* [scheme](iproposalcreateoptionscr.md#optional-scheme)
* [tags](iproposalcreateoptionscr.md#optional-tags)
* [title](iproposalcreateoptionscr.md#optional-title)
* [url](iproposalcreateoptionscr.md#optional-url)

## Properties

###  beneficiary

• **beneficiary**: *[Address](../globals.md#address)*

*Defined in [src/schemes/contributionReward.ts:32](https://github.com/daostack/client/blob/6c661ff/src/schemes/contributionReward.ts#L32)*

___

###  dao

• **dao**: *[Address](../globals.md#address)*

*Inherited from [IProposalBaseCreateOptions](iproposalbasecreateoptions.md).[dao](iproposalbasecreateoptions.md#dao)*

*Defined in [src/proposal.ts:961](https://github.com/daostack/client/blob/6c661ff/src/proposal.ts#L961)*

___

### `Optional` description

• **description**? : *undefined | string*

*Inherited from [IProposalBaseCreateOptions](iproposalbasecreateoptions.md).[description](iproposalbasecreateoptions.md#optional-description)*

*Defined in [src/proposal.ts:962](https://github.com/daostack/client/blob/6c661ff/src/proposal.ts#L962)*

___

### `Optional` descriptionHash

• **descriptionHash**? : *undefined | string*

*Inherited from [IProposalBaseCreateOptions](iproposalbasecreateoptions.md).[descriptionHash](iproposalbasecreateoptions.md#optional-descriptionhash)*

*Defined in [src/proposal.ts:963](https://github.com/daostack/client/blob/6c661ff/src/proposal.ts#L963)*

___

### `Optional` ethReward

• **ethReward**? : *BN*

*Defined in [src/schemes/contributionReward.ts:35](https://github.com/daostack/client/blob/6c661ff/src/schemes/contributionReward.ts#L35)*

___

### `Optional` externalTokenAddress

• **externalTokenAddress**? : *[Address](../globals.md#address)*

*Defined in [src/schemes/contributionReward.ts:37](https://github.com/daostack/client/blob/6c661ff/src/schemes/contributionReward.ts#L37)*

___

### `Optional` externalTokenReward

• **externalTokenReward**? : *BN*

*Defined in [src/schemes/contributionReward.ts:36](https://github.com/daostack/client/blob/6c661ff/src/schemes/contributionReward.ts#L36)*

___

### `Optional` nativeTokenReward

• **nativeTokenReward**? : *BN*

*Defined in [src/schemes/contributionReward.ts:33](https://github.com/daostack/client/blob/6c661ff/src/schemes/contributionReward.ts#L33)*

___

### `Optional` periodLength

• **periodLength**? : *undefined | number*

*Defined in [src/schemes/contributionReward.ts:38](https://github.com/daostack/client/blob/6c661ff/src/schemes/contributionReward.ts#L38)*

___

### `Optional` periods

• **periods**? : *any*

*Defined in [src/schemes/contributionReward.ts:39](https://github.com/daostack/client/blob/6c661ff/src/schemes/contributionReward.ts#L39)*

___

### `Optional` proposalType

• **proposalType**? : *[IProposalType](../globals.md#const-iproposaltype) | "competition"*

*Inherited from [IProposalBaseCreateOptions](iproposalbasecreateoptions.md).[proposalType](iproposalbasecreateoptions.md#optional-proposaltype)*

*Defined in [src/proposal.ts:968](https://github.com/daostack/client/blob/6c661ff/src/proposal.ts#L968)*

___

### `Optional` reputationReward

• **reputationReward**? : *BN*

*Defined in [src/schemes/contributionReward.ts:34](https://github.com/daostack/client/blob/6c661ff/src/schemes/contributionReward.ts#L34)*

___

### `Optional` scheme

• **scheme**? : *[Address](../globals.md#address)*

*Inherited from [IProposalBaseCreateOptions](iproposalbasecreateoptions.md).[scheme](iproposalbasecreateoptions.md#optional-scheme)*

*Defined in [src/proposal.ts:966](https://github.com/daostack/client/blob/6c661ff/src/proposal.ts#L966)*

___

### `Optional` tags

• **tags**? : *string[]*

*Inherited from [IProposalBaseCreateOptions](iproposalbasecreateoptions.md).[tags](iproposalbasecreateoptions.md#optional-tags)*

*Defined in [src/proposal.ts:965](https://github.com/daostack/client/blob/6c661ff/src/proposal.ts#L965)*

___

### `Optional` title

• **title**? : *undefined | string*

*Inherited from [IProposalBaseCreateOptions](iproposalbasecreateoptions.md).[title](iproposalbasecreateoptions.md#optional-title)*

*Defined in [src/proposal.ts:964](https://github.com/daostack/client/blob/6c661ff/src/proposal.ts#L964)*

___

### `Optional` url

• **url**? : *undefined | string*

*Inherited from [IProposalBaseCreateOptions](iproposalbasecreateoptions.md).[url](iproposalbasecreateoptions.md#optional-url)*

*Defined in [src/proposal.ts:967](https://github.com/daostack/client/blob/6c661ff/src/proposal.ts#L967)*
