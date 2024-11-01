import { BigInt, log } from "@graphprotocol/graph-ts";
import { assert, test } from "matchstick-as/assembly/index";

import { handleOrderCreated } from "../src/mappings/BullaSwap";
import { ADDRESS_1, ADDRESS_2, ADDRESS_3, ADDRESS_4, afterEach, setupContracts } from "./helpers";
import { newOrderCreatedEvent } from "./functions/BullaSwap.testtools";
import { User } from "../generated/schema";
import { getOrderCreatedEventId } from "../src/functions/BullaSwap";

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
  const signerUser = new User(signerWallet.toHexString());
  signerUser.swapEvents = [];
  signerUser.save();

  const senderUser = new User(senderWallet.toHexString());
  senderUser.swapEvents = [];
  senderUser.save();

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

// exporting for test coverage
export { handleOrderCreated };
