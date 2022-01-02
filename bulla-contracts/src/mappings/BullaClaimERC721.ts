import {
  BullaManagerSet,
  ClaimCreated,
  ClaimPayment,
  ClaimRejected,
  ClaimRescinded,
  FeePaid,
  OwnershipTransferred,
  Transfer,
} from "../../generated/BullaClaimERC721/BullaClaimERC721";
import { ClaimCreatedEvent } from "../../generated/schema";
import { getOrCreateClaim } from "../functions/BullaClaimERC721";
import {
  getIPFSHash,
  getOrCreateToken,
  getOrCreateUser,
  multihashStructToBase58,
} from "../functions/common";

export function handleBullaManagerSet(event: BullaManagerSet): void {}

export function handleClaimCreated(event: ClaimCreated): void {
  const ev = event.params;
  const token = getOrCreateToken(ev.claim.claimToken);
  const ipfsHash = getIPFSHash(ev.claim.attachment);

  const claimCreatedEvent = new ClaimCreatedEvent(
    event.transaction.hash.toHexString()
  );
  claimCreatedEvent.tokenId = ev.tokenId.toString();
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

  const tokenId = ev.tokenId.toString();
  const claim = getOrCreateClaim(tokenId);
  claim.tokenId = tokenId;
  claim.ipfsHash = ipfsHash;
  // claim.logs = [claimCreatedEvent.id];
  claim.accountTag = "";
  claim.creator = ev.origin;
  claim.creditor = ev.creditor;
  claim.debtor = ev.claim.debtor;
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

  // claim.claimActions = [claimCreatedEvent.id];

  const user_creditor = getOrCreateUser(ev.creditor);
  const user_debtor = getOrCreateUser(ev.debtor);
  user_creditor.claims = user_creditor.claims.concat([claim.id]);
  user_debtor.claims = user_debtor.claims.concat([claim.id]);

  // user_creditor.receivables = [...(user_creditor.receivables || []), claim.id];
  // user_debtor.payables = [...(user_debtor.payables || []), claim.id];

  user_creditor.save();
  user_debtor.save();
}
export function handleClaimPayment(event: ClaimPayment): void {}

export function handleClaimRejected(event: ClaimRejected): void {}

export function handleClaimRescinded(event: ClaimRescinded): void {}

export function handleFeePaid(event: FeePaid): void {}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {}

export function handleTransfer(event: Transfer): void {}
