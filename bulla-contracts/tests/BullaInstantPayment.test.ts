import { ByteArray, Bytes, crypto, log } from "@graphprotocol/graph-ts";
import { assert, logStore, test } from "matchstick-as/assembly/index";
import { getInstantPaymentEventId, getInstantPaymentEventId__Bytes, getInstantPaymentTagUpdatedId } from "../src/functions/BullaInstantPayment";
import { handleInstantPayment, handleInstantPaymentTagUpdated } from "../src/mappings/BullaInstantPayment";
import { newInstantPaymentEvent, newInstantPaymentTagUpdatedEvent } from "./functions/BullaInstantPayment.testtools";
import { ADDRESS_ZERO, afterEach, setupContracts } from "./helpers";

test("it handles InstantPayment events", () => {
  setupContracts();

  const instantPaymentEvent = newInstantPaymentEvent();
  const instantPaymentId = getInstantPaymentEventId(instantPaymentEvent.transaction.hash, instantPaymentEvent.logIndex);
  handleInstantPayment(instantPaymentEvent);

  assert.fieldEquals("InstantPayment", instantPaymentId, "from", instantPaymentEvent.params.from.toHexString());
  assert.fieldEquals("InstantPayment", instantPaymentId, "to", instantPaymentEvent.params.to.toHexString());
  assert.fieldEquals("InstantPayment", instantPaymentId, "amount", instantPaymentEvent.params.amount.toString());
  assert.fieldEquals("InstantPayment", instantPaymentId, "token", instantPaymentEvent.params.tokenAddress.toHexString());
  assert.fieldEquals("InstantPayment", instantPaymentId, "description", instantPaymentEvent.params.description.toString());
  assert.fieldEquals("InstantPayment", instantPaymentId, "ipfsHash", instantPaymentEvent.params.ipfsHash.toString());

  assert.fieldEquals("InstantPaymentEvent", instantPaymentId, "instantPayment", instantPaymentId);
  assert.fieldEquals("InstantPaymentEvent", instantPaymentId, "from", instantPaymentEvent.params.from.toHexString());
  assert.fieldEquals("InstantPaymentEvent", instantPaymentId, "to", instantPaymentEvent.params.to.toHexString());
  assert.fieldEquals("InstantPaymentEvent", instantPaymentId, "amount", instantPaymentEvent.params.amount.toString());
  assert.fieldEquals("InstantPaymentEvent", instantPaymentId, "token", instantPaymentEvent.params.tokenAddress.toHexString());
  assert.fieldEquals("InstantPaymentEvent", instantPaymentId, "description", instantPaymentEvent.params.description.toString());
  assert.fieldEquals("InstantPaymentEvent", instantPaymentId, "tag", instantPaymentEvent.params.tag.toString());
  assert.fieldEquals("InstantPaymentEvent", instantPaymentId, "ipfsHash", instantPaymentEvent.params.ipfsHash.toString());
  assert.fieldEquals("InstantPaymentEvent", instantPaymentId, "eventName", "InstantPayment");
  assert.fieldEquals("InstantPaymentEvent", instantPaymentId, "blockNumber", instantPaymentEvent.block.number.toString());
  assert.fieldEquals("InstantPaymentEvent", instantPaymentId, "transactionHash", instantPaymentEvent.transaction.hash.toHexString());
  assert.fieldEquals("InstantPaymentEvent", instantPaymentId, "logIndex", instantPaymentEvent.logIndex.toString());
  assert.fieldEquals("InstantPaymentEvent", instantPaymentId, "timestamp", instantPaymentEvent.block.timestamp.toString());

  assert.fieldEquals("InstantPaymentTag", instantPaymentId, "instantPayment", instantPaymentId);
  assert.fieldEquals("InstantPaymentTag", instantPaymentId, "updatedBy", instantPaymentEvent.params.from.toHexString());
  assert.fieldEquals("InstantPaymentTag", instantPaymentId, "tag", instantPaymentEvent.params.tag.toString());

  log.info("✅ should create an InstantPaymentEvent, InstantPayment, ERC20 token, and an InstantPaymentTag", []);

  const instantPaymentEvent_native = newInstantPaymentEvent(ADDRESS_ZERO);
  const instantPaymentId_native = getInstantPaymentEventId(instantPaymentEvent.transaction.hash, instantPaymentEvent.logIndex);

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

test("it handles InstantPaymentTagUpdated events", () => {
  setupContracts();

  const instantPaymentEvent = newInstantPaymentEvent();
  const instantPaymentId = getInstantPaymentEventId(instantPaymentEvent.transaction.hash, instantPaymentEvent.logIndex);
  handleInstantPayment(instantPaymentEvent);

  assert.fieldEquals("InstantPayment", instantPaymentId, "from", instantPaymentEvent.params.from.toHexString());
  assert.fieldEquals("InstantPayment", instantPaymentId, "to", instantPaymentEvent.params.to.toHexString());
  assert.fieldEquals("InstantPayment", instantPaymentId, "amount", instantPaymentEvent.params.amount.toString());
  assert.fieldEquals("InstantPayment", instantPaymentId, "token", instantPaymentEvent.params.tokenAddress.toHexString());
  assert.fieldEquals("InstantPayment", instantPaymentId, "description", instantPaymentEvent.params.description.toString());
  assert.fieldEquals("InstantPayment", instantPaymentId, "ipfsHash", instantPaymentEvent.params.ipfsHash.toString());

  assert.fieldEquals("InstantPaymentEvent", instantPaymentId, "instantPayment", instantPaymentId);
  assert.fieldEquals("InstantPaymentEvent", instantPaymentId, "from", instantPaymentEvent.params.from.toHexString());
  assert.fieldEquals("InstantPaymentEvent", instantPaymentId, "to", instantPaymentEvent.params.to.toHexString());
  assert.fieldEquals("InstantPaymentEvent", instantPaymentId, "amount", instantPaymentEvent.params.amount.toString());
  assert.fieldEquals("InstantPaymentEvent", instantPaymentId, "token", instantPaymentEvent.params.tokenAddress.toHexString());
  assert.fieldEquals("InstantPaymentEvent", instantPaymentId, "description", instantPaymentEvent.params.description.toString());
  assert.fieldEquals("InstantPaymentEvent", instantPaymentId, "tag", instantPaymentEvent.params.tag.toString());
  assert.fieldEquals("InstantPaymentEvent", instantPaymentId, "ipfsHash", instantPaymentEvent.params.ipfsHash.toString());
  assert.fieldEquals("InstantPaymentEvent", instantPaymentId, "eventName", "InstantPayment");
  assert.fieldEquals("InstantPaymentEvent", instantPaymentId, "blockNumber", instantPaymentEvent.block.number.toString());
  assert.fieldEquals("InstantPaymentEvent", instantPaymentId, "transactionHash", instantPaymentEvent.transaction.hash.toHexString());
  assert.fieldEquals("InstantPaymentEvent", instantPaymentId, "logIndex", instantPaymentEvent.logIndex.toString());
  assert.fieldEquals("InstantPaymentEvent", instantPaymentId, "timestamp", instantPaymentEvent.block.timestamp.toString());

  assert.fieldEquals("InstantPaymentTag", instantPaymentId, "instantPayment", instantPaymentId);
  assert.fieldEquals("InstantPaymentTag", instantPaymentId, "updatedBy", instantPaymentEvent.params.from.toHexString());
  assert.fieldEquals("InstantPaymentTag", instantPaymentId, "tag", instantPaymentEvent.params.tag.toString());

  const newTag = "super new tag";
  const instantPaymentIdBytes = getInstantPaymentEventId__Bytes(instantPaymentEvent.transaction.hash, instantPaymentEvent.logIndex);
  const instantPaymentTagUpdatedEvent = newInstantPaymentTagUpdatedEvent(instantPaymentIdBytes, newTag);
  const instantPaymentTagUpdatedEventId = getInstantPaymentTagUpdatedId(instantPaymentTagUpdatedEvent);

  // assert new tag event with correct id is stored,
  handleInstantPaymentTagUpdated(instantPaymentTagUpdatedEvent);
  assert.fieldEquals("InstantPaymentTag", instantPaymentId, "instantPayment", instantPaymentId);
  assert.fieldEquals("InstantPaymentTag", instantPaymentId, "updatedBy", instantPaymentEvent.params.from.toHexString());
  assert.fieldEquals("InstantPaymentTag", instantPaymentId, "tag", newTag);

  assert.fieldEquals("InstantPaymentTagUpdatedEvent", instantPaymentTagUpdatedEventId, "instantPayment", instantPaymentId);
  assert.fieldEquals("InstantPaymentTagUpdatedEvent", instantPaymentTagUpdatedEventId, "updatedBy", instantPaymentTagUpdatedEvent.params.updatedBy.toHexString());
  assert.fieldEquals("InstantPaymentTagUpdatedEvent", instantPaymentTagUpdatedEventId, "tag", instantPaymentTagUpdatedEvent.params.tag.toString());
  assert.fieldEquals("InstantPaymentTagUpdatedEvent", instantPaymentTagUpdatedEventId, "eventName", "InstantPaymentTagUpdated");
  assert.fieldEquals("InstantPaymentTagUpdatedEvent", instantPaymentTagUpdatedEventId, "blockNumber", instantPaymentTagUpdatedEvent.block.number.toString());
  assert.fieldEquals("InstantPaymentTagUpdatedEvent", instantPaymentTagUpdatedEventId, "transactionHash", instantPaymentTagUpdatedEvent.transaction.hash.toHexString());
  assert.fieldEquals("InstantPaymentTagUpdatedEvent", instantPaymentTagUpdatedEventId, "logIndex", instantPaymentTagUpdatedEvent.logIndex.toString());
  assert.fieldEquals("InstantPaymentTagUpdatedEvent", instantPaymentTagUpdatedEventId, "timestamp", instantPaymentTagUpdatedEvent.block.timestamp.toString());

  // assert failing case where the event does not match an entity
  const randomHash = Bytes.fromByteArray(crypto.keccak256(ByteArray.fromUTF8("random hash")));
  const instantPaymentTagUpdatedEvent_bad = newInstantPaymentTagUpdatedEvent(randomHash, newTag);

  handleInstantPaymentTagUpdated(instantPaymentTagUpdatedEvent_bad);
  
  assert.fieldEquals("InstantPaymentTag", instantPaymentId, "instantPayment", instantPaymentId);
  assert.fieldEquals("InstantPaymentTag", instantPaymentId, "updatedBy", instantPaymentEvent.params.from.toHexString());
  assert.fieldEquals("InstantPaymentTag", instantPaymentId, "tag", newTag);
  log.info("✅ should create an InstantPaymentEvent, InstantPayment, ERC20 token, and an InstantPaymentTag", []);
  logStore()
  afterEach();
});

export { handleInstantPayment, handleInstantPaymentTagUpdated };
