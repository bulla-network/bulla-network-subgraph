import { BigInt, log } from "@graphprotocol/graph-ts";
import { assert, test } from "matchstick-as/assembly/index";

import { getOrderCreatedEventId, getOrderDeletedEventId, getOrderExecutedEventId } from "../src/functions/BullaSwap";
import { handleOrderCreated, handleOrderDeleted, handleOrderExecuted } from "../src/mappings/BullaSwap";
import { newOrderCreatedEvent, newOrderDeletedEvent, newOrderExecutedEvent } from "./functions/BullaSwap.testtools";
import { ADDRESS_1, ADDRESS_2, ADDRESS_3, ADDRESS_4, afterEach, setupContracts } from "./helpers";

test("it handles OrderCreated event", () => {
  const orderId = BigInt.fromI32(3);
  const expiry = BigInt.fromI32(100);
  const signerWallet = ADDRESS_1;
  const signerToken = ADDRESS_2;
  const signerAmount = BigInt.fromI32(10000);
  const senderWallet = ADDRESS_3;
  const senderToken = ADDRESS_4;
  const senderAmount = BigInt.fromI32(10000);

  setupContracts();

  const timestamp = BigInt.fromI32(100);
  const blockNum = BigInt.fromI32(100);

  const orderCreatedEvent = newOrderCreatedEvent(orderId, signerWallet, signerToken, signerAmount, senderWallet, senderToken, senderAmount, expiry);
  orderCreatedEvent.block.timestamp = timestamp;
  orderCreatedEvent.block.number = blockNum;

  handleOrderCreated(orderCreatedEvent);

  const orderCreatedEventId = getOrderCreatedEventId(orderId, orderCreatedEvent);
  assert.fieldEquals("OrderCreatedEvent", orderCreatedEventId, "signerWallet", signerWallet.toHexString());
  assert.fieldEquals("OrderCreatedEvent", orderCreatedEventId, "sender", senderWallet.toHexString());
  assert.fieldEquals("OrderERC20", orderId.toString(), "orderId", orderId.toString());

  log.info("✅ should create a OrderCreated event", []);

  afterEach();
});

test("it handles OrderExecuted event", () => {
  const orderId = BigInt.fromI32(3);
  const expiry = BigInt.fromI32(100);
  const signerWallet = ADDRESS_1;
  const signerToken = ADDRESS_2;
  const signerAmount = BigInt.fromI32(10000);
  const senderWallet = ADDRESS_3;
  const senderToken = ADDRESS_4;
  const senderAmount = BigInt.fromI32(10000);

  setupContracts();

  const timestamp = BigInt.fromI32(100);
  const blockNum = BigInt.fromI32(100);

  const orderExecutedEvent = newOrderExecutedEvent(orderId, signerWallet, signerToken, signerAmount, senderWallet, senderToken, senderAmount, expiry);
  orderExecutedEvent.block.timestamp = timestamp;
  orderExecutedEvent.block.number = blockNum;

  handleOrderExecuted(orderExecutedEvent);

  const orderExecutedEventId = getOrderExecutedEventId(orderId, orderExecutedEvent);
  assert.fieldEquals("OrderExecutedEvent", orderExecutedEventId, "signerWallet", signerWallet.toHexString());
  assert.fieldEquals("OrderExecutedEvent", orderExecutedEventId, "sender", senderWallet.toHexString());
  assert.fieldEquals("OrderERC20", orderId.toString(), "orderId", orderId.toString());

  log.info("✅ should create a OrderExecuted event", []);

  afterEach();
});

test("it handles OrderDeleted event", () => {
  const orderId = BigInt.fromI32(3);
  const expiry = BigInt.fromI32(100);
  const signerWallet = ADDRESS_1;
  const signerToken = ADDRESS_2;
  const signerAmount = BigInt.fromI32(10000);
  const senderWallet = ADDRESS_3;
  const senderToken = ADDRESS_4;
  const senderAmount = BigInt.fromI32(10000);

  setupContracts();

  const timestamp = BigInt.fromI32(100);
  const blockNum = BigInt.fromI32(100);

  const orderDeletedEvent = newOrderDeletedEvent(orderId, signerWallet, signerToken, signerAmount, senderWallet, senderToken, senderAmount, expiry);
  orderDeletedEvent.block.timestamp = timestamp;
  orderDeletedEvent.block.number = blockNum;

  handleOrderDeleted(orderDeletedEvent);

  const orderDeletedEventId = getOrderDeletedEventId(orderId, orderDeletedEvent);
  assert.fieldEquals("OrderDeletedEvent", orderDeletedEventId, "signerWallet", signerWallet.toHexString());
  assert.fieldEquals("OrderERC20", orderId.toString(), "orderId", orderId.toString());

  log.info("✅ should create a OrderDeleted event", []);

  afterEach();
});

// exporting for test coverage
export { handleOrderCreated, handleOrderDeleted, handleOrderExecuted };
