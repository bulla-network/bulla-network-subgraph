import { Bytes, BigInt, Address } from "@graphprotocol/graph-ts";
import {
  BullaManagerSet,
  ClaimCreated as ClaimCreatedV1,
  ClaimPayment,
  ClaimRejected,
  ClaimRescinded,
  FeePaid,
  Transfer as ERC721TransferEvent,
} from "../../generated/BullaClaimERC721/BullaClaimERC721";
import { ClaimCreated as ClaimCreatedV2 } from "../../generated/BullaClaimV2/BullaClaimV2";
import { ClaimCreatedEvent, FeePaidEvent } from "../../generated/schema";
import {
  createBullaManagerSet,
  getClaimCreatedEventId,
  getClaimPaymentEventId,
  getClaimRejectedEventId,
  getClaimRescindedEventId,
  getFeePaidEventId,
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

export function handleClaimPayment(event: ClaimPayment): void {
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
