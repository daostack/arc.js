[@daostack/arc.js - v2.0.0-experimental.1](../README.md) › [Globals](../globals.md) › [IPFSClient](ipfsarc.js.md)

# Class: IPFSClient

## Hierarchy

* **IPFSClient**

## Index

### Constructors

* [constructor](ipfsarc.js.md#constructor)

### Properties

* [baseUrl](ipfsarc.js.md#baseurl)

### Accessors

* [ipfsUrl](ipfsarc.js.md#ipfsurl)

### Methods

* [addAndPinString](ipfsarc.js.md#addandpinstring)
* [addString](ipfsarc.js.md#addstring)
* [cat](ipfsarc.js.md#cat)
* [pinHash](ipfsarc.js.md#pinhash)

## Constructors

###  constructor

\+ **new IPFSClient**(`ipfsUrl`: string): *[IPFSClient](ipfsarc.js.md)*

*Defined in [src/ipfsClient.ts:6](https://github.com/daostack/arc.js/blob/6c661ff/src/ipfsClient.ts#L6)*

**Parameters:**

Name | Type |
------ | ------ |
`ipfsUrl` | string |

**Returns:** *[IPFSClient](ipfsarc.js.md)*

## Properties

###  baseUrl

• **baseUrl**: *string*

*Defined in [src/ipfsClient.ts:6](https://github.com/daostack/arc.js/blob/6c661ff/src/ipfsClient.ts#L6)*

## Accessors

###  ipfsUrl

• **get ipfsUrl**(): *string*

*Defined in [src/ipfsClient.ts:12](https://github.com/daostack/arc.js/blob/6c661ff/src/ipfsClient.ts#L12)*

**Returns:** *string*

## Methods

###  addAndPinString

▸ **addAndPinString**(`data`: string): *Promise‹any›*

*Defined in [src/ipfsClient.ts:63](https://github.com/daostack/arc.js/blob/6c661ff/src/ipfsClient.ts#L63)*

**Parameters:**

Name | Type |
------ | ------ |
`data` | string |

**Returns:** *Promise‹any›*

___

###  addString

▸ **addString**(`data`: string): *Promise‹any›*

*Defined in [src/ipfsClient.ts:31](https://github.com/daostack/arc.js/blob/6c661ff/src/ipfsClient.ts#L31)*

**Parameters:**

Name | Type |
------ | ------ |
`data` | string |

**Returns:** *Promise‹any›*

___

###  cat

▸ **cat**(`hash`: string): *Promise‹any›*

*Defined in [src/ipfsClient.ts:16](https://github.com/daostack/arc.js/blob/6c661ff/src/ipfsClient.ts#L16)*

**Parameters:**

Name | Type |
------ | ------ |
`hash` | string |

**Returns:** *Promise‹any›*

___

###  pinHash

▸ **pinHash**(`hash`: string): *Promise‹void›*

*Defined in [src/ipfsClient.ts:47](https://github.com/daostack/arc.js/blob/6c661ff/src/ipfsClient.ts#L47)*

**Parameters:**

Name | Type |
------ | ------ |
`hash` | string |

**Returns:** *Promise‹void›*
