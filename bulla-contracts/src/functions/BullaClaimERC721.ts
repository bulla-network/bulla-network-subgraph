import { BigInt, ethereum } from "@graphprotocol/graph-ts";
import { BullaManagerSet } from "../../generated/BullaClaimERC721/BullaClaimERC721";
import {
  BullaManagerSetEvent,
  Claim,
  ClaimPaymentEvent,
  ClaimRejectedEvent,
  ClaimRescindedEvent,
  TransferEvent as ERC721TransferEvent,
  FeePaidEvent,
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

export const getClaimCreatedEventId = (tokenId: BigInt, version: string): string => {
  return "ClaimCreatedEvent-" + tokenId.toString() + "-" + version.toLowerCase();
};

export const getMetadataAddedEventId = (tokenId: BigInt, event: ethereum.Event): string =>
  "MetadataAdded-" + tokenId.toString() + "-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString();

export const getBindingUpdatedEventId = (tokenId: BigInt, event: ethereum.Event): string =>
  "BindingUpdated-" + tokenId.toString() + "-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString();

export const getClaimImpairedEventId = (tokenId: BigInt, event: ethereum.Event): string =>
  "ClaimImpaired-" + tokenId.toString() + "-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString();

export const getClaimMarkedAsPaidEventId = (tokenId: BigInt, event: ethereum.Event): string =>
  "ClaimMarkedAsPaid-" + tokenId.toString() + "-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString();

export const getBullaManagerSetId = (event: ethereum.Event): string => "BullaManagerSet-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString();

export const getOrCreateFeePaidEvent = (feePaidId: string): FeePaidEvent => {
  let feePaidEvent = FeePaidEvent.load(feePaidId);
  if (!feePaidEvent) feePaidEvent = new FeePaidEvent(feePaidId);

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

/**
 * Generates a claim ID using version string instead of contract address
 * @param tokenId - The token ID
 * @param version - The version string ("v1" or "v2")
 * @returns The claim ID in format: TOKENID-VERSION
 */
export const getClaimId = (tokenId: string, version: string): string => {
  return tokenId + "-" + version.toLowerCase();
};

/**
 * Gets a claim by token ID and factoring version
 * Maps factoring versions to claim versions: v0/v1 -> "v1", v2_1 -> "v2"
 * @param tokenId - The token ID
 * @param factoringVersion - The factoring version ("v0", "v1", or "v2_1")
 * @returns The claim
 */
export const getClaim = (tokenId: string, factoringVersion: string): Claim => {
  const claimVersion = factoringVersion === "v2_1" ? "v2" : "v1";
  const claimId = getClaimId(tokenId, claimVersion);
  return loadClaim(claimId, false);
};

export const tryGetClaim = (tokenId: string, version: string): Claim | null => {
  const claimId = getClaimId(tokenId, version);
  return Claim.load(claimId);
};

export const isClaimIncompleteV1 = (claim: Claim): boolean => {
  return claim.tokenId.length == 0 || claim.creator.length == 0 || claim.creditor.length == 0 || claim.debtor.length == 0 || claim.token.length == 0;
};

export const getOrCreateClaim = (tokenId: string, version: string): Claim => {
  const claimId = getClaimId(tokenId, version);
  const existingClaim = Claim.load(claimId);
  if (existingClaim) return existingClaim;

  const claim = new Claim(claimId);
  claim.impairmentGracePeriod = BigInt.fromI32(0);
  return claim;
};

export const createBullaManagerSet = (bullaManagerSetEvent: BullaManagerSet): BullaManagerSetEvent =>
  new BullaManagerSetEvent(getBullaManagerSetId(bullaManagerSetEvent));
