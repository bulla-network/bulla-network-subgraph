import { Bytes } from "@graphprotocol/graph-ts";
import {
  BullaManagerSet,
  ClaimCreated,
  ClaimPayment,
  ClaimRejected,
  ClaimRescinded,
  FeePaid,
  Transfer as ERC721TransferEvent
} from "../../generated/BullaClaimERC721/BullaClaimERC721";
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
  getOrCreateClaimRescindedEvent, getOrCreateTransferEvent,
  getTransferEventId
} from "../functions/BullaClaimERC721";
import { ADDRESS_ZERO, getIPFSHash, getOrCreateToken, getOrCreateUser } from "../functions/common";

export function handleTransfer(event: ERC721TransferEvent): void {
  const ev = event.params;
  const transferId = getTransferEventId(event.params.tokenId, event.transaction.hash);
  const tokenId = ev.tokenId.toString();
  const isMintEvent = ev.from.equals(Bytes.fromHexString(ADDRESS_ZERO));

  if (!isMintEvent) {
    const transferEvent = getOrCreateTransferEvent(transferId);

    transferEvent.tokenId = tokenId;
    transferEvent.from = ev.from;
    transferEvent.to = ev.to;
    transferEvent.eventName = "Transfer";
    transferEvent.blockNumber = event.block.number;
    transferEvent.transactionHash = event.transaction.hash;
    transferEvent.timestamp = event.block.timestamp;
    transferEvent.save();

    const user_creditor = getOrCreateUser(ev.to);
    const claim = getOrCreateClaim(tokenId);
    claim.isTransferred = true;
    claim.creditor = user_creditor.id;
    claim.save();
  }
}

export function handleFeePaid(event: FeePaid): void {
  const ev = event.params;
  const feePaidEventId = getFeePaidEventId(event.params.tokenId, event.transaction.hash);
  const tokenId = ev.tokenId.toString();
  const feePaidEvent = new FeePaidEvent(feePaidEventId);

  feePaidEvent.id = feePaidEventId;
  feePaidEvent.bullaManager = ev.bullaManager;
  feePaidEvent.tokenId = tokenId;
  feePaidEvent.collectionAddress = ev.collectionAddress;
  feePaidEvent.paymentAmount = ev.paymentAmount;
  feePaidEvent.transactionFee = ev.transactionFee;
  feePaidEvent.eventName = "FeePaid";
  feePaidEvent.blockNumber = event.block.number;
  feePaidEvent.transactionHash = event.transaction.hash;
  feePaidEvent.timestamp = event.block.timestamp;
  feePaidEvent.save();
}

export function handleClaimRescinded(event: ClaimRescinded): void {
  const ev = event.params;
  const tokenId = ev.tokenId.toString();
  const claimRescindedEventId = getClaimRescindedEventId(event.params.tokenId, event.transaction.hash);

  const claimRejectedEvent = getOrCreateClaimRescindedEvent(claimRescindedEventId);
  claimRejectedEvent.bullaManager = ev.bullaManager;
  claimRejectedEvent.tokenId = tokenId;
  claimRejectedEvent.eventName = "ClaimRescinded";
  claimRejectedEvent.blockNumber = event.block.number;
  claimRejectedEvent.transactionHash = event.transaction.hash;
  claimRejectedEvent.timestamp = event.block.timestamp;
  claimRejectedEvent.save();

  const claim = getOrCreateClaim(tokenId);
  claim.status = "RESCINDED";
  claim.save();
}

export function handleClaimRejected(event: ClaimRejected): void {
  const ev = event.params;
  const tokenId = ev.tokenId.toString();
  const claimRejectedEventId = getClaimRejectedEventId(event.params.tokenId, event.transaction.hash);

  const claimRejectedEvent = getOrCreateClaimRejectedEvent(claimRejectedEventId);
  claimRejectedEvent.managerAddress = ev.bullaManager;
  claimRejectedEvent.tokenId = tokenId;
  claimRejectedEvent.eventName = "ClaimRejected";
  claimRejectedEvent.blockNumber = event.block.number;
  claimRejectedEvent.transactionHash = event.transaction.hash;
  claimRejectedEvent.timestamp = event.block.timestamp;
  claimRejectedEvent.save();

  const claim = getOrCreateClaim(tokenId);
  claim.status = "REJECTED";
  claim.save();
}

export function handleClaimPayment(event: ClaimPayment): void {
  const ev = event.params;
  const claimPaymentEventId = getClaimPaymentEventId(event.params.tokenId, event.transaction.hash);
  const claimPaymentEvent = getOrCreateClaimPaymentEvent(claimPaymentEventId);

  claimPaymentEvent.bullaManager = ev.bullaManager;
  claimPaymentEvent.tokenId = ev.tokenId.toString();
  claimPaymentEvent.debtor = ev.debtor;
  claimPaymentEvent.paidBy = ev.paidBy;
  claimPaymentEvent.paymentAmount = ev.paymentAmount;
  claimPaymentEvent.eventName = "ClaimPayment";
  claimPaymentEvent.blockNumber = event.block.number;
  claimPaymentEvent.transactionHash = event.transaction.hash;
  claimPaymentEvent.timestamp = event.block.timestamp;
  claimPaymentEvent.save();

  const claim = getOrCreateClaim(ev.tokenId.toString());
  const totalPaidAmount = claim.paidAmount.plus(ev.paymentAmount);
  const isClaimPaid = totalPaidAmount.equals(claim.amount);

  claim.paidAmount = totalPaidAmount;
  claim.status = isClaimPaid ? "PAID" : "REPAYING";
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
  bullaManagerSetEvent.timestamp = event.block.timestamp;

  bullaManagerSetEvent.save();
}

export function handleClaimCreated(event: ClaimCreated): void {
  const ev = event.params;
  const token = getOrCreateToken(ev.claim.claimToken);
  const ipfsHash = getIPFSHash(ev.claim.attachment);

  const tokenId = ev.tokenId.toString();
  const claim = getOrCreateClaim(tokenId);

  const user_creditor = getOrCreateUser(ev.creditor);
  const user_debtor = getOrCreateUser(ev.debtor);
  const user_creator = getOrCreateUser(ev.origin);

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
  claim.claimType = ev.origin.equals(ev.creditor) ? "INVOICE" : "PAYMENT";
  claim.token = token.id;
  claim.status = "PENDING";
  claim.transactionHash = event.transaction.hash;
  claim.save();

  const claimCreatedEventId = getClaimCreatedEventId(ev.tokenId, event.transaction.hash);
  const claimCreatedEvent = new ClaimCreatedEvent(claimCreatedEventId);
  claimCreatedEvent.tokenId = claim.id;
  claimCreatedEvent.bullaManager = ev.bullaManager;
  claimCreatedEvent.parent = ev.parent;
  claimCreatedEvent.creator = ev.origin;
  claimCreatedEvent.debtor = ev.claim.debtor;
  claimCreatedEvent.creditor = ev.creditor;
  claimCreatedEvent.claimToken = token.id;
  claimCreatedEvent.description = ev.description;
  claimCreatedEvent.timestamp = ev.blocktime;
  claimCreatedEvent.ipfsHash = ipfsHash;
  claimCreatedEvent.amount = ev.claim.claimAmount;
  claimCreatedEvent.dueBy = ev.claim.dueBy;

  claimCreatedEvent.eventName = "ClaimCreated";
  claimCreatedEvent.blockNumber = event.block.number;
  claimCreatedEvent.transactionHash = event.transaction.hash;
  claimCreatedEvent.timestamp = event.block.timestamp;
  claimCreatedEvent.save();

  user_creditor.claims = user_creditor.claims ? user_creditor.claims.concat([claim.id]) : [claim.id];
  user_debtor.claims = user_debtor.claims ? user_debtor.claims.concat([claim.id]) : [claim.id];
  user_creator.claims = user_creator.claims ? user_creator.claims.concat([claim.id]) : [claim.id];

  user_creditor.save();
  user_debtor.save();
}
