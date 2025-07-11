import { log, BigInt } from "@graphprotocol/graph-ts";
import { assert, logStore, test } from "matchstick-as/assembly/index";
import { getAccountTagId, getBullaBankerCreatedId, getBullaTagUpdatedEventId } from "../src/functions/BullaBanker";
import { CLAIM_TYPE_INVOICE } from "../src/functions/common";
import { handleBullaBankerCreated, handleBullaTagUpdated } from "../src/mappings/BullaBanker";
import { handleClaimCreatedV1 } from "../src/mappings/BullaClaimERC721";
import { newBullaBankerCreatedEvent, newBullaTagUpdatedEvent } from "./functions/BullaBanker.testtools";
import { newClaimCreatedEvent } from "./functions/BullaClaimERC721.testtools";
import { afterEach, DEFAULT_ACCOUNT_TAG, MOCK_BANKER_ADDRESS, MOCK_CLAIM_ADDRRESS, MOCK_MANAGER_ADDRESS, setupContracts } from "./helpers";

test("it handles BullaTagUpdated events", () => {
  setupContracts();

  const claimCreatedEvent = newClaimCreatedEvent(1, CLAIM_TYPE_INVOICE);
  handleClaimCreatedV1(claimCreatedEvent);

  const bullaTagUpdatedEvent = newBullaTagUpdatedEvent(claimCreatedEvent.params.tokenId, claimCreatedEvent.params.origin, DEFAULT_ACCOUNT_TAG);
  bullaTagUpdatedEvent.block.timestamp = claimCreatedEvent.block.timestamp.plus(BigInt.fromI32(20));
  bullaTagUpdatedEvent.block.number = claimCreatedEvent.block.number.plus(BigInt.fromI32(20));
  const bullaTagUpdatedEventId = getBullaTagUpdatedEventId(claimCreatedEvent.params.tokenId, claimCreatedEvent);

  handleBullaTagUpdated(bullaTagUpdatedEvent);

  assert.fieldEquals("BullaTagUpdatedEvent", bullaTagUpdatedEventId, "bullaManager", bullaTagUpdatedEvent.params.bullaManager.toHexString());
  assert.fieldEquals("BullaTagUpdatedEvent", bullaTagUpdatedEventId, "claim", bullaTagUpdatedEvent.params.tokenId.toString());
  assert.fieldEquals("BullaTagUpdatedEvent", bullaTagUpdatedEventId, "updatedBy", bullaTagUpdatedEvent.params.updatedBy.toHexString());
  assert.fieldEquals("BullaTagUpdatedEvent", bullaTagUpdatedEventId, "tag", DEFAULT_ACCOUNT_TAG);
  assert.fieldEquals("BullaTagUpdatedEvent", bullaTagUpdatedEventId, "eventName", "BullaTagUpdated");
  assert.fieldEquals("BullaTagUpdatedEvent", bullaTagUpdatedEventId, "blockNumber", bullaTagUpdatedEvent.block.number.toString());
  assert.fieldEquals("BullaTagUpdatedEvent", bullaTagUpdatedEventId, "transactionHash", bullaTagUpdatedEvent.transaction.hash.toHexString());
  assert.fieldEquals("BullaTagUpdatedEvent", bullaTagUpdatedEventId, "timestamp", bullaTagUpdatedEvent.block.timestamp.toString());
  assert.fieldEquals("BullaTagUpdatedEvent", bullaTagUpdatedEventId, "logIndex", bullaTagUpdatedEvent.logIndex.toString());
  log.info("✅ should create a BullaTagUpdated event", []);

  const accountTagId = getAccountTagId(claimCreatedEvent.params.tokenId, bullaTagUpdatedEvent.params.updatedBy);

  assert.fieldEquals("AccountTag", accountTagId, "claim", bullaTagUpdatedEvent.params.tokenId.toString());
  assert.fieldEquals("AccountTag", accountTagId, "userAddress", bullaTagUpdatedEvent.params.updatedBy.toHexString());
  assert.fieldEquals("AccountTag", accountTagId, "tag", DEFAULT_ACCOUNT_TAG);
  log.info("✅ should create an AccountTag entity", []);

  assert.fieldEquals("Claim", claimCreatedEvent.params.tokenId.toString(), "lastUpdatedBlockNumber", bullaTagUpdatedEvent.block.number.toString());
  assert.fieldEquals("Claim", claimCreatedEvent.params.tokenId.toString(), "lastUpdatedTimestamp", bullaTagUpdatedEvent.block.timestamp.toString());
  log.info("✅ should update the lastUpdated fields on the claim", []);

  afterEach();
});

test("it handles BullaBankerCreated events", () => {
  setupContracts();

  const bullaBankerCreatedEvent = newBullaBankerCreatedEvent(MOCK_MANAGER_ADDRESS, MOCK_CLAIM_ADDRRESS, MOCK_BANKER_ADDRESS);
  const bullaBankerCreatedEventId = getBullaBankerCreatedId(bullaBankerCreatedEvent);
  handleBullaBankerCreated(bullaBankerCreatedEvent);

  assert.fieldEquals("BullaBankerCreatedEvent", bullaBankerCreatedEventId, "bullaManager", bullaBankerCreatedEvent.params.bullaManager.toHexString());
  assert.fieldEquals("BullaBankerCreatedEvent", bullaBankerCreatedEventId, "bullaClaimERC721", bullaBankerCreatedEvent.params.bullaClaimERC721.toHexString());
  assert.fieldEquals("BullaBankerCreatedEvent", bullaBankerCreatedEventId, "bullaBanker", bullaBankerCreatedEvent.params.bullaBanker.toHexString());
  assert.fieldEquals("BullaBankerCreatedEvent", bullaBankerCreatedEventId, "eventName", "BullaBankerCreated");
  assert.fieldEquals("BullaBankerCreatedEvent", bullaBankerCreatedEventId, "blockNumber", bullaBankerCreatedEvent.block.number.toString());
  assert.fieldEquals("BullaBankerCreatedEvent", bullaBankerCreatedEventId, "transactionHash", bullaBankerCreatedEvent.transaction.hash.toHexString());
  assert.fieldEquals("BullaBankerCreatedEvent", bullaBankerCreatedEventId, "timestamp", bullaBankerCreatedEvent.block.timestamp.toString());
  assert.fieldEquals("BullaBankerCreatedEvent", bullaBankerCreatedEventId, "logIndex", bullaBankerCreatedEvent.logIndex.toString());
  log.info("✅ should create a BullaBankerCreated event", []);

  afterEach();
});

export { handleBullaTagUpdated, handleBullaBankerCreated };
