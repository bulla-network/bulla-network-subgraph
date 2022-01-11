import { BigInt, Bytes } from "@graphprotocol/graph-ts";
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

export const getTransferEventId = (tokenId: BigInt, txHash: Bytes): string => `Transfer-${tokenId.toString()}-${txHash.toHexString()}`;

export const getFeePaidEventId = (tokenId: BigInt, txHash: Bytes): string => `FeePaid-${tokenId.toString()}-${txHash.toHexString()}`;

export const getClaimRejectedEventId = (tokenId: BigInt, txHash: Bytes): string => `ClaimRejected-${tokenId.toString()}-${txHash.toHexString()}`;

export const getClaimRescindedEventId = (tokenId: BigInt, txHash: Bytes): string => `ClaimRescinded-${tokenId.toString()}-${txHash.toHexString()}`;

export const getClaimPaymentEventId = (tokenId: BigInt, txHash: Bytes): string => `ClaimPayment-${tokenId.toString()}-${txHash.toHexString()}`;

export const getBullaManagerSetId = (txHash: Bytes): string => `BullaManagerSet-${txHash.toHexString()}`;

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

export const getOrCreateClaim = (claimId: string): Claim => {
  let claim = Claim.load(claimId);
  if (!claim) claim = new Claim(claimId);

  return claim;
};

export const createBullaManagerSet = (bullaManagerSetEvent: BullaManagerSet): BullaManagerSetEvent =>
  new BullaManagerSetEvent(getBullaManagerSetId(bullaManagerSetEvent.transaction.hash));
