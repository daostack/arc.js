[@daostack/client - v0.2.64](../README.md) › [Globals](../globals.md) › [ReputationFromTokenScheme](reputationfromtokenscheme.md)

# Class: ReputationFromTokenScheme

## Hierarchy

* **ReputationFromTokenScheme**

## Index

### Constructors

* [constructor](reputationfromtokenscheme.md#constructor)

### Properties

* [scheme](reputationfromtokenscheme.md#scheme)

### Methods

* [getAgreementHash](reputationfromtokenscheme.md#getagreementhash)
* [getContract](reputationfromtokenscheme.md#getcontract)
* [redeem](reputationfromtokenscheme.md#redeem)

## Constructors

###  constructor

\+ **new ReputationFromTokenScheme**(`scheme`: [SchemeBase](schemebase.md)): *[ReputationFromTokenScheme](reputationfromtokenscheme.md)*

*Defined in [src/schemes/reputationFromToken.ts:14](https://github.com/daostack/client/blob/9d69996/src/schemes/reputationFromToken.ts#L14)*

**Parameters:**

Name | Type |
------ | ------ |
`scheme` | [SchemeBase](schemebase.md) |

**Returns:** *[ReputationFromTokenScheme](reputationfromtokenscheme.md)*

## Properties

###  scheme

• **scheme**: *[SchemeBase](schemebase.md)*

*Defined in [src/schemes/reputationFromToken.ts:16](https://github.com/daostack/client/blob/9d69996/src/schemes/reputationFromToken.ts#L16)*

## Methods

###  getAgreementHash

▸ **getAgreementHash**(): *Promise‹string›*

*Defined in [src/schemes/reputationFromToken.ts:20](https://github.com/daostack/client/blob/9d69996/src/schemes/reputationFromToken.ts#L20)*

**Returns:** *Promise‹string›*

___

###  getContract

▸ **getContract**(): *Promise‹Contract‹››*

*Defined in [src/schemes/reputationFromToken.ts:60](https://github.com/daostack/client/blob/9d69996/src/schemes/reputationFromToken.ts#L60)*

**Returns:** *Promise‹Contract‹››*

___

###  redeem

▸ **redeem**(`beneficiary`: [Address](../globals.md#address), `agreementHash?`: undefined | string): *[Operation](../globals.md#operation)‹undefined›*

*Defined in [src/schemes/reputationFromToken.ts:26](https://github.com/daostack/client/blob/9d69996/src/schemes/reputationFromToken.ts#L26)*

**Parameters:**

Name | Type |
------ | ------ |
`beneficiary` | [Address](../globals.md#address) |
`agreementHash?` | undefined &#124; string |

**Returns:** *[Operation](../globals.md#operation)‹undefined›*
