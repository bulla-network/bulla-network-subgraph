import { log } from "@graphprotocol/graph-ts";
import { test, assert } from "matchstick-as/assembly/index";
import { handleClaimCreated } from "../src/mappings/BullaClaimERC721";
import { DEFAULT_ACCOUNT_TAG, MOCK_BANKER_ADDRESS, MOCK_CLAIM_ADDRRESS, MOCK_MANAGER_ADDRESS, newBullaBankerCreatedEvent, newBullaTagUpdatedEvent } from "./helpers";
import { handleBullaBankerCreated, handleBullaTagUpdated } from "../src/mappings/BullaBanker";
import { afterEach, newClaimCreatedEvent, setupTests } from "./helpers";
import { getAccountTagId, getBullaBankerCreatedId, getBullaTagUpdatedEventId } from "../src/functions/BullaBanker";

test("it handles BullaTagUpdated events", () => {
  setupTests();

  const claimCreatedEvent = newClaimCreatedEvent(1, "INVOICE", false);
  handleClaimCreated(claimCreatedEvent);

  const bullaTagUpdatedEvent = newBullaTagUpdatedEvent(claimCreatedEvent.params.tokenId, claimCreatedEvent.params.origin, DEFAULT_ACCOUNT_TAG);
  const bullaTagUpdatedEventId = getBullaTagUpdatedEventId(claimCreatedEvent.params.tokenId, claimCreatedEvent.transaction.hash);

  handleBullaTagUpdated(bullaTagUpdatedEvent);

  assert.fieldEquals("BullaTagUpdatedEvent", bullaTagUpdatedEventId, "bullaManager", bullaTagUpdatedEvent.params.bullaManager.toHexString());
  assert.fieldEquals("BullaTagUpdatedEvent", bullaTagUpdatedEventId, "tokenId", bullaTagUpdatedEvent.params.tokenId.toString());
  assert.fieldEquals("BullaTagUpdatedEvent", bullaTagUpdatedEventId, "updatedBy", bullaTagUpdatedEvent.params.updatedBy.toHexString());
  assert.fieldEquals("BullaTagUpdatedEvent", bullaTagUpdatedEventId, "tag", DEFAULT_ACCOUNT_TAG);
  assert.fieldEquals("BullaTagUpdatedEvent", bullaTagUpdatedEventId, "eventName", "BullaTagUpdated");
  assert.fieldEquals("BullaTagUpdatedEvent", bullaTagUpdatedEventId, "blockNumber", bullaTagUpdatedEvent.block.number.toString());
  assert.fieldEquals("BullaTagUpdatedEvent", bullaTagUpdatedEventId, "transactionHash", bullaTagUpdatedEvent.transaction.hash.toHexString());
  assert.fieldEquals("BullaTagUpdatedEvent", bullaTagUpdatedEventId, "timestamp", bullaTagUpdatedEvent.block.timestamp.toString());
  log.info("✅ should create a BullaTagUpdated event", []);

  const accountTagId = getAccountTagId(claimCreatedEvent.params.tokenId, bullaTagUpdatedEvent.params.updatedBy);

  assert.fieldEquals("AccountTag", accountTagId, "tokenId", bullaTagUpdatedEvent.params.tokenId.toString());
  assert.fieldEquals("AccountTag", accountTagId, "userAddress", bullaTagUpdatedEvent.params.updatedBy.toHexString());
  assert.fieldEquals("AccountTag", accountTagId, "tag", DEFAULT_ACCOUNT_TAG);
  log.info("✅ should create an AccountTag entity", []);

  afterEach();
});

test("it handles BullaBankerCreated events", () => {
  setupTests();

  const bullaBankerCreatedEvent = newBullaBankerCreatedEvent(MOCK_MANAGER_ADDRESS, MOCK_CLAIM_ADDRRESS, MOCK_BANKER_ADDRESS);
  const bullaBankerCreatedEventId = getBullaBankerCreatedId(bullaBankerCreatedEvent.transaction.hash);
  handleBullaBankerCreated(bullaBankerCreatedEvent);
  
  assert.fieldEquals("BullaBankerCreatedEvent", bullaBankerCreatedEventId, "bullaManager", bullaBankerCreatedEvent.params.bullaManager.toHexString());
  assert.fieldEquals("BullaBankerCreatedEvent", bullaBankerCreatedEventId, "bullaClaimERC721", bullaBankerCreatedEvent.params.bullaClaimERC721.toHexString());
  assert.fieldEquals("BullaBankerCreatedEvent", bullaBankerCreatedEventId, "bullaBanker", bullaBankerCreatedEvent.params.bullaBanker.toHexString());
  assert.fieldEquals("BullaBankerCreatedEvent", bullaBankerCreatedEventId, "eventName", "BullaBankerCreated");
  assert.fieldEquals("BullaBankerCreatedEvent", bullaBankerCreatedEventId, "blockNumber", bullaBankerCreatedEvent.block.number.toString());
  assert.fieldEquals("BullaBankerCreatedEvent", bullaBankerCreatedEventId, "transactionHash", bullaBankerCreatedEvent.transaction.hash.toHexString());
  assert.fieldEquals("BullaBankerCreatedEvent", bullaBankerCreatedEventId, "timestamp", bullaBankerCreatedEvent.block.timestamp.toString());
  log.info("✅ should create a BullaBankerCreated event", []);

  afterEach();
});

export { handleBullaTagUpdated };
