import { Bytes, BigInt, Address } from "@graphprotocol/graph-ts";
import {
  BullaManagerSet,
  ClaimCreated as ClaimCreatedV1,
  ClaimPayment as ClaimPaymentV1,
  ClaimRejected,
  ClaimRescinded,
  FeePaid,
  Transfer as ERC721TransferEvent,
} from "../../generated/BullaClaimERC721/BullaClaimERC721";
import {
  ClaimCreated as ClaimCreatedV2,
  ClaimPayment as ClaimPaymentV2,
  MetadataAdded,
  BindingUpdated,
  ClaimRejected as ClaimRejectedV2,
  ClaimRescinded as ClaimRescindedV2,
  ClaimImpaired,
} from "../../generated/BullaClaimV2/BullaClaimV2";
import { BindingUpdatedEvent, ClaimCreatedEvent, ClaimImpairedEvent, FeePaidEvent, MetadataAddedEvent } from "../../generated/schema";
import {
  createBullaManagerSet,
  getClaimCreatedEventId,
  getClaimPaymentEventId,
  getClaimRejectedEventId,
  getClaimRescindedEventId,
  getFeePaidEventId,
  getMetadataAddedEventId,
  getBindingUpdatedEventId,
  getClaimImpairedEventId,
  getOrCreateClaim,
  getOrCreateClaimPaymentEvent,
  getOrCreateClaimRejectedEvent,
  getOrCreateClaimRescindedEvent,
  getOrCreateTransferEvent,
  getTransferEventId,
} from "../functions/BullaClaimERC721";
import {
  ADDRESS_ZERO,
  CLAIM_STATUS_PAID,
  CLAIM_STATUS_PENDING,
  CLAIM_STATUS_REJECTED,
  CLAIM_STATUS_REPAYING,
  CLAIM_STATUS_RESCINDED,
  CLAIM_STATUS_IMPAIRED,
  CLAIM_TYPE_INVOICE,
  CLAIM_TYPE_PAYMENT,
  CLAIM_BINDING_UNBOUND,
  getClaimBindingFromEnum,
  getIPFSHash_claimCreated,
  getOrCreateToken,
  getOrCreateUser,
} from "../functions/common";

export function handleTransfer(event: ERC721TransferEvent): void {
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

    const claim = getOrCreateClaim(tokenId);
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

  const claim = getOrCreateClaim(tokenId);
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

  const claim = getOrCreateClaim(tokenId);
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
  const claim = getOrCreateClaim(ev.tokenId.toString());
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

  const claim = getOrCreateClaim(ev.claimId.toString());
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
  const claim = getOrCreateClaim(tokenId);
  const user_creditor = getOrCreateUser(ev.creditor);
  const user_debtor = getOrCreateUser(ev.debtor);
  const user_creator = getOrCreateUser(ev.origin);
  const user_nullController = getOrCreateUser(Address.fromString(ADDRESS_ZERO)); // no controller in v1

  claim.tokenId = tokenId;
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

  const claimCreatedEventId = getClaimCreatedEventId(ev.tokenId, event);
  const claimCreatedEvent = new ClaimCreatedEvent(claimCreatedEventId);
  claimCreatedEvent.claim = claim.id;
  claimCreatedEvent.bullaManager = ev.bullaManager;
  claimCreatedEvent.creator = ev.origin;
  claimCreatedEvent.debtor = ev.claim.debtor;
  claimCreatedEvent.creditor = ev.creditor;
  claimCreatedEvent.claimToken = token.id;
  claimCreatedEvent.description = ev.description;
  claimCreatedEvent.timestamp = ev.blocktime;
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
  const ev = event.params;
  const token = getOrCreateToken(ev.token);

  const tokenId = ev.claimId.toString();
  const claim = getOrCreateClaim(tokenId);
  const user_creditor = getOrCreateUser(ev.creditor);
  const user_debtor = getOrCreateUser(ev.debtor);
  const user_creator = getOrCreateUser(ev.from);
  const user_controller = getOrCreateUser(ev.controller);

  claim.tokenId = tokenId;
  claim.creator = user_creator.id;
  claim.creditor = user_creditor.id;
  claim.debtor = user_debtor.id;
  claim.controller = user_controller.id;

  claim.amount = ev.claimAmount;
  claim.paidAmount = BigInt.fromI32(0);
  claim.isTransferred = false;
  claim.description = ev.description;
  claim.created = event.block.timestamp;
  claim.dueBy = ev.dueBy;
  claim.claimType = ev.from.equals(ev.creditor) ? CLAIM_TYPE_INVOICE : CLAIM_TYPE_PAYMENT;
  claim.token = token.id;
  claim.status = CLAIM_STATUS_PENDING;
  claim.binding = getClaimBindingFromEnum(ev.binding);
  claim.transactionHash = event.transaction.hash;
  claim.lastUpdatedBlockNumber = event.block.number;
  claim.lastUpdatedTimestamp = event.block.timestamp;
  claim.bullaClaimAddress = event.address;

  claim.save();

  const claimCreatedEventId = getClaimCreatedEventId(ev.claimId, event);
  const claimCreatedEvent = new ClaimCreatedEvent(claimCreatedEventId);
  claimCreatedEvent.claim = claim.id;
  claimCreatedEvent.bullaManager = Bytes.fromHexString(ADDRESS_ZERO);
  claimCreatedEvent.creator = ev.from;
  claimCreatedEvent.debtor = ev.debtor;
  claimCreatedEvent.creditor = ev.creditor;
  claimCreatedEvent.claimToken = token.id;
  claimCreatedEvent.description = ev.description;
  claimCreatedEvent.timestamp = event.block.timestamp;
  claimCreatedEvent.amount = ev.claimAmount;
  claimCreatedEvent.dueBy = ev.dueBy;
  claimCreatedEvent.controller = ev.controller;
  claimCreatedEvent.binding = getClaimBindingFromEnum(ev.binding);

  claimCreatedEvent.eventName = "ClaimCreated";
  claimCreatedEvent.blockNumber = event.block.number;
  claimCreatedEvent.transactionHash = event.transaction.hash;
  claimCreatedEvent.logIndex = event.logIndex;
  claimCreatedEvent.timestamp = event.block.timestamp;
  claimCreatedEvent.save();

  user_creditor.claims = user_creditor.claims ? user_creditor.claims.concat([claim.id]) : [claim.id];
  user_debtor.claims = user_debtor.claims ? user_debtor.claims.concat([claim.id]) : [claim.id];
  user_creator.claims = user_creator.claims ? user_creator.claims.concat([claim.id]) : [claim.id];
  user_controller.claims = user_controller.claims ? user_controller.claims.concat([claim.id]) : [claim.id];

  user_creditor.save();
  user_debtor.save();
  user_creator.save();
  user_controller.save();
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

  const claim = getOrCreateClaim(tokenId);
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

  const claim = getOrCreateClaim(tokenId);
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

  const claim = getOrCreateClaim(tokenId);
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

  const claim = getOrCreateClaim(tokenId);
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

  const claim = getOrCreateClaim(tokenId);
  claim.lastUpdatedBlockNumber = event.block.number;
  claim.lastUpdatedTimestamp = event.block.timestamp;
  claim.status = CLAIM_STATUS_IMPAIRED;
  claim.save();
}
