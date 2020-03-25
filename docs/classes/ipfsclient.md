[@daostack/client - v0.2.64](../README.md) › [Globals](../globals.md) › [IPFSClient](ipfsclient.md)

# Class: IPFSClient

## Hierarchy

* **IPFSClient**

## Index

### Constructors

* [constructor](ipfsclient.md#constructor)

### Properties

* [baseUrl](ipfsclient.md#baseurl)

### Accessors

* [ipfsUrl](ipfsclient.md#ipfsurl)

### Methods

* [addAndPinString](ipfsclient.md#addandpinstring)
* [addString](ipfsclient.md#addstring)
* [cat](ipfsclient.md#cat)
* [pinHash](ipfsclient.md#pinhash)

## Constructors

###  constructor

\+ **new IPFSClient**(`ipfsUrl`: string): *[IPFSClient](ipfsclient.md)*

*Defined in [src/ipfsClient.ts:6](https://github.com/dorgtech/client/blob/74940d1/src/ipfsClient.ts#L6)*

**Parameters:**

Name | Type |
------ | ------ |
`ipfsUrl` | string |

**Returns:** *[IPFSClient](ipfsclient.md)*

## Properties

###  baseUrl

• **baseUrl**: *string*

*Defined in [src/ipfsClient.ts:6](https://github.com/dorgtech/client/blob/74940d1/src/ipfsClient.ts#L6)*

## Accessors

###  ipfsUrl

• **get ipfsUrl**(): *string*

*Defined in [src/ipfsClient.ts:12](https://github.com/dorgtech/client/blob/74940d1/src/ipfsClient.ts#L12)*

**Returns:** *string*

## Methods

###  addAndPinString

▸ **addAndPinString**(`data`: string): *Promise‹any›*

*Defined in [src/ipfsClient.ts:63](https://github.com/dorgtech/client/blob/74940d1/src/ipfsClient.ts#L63)*

**Parameters:**

Name | Type |
------ | ------ |
`data` | string |

**Returns:** *Promise‹any›*

___

###  addString

▸ **addString**(`data`: string): *Promise‹any›*

*Defined in [src/ipfsClient.ts:31](https://github.com/dorgtech/client/blob/74940d1/src/ipfsClient.ts#L31)*

**Parameters:**

Name | Type |
------ | ------ |
`data` | string |

**Returns:** *Promise‹any›*

___

###  cat

▸ **cat**(`hash`: string): *Promise‹any›*

*Defined in [src/ipfsClient.ts:16](https://github.com/dorgtech/client/blob/74940d1/src/ipfsClient.ts#L16)*

**Parameters:**

Name | Type |
------ | ------ |
`hash` | string |

**Returns:** *Promise‹any›*

___

###  pinHash

▸ **pinHash**(`hash`: string): *Promise‹void›*

*Defined in [src/ipfsClient.ts:47](https://github.com/dorgtech/client/blob/74940d1/src/ipfsClient.ts#L47)*

**Parameters:**

Name | Type |
------ | ------ |
`hash` | string |

**Returns:** *Promise‹void›*
