import { ethereum, crypto, ByteArray, Bytes, BigInt } from "@graphprotocol/graph-ts";

export const getInstantPaymentEventId = (transactionHash: Bytes, logIndex: BigInt): string =>
  crypto.keccak256(ByteArray.fromUTF8(transactionHash.toHexString() + logIndex.toString())).toHexString();

export const getInstantPaymentEventId__Bytes = (transactionHash: Bytes, logIndex: BigInt): Bytes =>
  changetype<Bytes>(crypto.keccak256(ByteArray.fromUTF8(transactionHash.toHexString() + logIndex.toString())));

export const getInstantPaymentTagUpdatedId = (event: ethereum.Event): string =>
  crypto.keccak256(ByteArray.fromUTF8(event.transaction.hash.toHexString() + event.logIndex.toString())).toHexString();
