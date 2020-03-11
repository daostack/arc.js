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
* [schemeParams](ischemestate.md#optional-schemeparams)
* [schemeRegistrarParams](ischemestate.md#optional-schemeregistrarparams)
* [version](ischemestate.md#version)

## Properties

###  address

• **address**: *[Address](../globals.md#address)*

*Inherited from [ISchemeStaticState](ischemestaticstate.md).[address](ischemestaticstate.md#address)*

*Overrides void*

*Defined in [src/schemes/base.ts:15](https://github.com/daostack/client/blob/b547acc/src/schemes/base.ts#L15)*

___

###  canDelegateCall

• **canDelegateCall**: *boolean*

*Defined in [src/schemes/base.ts:22](https://github.com/daostack/client/blob/b547acc/src/schemes/base.ts#L22)*

*Defined in [src/scheme.ts:28](https://github.com/daostack/client/blob/b547acc/src/scheme.ts#L28)*

___

###  canManageGlobalConstraints

• **canManageGlobalConstraints**: *boolean*

*Defined in [src/schemes/base.ts:25](https://github.com/daostack/client/blob/b547acc/src/schemes/base.ts#L25)*

*Defined in [src/scheme.ts:31](https://github.com/daostack/client/blob/b547acc/src/scheme.ts#L31)*

___

###  canRegisterSchemes

• **canRegisterSchemes**: *boolean*

*Defined in [src/schemes/base.ts:23](https://github.com/daostack/client/blob/b547acc/src/schemes/base.ts#L23)*

*Defined in [src/scheme.ts:29](https://github.com/daostack/client/blob/b547acc/src/scheme.ts#L29)*

___

###  canUpgradeController

• **canUpgradeController**: *boolean*

*Defined in [src/schemes/base.ts:24](https://github.com/daostack/client/blob/b547acc/src/schemes/base.ts#L24)*

*Defined in [src/scheme.ts:30](https://github.com/daostack/client/blob/b547acc/src/scheme.ts#L30)*

___

### `Optional` contributionRewardExtParams

• **contributionRewardExtParams**? : *[IContributionRewardExtParams](icontributionrewardextparams.md)*

*Defined in [src/schemes/base.ts:28](https://github.com/daostack/client/blob/b547acc/src/schemes/base.ts#L28)*

*Defined in [src/scheme.ts:34](https://github.com/daostack/client/blob/b547acc/src/scheme.ts#L34)*

___

### `Optional` contributionRewardParams

• **contributionRewardParams**? : *[IContributionRewardParams](icontributionrewardparams.md)*

*Defined in [src/schemes/base.ts:27](https://github.com/daostack/client/blob/b547acc/src/schemes/base.ts#L27)*

*Defined in [src/scheme.ts:33](https://github.com/daostack/client/blob/b547acc/src/scheme.ts#L33)*

___

###  dao

• **dao**: *[Address](../globals.md#address)*

*Overrides [ISchemeStaticState](ischemestaticstate.md).[dao](ischemestaticstate.md#dao)*

*Defined in [src/schemes/base.ts:26](https://github.com/daostack/client/blob/b547acc/src/schemes/base.ts#L26)*

*Defined in [src/scheme.ts:32](https://github.com/daostack/client/blob/b547acc/src/scheme.ts#L32)*

___

### `Optional` genericSchemeParams

• **genericSchemeParams**? : *[IGenericSchemeParams](igenericschemeparams.md)*

*Defined in [src/schemes/base.ts:29](https://github.com/daostack/client/blob/b547acc/src/schemes/base.ts#L29)*

*Defined in [src/scheme.ts:35](https://github.com/daostack/client/blob/b547acc/src/scheme.ts#L35)*

___

###  id

• **id**: *string*

*Inherited from [ISchemeStaticState](ischemestaticstate.md).[id](ischemestaticstate.md#id)*

*Overrides void*

*Defined in [src/schemes/base.ts:14](https://github.com/daostack/client/blob/b547acc/src/schemes/base.ts#L14)*

___

###  name

• **name**: *string*

*Inherited from [ISchemeStaticState](ischemestaticstate.md).[name](ischemestaticstate.md#name)*

*Overrides void*

*Defined in [src/schemes/base.ts:17](https://github.com/daostack/client/blob/b547acc/src/schemes/base.ts#L17)*

___

###  numberOfBoostedProposals

• **numberOfBoostedProposals**: *number*

*Defined in [src/schemes/base.ts:37](https://github.com/daostack/client/blob/b547acc/src/schemes/base.ts#L37)*

*Defined in [src/scheme.ts:43](https://github.com/daostack/client/blob/b547acc/src/scheme.ts#L43)*

___

###  numberOfPreBoostedProposals

• **numberOfPreBoostedProposals**: *number*

*Defined in [src/schemes/base.ts:36](https://github.com/daostack/client/blob/b547acc/src/schemes/base.ts#L36)*

*Defined in [src/scheme.ts:42](https://github.com/daostack/client/blob/b547acc/src/scheme.ts#L42)*

___

###  numberOfQueuedProposals

• **numberOfQueuedProposals**: *number*

*Defined in [src/schemes/base.ts:35](https://github.com/daostack/client/blob/b547acc/src/schemes/base.ts#L35)*

*Defined in [src/scheme.ts:41](https://github.com/daostack/client/blob/b547acc/src/scheme.ts#L41)*

___

### `Optional` schemeParams

• **schemeParams**? : *IGenericSchemeParams | IContributionRewardParams | IContributionRewardExtParams | ISchemeRegisterParams*

*Defined in [src/schemes/base.ts:38](https://github.com/daostack/client/blob/b547acc/src/schemes/base.ts#L38)*

*Defined in [src/scheme.ts:44](https://github.com/daostack/client/blob/b547acc/src/scheme.ts#L44)*

___

### `Optional` schemeRegistrarParams

• **schemeRegistrarParams**? : *object | null*

*Defined in [src/schemes/base.ts:30](https://github.com/daostack/client/blob/b547acc/src/schemes/base.ts#L30)*

*Defined in [src/scheme.ts:36](https://github.com/daostack/client/blob/b547acc/src/scheme.ts#L36)*

___

###  version

• **version**: *string*

*Inherited from [ISchemeStaticState](ischemestaticstate.md).[version](ischemestaticstate.md#version)*

*Overrides void*

*Defined in [src/schemes/base.ts:18](https://github.com/daostack/client/blob/b547acc/src/schemes/base.ts#L18)*
