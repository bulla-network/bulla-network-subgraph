import { Address, log } from "@graphprotocol/graph-ts";
import { assert, logStore, test } from "matchstick-as/assembly/index";
import { getInstantPaymentEventId } from "../src/functions/BullaInstaPay";
import { handleInstantPayment } from "../src/mappings/BullaInstaPay";
import { newInstantPayEvent } from "./functions/BullaInstaPay.testtools";
import { ADDRESS_ZERO, afterEach, setupContracts } from "./helpers";

test("it handles InstantPayment events", () => {
  setupContracts();

  const instantPaymentEvent = newInstantPayEvent();
  const instantPaymentId = getInstantPaymentEventId(instantPaymentEvent);
  handleInstantPayment(instantPaymentEvent);

  assert.fieldEquals("InstantPaymentEvent", instantPaymentId, "from", instantPaymentEvent.params.from.toHexString());
  assert.fieldEquals("InstantPaymentEvent", instantPaymentId, "to", instantPaymentEvent.params.to.toHexString());
  assert.fieldEquals("InstantPaymentEvent", instantPaymentId, "amount", instantPaymentEvent.params.amount.toString());
  assert.fieldEquals("InstantPaymentEvent", instantPaymentId, "token", instantPaymentEvent.params.tokenAddress.toHexString());
  assert.fieldEquals("InstantPaymentEvent", instantPaymentId, "description", instantPaymentEvent.params.description.toString());
  assert.fieldEquals("InstantPaymentEvent", instantPaymentId, "ipfsHash", instantPaymentEvent.params.ipfsHash.toString());
  assert.fieldEquals("InstantPaymentEvent", instantPaymentId, "blockNumber", instantPaymentEvent.block.number.toString());
  assert.fieldEquals("InstantPaymentEvent", instantPaymentId, "transactionHash", instantPaymentEvent.transaction.hash.toHexString());
  assert.fieldEquals("InstantPaymentEvent", instantPaymentId, "timestamp", instantPaymentEvent.block.timestamp.toString());
  assert.fieldEquals("InstantPaymentEvent", instantPaymentId, "logIndex", instantPaymentEvent.logIndex.toString());
  log.info("✅ should create a InstantPayment event with an ERC20 token", []);

  const instantPaymentEvent_native = newInstantPayEvent(ADDRESS_ZERO);
  const instantPaymentId_native = getInstantPaymentEventId(instantPaymentEvent_native);
  handleInstantPayment(instantPaymentEvent_native);

  assert.fieldEquals("InstantPaymentEvent", instantPaymentId_native, "from", instantPaymentEvent_native.params.from.toHexString());
  assert.fieldEquals("InstantPaymentEvent", instantPaymentId_native, "to", instantPaymentEvent_native.params.to.toHexString());
  assert.fieldEquals("InstantPaymentEvent", instantPaymentId_native, "amount", instantPaymentEvent_native.params.amount.toString());
  assert.fieldEquals("InstantPaymentEvent", instantPaymentId_native, "token", instantPaymentEvent_native.params.tokenAddress.toHexString());
  assert.fieldEquals("InstantPaymentEvent", instantPaymentId_native, "description", instantPaymentEvent_native.params.description.toString());
  assert.fieldEquals("InstantPaymentEvent", instantPaymentId_native, "ipfsHash", instantPaymentEvent_native.params.ipfsHash.toString());
  assert.fieldEquals("InstantPaymentEvent", instantPaymentId_native, "blockNumber", instantPaymentEvent_native.block.number.toString());
  assert.fieldEquals("InstantPaymentEvent", instantPaymentId_native, "transactionHash", instantPaymentEvent_native.transaction.hash.toHexString());
  assert.fieldEquals("InstantPaymentEvent", instantPaymentId_native, "timestamp", instantPaymentEvent_native.block.timestamp.toString());
  assert.fieldEquals("InstantPaymentEvent", instantPaymentId_native, "logIndex", instantPaymentEvent_native.logIndex.toString());
  log.info("✅ should create a InstantPayment event with the native token", []);

  afterEach();
});

export { handleInstantPayment };
