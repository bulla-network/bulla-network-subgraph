import { BigInt, log } from "@graphprotocol/graph-ts";
import { assert, test } from "matchstick-as/assembly/index";
import {
  getBindingUpdatedEventId,
  getBullaManagerSetId,
  getClaimCreatedEventId,
  getClaimImpairedEventId,
  getClaimMarkedAsPaidEventId,
  getClaimPaymentEventId,
  getClaimRejectedEventId,
  getClaimRescindedEventId,
  getFeePaidEventId,
  getMetadataAddedEventId,
  getTransferEventId,
} from "../src/functions/BullaClaimERC721";
import {
  BULLA_CLAIM_VERSION_V1,
  BULLA_CLAIM_VERSION_V2,
  CLAIM_STATUS_IMPAIRED,
  CLAIM_STATUS_PAID,
  CLAIM_STATUS_PENDING,
  CLAIM_STATUS_REJECTED,
  CLAIM_STATUS_REPAYING,
  CLAIM_STATUS_RESCINDED,
  CLAIM_TYPE_INVOICE,
  getClaimBindingFromEnum,
} from "../src/functions/common";
import {
  handleBindingUpdated,
  handleBullaManagerSetEvent,
  handleClaimCreatedV1,
  handleClaimCreatedV2,
  handleClaimImpaired,
  handleClaimMarkedAsPaid,
  handleClaimPayment,
  handleClaimPaymentV2,
  handleClaimRejected,
  handleClaimRejectedV2,
  handleClaimRescinded,
  handleClaimRescindedV2,
  handleFeePaid,
  handleMetadataAdded,
  handleTransferV1,
} from "../src/mappings/BullaClaimERC721";
import {
  newBindingUpdatedEvent,
  newBullaManagerSetEvent,
  newClaimCreatedEventV1,
  newClaimCreatedEventV2,
  newClaimCreatedWithAttachmentEvent,
  newClaimImpairedEvent,
  newClaimMarkedAsPaidEvent,
  newClaimPaymentEvent,
  newClaimPaymentEventV2,
  newClaimRejectedEvent,
  newClaimRejectedEventV2,
  newClaimRescindedEvent,
  newClaimRescindedEventV2,
  newFeePaidEvent,
  newMetadataAddedEvent,
  newPartialClaimPaymentEvent,
  newPartialClaimPaymentEventV2,
  newTransferEvent,
} from "./functions/BullaClaimERC721.testtools";
import { ADDRESS_1, ADDRESS_2, ADDRESS_3, ADDRESS_ZERO, afterEach, IPFS_HASH, MOCK_WETH_ADDRESS, setupContracts } from "./helpers";

test("it handles Transfer events", () => {
  setupContracts();

  const claimCreatedEvent = newClaimCreatedEventV1(1, CLAIM_TYPE_INVOICE);
  const transferMintEvent = newTransferEvent(claimCreatedEvent, true);
  const transferMintEventId = getTransferEventId(transferMintEvent.params.tokenId, transferMintEvent);

  handleClaimCreatedV1(claimCreatedEvent);
  handleTransferV1(transferMintEvent);

  assert.notInStore("TransferEvent", transferMintEventId);
  log.info("✅ should ignore transfer events fired on claim creation", []);

  const transferEvent = newTransferEvent(claimCreatedEvent, false);
  transferEvent.block.timestamp = claimCreatedEvent.block.timestamp.plus(BigInt.fromI32(20));
  transferEvent.block.number = claimCreatedEvent.block.number.plus(BigInt.fromI32(20));
  const transferEventId = getTransferEventId(transferEvent.params.tokenId, transferEvent);
  handleTransferV1(transferEvent);

  assert.fieldEquals("TransferEvent", transferEventId, "from", transferEvent.params.from.toHexString());
  assert.fieldEquals("TransferEvent", transferEventId, "to", transferEvent.params.to.toHexString());
  assert.fieldEquals("TransferEvent", transferEventId, "tokenId", transferEvent.params.tokenId.toString());
  assert.fieldEquals("TransferEvent", transferEventId, "claim", transferEvent.params.tokenId.toString());
  assert.fieldEquals("TransferEvent", transferEventId, "logIndex", transferEvent.logIndex.toString());
  log.info("✅ should handle transfer events", []);

  assert.fieldEquals("Claim", "1-v1", "isTransferred", "true");
  assert.fieldEquals("Claim", "1-v1", "creditor", transferEvent.params.to.toHexString());
  assert.fieldEquals("Claim", "1-v1", "lastUpdatedBlockNumber", transferEvent.block.number.toString());
  assert.fieldEquals("Claim", "1-v1", "lastUpdatedTimestamp", transferEvent.block.timestamp.toString());
  log.info("✅ should update the Claim entity with new creditor and transfer status", []);

  afterEach();
});

test("it handles FeePaid events", () => {
  setupContracts();

  const claimCreatedEvent = newClaimCreatedEventV1(1, CLAIM_TYPE_INVOICE);
  const feePaidEvent = newFeePaidEvent(claimCreatedEvent);
  const feePaidEventId = getFeePaidEventId(feePaidEvent.params.tokenId, feePaidEvent);

  handleClaimCreatedV1(claimCreatedEvent);
  handleFeePaid(feePaidEvent);

  assert.fieldEquals("FeePaidEvent", feePaidEventId, "bullaManager", feePaidEvent.params.bullaManager.toHexString());
  assert.fieldEquals("FeePaidEvent", feePaidEventId, "claim", feePaidEvent.params.tokenId.toString());
  assert.fieldEquals("FeePaidEvent", feePaidEventId, "collectionAddress", feePaidEvent.params.collectionAddress.toHexString());
  assert.fieldEquals("FeePaidEvent", feePaidEventId, "paymentAmount", feePaidEvent.params.paymentAmount.toString());
  assert.fieldEquals("FeePaidEvent", feePaidEventId, "transactionFee", feePaidEvent.params.transactionFee.toString());
  assert.fieldEquals("FeePaidEvent", feePaidEventId, "eventName", "FeePaid");
  assert.fieldEquals("FeePaidEvent", feePaidEventId, "blockNumber", feePaidEvent.block.number.toString());
  assert.fieldEquals("FeePaidEvent", feePaidEventId, "transactionHash", feePaidEvent.transaction.hash.toHexString());
  assert.fieldEquals("FeePaidEvent", feePaidEventId, "timestamp", feePaidEvent.block.timestamp.toString());
  assert.fieldEquals("FeePaidEvent", feePaidEventId, "logIndex", feePaidEvent.logIndex.toString());
  log.info("✅ should create a FeePaid entity", []);

  afterEach();
});

test("it handles ClaimRejected events", () => {
  setupContracts();

  const claimCreatedEvent = newClaimCreatedEventV1(1, CLAIM_TYPE_INVOICE);
  const claimRejectedEvent = newClaimRejectedEvent(claimCreatedEvent);
  claimRejectedEvent.block.timestamp = claimCreatedEvent.block.timestamp.plus(BigInt.fromI32(20));
  claimRejectedEvent.block.number = claimCreatedEvent.block.number.plus(BigInt.fromI32(20));
  const claimRejectedEventId = getClaimRejectedEventId(claimCreatedEvent.params.tokenId, claimCreatedEvent);

  handleClaimCreatedV1(claimCreatedEvent);
  handleClaimRejected(claimRejectedEvent);

  assert.fieldEquals("ClaimRejectedEvent", claimRejectedEventId, "managerAddress", claimRejectedEvent.params.bullaManager.toHexString());
  assert.fieldEquals("ClaimRejectedEvent", claimRejectedEventId, "claim", claimRejectedEvent.params.tokenId.toString());
  assert.fieldEquals("ClaimRejectedEvent", claimRejectedEventId, "eventName", "ClaimRejected");
  assert.fieldEquals("ClaimRejectedEvent", claimRejectedEventId, "blockNumber", claimRejectedEvent.block.number.toString());
  assert.fieldEquals("ClaimRejectedEvent", claimRejectedEventId, "transactionHash", claimRejectedEvent.transaction.hash.toHexString());
  assert.fieldEquals("ClaimRejectedEvent", claimRejectedEventId, "timestamp", claimRejectedEvent.block.timestamp.toString());
  assert.fieldEquals("ClaimRejectedEvent", claimRejectedEventId, "logIndex", claimRejectedEvent.logIndex.toString());
  log.info("✅ should create a ClaimRejectedEvent entity", []);

  assert.fieldEquals("Claim", "1-v1", "status", CLAIM_STATUS_REJECTED);
  assert.fieldEquals("Claim", "1-v1", "lastUpdatedBlockNumber", claimRejectedEvent.block.number.toString());
  assert.fieldEquals("Claim", "1-v1", "lastUpdatedTimestamp", claimRejectedEvent.block.timestamp.toString());
  log.info("✅ should set the status of a claim to rejected", []);

  afterEach();
});

test("it handles ClaimRescinded events", () => {
  setupContracts();

  const claimCreatedEvent = newClaimCreatedEventV1(1, CLAIM_TYPE_INVOICE);
  const claimRescindedEvent = newClaimRescindedEvent(claimCreatedEvent);
  claimRescindedEvent.block.timestamp = claimCreatedEvent.block.timestamp.plus(BigInt.fromI32(20));
  claimRescindedEvent.block.number = claimCreatedEvent.block.number.plus(BigInt.fromI32(20));
  const claimRescindedEventId = getClaimRescindedEventId(claimCreatedEvent.params.tokenId, claimCreatedEvent);

  handleClaimCreatedV1(claimCreatedEvent);
  handleClaimRescinded(claimRescindedEvent);

  assert.fieldEquals("ClaimRescindedEvent", claimRescindedEventId, "bullaManager", claimRescindedEvent.params.bullaManager.toHexString());
  assert.fieldEquals("ClaimRescindedEvent", claimRescindedEventId, "claim", claimRescindedEvent.params.tokenId.toString());
  assert.fieldEquals("ClaimRescindedEvent", claimRescindedEventId, "eventName", "ClaimRescinded");
  assert.fieldEquals("ClaimRescindedEvent", claimRescindedEventId, "blockNumber", claimRescindedEvent.block.number.toString());
  assert.fieldEquals("ClaimRescindedEvent", claimRescindedEventId, "transactionHash", claimRescindedEvent.transaction.hash.toHexString());
  assert.fieldEquals("ClaimRescindedEvent", claimRescindedEventId, "timestamp", claimRescindedEvent.block.timestamp.toString());
  assert.fieldEquals("ClaimRescindedEvent", claimRescindedEventId, "logIndex", claimRescindedEvent.logIndex.toString());
  log.info("✅ should create a ClaimRescindedEvent entity", []);

  assert.fieldEquals("Claim", "1-v1", "status", CLAIM_STATUS_RESCINDED);
  assert.fieldEquals("Claim", "1-v1", "lastUpdatedBlockNumber", claimRescindedEvent.block.number.toString());
  assert.fieldEquals("Claim", "1-v1", "lastUpdatedTimestamp", claimRescindedEvent.block.timestamp.toString());

  log.info("✅ should set the status of a claim to rescinded", []);

  afterEach();
});

test("it handles full ClaimPayment events", () => {
  setupContracts();

  const claimCreatedEvent = newClaimCreatedEventV1(1, CLAIM_TYPE_INVOICE);
  const fullPaymentEvent = newClaimPaymentEvent(claimCreatedEvent);
  fullPaymentEvent.block.timestamp = claimCreatedEvent.block.timestamp.plus(BigInt.fromI32(20));
  fullPaymentEvent.block.number = claimCreatedEvent.block.number.plus(BigInt.fromI32(20));
  const claimPaymentEventId = getClaimPaymentEventId(claimCreatedEvent.params.tokenId, claimCreatedEvent);

  handleClaimCreatedV1(claimCreatedEvent);
  handleClaimPayment(fullPaymentEvent);

  assert.fieldEquals("ClaimPaymentEvent", claimPaymentEventId, "bullaManager", fullPaymentEvent.params.bullaManager.toHexString());
  assert.fieldEquals("ClaimPaymentEvent", claimPaymentEventId, "claim", fullPaymentEvent.params.tokenId.toString());
  assert.fieldEquals("ClaimPaymentEvent", claimPaymentEventId, "debtor", fullPaymentEvent.params.debtor.toHexString());
  assert.fieldEquals("ClaimPaymentEvent", claimPaymentEventId, "paidBy", fullPaymentEvent.params.paidBy.toHexString());
  assert.fieldEquals("ClaimPaymentEvent", claimPaymentEventId, "paymentAmount", fullPaymentEvent.params.paymentAmount.toString());
  assert.fieldEquals("ClaimPaymentEvent", claimPaymentEventId, "eventName", "ClaimPayment");
  assert.fieldEquals("ClaimPaymentEvent", claimPaymentEventId, "blockNumber", fullPaymentEvent.block.number.toString());
  assert.fieldEquals("ClaimPaymentEvent", claimPaymentEventId, "transactionHash", fullPaymentEvent.transaction.hash.toHex());
  assert.fieldEquals("ClaimPaymentEvent", claimPaymentEventId, "timestamp", fullPaymentEvent.block.timestamp.toString());
  assert.fieldEquals("ClaimPaymentEvent", claimPaymentEventId, "logIndex", fullPaymentEvent.logIndex.toString());
  log.info("✅ should create a ClaimPaymentEvent entity", []);

  assert.fieldEquals("Claim", "1-v1", "status", CLAIM_STATUS_PAID);
  assert.fieldEquals("Claim", "1-v1", "lastUpdatedBlockNumber", fullPaymentEvent.block.number.toString());
  assert.fieldEquals("Claim", "1-v1", "lastUpdatedTimestamp", fullPaymentEvent.block.timestamp.toString());
  log.info("✅ should set the status of a claim to paid", []);

  afterEach();
});

test("it handles partial ClaimPayment events", () => {
  setupContracts();

  const claimCreatedEvent = newClaimCreatedEventV1(1, CLAIM_TYPE_INVOICE);
  const partialClaimPaymentEvent = newPartialClaimPaymentEvent(claimCreatedEvent);
  partialClaimPaymentEvent.block.timestamp = claimCreatedEvent.block.timestamp.plus(BigInt.fromI32(20));
  partialClaimPaymentEvent.block.number = claimCreatedEvent.block.number.plus(BigInt.fromI32(20));

  handleClaimCreatedV1(claimCreatedEvent);
  handleClaimPayment(partialClaimPaymentEvent);

  assert.fieldEquals("Claim", "1-v1", "status", CLAIM_STATUS_REPAYING);
  assert.fieldEquals("Claim", "1-v1", "lastUpdatedBlockNumber", partialClaimPaymentEvent.block.number.toString());
  assert.fieldEquals("Claim", "1-v1", "lastUpdatedTimestamp", partialClaimPaymentEvent.block.timestamp.toString());

  log.info("✅ should set the status of a claim to repaying", []);

  afterEach();
});

/** tests mapping */
test("it handles CreateClaim events", () => {
  setupContracts();

  const claimCreatedEvent = newClaimCreatedEventV1(1, CLAIM_TYPE_INVOICE);
  const claimCreatedEventId = getClaimCreatedEventId(claimCreatedEvent.params.tokenId, "v1");

  handleClaimCreatedV1(claimCreatedEvent);

  const tokenId = "1";
  const expectedClaimId = "1-v1";
  const ev = claimCreatedEvent.params;

  /** assert token */
  assert.fieldEquals("Token", MOCK_WETH_ADDRESS.toHexString(), "address", ev.claim.claimToken.toHexString());
  assert.fieldEquals("Token", MOCK_WETH_ADDRESS.toHexString(), "symbol", "WETH");
  assert.fieldEquals("Token", MOCK_WETH_ADDRESS.toHexString(), "decimals", "18");
  assert.fieldEquals("Token", MOCK_WETH_ADDRESS.toHexString(), "isNative", "false");
  assert.fieldEquals("Token", MOCK_WETH_ADDRESS.toHexString(), "network", "mainnet");
  log.info("✅ should create a Token entity", []);

  /** assert ClaimCreatedEvent */
  assert.fieldEquals("ClaimCreatedEvent", claimCreatedEventId, "version", BULLA_CLAIM_VERSION_V1);
  assert.fieldEquals("ClaimCreatedEvent", claimCreatedEventId, "bullaClaimAddress", claimCreatedEvent.address.toHexString());
  assert.fieldEquals("ClaimCreatedEvent", claimCreatedEventId, "claim", expectedClaimId);
  assert.fieldEquals("ClaimCreatedEvent", claimCreatedEventId, "bullaManager", ev.bullaManager.toHexString());
  assert.fieldEquals("ClaimCreatedEvent", claimCreatedEventId, "creator", ev.origin.toHexString());
  assert.fieldEquals("ClaimCreatedEvent", claimCreatedEventId, "creditor", ev.creditor.toHexString());
  assert.fieldEquals("ClaimCreatedEvent", claimCreatedEventId, "claimToken", ev.claim.claimToken.toHexString());
  assert.fieldEquals("ClaimCreatedEvent", claimCreatedEventId, "description", ev.description);
  assert.fieldEquals("ClaimCreatedEvent", claimCreatedEventId, "ipfsHash", "null");
  assert.fieldEquals("ClaimCreatedEvent", claimCreatedEventId, "amount", ev.claim.claimAmount.toString());
  assert.fieldEquals("ClaimCreatedEvent", claimCreatedEventId, "dueBy", ev.claim.dueBy.toString());
  assert.fieldEquals("ClaimCreatedEvent", claimCreatedEventId, "eventName", "ClaimCreated");
  assert.fieldEquals("ClaimCreatedEvent", claimCreatedEventId, "blockNumber", claimCreatedEvent.block.number.toString());
  assert.fieldEquals("ClaimCreatedEvent", claimCreatedEventId, "transactionHash", claimCreatedEvent.transaction.hash.toHex());
  assert.fieldEquals("ClaimCreatedEvent", claimCreatedEventId, "timestamp", claimCreatedEvent.block.timestamp.toString());
  assert.fieldEquals("ClaimCreatedEvent", claimCreatedEventId, "logIndex", claimCreatedEvent.logIndex.toString());
  log.info("✅ should create a ClaimCreatedEvent entity", []);

  /** assert Users */
  assert.fieldEquals("User", ADDRESS_1.toHexString(), "address", ADDRESS_1.toHexString());
  assert.fieldEquals("User", ADDRESS_2.toHexString(), "address", ADDRESS_2.toHexString());
  log.info("✅ should create two User entities", []);

  /** assert claim */
  assert.fieldEquals("Claim", expectedClaimId, "id", expectedClaimId);
  assert.fieldEquals("Claim", expectedClaimId, "version", BULLA_CLAIM_VERSION_V1);
  assert.fieldEquals("Claim", expectedClaimId, "bullaClaimAddress", claimCreatedEvent.address.toHexString());
  assert.fieldEquals("Claim", expectedClaimId, "tokenId", "1");
  assert.fieldEquals("Claim", expectedClaimId, "ipfsHash", "null");
  assert.fieldEquals("Claim", expectedClaimId, "creator", ev.origin.toHexString());
  assert.fieldEquals("Claim", expectedClaimId, "creditor", ev.creditor.toHexString());
  assert.fieldEquals("Claim", expectedClaimId, "debtor", ev.debtor.toHexString());
  assert.fieldEquals("Claim", expectedClaimId, "amount", ev.claim.claimAmount.toString());
  assert.fieldEquals("Claim", expectedClaimId, "paidAmount", "0");
  assert.fieldEquals("Claim", expectedClaimId, "isTransferred", "false");
  assert.fieldEquals("Claim", expectedClaimId, "description", ev.description);
  assert.fieldEquals("Claim", expectedClaimId, "created", claimCreatedEvent.block.timestamp.toString());
  assert.fieldEquals("Claim", expectedClaimId, "dueBy", ev.claim.dueBy.toString());
  assert.fieldEquals("Claim", expectedClaimId, "claimType", CLAIM_TYPE_INVOICE);
  assert.fieldEquals("Claim", expectedClaimId, "token", ev.claim.claimToken.toHexString());
  assert.fieldEquals("Claim", expectedClaimId, "status", CLAIM_STATUS_PENDING);
  assert.fieldEquals("Claim", expectedClaimId, "transactionHash", claimCreatedEvent.transaction.hash.toHex());
  assert.fieldEquals("Claim", expectedClaimId, "lastUpdatedBlockNumber", claimCreatedEvent.block.number.toString());
  assert.fieldEquals("Claim", expectedClaimId, "lastUpdatedTimestamp", claimCreatedEvent.block.timestamp.toString());
  log.info("✅ should create a Claim entity", []);

  const createClaimEvent2 = newClaimCreatedWithAttachmentEvent(2, CLAIM_TYPE_INVOICE);
  handleClaimCreatedV1(createClaimEvent2);
  const expectedClaimId2 = "2-v1";
  assert.fieldEquals("Claim", expectedClaimId2, "ipfsHash", IPFS_HASH);
  log.info("✅ should parse a multihash struct to an IPFS hash", []);

  afterEach();
});

test("it handles BullaManagerUpdated events", () => {
  setupContracts();

  const bullaManagerSetEvent = newBullaManagerSetEvent(ADDRESS_ZERO, ADDRESS_3);
  const bullaManagerSetId = getBullaManagerSetId(bullaManagerSetEvent);
  const ev = bullaManagerSetEvent.params;

  handleBullaManagerSetEvent(bullaManagerSetEvent);

  assert.fieldEquals("BullaManagerSetEvent", bullaManagerSetId, "prevBullaManager", ev.prevBullaManager.toHexString());
  assert.fieldEquals("BullaManagerSetEvent", bullaManagerSetId, "newBullaManager", ev.newBullaManager.toHexString());
  assert.fieldEquals("BullaManagerSetEvent", bullaManagerSetId, "eventName", "BullaManagerSet");
  assert.fieldEquals("BullaManagerSetEvent", bullaManagerSetId, "blockNumber", bullaManagerSetEvent.block.number.toString());
  assert.fieldEquals("BullaManagerSetEvent", bullaManagerSetId, "timestamp", bullaManagerSetEvent.block.timestamp.toString());
  assert.fieldEquals("BullaManagerSetEvent", bullaManagerSetId, "transactionHash", bullaManagerSetEvent.transaction.hash.toHexString());
  assert.fieldEquals("BullaManagerSetEvent", bullaManagerSetId, "logIndex", bullaManagerSetEvent.logIndex.toString());
  log.info("✅ should create a BullaManagerSetEvent", []);

  afterEach();
});

test("it handles BullaClaimV2 events", () => {
  setupContracts();

  const claimCreatedEvent = newClaimCreatedEventV2(1, CLAIM_TYPE_INVOICE);
  const claimCreatedEventId = getClaimCreatedEventId(claimCreatedEvent.params.claimId, "v2");

  console.log(claimCreatedEvent);
  handleClaimCreatedV2(claimCreatedEvent);

  const claimId = "1";
  const expectedClaimId = "1-v2";
  const ev = claimCreatedEvent.params;

  /** assert token */
  assert.fieldEquals("Token", MOCK_WETH_ADDRESS.toHexString(), "address", ev.token.toHexString());
  assert.fieldEquals("Token", MOCK_WETH_ADDRESS.toHexString(), "symbol", "WETH");
  assert.fieldEquals("Token", MOCK_WETH_ADDRESS.toHexString(), "decimals", "18");
  assert.fieldEquals("Token", MOCK_WETH_ADDRESS.toHexString(), "isNative", "false");
  assert.fieldEquals("Token", MOCK_WETH_ADDRESS.toHexString(), "network", "mainnet");
  log.info("✅ should create a Token entity", []);

  /** assert ClaimCreatedEvent */
  assert.fieldEquals("ClaimCreatedEvent", claimCreatedEventId, "version", BULLA_CLAIM_VERSION_V2);
  assert.fieldEquals("ClaimCreatedEvent", claimCreatedEventId, "bullaClaimAddress", claimCreatedEvent.address.toHexString());
  assert.fieldEquals("ClaimCreatedEvent", claimCreatedEventId, "claim", expectedClaimId);
  assert.fieldEquals("ClaimCreatedEvent", claimCreatedEventId, "creator", ev.from.toHexString());
  assert.fieldEquals("ClaimCreatedEvent", claimCreatedEventId, "creditor", ev.creditor.toHexString());
  assert.fieldEquals("ClaimCreatedEvent", claimCreatedEventId, "debtor", ev.debtor.toHexString());
  assert.fieldEquals("ClaimCreatedEvent", claimCreatedEventId, "claimToken", ev.token.toHexString());
  assert.fieldEquals("ClaimCreatedEvent", claimCreatedEventId, "description", ev.description);
  assert.fieldEquals("ClaimCreatedEvent", claimCreatedEventId, "amount", ev.claimAmount.toString());
  assert.fieldEquals("ClaimCreatedEvent", claimCreatedEventId, "dueBy", ev.dueBy.toString());
  assert.fieldEquals("ClaimCreatedEvent", claimCreatedEventId, "controller", ev.controller.toHexString());
  assert.fieldEquals("ClaimCreatedEvent", claimCreatedEventId, "binding", getClaimBindingFromEnum(ev.binding));
  assert.fieldEquals("ClaimCreatedEvent", claimCreatedEventId, "eventName", "ClaimCreated");
  assert.fieldEquals("ClaimCreatedEvent", claimCreatedEventId, "blockNumber", claimCreatedEvent.block.number.toString());
  assert.fieldEquals("ClaimCreatedEvent", claimCreatedEventId, "transactionHash", claimCreatedEvent.transaction.hash.toHex());
  assert.fieldEquals("ClaimCreatedEvent", claimCreatedEventId, "timestamp", claimCreatedEvent.block.timestamp.toString());
  assert.fieldEquals("ClaimCreatedEvent", claimCreatedEventId, "logIndex", claimCreatedEvent.logIndex.toString());
  log.info("✅ should create a ClaimCreatedEvent entity", []);

  /** assert Users */
  assert.fieldEquals("User", ADDRESS_1.toHexString(), "address", ADDRESS_1.toHexString());
  assert.fieldEquals("User", ADDRESS_2.toHexString(), "address", ADDRESS_2.toHexString());
  log.info("✅ should create two User entities", []);

  /** assert claim */
  assert.fieldEquals("Claim", expectedClaimId, "id", expectedClaimId);
  assert.fieldEquals("Claim", expectedClaimId, "version", BULLA_CLAIM_VERSION_V2);
  assert.fieldEquals("Claim", expectedClaimId, "bullaClaimAddress", claimCreatedEvent.address.toHexString());
  assert.fieldEquals("Claim", expectedClaimId, "tokenId", claimId);
  assert.fieldEquals("Claim", expectedClaimId, "creator", ev.from.toHexString());
  assert.fieldEquals("Claim", expectedClaimId, "creditor", ev.creditor.toHexString());
  assert.fieldEquals("Claim", expectedClaimId, "debtor", ev.debtor.toHexString());
  assert.fieldEquals("Claim", expectedClaimId, "controller", ev.controller.toHexString());
  assert.fieldEquals("Claim", expectedClaimId, "amount", ev.claimAmount.toString());
  assert.fieldEquals("Claim", expectedClaimId, "paidAmount", "0");
  assert.fieldEquals("Claim", expectedClaimId, "isTransferred", "false");
  assert.fieldEquals("Claim", expectedClaimId, "description", ev.description);
  assert.fieldEquals("Claim", expectedClaimId, "created", claimCreatedEvent.block.timestamp.toString());
  assert.fieldEquals("Claim", expectedClaimId, "dueBy", ev.dueBy.toString());
  assert.fieldEquals("Claim", expectedClaimId, "claimType", CLAIM_TYPE_INVOICE);
  assert.fieldEquals("Claim", expectedClaimId, "token", ev.token.toHexString());
  assert.fieldEquals("Claim", expectedClaimId, "status", CLAIM_STATUS_PENDING);
  assert.fieldEquals("Claim", expectedClaimId, "binding", getClaimBindingFromEnum(ev.binding));
  assert.fieldEquals("Claim", expectedClaimId, "transactionHash", claimCreatedEvent.transaction.hash.toHex());
  assert.fieldEquals("Claim", expectedClaimId, "lastUpdatedBlockNumber", claimCreatedEvent.block.number.toString());
  assert.fieldEquals("Claim", expectedClaimId, "lastUpdatedTimestamp", claimCreatedEvent.block.timestamp.toString());
  log.info("✅ should create a Claim entity", []);

  // Test MetadataAdded event
  const metadataAddedEvent = newMetadataAddedEvent(1, "https://example.com/token/1", "https://example.com/attachment/1");
  metadataAddedEvent.block.timestamp = claimCreatedEvent.block.timestamp.plus(BigInt.fromI32(10));
  metadataAddedEvent.block.number = claimCreatedEvent.block.number.plus(BigInt.fromI32(1));
  const metadataAddedEventId = getMetadataAddedEventId(metadataAddedEvent.params.claimId, metadataAddedEvent);

  handleMetadataAdded(metadataAddedEvent);

  /** assert MetadataAddedEvent */
  assert.fieldEquals("MetadataAddedEvent", metadataAddedEventId, "claim", claimId);
  assert.fieldEquals("MetadataAddedEvent", metadataAddedEventId, "tokenURI", "https://example.com/token/1");
  assert.fieldEquals("MetadataAddedEvent", metadataAddedEventId, "attachmentURI", "https://example.com/attachment/1");
  assert.fieldEquals("MetadataAddedEvent", metadataAddedEventId, "eventName", "MetadataAdded");
  assert.fieldEquals("MetadataAddedEvent", metadataAddedEventId, "blockNumber", metadataAddedEvent.block.number.toString());
  assert.fieldEquals("MetadataAddedEvent", metadataAddedEventId, "transactionHash", metadataAddedEvent.transaction.hash.toHex());
  assert.fieldEquals("MetadataAddedEvent", metadataAddedEventId, "timestamp", metadataAddedEvent.block.timestamp.toString());
  assert.fieldEquals("MetadataAddedEvent", metadataAddedEventId, "logIndex", metadataAddedEvent.logIndex.toString());
  log.info("✅ should create a MetadataAddedEvent entity", []);

  /** assert claim was updated with metadata */
  assert.fieldEquals("Claim", claimId, "tokenURI", "https://example.com/token/1");
  assert.fieldEquals("Claim", claimId, "attachmentURI", "https://example.com/attachment/1");
  assert.fieldEquals("Claim", claimId, "lastUpdatedBlockNumber", metadataAddedEvent.block.number.toString());
  assert.fieldEquals("Claim", claimId, "lastUpdatedTimestamp", metadataAddedEvent.block.timestamp.toString());
  log.info("✅ should update the Claim entity with metadata", []);

  // Test BindingUpdated event
  const bindingUpdatedEvent = newBindingUpdatedEvent(1, ADDRESS_1, 1); // 1 = BindingPending
  bindingUpdatedEvent.block.timestamp = claimCreatedEvent.block.timestamp.plus(BigInt.fromI32(20));
  bindingUpdatedEvent.block.number = claimCreatedEvent.block.number.plus(BigInt.fromI32(2));
  const bindingUpdatedEventId = getBindingUpdatedEventId(bindingUpdatedEvent.params.claimId, bindingUpdatedEvent);

  handleBindingUpdated(bindingUpdatedEvent);

  /** assert BindingUpdatedEvent */
  assert.fieldEquals("BindingUpdatedEvent", bindingUpdatedEventId, "claim", claimId);
  assert.fieldEquals("BindingUpdatedEvent", bindingUpdatedEventId, "from", ADDRESS_1.toHexString());
  assert.fieldEquals("BindingUpdatedEvent", bindingUpdatedEventId, "binding", getClaimBindingFromEnum(1));
  assert.fieldEquals("BindingUpdatedEvent", bindingUpdatedEventId, "eventName", "BindingUpdated");
  assert.fieldEquals("BindingUpdatedEvent", bindingUpdatedEventId, "blockNumber", bindingUpdatedEvent.block.number.toString());
  assert.fieldEquals("BindingUpdatedEvent", bindingUpdatedEventId, "transactionHash", bindingUpdatedEvent.transaction.hash.toHex());
  assert.fieldEquals("BindingUpdatedEvent", bindingUpdatedEventId, "timestamp", bindingUpdatedEvent.block.timestamp.toString());
  assert.fieldEquals("BindingUpdatedEvent", bindingUpdatedEventId, "logIndex", bindingUpdatedEvent.logIndex.toString());
  log.info("✅ should create a BindingUpdatedEvent entity", []);

  /** assert claim was updated with new binding */
  assert.fieldEquals("Claim", claimId, "binding", getClaimBindingFromEnum(1)); // 1 = BindingPending
  assert.fieldEquals("Claim", claimId, "lastUpdatedBlockNumber", bindingUpdatedEvent.block.number.toString());
  assert.fieldEquals("Claim", claimId, "lastUpdatedTimestamp", bindingUpdatedEvent.block.timestamp.toString());
  log.info("✅ should update the Claim entity with new binding", []);

  // Test ClaimRejectedV2 event
  const note = "Rejected by debtor due to inability to pay";
  const claimRejectedEvent = newClaimRejectedEventV2(1, ADDRESS_1, note);
  claimRejectedEvent.block.timestamp = claimCreatedEvent.block.timestamp.plus(BigInt.fromI32(30));
  claimRejectedEvent.block.number = claimCreatedEvent.block.number.plus(BigInt.fromI32(3));
  const claimRejectedEventId = getClaimRejectedEventId(claimRejectedEvent.params.claimId, claimRejectedEvent);

  handleClaimRejectedV2(claimRejectedEvent);

  /** assert ClaimRejectedEvent */
  assert.fieldEquals("ClaimRejectedEvent", claimRejectedEventId, "claim", claimId);
  assert.fieldEquals("ClaimRejectedEvent", claimRejectedEventId, "managerAddress", ADDRESS_ZERO.toHexString());
  assert.fieldEquals("ClaimRejectedEvent", claimRejectedEventId, "from", ADDRESS_1.toHexString());
  assert.fieldEquals("ClaimRejectedEvent", claimRejectedEventId, "note", note);
  assert.fieldEquals("ClaimRejectedEvent", claimRejectedEventId, "eventName", "ClaimRejected");
  assert.fieldEquals("ClaimRejectedEvent", claimRejectedEventId, "blockNumber", claimRejectedEvent.block.number.toString());
  assert.fieldEquals("ClaimRejectedEvent", claimRejectedEventId, "transactionHash", claimRejectedEvent.transaction.hash.toHex());
  assert.fieldEquals("ClaimRejectedEvent", claimRejectedEventId, "timestamp", claimRejectedEvent.block.timestamp.toString());
  assert.fieldEquals("ClaimRejectedEvent", claimRejectedEventId, "logIndex", claimRejectedEvent.logIndex.toString());
  log.info("✅ should create a ClaimRejectedEvent entity", []);

  /** assert claim was updated with rejected status */
  assert.fieldEquals("Claim", claimId, "status", CLAIM_STATUS_REJECTED);
  assert.fieldEquals("Claim", claimId, "lastUpdatedBlockNumber", claimRejectedEvent.block.number.toString());
  assert.fieldEquals("Claim", claimId, "lastUpdatedTimestamp", claimRejectedEvent.block.timestamp.toString());
  log.info("✅ should update the Claim entity with rejected status", []);

  // Test ClaimRescindedV2 event
  const rescindNote = "Rescinded by creditor due to contract dispute";
  const claimRescindedEvent = newClaimRescindedEventV2(1, ADDRESS_1, rescindNote);
  claimRescindedEvent.block.timestamp = claimCreatedEvent.block.timestamp.plus(BigInt.fromI32(40));
  claimRescindedEvent.block.number = claimCreatedEvent.block.number.plus(BigInt.fromI32(4));
  const claimRescindedEventId = getClaimRescindedEventId(claimRescindedEvent.params.claimId, claimRescindedEvent);

  handleClaimRescindedV2(claimRescindedEvent);

  /** assert ClaimRescindedEvent */
  assert.fieldEquals("ClaimRescindedEvent", claimRescindedEventId, "claim", claimId);
  assert.fieldEquals("ClaimRescindedEvent", claimRescindedEventId, "bullaManager", ADDRESS_ZERO.toHexString());
  assert.fieldEquals("ClaimRescindedEvent", claimRescindedEventId, "from", ADDRESS_1.toHexString());
  assert.fieldEquals("ClaimRescindedEvent", claimRescindedEventId, "note", rescindNote);
  assert.fieldEquals("ClaimRescindedEvent", claimRescindedEventId, "eventName", "ClaimRescinded");
  assert.fieldEquals("ClaimRescindedEvent", claimRescindedEventId, "blockNumber", claimRescindedEvent.block.number.toString());
  assert.fieldEquals("ClaimRescindedEvent", claimRescindedEventId, "transactionHash", claimRescindedEvent.transaction.hash.toHex());
  assert.fieldEquals("ClaimRescindedEvent", claimRescindedEventId, "timestamp", claimRescindedEvent.block.timestamp.toString());
  assert.fieldEquals("ClaimRescindedEvent", claimRescindedEventId, "logIndex", claimRescindedEvent.logIndex.toString());
  log.info("✅ should create a ClaimRescindedEvent entity", []);

  /** assert claim was updated with rescinded status */
  assert.fieldEquals("Claim", claimId, "status", CLAIM_STATUS_RESCINDED);
  assert.fieldEquals("Claim", claimId, "lastUpdatedBlockNumber", claimRescindedEvent.block.number.toString());
  assert.fieldEquals("Claim", claimId, "lastUpdatedTimestamp", claimRescindedEvent.block.timestamp.toString());
  log.info("✅ should update the Claim entity with rescinded status", []);

  // Test ClaimImpaired event
  const claimImpairedEvent = newClaimImpairedEvent(1);
  claimImpairedEvent.block.timestamp = claimCreatedEvent.block.timestamp.plus(BigInt.fromI32(50));
  claimImpairedEvent.block.number = claimCreatedEvent.block.number.plus(BigInt.fromI32(5));
  const claimImpairedEventId = getClaimImpairedEventId(claimImpairedEvent.params.claimId, claimImpairedEvent);

  handleClaimImpaired(claimImpairedEvent);

  /** assert ClaimImpairedEvent */
  assert.fieldEquals("ClaimImpairedEvent", claimImpairedEventId, "claim", claimId);
  assert.fieldEquals("ClaimImpairedEvent", claimImpairedEventId, "eventName", "ClaimImpaired");
  assert.fieldEquals("ClaimImpairedEvent", claimImpairedEventId, "blockNumber", claimImpairedEvent.block.number.toString());
  assert.fieldEquals("ClaimImpairedEvent", claimImpairedEventId, "transactionHash", claimImpairedEvent.transaction.hash.toHex());
  assert.fieldEquals("ClaimImpairedEvent", claimImpairedEventId, "timestamp", claimImpairedEvent.block.timestamp.toString());
  assert.fieldEquals("ClaimImpairedEvent", claimImpairedEventId, "logIndex", claimImpairedEvent.logIndex.toString());
  log.info("✅ should create a ClaimImpairedEvent entity", []);

  /** assert claim was updated with impaired status */
  assert.fieldEquals("Claim", claimId, "status", CLAIM_STATUS_IMPAIRED);
  assert.fieldEquals("Claim", claimId, "lastUpdatedBlockNumber", claimImpairedEvent.block.number.toString());
  assert.fieldEquals("Claim", claimId, "lastUpdatedTimestamp", claimImpairedEvent.block.timestamp.toString());
  log.info("✅ should update the Claim entity with impaired status", []);

  // Test ClaimMarkedAsPaid event
  const claimMarkedAsPaidEvent = newClaimMarkedAsPaidEvent(1);
  claimMarkedAsPaidEvent.block.timestamp = claimCreatedEvent.block.timestamp.plus(BigInt.fromI32(60));
  claimMarkedAsPaidEvent.block.number = claimCreatedEvent.block.number.plus(BigInt.fromI32(6));
  const claimMarkedAsPaidEventId = getClaimMarkedAsPaidEventId(claimMarkedAsPaidEvent.params.claimId, claimMarkedAsPaidEvent);

  handleClaimMarkedAsPaid(claimMarkedAsPaidEvent);

  /** assert ClaimMarkedAsPaidEvent */
  assert.fieldEquals("ClaimMarkedAsPaidEvent", claimMarkedAsPaidEventId, "claim", claimId);
  assert.fieldEquals("ClaimMarkedAsPaidEvent", claimMarkedAsPaidEventId, "eventName", "ClaimMarkedAsPaid");
  assert.fieldEquals("ClaimMarkedAsPaidEvent", claimMarkedAsPaidEventId, "blockNumber", claimMarkedAsPaidEvent.block.number.toString());
  assert.fieldEquals("ClaimMarkedAsPaidEvent", claimMarkedAsPaidEventId, "transactionHash", claimMarkedAsPaidEvent.transaction.hash.toHex());
  assert.fieldEquals("ClaimMarkedAsPaidEvent", claimMarkedAsPaidEventId, "timestamp", claimMarkedAsPaidEvent.block.timestamp.toString());
  assert.fieldEquals("ClaimMarkedAsPaidEvent", claimMarkedAsPaidEventId, "logIndex", claimMarkedAsPaidEvent.logIndex.toString());
  log.info("✅ should create a ClaimMarkedAsPaidEvent entity", []);

  /** assert claim was updated with paid status */
  assert.fieldEquals("Claim", claimId, "status", CLAIM_STATUS_PAID);
  assert.fieldEquals("Claim", claimId, "lastUpdatedBlockNumber", claimMarkedAsPaidEvent.block.number.toString());
  assert.fieldEquals("Claim", claimId, "lastUpdatedTimestamp", claimMarkedAsPaidEvent.block.timestamp.toString());
  log.info("✅ should update the Claim entity with paid status", []);

  afterEach();
});

test("it handles full ClaimPaymentV2 events", () => {
  setupContracts();

  const claimCreatedEvent = newClaimCreatedEventV2(1, CLAIM_TYPE_INVOICE);
  const fullPaymentEvent = newClaimPaymentEventV2(claimCreatedEvent);
  fullPaymentEvent.block.timestamp = claimCreatedEvent.block.timestamp.plus(BigInt.fromI32(20));
  fullPaymentEvent.block.number = claimCreatedEvent.block.number.plus(BigInt.fromI32(20));
  const claimPaymentEventId = getClaimPaymentEventId(fullPaymentEvent.params.claimId, fullPaymentEvent);

  handleClaimCreatedV2(claimCreatedEvent);
  handleClaimPaymentV2(fullPaymentEvent);

  assert.fieldEquals("ClaimPaymentEvent", claimPaymentEventId, "bullaManager", ADDRESS_ZERO.toHexString());
  assert.fieldEquals("ClaimPaymentEvent", claimPaymentEventId, "claim", fullPaymentEvent.params.claimId.toString());
  assert.fieldEquals("ClaimPaymentEvent", claimPaymentEventId, "debtor", claimCreatedEvent.params.debtor.toHexString());
  assert.fieldEquals("ClaimPaymentEvent", claimPaymentEventId, "paidBy", fullPaymentEvent.params.paidBy.toHexString());
  assert.fieldEquals("ClaimPaymentEvent", claimPaymentEventId, "paymentAmount", fullPaymentEvent.params.paymentAmount.toString());
  assert.fieldEquals("ClaimPaymentEvent", claimPaymentEventId, "eventName", "ClaimPayment");
  assert.fieldEquals("ClaimPaymentEvent", claimPaymentEventId, "blockNumber", fullPaymentEvent.block.number.toString());
  assert.fieldEquals("ClaimPaymentEvent", claimPaymentEventId, "transactionHash", fullPaymentEvent.transaction.hash.toHex());
  assert.fieldEquals("ClaimPaymentEvent", claimPaymentEventId, "timestamp", fullPaymentEvent.block.timestamp.toString());
  assert.fieldEquals("ClaimPaymentEvent", claimPaymentEventId, "logIndex", fullPaymentEvent.logIndex.toString());
  log.info("✅ should create a ClaimPaymentEvent entity for V2", []);

  assert.fieldEquals("Claim", "1-v2", "status", CLAIM_STATUS_PAID);
  assert.fieldEquals("Claim", "1-v2", "paidAmount", fullPaymentEvent.params.totalPaidAmount.toString());
  assert.fieldEquals("Claim", "1-v2", "lastUpdatedBlockNumber", fullPaymentEvent.block.number.toString());
  assert.fieldEquals("Claim", "1-v2", "lastUpdatedTimestamp", fullPaymentEvent.block.timestamp.toString());
  log.info("✅ should set the status of a V2 claim to paid", []);

  afterEach();
});

test("it handles partial ClaimPaymentV2 events", () => {
  setupContracts();

  const claimCreatedEvent = newClaimCreatedEventV2(1, CLAIM_TYPE_INVOICE);
  const partialClaimPaymentEvent = newPartialClaimPaymentEventV2(claimCreatedEvent);
  partialClaimPaymentEvent.block.timestamp = claimCreatedEvent.block.timestamp.plus(BigInt.fromI32(20));
  partialClaimPaymentEvent.block.number = claimCreatedEvent.block.number.plus(BigInt.fromI32(20));

  handleClaimCreatedV2(claimCreatedEvent);
  handleClaimPaymentV2(partialClaimPaymentEvent);

  assert.fieldEquals("Claim", "1-v2", "status", CLAIM_STATUS_REPAYING);
  assert.fieldEquals("Claim", "1-v2", "paidAmount", partialClaimPaymentEvent.params.totalPaidAmount.toString());
  assert.fieldEquals("Claim", "1-v2", "lastUpdatedBlockNumber", partialClaimPaymentEvent.block.number.toString());
  assert.fieldEquals("Claim", "1-v2", "lastUpdatedTimestamp", partialClaimPaymentEvent.block.timestamp.toString());

  log.info("✅ should set the status of a V2 claim to repaying", []);

  afterEach();
});

//exporting for test coverage
export {
  handleBullaManagerSetEvent,
  handleClaimCreatedV1,
  handleClaimPayment,
  handleClaimPaymentV2,
  handleClaimRejected,
  handleClaimRescinded,
  handleFeePaid,
  handleTransferV1,
};
