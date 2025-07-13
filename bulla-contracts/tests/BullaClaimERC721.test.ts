import { BigInt, log } from "@graphprotocol/graph-ts";
import { assert, test } from "matchstick-as/assembly/index";
import {
  getBullaManagerSetId,
  getClaimCreatedEventId,
  getClaimPaymentEventId,
  getClaimRejectedEventId,
  getClaimRescindedEventId,
  getFeePaidEventId,
  getMetadataAddedEventId,
  getTransferEventId,
} from "../src/functions/BullaClaimERC721";
import {
  CLAIM_STATUS_PAID,
  CLAIM_STATUS_PENDING,
  CLAIM_STATUS_REJECTED,
  CLAIM_STATUS_REPAYING,
  CLAIM_STATUS_RESCINDED,
  CLAIM_TYPE_INVOICE,
  getClaimBindingFromEnum,
} from "../src/functions/common";
import {
  handleBullaManagerSetEvent,
  handleClaimCreatedV1,
  handleClaimCreatedV2,
  handleClaimPayment,
  handleClaimPaymentV2,
  handleClaimRejected,
  handleClaimRescinded,
  handleFeePaid,
  handleMetadataAdded,
  handleTransfer,
} from "../src/mappings/BullaClaimERC721";
import {
  newBullaManagerSetEvent,
  newClaimCreatedEventV1,
  newClaimCreatedEventV2,
  newClaimCreatedWithAttachmentEvent,
  newClaimPaymentEvent,
  newClaimPaymentEventV2,
  newClaimRejectedEvent,
  newClaimRescindedEvent,
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
  handleTransfer(transferMintEvent);

  assert.notInStore("TransferEvent", transferMintEventId);
  log.info("✅ should ignore transfer events fired on claim creation", []);

  const transferEvent = newTransferEvent(claimCreatedEvent, false);
  transferEvent.block.timestamp = claimCreatedEvent.block.timestamp.plus(BigInt.fromI32(20));
  transferEvent.block.number = claimCreatedEvent.block.number.plus(BigInt.fromI32(20));
  const transferEventId = getTransferEventId(transferEvent.params.tokenId, transferEvent);
  handleTransfer(transferEvent);

  assert.fieldEquals("TransferEvent", transferEventId, "from", transferEvent.params.from.toHexString());
  assert.fieldEquals("TransferEvent", transferEventId, "to", transferEvent.params.to.toHexString());
  assert.fieldEquals("TransferEvent", transferEventId, "tokenId", transferEvent.params.tokenId.toString());
  assert.fieldEquals("TransferEvent", transferEventId, "claim", transferEvent.params.tokenId.toString());
  assert.fieldEquals("TransferEvent", transferEventId, "logIndex", transferEvent.logIndex.toString());
  log.info("✅ should handle transfer events", []);

  assert.fieldEquals("Claim", transferEvent.params.tokenId.toString(), "isTransferred", "true");
  assert.fieldEquals("Claim", transferEvent.params.tokenId.toString(), "creditor", transferEvent.params.to.toHexString());
  assert.fieldEquals("Claim", transferEvent.params.tokenId.toString(), "lastUpdatedBlockNumber", transferEvent.block.number.toString());
  assert.fieldEquals("Claim", transferEvent.params.tokenId.toString(), "lastUpdatedTimestamp", transferEvent.block.timestamp.toString());
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

  assert.fieldEquals("Claim", claimCreatedEvent.params.tokenId.toString(), "status", CLAIM_STATUS_REJECTED);
  assert.fieldEquals("Claim", claimCreatedEvent.params.tokenId.toString(), "lastUpdatedBlockNumber", claimRejectedEvent.block.number.toString());
  assert.fieldEquals("Claim", claimCreatedEvent.params.tokenId.toString(), "lastUpdatedTimestamp", claimRejectedEvent.block.timestamp.toString());
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

  assert.fieldEquals("Claim", claimCreatedEvent.params.tokenId.toString(), "status", CLAIM_STATUS_RESCINDED);
  assert.fieldEquals("Claim", claimCreatedEvent.params.tokenId.toString(), "lastUpdatedBlockNumber", claimRescindedEvent.block.number.toString());
  assert.fieldEquals("Claim", claimCreatedEvent.params.tokenId.toString(), "lastUpdatedTimestamp", claimRescindedEvent.block.timestamp.toString());

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

  assert.fieldEquals("Claim", "1", "status", CLAIM_STATUS_PAID);
  assert.fieldEquals("Claim", claimCreatedEvent.params.tokenId.toString(), "lastUpdatedBlockNumber", fullPaymentEvent.block.number.toString());
  assert.fieldEquals("Claim", claimCreatedEvent.params.tokenId.toString(), "lastUpdatedTimestamp", fullPaymentEvent.block.timestamp.toString());
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

  assert.fieldEquals("Claim", "1", "status", CLAIM_STATUS_REPAYING);
  assert.fieldEquals("Claim", claimCreatedEvent.params.tokenId.toString(), "lastUpdatedBlockNumber", partialClaimPaymentEvent.block.number.toString());
  assert.fieldEquals("Claim", claimCreatedEvent.params.tokenId.toString(), "lastUpdatedTimestamp", partialClaimPaymentEvent.block.timestamp.toString());

  log.info("✅ should set the status of a claim to repaying", []);

  afterEach();
});

/** tests mapping */
test("it handles CreateClaim events", () => {
  setupContracts();

  const claimCreatedEvent = newClaimCreatedEventV1(1, CLAIM_TYPE_INVOICE);
  const claimCreatedEventId = getClaimCreatedEventId(claimCreatedEvent.params.tokenId, claimCreatedEvent);

  handleClaimCreatedV1(claimCreatedEvent);

  const tokenId = "1";
  const ev = claimCreatedEvent.params;

  /** assert token */
  assert.fieldEquals("Token", MOCK_WETH_ADDRESS.toHexString(), "address", ev.claim.claimToken.toHexString());
  assert.fieldEquals("Token", MOCK_WETH_ADDRESS.toHexString(), "symbol", "WETH");
  assert.fieldEquals("Token", MOCK_WETH_ADDRESS.toHexString(), "decimals", "18");
  assert.fieldEquals("Token", MOCK_WETH_ADDRESS.toHexString(), "isNative", "false");
  assert.fieldEquals("Token", MOCK_WETH_ADDRESS.toHexString(), "network", "mainnet");
  log.info("✅ should create a Token entity", []);

  /** assert ClaimCreatedEvent */
  assert.fieldEquals("ClaimCreatedEvent", claimCreatedEventId, "claim", tokenId);
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
  assert.fieldEquals("Claim", tokenId, "id", tokenId);
  assert.fieldEquals("Claim", tokenId, "tokenId", "1");
  assert.fieldEquals("Claim", tokenId, "ipfsHash", "null");
  assert.fieldEquals("Claim", tokenId, "creator", ev.origin.toHexString());
  assert.fieldEquals("Claim", tokenId, "creditor", ev.creditor.toHexString());
  assert.fieldEquals("Claim", tokenId, "debtor", ev.debtor.toHexString());
  assert.fieldEquals("Claim", tokenId, "amount", ev.claim.claimAmount.toString());
  assert.fieldEquals("Claim", tokenId, "paidAmount", "0");
  assert.fieldEquals("Claim", tokenId, "isTransferred", "false");
  assert.fieldEquals("Claim", tokenId, "description", ev.description);
  assert.fieldEquals("Claim", tokenId, "created", claimCreatedEvent.block.timestamp.toString());
  assert.fieldEquals("Claim", tokenId, "dueBy", ev.claim.dueBy.toString());
  assert.fieldEquals("Claim", tokenId, "claimType", CLAIM_TYPE_INVOICE);
  assert.fieldEquals("Claim", tokenId, "token", ev.claim.claimToken.toHexString());
  assert.fieldEquals("Claim", tokenId, "status", CLAIM_STATUS_PENDING);
  assert.fieldEquals("Claim", tokenId, "transactionHash", claimCreatedEvent.transaction.hash.toHexString());
  assert.fieldEquals("Claim", tokenId, "bullaClaimAddress", claimCreatedEvent.address.toHexString());
  assert.fieldEquals("Claim", tokenId, "lastUpdatedBlockNumber", claimCreatedEvent.block.number.toString());
  assert.fieldEquals("Claim", tokenId, "lastUpdatedTimestamp", claimCreatedEvent.block.timestamp.toString());
  log.info("✅ should create a Claim entity", []);

  const createClaimEvent2 = newClaimCreatedWithAttachmentEvent(2, CLAIM_TYPE_INVOICE);
  handleClaimCreatedV1(createClaimEvent2);
  assert.fieldEquals("Claim", "2", "ipfsHash", IPFS_HASH);
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
  const claimCreatedEventId = getClaimCreatedEventId(claimCreatedEvent.params.claimId, claimCreatedEvent);

  handleClaimCreatedV2(claimCreatedEvent);

  const claimId = "1";
  const ev = claimCreatedEvent.params;

  /** assert token */
  assert.fieldEquals("Token", MOCK_WETH_ADDRESS.toHexString(), "address", ev.token.toHexString());
  assert.fieldEquals("Token", MOCK_WETH_ADDRESS.toHexString(), "symbol", "WETH");
  assert.fieldEquals("Token", MOCK_WETH_ADDRESS.toHexString(), "decimals", "18");
  assert.fieldEquals("Token", MOCK_WETH_ADDRESS.toHexString(), "isNative", "false");
  assert.fieldEquals("Token", MOCK_WETH_ADDRESS.toHexString(), "network", "mainnet");
  log.info("✅ should create a Token entity", []);

  /** assert ClaimCreatedEvent */
  assert.fieldEquals("ClaimCreatedEvent", claimCreatedEventId, "claim", claimId);
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
  assert.fieldEquals("Claim", claimId, "id", claimId);
  assert.fieldEquals("Claim", claimId, "tokenId", claimId);
  assert.fieldEquals("Claim", claimId, "creator", ev.from.toHexString());
  assert.fieldEquals("Claim", claimId, "creditor", ev.creditor.toHexString());
  assert.fieldEquals("Claim", claimId, "debtor", ev.debtor.toHexString());
  assert.fieldEquals("Claim", claimId, "controller", ev.controller.toHexString());
  assert.fieldEquals("Claim", claimId, "amount", ev.claimAmount.toString());
  assert.fieldEquals("Claim", claimId, "paidAmount", "0");
  assert.fieldEquals("Claim", claimId, "isTransferred", "false");
  assert.fieldEquals("Claim", claimId, "description", ev.description);
  assert.fieldEquals("Claim", claimId, "created", claimCreatedEvent.block.timestamp.toString());
  assert.fieldEquals("Claim", claimId, "dueBy", ev.dueBy.toString());
  assert.fieldEquals("Claim", claimId, "claimType", CLAIM_TYPE_INVOICE);
  assert.fieldEquals("Claim", claimId, "token", ev.token.toHexString());
  assert.fieldEquals("Claim", claimId, "status", CLAIM_STATUS_PENDING);
  assert.fieldEquals("Claim", claimId, "binding", getClaimBindingFromEnum(ev.binding));
  assert.fieldEquals("Claim", claimId, "transactionHash", claimCreatedEvent.transaction.hash.toHexString());
  assert.fieldEquals("Claim", claimId, "bullaClaimAddress", claimCreatedEvent.address.toHexString());
  assert.fieldEquals("Claim", claimId, "lastUpdatedBlockNumber", claimCreatedEvent.block.number.toString());
  assert.fieldEquals("Claim", claimId, "lastUpdatedTimestamp", claimCreatedEvent.block.timestamp.toString());
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

  assert.fieldEquals("Claim", "1", "status", CLAIM_STATUS_PAID);
  assert.fieldEquals("Claim", "1", "paidAmount", fullPaymentEvent.params.totalPaidAmount.toString());
  assert.fieldEquals("Claim", claimCreatedEvent.params.claimId.toString(), "lastUpdatedBlockNumber", fullPaymentEvent.block.number.toString());
  assert.fieldEquals("Claim", claimCreatedEvent.params.claimId.toString(), "lastUpdatedTimestamp", fullPaymentEvent.block.timestamp.toString());
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

  assert.fieldEquals("Claim", "1", "status", CLAIM_STATUS_REPAYING);
  assert.fieldEquals("Claim", "1", "paidAmount", partialClaimPaymentEvent.params.totalPaidAmount.toString());
  assert.fieldEquals("Claim", claimCreatedEvent.params.claimId.toString(), "lastUpdatedBlockNumber", partialClaimPaymentEvent.block.number.toString());
  assert.fieldEquals("Claim", claimCreatedEvent.params.claimId.toString(), "lastUpdatedTimestamp", partialClaimPaymentEvent.block.timestamp.toString());

  log.info("✅ should set the status of a V2 claim to repaying", []);

  afterEach();
});

//exporting for test coverage
export {
  handleClaimCreatedV1,
  handleClaimPayment,
  handleClaimPaymentV2,
  handleClaimRejected,
  handleClaimRescinded,
  handleFeePaid,
  handleTransfer,
  handleBullaManagerSetEvent,
};
