import { BigInt, Bytes, log } from "@graphprotocol/graph-ts";
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

  // Lifecycle: Pending with createdAt + latest txHash denormalized on the order
  assert.fieldEquals("OrderERC20", orderId.toString(), "status", "Pending");
  assert.fieldEquals("OrderERC20", orderId.toString(), "createdAt", timestamp.toString());
  // On create, createdTxHash == transactionHash (both the OrderCreated tx).
  assert.fieldEquals("OrderERC20", orderId.toString(), "createdTxHash", orderCreatedEvent.transaction.hash.toHexString());
  assert.fieldEquals("OrderERC20", orderId.toString(), "transactionHash", orderCreatedEvent.transaction.hash.toHexString());
  assert.fieldEquals("OrderERC20", orderId.toString(), "expiry", expiry.toString());
  assert.fieldEquals("OrderERC20", orderId.toString(), "signerWallet", signerWallet.toHexString());
  assert.fieldEquals("OrderERC20", orderId.toString(), "senderWallet", senderWallet.toHexString());

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

  // Lifecycle: Executed, with executedAt + recipient (testtool sets recipient = signerWallet)
  assert.fieldEquals("OrderERC20", orderId.toString(), "status", "Executed");
  assert.fieldEquals("OrderERC20", orderId.toString(), "executedAt", timestamp.toString());
  assert.fieldEquals("OrderERC20", orderId.toString(), "recipient", signerWallet.toHexString());
  assert.fieldEquals("OrderERC20", orderId.toString(), "transactionHash", orderExecutedEvent.transaction.hash.toHexString());

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

  // Lifecycle: Canceled, with canceledAt set
  assert.fieldEquals("OrderERC20", orderId.toString(), "status", "Canceled");
  assert.fieldEquals("OrderERC20", orderId.toString(), "canceledAt", timestamp.toString());
  assert.fieldEquals("OrderERC20", orderId.toString(), "transactionHash", orderDeletedEvent.transaction.hash.toHexString());

  log.info("✅ should create a OrderDeleted event", []);

  afterEach();
});

test("it transitions an order Pending -> Executed and preserves createdAt", () => {
  const orderId = BigInt.fromI32(7);
  const expiry = BigInt.fromI32(100);
  const signerWallet = ADDRESS_1;
  const signerToken = ADDRESS_2;
  const signerAmount = BigInt.fromI32(10000);
  const senderWallet = ADDRESS_3;
  const senderToken = ADDRESS_4;
  const senderAmount = BigInt.fromI32(10000);

  setupContracts();

  const createdEvent = newOrderCreatedEvent(orderId, signerWallet, signerToken, signerAmount, senderWallet, senderToken, senderAmount, expiry);
  createdEvent.block.timestamp = BigInt.fromI32(100);
  createdEvent.block.number = BigInt.fromI32(100);
  handleOrderCreated(createdEvent);

  assert.fieldEquals("OrderERC20", orderId.toString(), "status", "Pending");
  assert.fieldEquals("OrderERC20", orderId.toString(), "createdAt", "100");
  const createdTxHash = createdEvent.transaction.hash;

  const executedEvent = newOrderExecutedEvent(orderId, signerWallet, signerToken, signerAmount, senderWallet, senderToken, senderAmount, expiry);
  executedEvent.block.timestamp = BigInt.fromI32(200);
  executedEvent.block.number = BigInt.fromI32(200);
  // Distinct tx so we can tell createdTxHash (creation tx) from transactionHash (latest tx).
  executedEvent.transaction.hash = Bytes.fromHexString("0x00000000000000000000000000000000000000000000000000000000deadbeef");
  handleOrderExecuted(executedEvent);

  // Same row flips to Executed; createdAt + createdTxHash unchanged, executedAt + latest txHash updated
  assert.fieldEquals("OrderERC20", orderId.toString(), "status", "Executed");
  assert.fieldEquals("OrderERC20", orderId.toString(), "createdAt", "100");
  assert.fieldEquals("OrderERC20", orderId.toString(), "executedAt", "200");
  assert.fieldEquals("OrderERC20", orderId.toString(), "lastUpdatedTimestamp", "200");
  // createdTxHash pinned to the OrderCreated tx; transactionHash advances to the execute tx.
  assert.fieldEquals("OrderERC20", orderId.toString(), "createdTxHash", createdTxHash.toHexString());
  assert.fieldEquals("OrderERC20", orderId.toString(), "transactionHash", executedEvent.transaction.hash.toHexString());

  log.info("✅ should transition an order through its lifecycle on the same row", []);

  afterEach();
});

test("it transitions an order Pending -> Canceled and preserves createdTxHash", () => {
  const orderId = BigInt.fromI32(9);
  const expiry = BigInt.fromI32(100);
  const signerWallet = ADDRESS_1;
  const signerToken = ADDRESS_2;
  const signerAmount = BigInt.fromI32(10000);
  const senderWallet = ADDRESS_3;
  const senderToken = ADDRESS_4;
  const senderAmount = BigInt.fromI32(10000);

  setupContracts();

  const createdEvent = newOrderCreatedEvent(orderId, signerWallet, signerToken, signerAmount, senderWallet, senderToken, senderAmount, expiry);
  createdEvent.block.timestamp = BigInt.fromI32(100);
  createdEvent.block.number = BigInt.fromI32(100);
  handleOrderCreated(createdEvent);
  const createdTxHash = createdEvent.transaction.hash;

  const deletedEvent = newOrderDeletedEvent(orderId, signerWallet, signerToken, signerAmount, senderWallet, senderToken, senderAmount, expiry);
  deletedEvent.block.timestamp = BigInt.fromI32(200);
  deletedEvent.block.number = BigInt.fromI32(200);
  // Distinct cancel tx: the entity's transactionHash points here, but createdTxHash must not.
  deletedEvent.transaction.hash = Bytes.fromHexString("0x00000000000000000000000000000000000000000000000000000000cafebabe");
  handleOrderDeleted(deletedEvent);

  // Canceled row keeps the creation tx in createdTxHash; transactionHash is the cancel tx.
  assert.fieldEquals("OrderERC20", orderId.toString(), "status", "Canceled");
  assert.fieldEquals("OrderERC20", orderId.toString(), "canceledAt", "200");
  assert.fieldEquals("OrderERC20", orderId.toString(), "createdTxHash", createdTxHash.toHexString());
  assert.fieldEquals("OrderERC20", orderId.toString(), "transactionHash", deletedEvent.transaction.hash.toHexString());

  log.info("✅ should preserve createdTxHash through cancellation", []);

  afterEach();
});

test("it records a BullaTransaction for the handled tx", () => {
  const orderId = BigInt.fromI32(11);
  const expiry = BigInt.fromI32(100);
  const signerWallet = ADDRESS_1;
  const signerToken = ADDRESS_2;
  const signerAmount = BigInt.fromI32(10000);
  const senderWallet = ADDRESS_3;
  const senderToken = ADDRESS_4;
  const senderAmount = BigInt.fromI32(10000);

  setupContracts();

  const timestamp = BigInt.fromI32(150);
  const orderCreatedEvent = newOrderCreatedEvent(orderId, signerWallet, signerToken, signerAmount, senderWallet, senderToken, senderAmount, expiry);
  orderCreatedEvent.block.timestamp = timestamp;
  orderCreatedEvent.block.number = BigInt.fromI32(150);

  handleOrderCreated(orderCreatedEvent);

  // One idempotent BullaTransaction row per (user, tx); id is `${user}-${txHash}`.
  const txId = orderCreatedEvent.transaction.from.toHexString() + "-" + orderCreatedEvent.transaction.hash.toHexString();
  assert.fieldEquals("BullaTransaction", txId, "txHash", orderCreatedEvent.transaction.hash.toHexString());
  assert.fieldEquals("BullaTransaction", txId, "user", orderCreatedEvent.transaction.from.toHexString());
  assert.fieldEquals("BullaTransaction", txId, "timestamp", timestamp.toString());

  log.info("✅ should record a BullaTransaction for the handled tx", []);

  afterEach();
});

// exporting for test coverage
export { handleOrderCreated, handleOrderDeleted, handleOrderExecuted };
