import { Address, BigInt, Bytes, log } from "@graphprotocol/graph-ts";
import {
  BullaManagerSet,
  ClaimCreated as ClaimCreatedV1,
  ClaimPayment as ClaimPaymentV1,
  ClaimRejected,
  ClaimRescinded,
  Transfer as ERC721TransferEvent,
  FeePaid,
} from "../../generated/BullaClaimERC721/BullaClaimERC721";
import {
  BindingUpdated,
  ClaimCreated as ClaimCreatedV2,
  ClaimImpaired,
  ClaimMarkedAsPaid,
  ClaimPayment as ClaimPaymentV2,
  ClaimRejected as ClaimRejectedV2,
  ClaimRescinded as ClaimRescindedV2,
  MetadataAdded,
} from "../../generated/BullaClaimV2/BullaClaimV2";
import { BindingUpdatedEvent, ClaimCreatedEvent, ClaimImpairedEvent, ClaimMarkedAsPaidEvent, FeePaidEvent, MetadataAddedEvent } from "../../generated/schema";
import {
  createBullaManagerSet,
  getBindingUpdatedEventId,
  getClaimCreatedEventId,
  getClaimImpairedEventId,
  getClaimMarkedAsPaidEventId,
  getClaimPaymentEventId,
  getClaimRejectedEventId,
  getClaimRescindedEventId,
  getFeePaidEventId,
  getMetadataAddedEventId,
  getOrCreateClaim,
  getOrCreateClaimPaymentEvent,
  getOrCreateClaimRejectedEvent,
  getOrCreateClaimRescindedEvent,
  getOrCreateTransferEvent,
  getTransferEventId,
} from "../functions/BullaClaimERC721";
import {
  ADDRESS_ZERO,
  BULLA_CLAIM_VERSION_V1,
  BULLA_CLAIM_VERSION_V2,
  CLAIM_BINDING_UNBOUND,
  CLAIM_STATUS_IMPAIRED,
  CLAIM_STATUS_PAID,
  CLAIM_STATUS_PENDING,
  CLAIM_STATUS_REJECTED,
  CLAIM_STATUS_REPAYING,
  CLAIM_STATUS_RESCINDED,
  CLAIM_TYPE_INVOICE,
  CLAIM_TYPE_PAYMENT,
  getClaimBindingFromEnum,
  getIPFSHash_claimCreated,
  getOrCreateToken,
  getOrCreateUser,
} from "../functions/common";

// Helper function for safe BigInt to string conversion with debugging
function safeToString(value: BigInt, fieldName: string): string {
  log.warning("DEBUG: Converting {} to string", [fieldName]);
  const result = value.toString();
  log.warning("DEBUG: Successfully converted {} to: {}", [fieldName, result]);
  return result;
}

export function handleTransferV1(event: ERC721TransferEvent): void {
  const ev = event.params;
  const transferId = getTransferEventId(event.params.tokenId, event);
  const tokenId = ev.tokenId.toString();
  const isMintEvent = ev.from.equals(Bytes.fromHexString(ADDRESS_ZERO));

  if (!isMintEvent) {
    const user_newOwner = getOrCreateUser(ev.to);
    const transferEvent = getOrCreateTransferEvent(transferId);

    transferEvent.tokenId = tokenId;
    transferEvent.from = ev.from;
    transferEvent.to = ev.to;
    transferEvent.claim = tokenId;
    transferEvent.eventName = "Transfer";
    transferEvent.blockNumber = event.block.number;
    transferEvent.transactionHash = event.transaction.hash;
    transferEvent.logIndex = event.logIndex;
    transferEvent.timestamp = event.block.timestamp;
    transferEvent.save();

    const claim = getOrCreateClaim(tokenId, "v1");
    claim.isTransferred = true;
    claim.creditor = user_newOwner.id;
    claim.lastUpdatedBlockNumber = event.block.number;
    claim.lastUpdatedTimestamp = event.block.timestamp;
    claim.save();

    user_newOwner.claims = user_newOwner.claims ? user_newOwner.claims.concat([claim.id]) : [claim.id];
    user_newOwner.save();
  }
}

export function handleTransferV2(event: ERC721TransferEvent): void {
  const ev = event.params;
  const transferId = getTransferEventId(event.params.tokenId, event);
  const tokenId = ev.tokenId.toString();
  const isMintEvent = ev.from.equals(Bytes.fromHexString(ADDRESS_ZERO));

  if (!isMintEvent) {
    const user_newOwner = getOrCreateUser(ev.to);
    const transferEvent = getOrCreateTransferEvent(transferId);

    transferEvent.tokenId = tokenId;
    transferEvent.from = ev.from;
    transferEvent.to = ev.to;
    transferEvent.claim = tokenId;
    transferEvent.eventName = "Transfer";
    transferEvent.blockNumber = event.block.number;
    transferEvent.transactionHash = event.transaction.hash;
    transferEvent.logIndex = event.logIndex;
    transferEvent.timestamp = event.block.timestamp;
    transferEvent.save();

    const claim = getOrCreateClaim(tokenId, "v2");
    claim.isTransferred = true;
    claim.creditor = user_newOwner.id;
    claim.lastUpdatedBlockNumber = event.block.number;
    claim.lastUpdatedTimestamp = event.block.timestamp;
    claim.save();

    user_newOwner.claims = user_newOwner.claims ? user_newOwner.claims.concat([claim.id]) : [claim.id];
    user_newOwner.save();
  }
}

export function handleFeePaid(event: FeePaid): void {
  const ev = event.params;
  const feePaidEventId = getFeePaidEventId(event.params.tokenId, event);
  const tokenId = ev.tokenId.toString();
  const feePaidEvent = new FeePaidEvent(feePaidEventId);

  feePaidEvent.id = feePaidEventId;
  feePaidEvent.bullaManager = ev.bullaManager;
  feePaidEvent.claim = tokenId;
  feePaidEvent.collectionAddress = ev.collectionAddress;
  feePaidEvent.paymentAmount = ev.paymentAmount;
  feePaidEvent.transactionFee = ev.transactionFee;
  feePaidEvent.eventName = "FeePaid";
  feePaidEvent.blockNumber = event.block.number;
  feePaidEvent.transactionHash = event.transaction.hash;
  feePaidEvent.logIndex = event.logIndex;
  feePaidEvent.timestamp = event.block.timestamp;
  feePaidEvent.save();
}

export function handleClaimRescinded(event: ClaimRescinded): void {
  const ev = event.params;
  const tokenId = ev.tokenId.toString();
  const claimRescindedEventId = getClaimRescindedEventId(event.params.tokenId, event);

  const claimRescindedEvent = getOrCreateClaimRescindedEvent(claimRescindedEventId);
  claimRescindedEvent.bullaManager = ev.bullaManager;
  claimRescindedEvent.from = Bytes.fromHexString(ADDRESS_ZERO);
  claimRescindedEvent.note = "";
  claimRescindedEvent.claim = tokenId;
  claimRescindedEvent.eventName = "ClaimRescinded";
  claimRescindedEvent.blockNumber = event.block.number;
  claimRescindedEvent.transactionHash = event.transaction.hash;
  claimRescindedEvent.logIndex = event.logIndex;
  claimRescindedEvent.timestamp = event.block.timestamp;
  claimRescindedEvent.save();

  const claim = getOrCreateClaim(tokenId, BULLA_CLAIM_VERSION_V1);
  claim.lastUpdatedBlockNumber = event.block.number;
  claim.lastUpdatedTimestamp = event.block.timestamp;
  claim.status = CLAIM_STATUS_RESCINDED;
  claim.save();
}

export function handleClaimRejected(event: ClaimRejected): void {
  const ev = event.params;
  const tokenId = ev.tokenId.toString();
  const claimRejectedEventId = getClaimRejectedEventId(event.params.tokenId, event);

  const claimRejectedEvent = getOrCreateClaimRejectedEvent(claimRejectedEventId);
  claimRejectedEvent.managerAddress = ev.bullaManager;
  claimRejectedEvent.from = Bytes.fromHexString(ADDRESS_ZERO);
  claimRejectedEvent.note = "";
  claimRejectedEvent.claim = tokenId;
  claimRejectedEvent.eventName = "ClaimRejected";
  claimRejectedEvent.blockNumber = event.block.number;
  claimRejectedEvent.transactionHash = event.transaction.hash;
  claimRejectedEvent.logIndex = event.logIndex;
  claimRejectedEvent.timestamp = event.block.timestamp;
  claimRejectedEvent.save();

  const claim = getOrCreateClaim(tokenId, BULLA_CLAIM_VERSION_V1);
  claim.lastUpdatedBlockNumber = event.block.number;
  claim.lastUpdatedTimestamp = event.block.timestamp;
  claim.status = CLAIM_STATUS_REJECTED;
  claim.save();
}

export function handleClaimPayment(event: ClaimPaymentV1): void {
  const ev = event.params;
  const claimPaymentEventId = getClaimPaymentEventId(event.params.tokenId, event);
  const claimPaymentEvent = getOrCreateClaimPaymentEvent(claimPaymentEventId);

  claimPaymentEvent.bullaManager = ev.bullaManager;
  claimPaymentEvent.claim = ev.tokenId.toString();
  claimPaymentEvent.debtor = ev.debtor;
  claimPaymentEvent.paidBy = ev.paidBy;
  claimPaymentEvent.paymentAmount = ev.paymentAmount;
  claimPaymentEvent.eventName = "ClaimPayment";
  claimPaymentEvent.blockNumber = event.block.number;
  claimPaymentEvent.transactionHash = event.transaction.hash;
  claimPaymentEvent.logIndex = event.logIndex;
  claimPaymentEvent.timestamp = event.block.timestamp;
  claimPaymentEvent.save();
  //TODO: fix repaying event sourcing issues
  const claim = getOrCreateClaim(ev.tokenId.toString(), BULLA_CLAIM_VERSION_V1);
  const totalPaidAmount = claim.paidAmount.plus(ev.paymentAmount);
  const isClaimPaid = totalPaidAmount.equals(claim.amount);

  claim.paidAmount = totalPaidAmount;
  claim.status = isClaimPaid ? CLAIM_STATUS_PAID : CLAIM_STATUS_REPAYING;
  claim.lastUpdatedBlockNumber = event.block.number;
  claim.lastUpdatedTimestamp = event.block.timestamp;
  claim.save();
}

export function handleClaimPaymentV2(event: ClaimPaymentV2): void {
  const ev = event.params;
  const claimPaymentEventId = getClaimPaymentEventId(event.params.claimId, event);
  const claimPaymentEvent = getOrCreateClaimPaymentEvent(claimPaymentEventId);

  claimPaymentEvent.bullaManager = Bytes.fromHexString(ADDRESS_ZERO); // Not available in V2
  claimPaymentEvent.claim = ev.claimId.toString();
  claimPaymentEvent.paidBy = ev.paidBy;
  claimPaymentEvent.paymentAmount = ev.paymentAmount;
  claimPaymentEvent.eventName = "ClaimPayment";
  claimPaymentEvent.blockNumber = event.block.number;
  claimPaymentEvent.transactionHash = event.transaction.hash;
  claimPaymentEvent.logIndex = event.logIndex;
  claimPaymentEvent.timestamp = event.block.timestamp;

  const claim = getOrCreateClaim(ev.claimId.toString(), BULLA_CLAIM_VERSION_V2);
  claimPaymentEvent.debtor = Bytes.fromHexString(claim.debtor);

  claimPaymentEvent.save();

  // Update claim with total paid amount from event
  const isClaimPaid = ev.totalPaidAmount.equals(claim.amount);
  claim.paidAmount = ev.totalPaidAmount;
  claim.status = isClaimPaid ? CLAIM_STATUS_PAID : CLAIM_STATUS_REPAYING;
  claim.lastUpdatedBlockNumber = event.block.number;
  claim.lastUpdatedTimestamp = event.block.timestamp;
  claim.save();
}

export function handleBullaManagerSetEvent(event: BullaManagerSet): void {
  const ev = event.params;
  const bullaManagerSetEvent = createBullaManagerSet(event);
  bullaManagerSetEvent.prevBullaManager = ev.prevBullaManager;
  bullaManagerSetEvent.newBullaManager = ev.newBullaManager;
  bullaManagerSetEvent.eventName = "BullaManagerSet";
  bullaManagerSetEvent.blockNumber = event.block.number;
  bullaManagerSetEvent.transactionHash = event.transaction.hash;
  bullaManagerSetEvent.logIndex = event.logIndex;
  bullaManagerSetEvent.timestamp = event.block.timestamp;

  bullaManagerSetEvent.save();
}

export function handleClaimCreatedV1(event: ClaimCreatedV1): void {
  const ev = event.params;
  const token = getOrCreateToken(ev.claim.claimToken);
  const ipfsHash = getIPFSHash_claimCreated(ev.claim.attachment);

  const tokenId = ev.tokenId.toString();
  const claim = getOrCreateClaim(tokenId, BULLA_CLAIM_VERSION_V1);
  const user_creditor = getOrCreateUser(ev.creditor);
  const user_debtor = getOrCreateUser(ev.debtor);
  const user_creator = getOrCreateUser(ev.origin);
  const user_nullController = getOrCreateUser(Address.fromString(ADDRESS_ZERO)); // no controller in v1

  claim.tokenId = tokenId;
  claim.version = BULLA_CLAIM_VERSION_V1;
  claim.ipfsHash = ipfsHash;
  claim.creator = user_creator.id;
  claim.creditor = user_creditor.id;
  claim.debtor = user_debtor.id;
  claim.amount = ev.claim.claimAmount;
  claim.paidAmount = ev.claim.paidAmount;
  claim.isTransferred = false;
  claim.description = ev.description;
  claim.created = event.block.timestamp;
  claim.dueBy = ev.claim.dueBy;
  claim.claimType = ev.origin.equals(ev.creditor) ? CLAIM_TYPE_INVOICE : CLAIM_TYPE_PAYMENT;
  claim.token = token.id;
  claim.status = CLAIM_STATUS_PENDING;
  claim.controller = user_nullController.id; // null id, as no controller in v1
  claim.binding = CLAIM_BINDING_UNBOUND; // no binding in v1
  claim.transactionHash = event.transaction.hash;
  claim.lastUpdatedBlockNumber = event.block.number;
  claim.lastUpdatedTimestamp = event.block.timestamp;
  claim.bullaClaimAddress = event.address;

  claim.save();

  const claimCreatedEventId = getClaimCreatedEventId(ev.tokenId, "v1");
  const claimCreatedEvent = new ClaimCreatedEvent(claimCreatedEventId);
  claimCreatedEvent.version = BULLA_CLAIM_VERSION_V1;
  claimCreatedEvent.bullaClaimAddress = event.address;
  claimCreatedEvent.claim = claim.id;
  claimCreatedEvent.bullaManager = ev.bullaManager;
  claimCreatedEvent.creator = ev.origin;
  claimCreatedEvent.debtor = ev.claim.debtor;
  claimCreatedEvent.creditor = ev.creditor;
  claimCreatedEvent.claimToken = token.id;
  claimCreatedEvent.description = ev.description;
  claimCreatedEvent.ipfsHash = ipfsHash;
  claimCreatedEvent.amount = ev.claim.claimAmount;
  claimCreatedEvent.dueBy = ev.claim.dueBy;
  claimCreatedEvent.controller = Bytes.fromHexString(ADDRESS_ZERO); // no controller in v1
  claimCreatedEvent.binding = CLAIM_BINDING_UNBOUND; // no binding in v1

  claimCreatedEvent.eventName = "ClaimCreated";
  claimCreatedEvent.blockNumber = event.block.number;
  claimCreatedEvent.transactionHash = event.transaction.hash;
  claimCreatedEvent.logIndex = event.logIndex;
  claimCreatedEvent.timestamp = event.block.timestamp;
  claimCreatedEvent.save();

  user_creditor.claims = user_creditor.claims ? user_creditor.claims.concat([claim.id]) : [claim.id];
  user_debtor.claims = user_debtor.claims ? user_debtor.claims.concat([claim.id]) : [claim.id];
  user_creator.claims = user_creator.claims ? user_creator.claims.concat([claim.id]) : [claim.id];

  user_creditor.save();
  user_debtor.save();
  user_creator.save();
}

export function handleClaimCreatedV2(event: ClaimCreatedV2): void {
  log.warning("DEBUG 1: Starting handleClaimCreatedV2", []);
  const ev = event.params;
  log.warning("DEBUG 2: Got event.params", []);

  log.warning("DEBUG 3: About to call getOrCreateToken", []);
  const token = getOrCreateToken(ev.token);
  log.warning("DEBUG 4: Successfully got token", []);

  // Debug logging to identify the exact issue
  log.warning("DEBUG 5: About to call ev.claimId.toString()", []);

  log.warning("DEBUG 6: About to call safeToString", []);
  const tokenId = safeToString(ev.claimId, "ev.claimId");
  log.warning("DEBUG 7: Successfully got tokenId: {}", [tokenId]);

  log.warning("DEBUG 8: About to call getOrCreateClaim", []);
  const claim = getOrCreateClaim(tokenId, BULLA_CLAIM_VERSION_V2);
  log.warning("DEBUG 9: Successfully got claim", []);

  log.warning("DEBUG 10: About to call getOrCreateUser for creditor", []);
  const user_creditor = getOrCreateUser(ev.creditor);
  log.warning("DEBUG 11: Successfully got user_creditor", []);

  log.warning("DEBUG 12: About to call getOrCreateUser for debtor", []);
  const user_debtor = getOrCreateUser(ev.debtor);
  log.warning("DEBUG 13: Successfully got user_debtor", []);

  log.warning("DEBUG 14: About to call getOrCreateUser for creator", []);
  const user_creator = getOrCreateUser(ev.from);
  log.warning("DEBUG 15: Successfully got user_creator", []);

  log.warning("DEBUG 16: About to call getOrCreateUser for controller", []);
  const user_controller = getOrCreateUser(ev.controller);
  log.warning("DEBUG 17: Successfully got user_controller", []);

  log.warning("DEBUG 18: About to set claim.tokenId", []);
  claim.tokenId = tokenId;
  log.warning("DEBUG 19: About to set claim.version", []);
  claim.version = BULLA_CLAIM_VERSION_V2;
  log.warning("DEBUG 20: About to set claim.ipfsHash", []);
  claim.ipfsHash = null; // V2 events don't include IPFS hash initially
  log.warning("DEBUG 21: About to set claim.creator", []);
  claim.creator = user_creator.id;
  log.warning("DEBUG 22: About to set claim.creditor", []);
  claim.creditor = user_creditor.id;
  log.warning("DEBUG 23: About to set claim.debtor", []);
  claim.debtor = user_debtor.id;
  log.warning("DEBUG 24: About to set claim.controller", []);
  claim.controller = user_controller.id;

  log.warning("DEBUG 25: About to set claim.amount", []);
  claim.amount = ev.claimAmount;
  log.warning("DEBUG 26: About to set claim.paidAmount", []);
  claim.paidAmount = BigInt.fromI32(0);
  log.warning("DEBUG 27: About to set claim.isTransferred", []);
  claim.isTransferred = false;
  log.warning("DEBUG 28: About to set claim.description", []);
  claim.description = ev.description;
  log.warning("DEBUG 29: About to set claim.created", []);
  claim.created = event.block.timestamp;
  log.warning("DEBUG 30: About to set claim.dueBy", []);
  claim.dueBy = ev.dueBy;
  log.warning("DEBUG 31: About to set claim.claimType", []);
  claim.claimType = ev.from.equals(ev.creditor) ? CLAIM_TYPE_INVOICE : CLAIM_TYPE_PAYMENT;
  log.warning("DEBUG 32: About to set claim.token", []);
  claim.token = token.id;
  log.warning("DEBUG 33: About to set claim.status", []);
  claim.status = CLAIM_STATUS_PENDING;
  log.warning("DEBUG 34: About to call getClaimBindingFromEnum", []);
  claim.binding = getClaimBindingFromEnum(ev.binding);
  log.warning("DEBUG 35: About to set claim.transactionHash", []);
  claim.transactionHash = event.transaction.hash;
  log.warning("DEBUG 36: About to set claim.lastUpdatedBlockNumber", []);
  claim.lastUpdatedBlockNumber = event.block.number;
  log.warning("DEBUG 37: About to set claim.lastUpdatedTimestamp", []);
  claim.lastUpdatedTimestamp = event.block.timestamp;
  log.warning("DEBUG 38: About to set claim.bullaClaimAddress", []);
  claim.bullaClaimAddress = event.address;

  log.warning("DEBUG 39: About to save claim", []);
  claim.save();
  log.warning("DEBUG 40: Successfully saved claim", []);

  log.warning("DEBUG 41: About to call getClaimCreatedEventId", []);
  const claimCreatedEventId = getClaimCreatedEventId(ev.claimId, "v2");
  log.warning("DEBUG 42: Successfully got claimCreatedEventId: {}", [claimCreatedEventId]);

  log.warning("DEBUG 43: About to create new ClaimCreatedEvent", []);
  const claimCreatedEvent = new ClaimCreatedEvent(claimCreatedEventId);
  log.warning("DEBUG 44: About to set claimCreatedEvent.version", []);
  claimCreatedEvent.version = BULLA_CLAIM_VERSION_V2;
  log.warning("DEBUG 45: About to set claimCreatedEvent.bullaClaimAddress", []);
  claimCreatedEvent.bullaClaimAddress = event.address;
  log.warning("DEBUG 46: About to set claimCreatedEvent.claim", []);
  claimCreatedEvent.claim = claim.id;
  log.warning("DEBUG 47: About to set claimCreatedEvent.bullaManager", []);
  claimCreatedEvent.bullaManager = Bytes.fromHexString(ADDRESS_ZERO);
  log.warning("DEBUG 48: About to set claimCreatedEvent.creator", []);
  claimCreatedEvent.creator = ev.from;
  log.warning("DEBUG 49: About to set claimCreatedEvent.debtor", []);
  claimCreatedEvent.debtor = ev.debtor;
  log.warning("DEBUG 50: About to set claimCreatedEvent.creditor", []);
  claimCreatedEvent.creditor = ev.creditor;
  log.warning("DEBUG 51: About to set claimCreatedEvent.claimToken", []);
  claimCreatedEvent.claimToken = token.id;
  log.warning("DEBUG 52: About to set claimCreatedEvent.description", []);
  claimCreatedEvent.description = ev.description;
  log.warning("DEBUG 53: About to set claimCreatedEvent.ipfsHash", []);
  claimCreatedEvent.ipfsHash = null; // V2 events don't include IPFS hash initially
  log.warning("DEBUG 54: About to set claimCreatedEvent.amount", []);
  claimCreatedEvent.amount = ev.claimAmount;
  log.warning("DEBUG 55: About to set claimCreatedEvent.dueBy", []);
  claimCreatedEvent.dueBy = ev.dueBy;
  log.warning("DEBUG 56: About to set claimCreatedEvent.controller", []);
  claimCreatedEvent.controller = ev.controller;
  log.warning("DEBUG 57: About to call getClaimBindingFromEnum for event", []);
  claimCreatedEvent.binding = getClaimBindingFromEnum(ev.binding);

  log.warning("DEBUG 58: About to set claimCreatedEvent.eventName", []);
  claimCreatedEvent.eventName = "ClaimCreated";
  log.warning("DEBUG 59: About to set claimCreatedEvent.blockNumber", []);
  claimCreatedEvent.blockNumber = event.block.number;
  log.warning("DEBUG 60: About to set claimCreatedEvent.transactionHash", []);
  claimCreatedEvent.transactionHash = event.transaction.hash;
  log.warning("DEBUG 61: About to set claimCreatedEvent.logIndex", []);
  claimCreatedEvent.logIndex = event.logIndex;
  log.warning("DEBUG 62: About to set claimCreatedEvent.timestamp", []);
  claimCreatedEvent.timestamp = event.block.timestamp;
  log.warning("DEBUG 63: About to save claimCreatedEvent", []);
  claimCreatedEvent.save();
  log.warning("DEBUG 64: Successfully saved claimCreatedEvent", []);

  log.warning("DEBUG 65: About to update user_creditor.claims", []);
  user_creditor.claims = user_creditor.claims ? user_creditor.claims.concat([claim.id]) : [claim.id];
  log.warning("DEBUG 66: About to update user_debtor.claims", []);
  user_debtor.claims = user_debtor.claims ? user_debtor.claims.concat([claim.id]) : [claim.id];
  log.warning("DEBUG 67: About to update user_creator.claims", []);
  user_creator.claims = user_creator.claims ? user_creator.claims.concat([claim.id]) : [claim.id];
  log.warning("DEBUG 68: About to update user_controller.claims", []);
  user_controller.claims = user_controller.claims ? user_controller.claims.concat([claim.id]) : [claim.id];

  log.warning("DEBUG 69: About to save user_creditor", []);
  user_creditor.save();
  log.warning("DEBUG 70: About to save user_debtor", []);
  user_debtor.save();
  log.warning("DEBUG 71: About to save user_creator", []);
  user_creator.save();
  log.warning("DEBUG 72: About to save user_controller", []);
  user_controller.save();
  log.warning("DEBUG 73: Completed handleClaimCreatedV2 successfully", []);
}

export function handleMetadataAdded(event: MetadataAdded): void {
  const ev = event.params;
  const tokenId = ev.claimId.toString();
  const metadataAddedEventId = getMetadataAddedEventId(ev.claimId, event);

  const metadataAddedEvent = new MetadataAddedEvent(metadataAddedEventId);
  metadataAddedEvent.claim = tokenId;
  metadataAddedEvent.tokenURI = ev.tokenURI;
  metadataAddedEvent.attachmentURI = ev.attachmentURI;
  metadataAddedEvent.eventName = "MetadataAdded";
  metadataAddedEvent.blockNumber = event.block.number;
  metadataAddedEvent.transactionHash = event.transaction.hash;
  metadataAddedEvent.logIndex = event.logIndex;
  metadataAddedEvent.timestamp = event.block.timestamp;
  metadataAddedEvent.save();

  const claim = getOrCreateClaim(tokenId, BULLA_CLAIM_VERSION_V2);
  claim.tokenURI = ev.tokenURI;
  claim.attachmentURI = ev.attachmentURI;
  claim.lastUpdatedBlockNumber = event.block.number;
  claim.lastUpdatedTimestamp = event.block.timestamp;
  claim.save();
}

export function handleBindingUpdated(event: BindingUpdated): void {
  const ev = event.params;
  const tokenId = ev.claimId.toString();
  const bindingUpdatedEventId = getBindingUpdatedEventId(ev.claimId, event);

  const bindingUpdatedEvent = new BindingUpdatedEvent(bindingUpdatedEventId);
  bindingUpdatedEvent.claim = tokenId;
  bindingUpdatedEvent.from = ev.from;
  bindingUpdatedEvent.binding = getClaimBindingFromEnum(ev.binding);
  bindingUpdatedEvent.eventName = "BindingUpdated";
  bindingUpdatedEvent.blockNumber = event.block.number;
  bindingUpdatedEvent.transactionHash = event.transaction.hash;
  bindingUpdatedEvent.logIndex = event.logIndex;
  bindingUpdatedEvent.timestamp = event.block.timestamp;
  bindingUpdatedEvent.save();

  const claim = getOrCreateClaim(tokenId, BULLA_CLAIM_VERSION_V2);
  claim.binding = getClaimBindingFromEnum(ev.binding);
  claim.lastUpdatedBlockNumber = event.block.number;
  claim.lastUpdatedTimestamp = event.block.timestamp;
  claim.save();
}

export function handleClaimRejectedV2(event: ClaimRejectedV2): void {
  const ev = event.params;
  const tokenId = ev.claimId.toString();
  const claimRejectedEventId = getClaimRejectedEventId(ev.claimId, event);

  const claimRejectedEvent = getOrCreateClaimRejectedEvent(claimRejectedEventId);
  claimRejectedEvent.managerAddress = Bytes.fromHexString(ADDRESS_ZERO); // No bullaManager in V2
  claimRejectedEvent.from = ev.from;
  claimRejectedEvent.note = ev.note;
  claimRejectedEvent.claim = tokenId;
  claimRejectedEvent.eventName = "ClaimRejected";
  claimRejectedEvent.blockNumber = event.block.number;
  claimRejectedEvent.transactionHash = event.transaction.hash;
  claimRejectedEvent.logIndex = event.logIndex;
  claimRejectedEvent.timestamp = event.block.timestamp;
  claimRejectedEvent.save();

  const claim = getOrCreateClaim(tokenId, BULLA_CLAIM_VERSION_V2);
  claim.lastUpdatedBlockNumber = event.block.number;
  claim.lastUpdatedTimestamp = event.block.timestamp;
  claim.status = CLAIM_STATUS_REJECTED;
  claim.save();
}

export function handleClaimRescindedV2(event: ClaimRescindedV2): void {
  const ev = event.params;
  const tokenId = ev.claimId.toString();
  const claimRescindedEventId = getClaimRescindedEventId(ev.claimId, event);

  const claimRescindedEvent = getOrCreateClaimRescindedEvent(claimRescindedEventId);
  claimRescindedEvent.bullaManager = Bytes.fromHexString(ADDRESS_ZERO); // No bullaManager in V2
  claimRescindedEvent.from = ev.from;
  claimRescindedEvent.note = ev.note;
  claimRescindedEvent.claim = tokenId;
  claimRescindedEvent.eventName = "ClaimRescinded";
  claimRescindedEvent.blockNumber = event.block.number;
  claimRescindedEvent.transactionHash = event.transaction.hash;
  claimRescindedEvent.logIndex = event.logIndex;
  claimRescindedEvent.timestamp = event.block.timestamp;
  claimRescindedEvent.save();

  const claim = getOrCreateClaim(tokenId, BULLA_CLAIM_VERSION_V2);
  claim.lastUpdatedBlockNumber = event.block.number;
  claim.lastUpdatedTimestamp = event.block.timestamp;
  claim.status = CLAIM_STATUS_RESCINDED;
  claim.save();
}

export function handleClaimImpaired(event: ClaimImpaired): void {
  const ev = event.params;
  const tokenId = ev.claimId.toString();
  const claimImpairedEventId = getClaimImpairedEventId(ev.claimId, event);

  const claimImpairedEvent = new ClaimImpairedEvent(claimImpairedEventId);
  claimImpairedEvent.claim = tokenId;
  claimImpairedEvent.eventName = "ClaimImpaired";
  claimImpairedEvent.blockNumber = event.block.number;
  claimImpairedEvent.transactionHash = event.transaction.hash;
  claimImpairedEvent.logIndex = event.logIndex;
  claimImpairedEvent.timestamp = event.block.timestamp;
  claimImpairedEvent.save();

  const claim = getOrCreateClaim(tokenId, BULLA_CLAIM_VERSION_V2);
  claim.lastUpdatedBlockNumber = event.block.number;
  claim.lastUpdatedTimestamp = event.block.timestamp;
  claim.status = CLAIM_STATUS_IMPAIRED;
  claim.save();
}

export function handleClaimMarkedAsPaid(event: ClaimMarkedAsPaid): void {
  const ev = event.params;
  const tokenId = ev.claimId.toString();
  const claimMarkedAsPaidEventId = getClaimMarkedAsPaidEventId(ev.claimId, event);

  const claimMarkedAsPaidEvent = new ClaimMarkedAsPaidEvent(claimMarkedAsPaidEventId);
  claimMarkedAsPaidEvent.claim = tokenId;
  claimMarkedAsPaidEvent.eventName = "ClaimMarkedAsPaid";
  claimMarkedAsPaidEvent.blockNumber = event.block.number;
  claimMarkedAsPaidEvent.transactionHash = event.transaction.hash;
  claimMarkedAsPaidEvent.logIndex = event.logIndex;
  claimMarkedAsPaidEvent.timestamp = event.block.timestamp;
  claimMarkedAsPaidEvent.save();

  const claim = getOrCreateClaim(tokenId, BULLA_CLAIM_VERSION_V2);
  claim.lastUpdatedBlockNumber = event.block.number;
  claim.lastUpdatedTimestamp = event.block.timestamp;
  claim.status = CLAIM_STATUS_PAID;
  claim.save();
}
