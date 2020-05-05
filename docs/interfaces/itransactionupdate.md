[@daostack/arc.js - v2.0.0-experimental.1](../README.md) › [Globals](../globals.md) › [ITransactionUpdate](itransactionupdate.md)

# Interface: ITransactionUpdate <**T**>

A transaction update is a snapshot of the state of a transaction at a particular time.

## Type parameters

▪ **T**

## Hierarchy

* **ITransactionUpdate**

## Index

### Properties

* [confirmations](itransactionupdate.md#optional-confirmations)
* [receipt](itransactionupdate.md#optional-receipt)
* [result](itransactionupdate.md#optional-result)
* [state](itransactionupdate.md#state)
* [transactionHash](itransactionupdate.md#optional-transactionhash)

## Properties

### `Optional` confirmations

• **confirmations**? : *undefined | number*

*Defined in [src/operation.ts:45](https://github.com/daostack/arc.js/blob/6c661ff/src/operation.ts#L45)*

 number of confirmations

___

### `Optional` receipt

• **receipt**? : *ITransactionReceipt*

*Defined in [src/operation.ts:41](https://github.com/daostack/arc.js/blob/6c661ff/src/operation.ts#L41)*

___

### `Optional` result

• **result**? : *T*

*Defined in [src/operation.ts:49](https://github.com/daostack/arc.js/blob/6c661ff/src/operation.ts#L49)*

Parsed return value from the method call

___

###  state

• **state**: *[ITransactionState](../enums/itransactionstate.md)*

*Defined in [src/operation.ts:39](https://github.com/daostack/arc.js/blob/6c661ff/src/operation.ts#L39)*

___

### `Optional` transactionHash

• **transactionHash**? : *undefined | string*

*Defined in [src/operation.ts:40](https://github.com/daostack/arc.js/blob/6c661ff/src/operation.ts#L40)*
