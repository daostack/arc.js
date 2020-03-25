[@daostack/client - v0.2.64](../README.md) › [Globals](../globals.md) › [ISchemeState](ischemestate.md)

# Interface: ISchemeState

## Hierarchy

* [ISchemeStaticState](ischemestaticstate.md)

* ISchemeStaticState

  ↳ **ISchemeState**

## Index

### Properties

* [address](ischemestate.md#address)
* [canDelegateCall](ischemestate.md#candelegatecall)
* [canManageGlobalConstraints](ischemestate.md#canmanageglobalconstraints)
* [canRegisterSchemes](ischemestate.md#canregisterschemes)
* [canUpgradeController](ischemestate.md#canupgradecontroller)
* [contributionRewardExtParams](ischemestate.md#optional-contributionrewardextparams)
* [contributionRewardParams](ischemestate.md#optional-contributionrewardparams)
* [dao](ischemestate.md#dao)
* [genericSchemeParams](ischemestate.md#optional-genericschemeparams)
* [id](ischemestate.md#id)
* [name](ischemestate.md#name)
* [numberOfBoostedProposals](ischemestate.md#numberofboostedproposals)
* [numberOfPreBoostedProposals](ischemestate.md#numberofpreboostedproposals)
* [numberOfQueuedProposals](ischemestate.md#numberofqueuedproposals)
* [paramsHash](ischemestate.md#paramshash)
* [schemeParams](ischemestate.md#optional-schemeparams)
* [schemeRegistrarParams](ischemestate.md#optional-schemeregistrarparams)
* [uGenericSchemeParams](ischemestate.md#optional-ugenericschemeparams)
* [version](ischemestate.md#version)

## Properties

###  address

• **address**: *[Address](../globals.md#address)*

*Inherited from [ISchemeStaticState](ischemestaticstate.md).[address](ischemestaticstate.md#address)*

*Overrides void*

*Defined in [src/schemes/base.ts:27](https://github.com/dorgtech/client/blob/74940d1/src/schemes/base.ts#L27)*

___

###  canDelegateCall

• **canDelegateCall**: *boolean*

*Defined in [src/schemes/base.ts:35](https://github.com/dorgtech/client/blob/74940d1/src/schemes/base.ts#L35)*

*Defined in [src/scheme.ts:37](https://github.com/dorgtech/client/blob/74940d1/src/scheme.ts#L37)*

___

###  canManageGlobalConstraints

• **canManageGlobalConstraints**: *boolean*

*Defined in [src/schemes/base.ts:38](https://github.com/dorgtech/client/blob/74940d1/src/schemes/base.ts#L38)*

*Defined in [src/scheme.ts:40](https://github.com/dorgtech/client/blob/74940d1/src/scheme.ts#L40)*

___

###  canRegisterSchemes

• **canRegisterSchemes**: *boolean*

*Defined in [src/schemes/base.ts:36](https://github.com/dorgtech/client/blob/74940d1/src/schemes/base.ts#L36)*

*Defined in [src/scheme.ts:38](https://github.com/dorgtech/client/blob/74940d1/src/scheme.ts#L38)*

___

###  canUpgradeController

• **canUpgradeController**: *boolean*

*Defined in [src/schemes/base.ts:37](https://github.com/dorgtech/client/blob/74940d1/src/schemes/base.ts#L37)*

*Defined in [src/scheme.ts:39](https://github.com/dorgtech/client/blob/74940d1/src/scheme.ts#L39)*

___

### `Optional` contributionRewardExtParams

• **contributionRewardExtParams**? : *[IContributionRewardExtParams](icontributionrewardextparams.md)*

*Defined in [src/schemes/base.ts:42](https://github.com/dorgtech/client/blob/74940d1/src/schemes/base.ts#L42)*

*Defined in [src/scheme.ts:44](https://github.com/dorgtech/client/blob/74940d1/src/scheme.ts#L44)*

___

### `Optional` contributionRewardParams

• **contributionRewardParams**? : *[IContributionRewardParams](icontributionrewardparams.md)*

*Defined in [src/schemes/base.ts:41](https://github.com/dorgtech/client/blob/74940d1/src/schemes/base.ts#L41)*

*Defined in [src/scheme.ts:43](https://github.com/dorgtech/client/blob/74940d1/src/scheme.ts#L43)*

___

###  dao

• **dao**: *[Address](../globals.md#address)*

*Overrides [ISchemeStaticState](ischemestaticstate.md).[dao](ischemestaticstate.md#dao)*

*Defined in [src/schemes/base.ts:39](https://github.com/dorgtech/client/blob/74940d1/src/schemes/base.ts#L39)*

*Defined in [src/scheme.ts:41](https://github.com/dorgtech/client/blob/74940d1/src/scheme.ts#L41)*

___

### `Optional` genericSchemeParams

• **genericSchemeParams**? : *[IGenericSchemeParams](igenericschemeparams.md)*

*Defined in [src/schemes/base.ts:43](https://github.com/dorgtech/client/blob/74940d1/src/schemes/base.ts#L43)*

*Defined in [src/scheme.ts:45](https://github.com/dorgtech/client/blob/74940d1/src/scheme.ts#L45)*

___

###  id

• **id**: *string*

*Inherited from [ISchemeStaticState](ischemestaticstate.md).[id](ischemestaticstate.md#id)*

*Overrides void*

*Defined in [src/schemes/base.ts:26](https://github.com/dorgtech/client/blob/74940d1/src/schemes/base.ts#L26)*

___

###  name

• **name**: *string*

*Inherited from [ISchemeStaticState](ischemestaticstate.md).[name](ischemestaticstate.md#name)*

*Overrides void*

*Defined in [src/schemes/base.ts:29](https://github.com/dorgtech/client/blob/74940d1/src/schemes/base.ts#L29)*

___

###  numberOfBoostedProposals

• **numberOfBoostedProposals**: *number*

*Defined in [src/schemes/base.ts:51](https://github.com/dorgtech/client/blob/74940d1/src/schemes/base.ts#L51)*

*Defined in [src/scheme.ts:53](https://github.com/dorgtech/client/blob/74940d1/src/scheme.ts#L53)*

___

###  numberOfPreBoostedProposals

• **numberOfPreBoostedProposals**: *number*

*Defined in [src/schemes/base.ts:50](https://github.com/dorgtech/client/blob/74940d1/src/schemes/base.ts#L50)*

*Defined in [src/scheme.ts:52](https://github.com/dorgtech/client/blob/74940d1/src/scheme.ts#L52)*

___

###  numberOfQueuedProposals

• **numberOfQueuedProposals**: *number*

*Defined in [src/schemes/base.ts:49](https://github.com/dorgtech/client/blob/74940d1/src/schemes/base.ts#L49)*

*Defined in [src/scheme.ts:51](https://github.com/dorgtech/client/blob/74940d1/src/scheme.ts#L51)*

___

###  paramsHash

• **paramsHash**: *string*

*Overrides [ISchemeStaticState](ischemestaticstate.md).[paramsHash](ischemestaticstate.md#paramshash)*

*Defined in [src/schemes/base.ts:40](https://github.com/dorgtech/client/blob/74940d1/src/schemes/base.ts#L40)*

*Defined in [src/scheme.ts:42](https://github.com/dorgtech/client/blob/74940d1/src/scheme.ts#L42)*

___

### `Optional` schemeParams

• **schemeParams**? : *IGenericSchemeParams | IContributionRewardParams | IContributionRewardExtParams | ISchemeRegisterParams*

*Defined in [src/schemes/base.ts:53](https://github.com/dorgtech/client/blob/74940d1/src/schemes/base.ts#L53)*

*Defined in [src/scheme.ts:55](https://github.com/dorgtech/client/blob/74940d1/src/scheme.ts#L55)*

___

### `Optional` schemeRegistrarParams

• **schemeRegistrarParams**? : *object | null*

*Defined in [src/schemes/base.ts:44](https://github.com/dorgtech/client/blob/74940d1/src/schemes/base.ts#L44)*

*Defined in [src/scheme.ts:46](https://github.com/dorgtech/client/blob/74940d1/src/scheme.ts#L46)*

___

### `Optional` uGenericSchemeParams

• **uGenericSchemeParams**? : *[IGenericSchemeParams](igenericschemeparams.md)*

*Defined in [src/schemes/base.ts:52](https://github.com/dorgtech/client/blob/74940d1/src/schemes/base.ts#L52)*

*Defined in [src/scheme.ts:54](https://github.com/dorgtech/client/blob/74940d1/src/scheme.ts#L54)*

___

###  version

• **version**: *string*

*Inherited from [ISchemeStaticState](ischemestaticstate.md).[version](ischemestaticstate.md#version)*

*Overrides void*

*Defined in [src/schemes/base.ts:31](https://github.com/dorgtech/client/blob/74940d1/src/schemes/base.ts#L31)*
