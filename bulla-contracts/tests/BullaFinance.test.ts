import { BigInt, log } from "@graphprotocol/graph-ts";
import { assert, test } from "matchstick-as/assembly/index";
import { getAccountTagId, getBullaTagUpdatedEventId } from "../src/functions/BullaBanker";
import { getFinancingAcceptedEventId, getFinancingOfferedEventId } from "../src/functions/BullaFinance";
import { CLAIM_TYPE_INVOICE } from "../src/functions/common";
import { handleClaimCreatedV1 } from "../src/mappings/BullaClaimERC721";
import { handleBullaTagUpdated, handleFinancingAccepted, handleFinancingOffered } from "../src/mappings/BullaFinance";
import { newClaimCreatedEventV1 } from "./functions/BullaClaimERC721.testtools";
import { newBullaTagUpdatedEvent, newFinancingAcceptedEvent, newFinancingOfferedEvent } from "./functions/BullaFinance.testtools";
import { ADDRESS_1, ADDRESS_2, afterEach, DEFAULT_ACCOUNT_TAG, setupContracts } from "./helpers";

test("it handles FinancingOffered events", () => {
  setupContracts();

  const claimId = BigInt.fromI32(1);
  const interestChargedBPS = BigInt.fromI32(875);
  const minDownPaymentBPS = BigInt.fromI32(1000);
  const termLength = BigInt.fromI32(30 * 24 * 60 * 60); // 30 days

  const timestamp = BigInt.fromI32(100);
  const blockNum = BigInt.fromI32(100);

  const claimCreatedEvent = newClaimCreatedEventV1(1, CLAIM_TYPE_INVOICE);
  claimCreatedEvent.block.timestamp = timestamp;
  claimCreatedEvent.block.number = blockNum;

  const bullaTagUpdatedEvent = newBullaTagUpdatedEvent(BigInt.fromU32(1), ADDRESS_1, DEFAULT_ACCOUNT_TAG);
  bullaTagUpdatedEvent.block.timestamp = timestamp;
  bullaTagUpdatedEvent.block.number = blockNum;

  const financingOfferedEvent = newFinancingOfferedEvent(claimId, minDownPaymentBPS, interestChargedBPS, termLength);
  financingOfferedEvent.block.timestamp = timestamp;
  financingOfferedEvent.block.number = blockNum;

  handleClaimCreatedV1(claimCreatedEvent);
  handleBullaTagUpdated(bullaTagUpdatedEvent);
  handleFinancingOffered(financingOfferedEvent);

  const bullaTagUpdatedEventId = getBullaTagUpdatedEventId(bullaTagUpdatedEvent.params.tokenId, bullaTagUpdatedEvent);
  const financingOfferedEventId = getFinancingOfferedEventId(claimCreatedEvent.params.tokenId, financingOfferedEvent);

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

  assert.fieldEquals("FinancingOfferedEvent", financingOfferedEventId, "originatingClaimId", financingOfferedEvent.params.originatingClaimId.toString());
  assert.fieldEquals("FinancingOfferedEvent", financingOfferedEventId, "minDownPaymentBPS", financingOfferedEvent.params.terms.minDownPaymentBPS.toString());
  assert.fieldEquals("FinancingOfferedEvent", financingOfferedEventId, "interestBPS", financingOfferedEvent.params.terms.interestBPS.toString());
  assert.fieldEquals("FinancingOfferedEvent", financingOfferedEventId, "termLength", financingOfferedEvent.params.terms.termLength.toString());
  assert.fieldEquals("FinancingOfferedEvent", financingOfferedEventId, "eventName", "FinancingOffered");
  assert.fieldEquals("FinancingOfferedEvent", financingOfferedEventId, "blockNumber", bullaTagUpdatedEvent.block.number.toString());
  assert.fieldEquals("FinancingOfferedEvent", financingOfferedEventId, "transactionHash", bullaTagUpdatedEvent.transaction.hash.toHexString());
  assert.fieldEquals("FinancingOfferedEvent", financingOfferedEventId, "timestamp", bullaTagUpdatedEvent.block.timestamp.toString());
  assert.fieldEquals("FinancingOfferedEvent", financingOfferedEventId, "logIndex", bullaTagUpdatedEvent.logIndex.toString());
  log.info("✅ should create a FinancingOffered event", []);

  /** assert Users */
  assert.fieldEquals("User", ADDRESS_1.toHexString(), "address", ADDRESS_1.toHexString());
  assert.fieldEquals("User", ADDRESS_2.toHexString(), "address", ADDRESS_2.toHexString());
  log.info("✅ should create two User entities", []);

  afterEach();
});

test("it handles FinancingAccepted events", () => {
  setupContracts();

  let timestamp = BigInt.fromI32(100);
  let blockNum = BigInt.fromI32(100);

  const originatingClaimEvent = newClaimCreatedEventV1(1, CLAIM_TYPE_INVOICE);
  originatingClaimEvent.block.timestamp = timestamp;
  originatingClaimEvent.block.number = blockNum;
  handleClaimCreatedV1(originatingClaimEvent);

  const bullaTagUpdatedEvent = newBullaTagUpdatedEvent(BigInt.fromU32(1), ADDRESS_1, DEFAULT_ACCOUNT_TAG);
  bullaTagUpdatedEvent.block.timestamp = timestamp;
  bullaTagUpdatedEvent.block.number = blockNum;
  handleBullaTagUpdated(bullaTagUpdatedEvent);

  // time passes
  timestamp = BigInt.fromI32(200);
  blockNum = BigInt.fromI32(200);

  const financedClaimEvent = newClaimCreatedEventV1(2, CLAIM_TYPE_INVOICE);
  originatingClaimEvent.block.timestamp = timestamp;
  originatingClaimEvent.block.number = blockNum;
  handleClaimCreatedV1(financedClaimEvent);

  const financingAcceptedEvent = newFinancingAcceptedEvent(BigInt.fromU32(1), BigInt.fromU32(2));
  financingAcceptedEvent.block.timestamp = timestamp;
  financingAcceptedEvent.block.number = blockNum;
  handleFinancingAccepted(financingAcceptedEvent);

  const financingAcceptedEventId = getFinancingAcceptedEventId(BigInt.fromU32(1), BigInt.fromU32(2), financingAcceptedEvent);

  // it should create a FinancingAcceptedEvent entity
  assert.fieldEquals("FinancingAcceptedEvent", financingAcceptedEventId, "originatingClaimId", financingAcceptedEvent.params.originatingClaimId.toString());
  assert.fieldEquals("FinancingAcceptedEvent", financingAcceptedEventId, "financedClaimId", financingAcceptedEvent.params.financedClaimId.toString());
  assert.fieldEquals("FinancingAcceptedEvent", financingAcceptedEventId, "eventName", "FinancingAccepted");
  assert.fieldEquals("FinancingAcceptedEvent", financingAcceptedEventId, "blockNumber", financingAcceptedEvent.block.number.toString());
  assert.fieldEquals("FinancingAcceptedEvent", financingAcceptedEventId, "transactionHash", financingAcceptedEvent.transaction.hash.toHexString());
  assert.fieldEquals("FinancingAcceptedEvent", financingAcceptedEventId, "timestamp", financingAcceptedEvent.block.timestamp.toString());
  assert.fieldEquals("FinancingAcceptedEvent", financingAcceptedEventId, "logIndex", financingAcceptedEvent.logIndex.toString());
  log.info("✅ should create a FinancingAccepted event", []);

  // it should update the originating claim timestamp and block number
  assert.fieldEquals("Claim", financingAcceptedEvent.params.originatingClaimId.toString(), "lastUpdatedBlockNumber", financingAcceptedEvent.block.number.toString());
  assert.fieldEquals("Claim", financingAcceptedEvent.params.originatingClaimId.toString(), "lastUpdatedTimestamp", financingAcceptedEvent.block.timestamp.toString());
  log.info("✅ should update originating claim's blocknumber and last updated timestamp", []);

  // it should update the financed claim timestamp and block number
  assert.fieldEquals("Claim", financingAcceptedEvent.params.financedClaimId.toString(), "lastUpdatedBlockNumber", financingAcceptedEvent.block.number.toString());
  assert.fieldEquals("Claim", financingAcceptedEvent.params.financedClaimId.toString(), "lastUpdatedTimestamp", financingAcceptedEvent.block.timestamp.toString());
  log.info("✅ should update financed claim's blocknumber and last updated timestamp", []);

  // it should create the user entities
  assert.fieldEquals("User", ADDRESS_1.toHexString(), "address", ADDRESS_1.toHexString());
  assert.fieldEquals("User", ADDRESS_2.toHexString(), "address", ADDRESS_2.toHexString());
  log.info("✅ should create two User entities", []);

  afterEach();
});

// exporting for test coverage
export { handleClaimCreatedV1, handleBullaTagUpdated, handleFinancingOffered, handleFinancingAccepted };
