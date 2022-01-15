import { log } from "@graphprotocol/graph-ts";
import { assert, logStore, test } from "matchstick-as/assembly/index";
import {
  getBullaManagerSetId,
  getClaimCreatedEventId,
  getClaimPaymentEventId,
  getClaimRejectedEventId,
  getClaimRescindedEventId,
  getFeePaidEventId,
  getTransferEventId
} from "../src/functions/BullaClaimERC721";
import {
  CLAIM_STATUS_PAID,
  CLAIM_STATUS_PENDING,
  CLAIM_STATUS_REJECTED,
  CLAIM_STATUS_REPAYING,
  CLAIM_STATUS_RESCINDED,
  CLAIM_TYPE_INVOICE
} from "../src/functions/common";
import {
  handleBullaManagerSetEvent,
  handleClaimCreated,
  handleClaimPayment,
  handleClaimRejected,
  handleClaimRescinded,
  handleFeePaid,
  handleTransfer
} from "../src/mappings/BullaClaimERC721";
import {
  newBullaManagerSetEvent,
  newClaimCreatedEvent,
  newClaimCreatedWithAttachmentEvent,
  newClaimPaymentEvent,
  newClaimRejectedEvent,
  newClaimRescindedEvent,
  newFeePaidEvent,
  newPartialClaimPaymentEvent,
  newTransferEvent
} from "./functions/BullaClaimERC721.testtools";
import { ADDRESS_1, ADDRESS_2, ADDRESS_3, ADDRESS_ZERO, afterEach, IPFS_HASH, MOCK_WETH_ADDRESS, setupContracts } from "./helpers";

test("it handles Transfer events", () => {
  setupContracts();

  const claimCreatedEvent = newClaimCreatedEvent(1, CLAIM_TYPE_INVOICE);
  const transferMintEvent = newTransferEvent(claimCreatedEvent, true);
  const transferMintEventId = getTransferEventId(transferMintEvent.params.tokenId, transferMintEvent.transaction.hash);

  handleClaimCreated(claimCreatedEvent);
  handleTransfer(transferMintEvent);

  assert.notInStore("TransferEvent", transferMintEventId);
  log.info("✅ should ignore transfer events fired on claim creation", []);

  const transferEvent = newTransferEvent(claimCreatedEvent, false);
  const transferEventId = getTransferEventId(transferEvent.params.tokenId, transferEvent.transaction.hash);
  handleTransfer(transferEvent);

  assert.fieldEquals("TransferEvent", transferEventId, "from", transferEvent.params.from.toHexString());
  assert.fieldEquals("TransferEvent", transferEventId, "to", transferEvent.params.to.toHexString());
  assert.fieldEquals("TransferEvent", transferEventId, "tokenId", transferEvent.params.tokenId.toString());
  log.info("✅ should handle transfer events", []);

  assert.fieldEquals("Claim", transferEvent.params.tokenId.toString(), "isTransferred", "true");
  assert.fieldEquals("Claim", transferEvent.params.tokenId.toString(), "creditor", transferEvent.params.to.toHexString());
  log.info("✅ should update the Claim entity with new creditor and transfer status", []);

  afterEach();
});

test("it handles FeePaid events", () => {
  setupContracts();

  const claimCreatedEvent = newClaimCreatedEvent(1, CLAIM_TYPE_INVOICE);
  const feePaidEvent = newFeePaidEvent(claimCreatedEvent);
  const feePaidEventId = getFeePaidEventId(feePaidEvent.params.tokenId, feePaidEvent.transaction.hash);

  handleClaimCreated(claimCreatedEvent);
  handleFeePaid(feePaidEvent);

  assert.fieldEquals("FeePaidEvent", feePaidEventId, "bullaManager", feePaidEvent.params.bullaManager.toHexString());
  assert.fieldEquals("FeePaidEvent", feePaidEventId, "tokenId", feePaidEvent.params.tokenId.toString());
  assert.fieldEquals("FeePaidEvent", feePaidEventId, "collectionAddress", feePaidEvent.params.collectionAddress.toHexString());
  assert.fieldEquals("FeePaidEvent", feePaidEventId, "paymentAmount", feePaidEvent.params.paymentAmount.toString());
  assert.fieldEquals("FeePaidEvent", feePaidEventId, "transactionFee", feePaidEvent.params.transactionFee.toString());
  assert.fieldEquals("FeePaidEvent", feePaidEventId, "eventName", "FeePaid");
  assert.fieldEquals("FeePaidEvent", feePaidEventId, "blockNumber", feePaidEvent.block.number.toString());
  assert.fieldEquals("FeePaidEvent", feePaidEventId, "transactionHash", feePaidEvent.transaction.hash.toHexString());
  assert.fieldEquals("FeePaidEvent", feePaidEventId, "timestamp", feePaidEvent.block.timestamp.toString());
  log.info("✅ should create a FeePaid entity", []);

  afterEach();
});

test("it handles ClaimRejected events", () => {
  setupContracts();

  const claimCreatedEvent = newClaimCreatedEvent(1, CLAIM_TYPE_INVOICE);
  const claimRejectedEvent = newClaimRejectedEvent(claimCreatedEvent);
  const claimRejectedEventId = getClaimRejectedEventId(claimCreatedEvent.params.tokenId, claimCreatedEvent.transaction.hash);

  handleClaimCreated(claimCreatedEvent);
  handleClaimRejected(claimRejectedEvent);

  assert.fieldEquals("ClaimRejectedEvent", claimRejectedEventId, "managerAddress", claimRejectedEvent.params.bullaManager.toHexString());
  assert.fieldEquals("ClaimRejectedEvent", claimRejectedEventId, "tokenId", claimRejectedEvent.params.tokenId.toString());
  assert.fieldEquals("ClaimRejectedEvent", claimRejectedEventId, "eventName", "ClaimRejected");
  assert.fieldEquals("ClaimRejectedEvent", claimRejectedEventId, "blockNumber", claimRejectedEvent.block.number.toString());
  assert.fieldEquals("ClaimRejectedEvent", claimRejectedEventId, "transactionHash", claimRejectedEvent.transaction.hash.toHexString());
  assert.fieldEquals("ClaimRejectedEvent", claimRejectedEventId, "timestamp", claimRejectedEvent.block.timestamp.toString());
  log.info("✅ should create a ClaimRejectedEvent entity", []);

  assert.fieldEquals("Claim", claimCreatedEvent.params.tokenId.toString(), "status", CLAIM_STATUS_REJECTED);
  log.info("✅ should set the status of a claim to rejected", []);

  afterEach();
});

test("it handles ClaimRescinded events", () => {
  setupContracts();

  const claimCreatedEvent = newClaimCreatedEvent(1, CLAIM_TYPE_INVOICE);
  const claimRescindedEvent = newClaimRescindedEvent(claimCreatedEvent);
  const claimRescindedEventId = getClaimRescindedEventId(claimCreatedEvent.params.tokenId, claimCreatedEvent.transaction.hash);

  handleClaimCreated(claimCreatedEvent);
  handleClaimRescinded(claimRescindedEvent);

  assert.fieldEquals("ClaimRescindedEvent", claimRescindedEventId, "bullaManager", claimRescindedEvent.params.bullaManager.toHexString());
  assert.fieldEquals("ClaimRescindedEvent", claimRescindedEventId, "tokenId", claimRescindedEvent.params.tokenId.toString());
  assert.fieldEquals("ClaimRescindedEvent", claimRescindedEventId, "eventName", "ClaimRescinded");
  assert.fieldEquals("ClaimRescindedEvent", claimRescindedEventId, "blockNumber", claimRescindedEvent.block.number.toString());
  assert.fieldEquals("ClaimRescindedEvent", claimRescindedEventId, "transactionHash", claimRescindedEvent.transaction.hash.toHexString());
  assert.fieldEquals("ClaimRescindedEvent", claimRescindedEventId, "timestamp", claimRescindedEvent.block.timestamp.toString());
  log.info("✅ should create a ClaimRescindedEvent entity", []);

  assert.fieldEquals("Claim", claimCreatedEvent.params.tokenId.toString(), "status", CLAIM_STATUS_RESCINDED);
  log.info("✅ should set the status of a claim to rescinded", []);

  afterEach();
});

test("it handles full ClaimPayment events", () => {
  setupContracts();

  const claimCreatedEvent = newClaimCreatedEvent(1, CLAIM_TYPE_INVOICE);
  const fullPaymentEvent = newClaimPaymentEvent(claimCreatedEvent);
  const claimPaymentEventId = getClaimPaymentEventId(claimCreatedEvent.params.tokenId, claimCreatedEvent.transaction.hash);

  handleClaimCreated(claimCreatedEvent);
  handleClaimPayment(fullPaymentEvent);

  assert.fieldEquals("ClaimPaymentEvent", claimPaymentEventId, "bullaManager", fullPaymentEvent.params.bullaManager.toHexString());
  assert.fieldEquals("ClaimPaymentEvent", claimPaymentEventId, "tokenId", fullPaymentEvent.params.tokenId.toString());
  assert.fieldEquals("ClaimPaymentEvent", claimPaymentEventId, "debtor", fullPaymentEvent.params.debtor.toHexString());
  assert.fieldEquals("ClaimPaymentEvent", claimPaymentEventId, "paidBy", fullPaymentEvent.params.paidBy.toHexString());
  assert.fieldEquals("ClaimPaymentEvent", claimPaymentEventId, "paymentAmount", fullPaymentEvent.params.paymentAmount.toString());
  assert.fieldEquals("ClaimPaymentEvent", claimPaymentEventId, "eventName", "ClaimPayment");
  assert.fieldEquals("ClaimPaymentEvent", claimPaymentEventId, "blockNumber", fullPaymentEvent.block.number.toString());
  assert.fieldEquals("ClaimPaymentEvent", claimPaymentEventId, "transactionHash", fullPaymentEvent.transaction.hash.toHex());
  assert.fieldEquals("ClaimPaymentEvent", claimPaymentEventId, "timestamp", fullPaymentEvent.block.timestamp.toString());
  log.info("✅ should create a ClaimPaymentEvent entity", []);

  assert.fieldEquals("Claim", "1", "status", CLAIM_STATUS_PAID);
  log.info("✅ should set the status of a claim to paid", []);

  afterEach();
});

test("it handles partial ClaimPayment events", () => {
  setupContracts();

  const claimCreatedEvent = newClaimCreatedEvent(1, CLAIM_TYPE_INVOICE);
  const partialClaimPaymentEvent = newPartialClaimPaymentEvent(claimCreatedEvent);

  handleClaimCreated(claimCreatedEvent);
  handleClaimPayment(partialClaimPaymentEvent);

  assert.fieldEquals("Claim", "1", "status", CLAIM_STATUS_REPAYING);
  log.info("✅ should set the status of a claim to repaying", []);

  afterEach();
});

/** tests mapping */
test("it handles CreateClaim events", () => {
  setupContracts();

  const claimCreatedEvent = newClaimCreatedEvent(1, CLAIM_TYPE_INVOICE);
  const claimCreatedEventId = getClaimCreatedEventId(claimCreatedEvent.params.tokenId, claimCreatedEvent.transaction.hash);

  handleClaimCreated(claimCreatedEvent);

  const tokenId = "1";
  const ev = claimCreatedEvent.params;

  /** assert token */
  assert.fieldEquals("Token", MOCK_WETH_ADDRESS.toHexString(), "address", ev.claim.claimToken.toHexString());
  assert.fieldEquals("Token", MOCK_WETH_ADDRESS.toHexString(), "symbol", "WETH");
  assert.fieldEquals("Token", MOCK_WETH_ADDRESS.toHexString(), "decimals", "18");
  assert.fieldEquals("Token", MOCK_WETH_ADDRESS.toHexString(), "isNative", "false");
  assert.fieldEquals("Token", MOCK_WETH_ADDRESS.toHexString(), "network", "mainnet");
  log.info("✅ should create a Token entity", []);
  logStore();
  /** assert ClaimCreatedEvent */
  assert.fieldEquals("ClaimCreatedEvent", claimCreatedEventId, "tokenId", tokenId);
  assert.fieldEquals("ClaimCreatedEvent", claimCreatedEventId, "bullaManager", ev.bullaManager.toHexString());
  assert.fieldEquals("ClaimCreatedEvent", claimCreatedEventId, "parent", ev.parent.toHexString());
  assert.fieldEquals("ClaimCreatedEvent", claimCreatedEventId, "creator", ev.origin.toHexString());
  assert.fieldEquals("ClaimCreatedEvent", claimCreatedEventId, "creditor", ev.creditor.toHexString());
  assert.fieldEquals("ClaimCreatedEvent", claimCreatedEventId, "claimToken", ev.claim.claimToken.toHexString());
  assert.fieldEquals("ClaimCreatedEvent", claimCreatedEventId, "description", ev.description);
  assert.fieldEquals("ClaimCreatedEvent", claimCreatedEventId, "ipfsHash", "null");
  // assert.fieldEquals("ClaimCreatedEvent", claimCreatedEventId, "ipfsHash_hex", "null");
  // assert.fieldEquals("ClaimCreatedEvent", claimCreatedEventId, "ipfsHash_hashFunction", "null");
  // assert.fieldEquals("ClaimCreatedEvent", claimCreatedEventId, "ipfsHash_size", "null");
  assert.fieldEquals("ClaimCreatedEvent", claimCreatedEventId, "amount", ev.claim.claimAmount.toString());
  assert.fieldEquals("ClaimCreatedEvent", claimCreatedEventId, "dueBy", ev.claim.dueBy.toString());
  assert.fieldEquals("ClaimCreatedEvent", claimCreatedEventId, "eventName", "ClaimCreated");
  assert.fieldEquals("ClaimCreatedEvent", claimCreatedEventId, "blockNumber", claimCreatedEvent.block.number.toString());
  assert.fieldEquals("ClaimCreatedEvent", claimCreatedEventId, "transactionHash", claimCreatedEvent.transaction.hash.toHex());
  assert.fieldEquals("ClaimCreatedEvent", claimCreatedEventId, "timestamp", "1");
  log.info("✅ should create a ClaimCreatedEvent entity", []);

  /** assert Users */
  // TODO: handle lists?
  // assert.fieldEquals("User", ADDRESS_1.toHexString(), "claims", ADDRESS_1.toHexString());
  assert.fieldEquals("User", ADDRESS_1.toHexString(), "address", ADDRESS_1.toHexString());
  assert.fieldEquals("User", ADDRESS_2.toHexString(), "address", ADDRESS_2.toHexString());
  log.info("✅ should create two User entities", []);

  /** assert claim */
  assert.fieldEquals("Claim", tokenId, "id", tokenId);
  assert.fieldEquals("Claim", tokenId, "tokenId", "1");
  assert.fieldEquals("Claim", tokenId, "ipfsHash", "null");
  // assert.fieldEquals("Claim", tokenId, "ipfsHash_hex", "null");
  // assert.fieldEquals("Claim", tokenId, "ipfsHash_hashFunction", "null");
  // assert.fieldEquals("Claim", tokenId, "ipfsHash_size", "null");
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
  log.info("✅ should create a Claim entity", []);

  const createClaimEvent2 = newClaimCreatedWithAttachmentEvent(2, CLAIM_TYPE_INVOICE);
  handleClaimCreated(createClaimEvent2);
  assert.fieldEquals("Claim", "2", "ipfsHash", IPFS_HASH);
  // assert.fieldEquals("Claim", "2", "ipfsHash_hex", MULTIHASH_BYTES);
  // assert.fieldEquals("Claim", "2", "ipfsHash_hashFunction", MULTIHASH_FUNCTION.toString());
  // assert.fieldEquals("Claim", "2", "ipfsHash_size", MULTIHASH_SIZE.toString());
  log.info("✅ should parse a multihash struct to an IPFS hash", []);

  afterEach();
});

test("it handles BullaManagerUpdated events", () => {
  setupContracts();

  const bullaManagerSetEvent = newBullaManagerSetEvent(ADDRESS_ZERO, ADDRESS_3);
  const bullaManagerSetId = getBullaManagerSetId(bullaManagerSetEvent.transaction.hash);
  const ev = bullaManagerSetEvent.params;

  handleBullaManagerSetEvent(bullaManagerSetEvent);

  assert.fieldEquals("BullaManagerSetEvent", bullaManagerSetId, "prevBullaManager", ev.prevBullaManager.toHexString());
  assert.fieldEquals("BullaManagerSetEvent", bullaManagerSetId, "newBullaManager", ev.newBullaManager.toHexString());
  assert.fieldEquals("BullaManagerSetEvent", bullaManagerSetId, "eventName", "BullaManagerSet");
  assert.fieldEquals("BullaManagerSetEvent", bullaManagerSetId, "blockNumber", bullaManagerSetEvent.block.number.toString());
  assert.fieldEquals("BullaManagerSetEvent", bullaManagerSetId, "timestamp", bullaManagerSetEvent.block.timestamp.toString());
  assert.fieldEquals("BullaManagerSetEvent", bullaManagerSetId, "transactionHash", bullaManagerSetEvent.transaction.hash.toHexString());
  log.info("✅ should create a BullaManagerSetEvent", []);

  afterEach();
});

//exporting for test coverage
export { handleClaimCreated, handleClaimPayment, handleClaimRejected, handleClaimRescinded, handleFeePaid, handleTransfer, handleBullaManagerSetEvent };
