[@daostack/client](../README.md) › [Globals](../globals.md) › [ISchemeState](ischemestate.md)

# Interface: ISchemeState

## Hierarchy

* [ISchemeStaticState](ischemestaticstate.md)

  ↳ **ISchemeState**

## Index

### Properties

* [address](ischemestate.md#address)
* [canDelegateCall](ischemestate.md#candelegatecall)
* [canManageGlobalConstraints](ischemestate.md#canmanageglobalconstraints)
* [canRegisterSchemes](ischemestate.md#canregisterschemes)
* [canUpgradeController](ischemestate.md#canupgradecontroller)
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

*Defined in [scheme.ts:18](https://github.com/daostack/client/blob/e663b6a/src/scheme.ts#L18)*

___

###  canDelegateCall

• **canDelegateCall**: *boolean*

*Defined in [scheme.ts:26](https://github.com/daostack/client/blob/e663b6a/src/scheme.ts#L26)*

___

###  canManageGlobalConstraints

• **canManageGlobalConstraints**: *boolean*

*Defined in [scheme.ts:29](https://github.com/daostack/client/blob/e663b6a/src/scheme.ts#L29)*

___

###  canRegisterSchemes

• **canRegisterSchemes**: *boolean*

*Defined in [scheme.ts:27](https://github.com/daostack/client/blob/e663b6a/src/scheme.ts#L27)*

___

###  canUpgradeController

• **canUpgradeController**: *boolean*

*Defined in [scheme.ts:28](https://github.com/daostack/client/blob/e663b6a/src/scheme.ts#L28)*

___

### `Optional` contributionRewardParams

• **contributionRewardParams**? : *[IContributionRewardParams](icontributionrewardparams.md)*

*Defined in [scheme.ts:32](https://github.com/daostack/client/blob/e663b6a/src/scheme.ts#L32)*

___

###  dao

• **dao**: *[Address](../globals.md#address)*

*Overrides [ISchemeStaticState](ischemestaticstate.md).[dao](ischemestaticstate.md#dao)*

*Defined in [scheme.ts:30](https://github.com/daostack/client/blob/e663b6a/src/scheme.ts#L30)*

___

### `Optional` genericSchemeParams

• **genericSchemeParams**? : *[IGenericSchemeParams](igenericschemeparams.md)*

*Defined in [scheme.ts:33](https://github.com/daostack/client/blob/e663b6a/src/scheme.ts#L33)*

___

###  id

• **id**: *string*

*Inherited from [ISchemeStaticState](ischemestaticstate.md).[id](ischemestaticstate.md#id)*

*Defined in [scheme.ts:17](https://github.com/daostack/client/blob/e663b6a/src/scheme.ts#L17)*

___

###  name

• **name**: *string*

*Inherited from [ISchemeStaticState](ischemestaticstate.md).[name](ischemestaticstate.md#name)*

*Defined in [scheme.ts:20](https://github.com/daostack/client/blob/e663b6a/src/scheme.ts#L20)*

___

###  numberOfBoostedProposals

• **numberOfBoostedProposals**: *number*

*Defined in [scheme.ts:41](https://github.com/daostack/client/blob/e663b6a/src/scheme.ts#L41)*

___

###  numberOfPreBoostedProposals

• **numberOfPreBoostedProposals**: *number*

*Defined in [scheme.ts:40](https://github.com/daostack/client/blob/e663b6a/src/scheme.ts#L40)*

___

###  numberOfQueuedProposals

• **numberOfQueuedProposals**: *number*

*Defined in [scheme.ts:39](https://github.com/daostack/client/blob/e663b6a/src/scheme.ts#L39)*

___

###  paramsHash

• **paramsHash**: *string*

*Overrides [ISchemeStaticState](ischemestaticstate.md).[paramsHash](ischemestaticstate.md#paramshash)*

*Defined in [scheme.ts:31](https://github.com/daostack/client/blob/e663b6a/src/scheme.ts#L31)*

___

### `Optional` schemeParams

• **schemeParams**? : *[IGenericSchemeParams](igenericschemeparams.md) | [IContributionRewardParams](icontributionrewardparams.md) | [ISchemeRegisterParams](ischemeregisterparams.md)*

*Defined in [scheme.ts:43](https://github.com/daostack/client/blob/e663b6a/src/scheme.ts#L43)*

___

### `Optional` schemeRegistrarParams

• **schemeRegistrarParams**? : *object | null*

*Defined in [scheme.ts:34](https://github.com/daostack/client/blob/e663b6a/src/scheme.ts#L34)*

___

### `Optional` uGenericSchemeParams

• **uGenericSchemeParams**? : *[IGenericSchemeParams](igenericschemeparams.md)*

*Defined in [scheme.ts:42](https://github.com/daostack/client/blob/e663b6a/src/scheme.ts#L42)*

___

###  version

• **version**: *string*

*Inherited from [ISchemeStaticState](ischemestaticstate.md).[version](ischemestaticstate.md#version)*

*Defined in [scheme.ts:22](https://github.com/daostack/client/blob/e663b6a/src/scheme.ts#L22)*
