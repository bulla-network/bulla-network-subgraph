import { BigInt, ethereum } from "@graphprotocol/graph-ts";
import { BullaManagerSet } from "../../generated/BullaClaimERC721/BullaClaimERC721";
import {
  Claim,
  ClaimPaymentEvent,
  ClaimRejectedEvent,
  ClaimRescindedEvent,
  FeePaidEvent,
  BullaManagerSetEvent,
  TransferEvent as ERC721TransferEvent
} from "../../generated/schema";

export const getTransferEventId = (tokenId: BigInt, event: ethereum.Event): string =>
  "Transfer-" + tokenId.toString() + "-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString();

export const getFeePaidEventId = (tokenId: BigInt, event: ethereum.Event): string =>
  "FeePaid-" + tokenId.toString() + "-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString();

export const getClaimRejectedEventId = (tokenId: BigInt, event: ethereum.Event): string =>
  "ClaimRejected-" + tokenId.toString() + "-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString();

export const getClaimRescindedEventId = (tokenId: BigInt, event: ethereum.Event): string =>
  "ClaimRescinded-" + tokenId.toString() + "-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString();

export const getClaimPaymentEventId = (tokenId: BigInt, event: ethereum.Event): string =>
  "ClaimPayment-" + tokenId.toString() + "-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString();

export const getClaimCreatedEventId = (tokenId: BigInt, event: ethereum.Event): string =>
  "ClaimCreatedEvent-" + tokenId.toString() + "-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString();

export const getBullaManagerSetId = (event: ethereum.Event): string => "BullaManagerSet-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString();

export const getOrCreateFeePaidEvent = (feePaidId: string): FeePaidEvent => {
  let feePaidEvent = FeePaidEvent.load(feePaidId);
  if (feePaidEvent) feePaidEvent = new FeePaidEvent(feePaidId);

  return feePaidEvent;
};

export const getOrCreateTransferEvent = (transferId: string): ERC721TransferEvent => {
  let transferEvent = ERC721TransferEvent.load(transferId);
  if (!transferEvent) transferEvent = new ERC721TransferEvent(transferId);

  return transferEvent;
};

export const getOrCreateClaimRescindedEvent = (claimRescindedId: string): ClaimRescindedEvent => {
  let claimRescindedEvent = ClaimRescindedEvent.load(claimRescindedId);
  if (!claimRescindedEvent) claimRescindedEvent = new ClaimRescindedEvent(claimRescindedId);

  return claimRescindedEvent;
};

export const getOrCreateClaimRejectedEvent = (claimRejectedId: string): ClaimRejectedEvent => {
  let claimRejectedEvent = ClaimRejectedEvent.load(claimRejectedId);
  if (!claimRejectedEvent) claimRejectedEvent = new ClaimRejectedEvent(claimRejectedId);

  return claimRejectedEvent;
};

export const getOrCreateClaimPaymentEvent = (claimPaymentId: string): ClaimPaymentEvent => {
  let claimPaymentEvent = ClaimPaymentEvent.load(claimPaymentId);
  if (!claimPaymentEvent) claimPaymentEvent = new ClaimPaymentEvent(claimPaymentId);

  return claimPaymentEvent;
};

export const loadClaim = (claimId: string, createOnNull: boolean): Claim => {
  let claim = Claim.load(claimId);
  if (!claim) {
    if (createOnNull) claim = new Claim(claimId);
    else throw new Error("Claim not found");
  }

  return claim;
};

export const getClaim = (claimId: string): Claim => {
  return loadClaim(claimId, false);
};

export const getOrCreateClaim = (claimId: string): Claim => {
  return loadClaim(claimId, true);
};

export const createBullaManagerSet = (bullaManagerSetEvent: BullaManagerSet): BullaManagerSetEvent =>
  new BullaManagerSetEvent(getBullaManagerSetId(bullaManagerSetEvent));
