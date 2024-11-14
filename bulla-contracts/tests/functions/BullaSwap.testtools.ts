import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";
import { OrderCreated, OrderDeleted, OrderExecuted } from "../../generated/BullaSwap/BullaSwap";
import { MOCK_BULLA_SWAP_ADDRESS } from "../helpers";

/// @NOTICE: event parameters should be in the same order as the event declaration in the contract

export function newOrderCreatedEvent(
  orderId: BigInt,
  signerWallet: Address,
  signerToken: Address,
  signerAmount: BigInt,
  senderWallet: Address,
  senderToken: Address,
  senderAmount: BigInt,
  expiry: BigInt
): OrderCreated {
  const mockEvent = newMockEvent();
  const orderCreatedEvent = new OrderCreated(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    mockEvent.receipt
  );

  orderCreatedEvent.address = MOCK_BULLA_SWAP_ADDRESS;
  orderCreatedEvent.parameters = new Array();
  orderCreatedEvent.parameters.push(new ethereum.EventParam("orderId", ethereum.Value.fromUnsignedBigInt(orderId)));
  orderCreatedEvent.parameters.push(new ethereum.EventParam("sender", ethereum.Value.fromAddress(senderWallet)));
  orderCreatedEvent.parameters.push(new ethereum.EventParam("signerWallet", ethereum.Value.fromAddress(signerWallet)));

  const orderTupleArray = [
    ethereum.Value.fromUnsignedBigInt(orderId),
    ethereum.Value.fromUnsignedBigInt(expiry),
    ethereum.Value.fromAddress(signerWallet),
    ethereum.Value.fromAddress(signerToken),
    ethereum.Value.fromUnsignedBigInt(signerAmount),
    ethereum.Value.fromAddress(senderWallet),
    ethereum.Value.fromAddress(senderToken),
    ethereum.Value.fromUnsignedBigInt(senderAmount)
  ];

  const orderTuple: ethereum.Tuple = changetype<ethereum.Tuple>(orderTupleArray);

  orderCreatedEvent.parameters.push(new ethereum.EventParam("order", ethereum.Value.fromTuple(orderTuple)));

  return orderCreatedEvent;
}

export function newOrderExecutedEvent(
  orderId: BigInt,
  signerWallet: Address,
  signerToken: Address,
  signerAmount: BigInt,
  senderWallet: Address,
  senderToken: Address,
  senderAmount: BigInt,
  expiry: BigInt
): OrderExecuted {
  const mockEvent = newMockEvent();
  const orderExecutedEvent = new OrderExecuted(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    mockEvent.receipt
  );

  orderExecutedEvent.address = MOCK_BULLA_SWAP_ADDRESS;
  orderExecutedEvent.parameters = new Array();
  orderExecutedEvent.parameters.push(new ethereum.EventParam("orderId", ethereum.Value.fromUnsignedBigInt(orderId)));
  orderExecutedEvent.parameters.push(new ethereum.EventParam("sender", ethereum.Value.fromAddress(senderWallet)));
  orderExecutedEvent.parameters.push(new ethereum.EventParam("recipient", ethereum.Value.fromAddress(signerWallet)));

  const orderTupleArray = [
    ethereum.Value.fromUnsignedBigInt(orderId),
    ethereum.Value.fromUnsignedBigInt(expiry),
    ethereum.Value.fromAddress(signerWallet),
    ethereum.Value.fromAddress(signerToken),
    ethereum.Value.fromUnsignedBigInt(signerAmount),
    ethereum.Value.fromAddress(senderWallet),
    ethereum.Value.fromAddress(senderToken),
    ethereum.Value.fromUnsignedBigInt(senderAmount)
  ];

  const orderTuple: ethereum.Tuple = changetype<ethereum.Tuple>(orderTupleArray);

  orderExecutedEvent.parameters.push(new ethereum.EventParam("order", ethereum.Value.fromTuple(orderTuple)));

  return orderExecutedEvent;
}

export function newOrderDeletedEvent(
  orderId: BigInt,
  signerWallet: Address,
  signerToken: Address,
  signerAmount: BigInt,
  senderWallet: Address,
  senderToken: Address,
  senderAmount: BigInt,
  expiry: BigInt
): OrderDeleted {
  const mockEvent = newMockEvent();
  const orderDeletedEvent = new OrderDeleted(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    mockEvent.receipt
  );

  orderDeletedEvent.address = MOCK_BULLA_SWAP_ADDRESS;
  orderDeletedEvent.parameters = new Array();
  orderDeletedEvent.parameters.push(new ethereum.EventParam("orderId", ethereum.Value.fromUnsignedBigInt(orderId)));
  orderDeletedEvent.parameters.push(new ethereum.EventParam("signerWallet", ethereum.Value.fromAddress(signerWallet)));

  const orderTupleArray = [
    ethereum.Value.fromUnsignedBigInt(orderId),
    ethereum.Value.fromUnsignedBigInt(expiry),
    ethereum.Value.fromAddress(signerWallet),
    ethereum.Value.fromAddress(signerToken),
    ethereum.Value.fromUnsignedBigInt(signerAmount),
    ethereum.Value.fromAddress(senderWallet),
    ethereum.Value.fromAddress(senderToken),
    ethereum.Value.fromUnsignedBigInt(senderAmount)
  ];

  const orderTuple: ethereum.Tuple = changetype<ethereum.Tuple>(orderTupleArray);

  orderDeletedEvent.parameters.push(new ethereum.EventParam("order", ethereum.Value.fromTuple(orderTuple)));

  return orderDeletedEvent;
}
