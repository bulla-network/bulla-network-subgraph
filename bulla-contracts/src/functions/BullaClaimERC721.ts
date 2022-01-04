import {
  ClaimPayment,
  ClaimRejected,
  ClaimRescinded,
  FeePaid,
  Transfer as ERC721Transfer
} from "../../generated/BullaClaimERC721/BullaClaimERC721";
import {
  Claim,
  ClaimPaymentEvent,
  ClaimRejectedEvent,
  ClaimRescindedEvent,
  FeePaidEvent,
  Transfer as ERC721TransferEvent
} from "../../generated/schema";

export const getTransferEventId = (event: ERC721Transfer): string =>
  `Transfer-${event.params.tokenId.toString()}-${event.transaction.hash.toHexString()}`;

export const getFeePaidEventId = (event: FeePaid): string =>
  `FeePaid-${event.params.tokenId.toString()}-${event.transaction.hash.toHexString()}`;

export const getClaimRescindedEventId = (event: ClaimRescinded): string =>
  `ClaimRescinded-${event.params.tokenId.toString()}-${event.transaction.hash.toHexString()}`;

export const getClaimRejectedEventId = (event: ClaimRejected): string =>
  `ClaimRejected-${event.params.tokenId.toString()}-${event.transaction.hash.toHexString()}`;

export const getClaimPaymentEventId = (event: ClaimPayment): string =>
  `ClaimPayment-${event.params.tokenId.toString()}-${event.transaction.hash.toHexString()}`;

export const getOrCreateFeePaidEvent = (feePaidId: string): FeePaidEvent => {
  let feePaidEvent = FeePaidEvent.load(feePaidId);
  if (!feePaidEvent) feePaidEvent = new FeePaidEvent(feePaidId);

  return feePaidEvent;
};

export const getOrCreateTransferEvent = (
  transferId: string
): ERC721TransferEvent => {
  let transferEvent = ERC721TransferEvent.load(transferId);
  if (!transferEvent) transferEvent = new ERC721TransferEvent(transferId);

  return transferEvent;
};

export const getOrCreateClaimRescindedEvent = (
  claimRescindedId: string
): ClaimRescindedEvent => {
  let claimRescindedEvent = ClaimRescindedEvent.load(claimRescindedId);
  if (!claimRescindedEvent)
    claimRescindedEvent = new ClaimRescindedEvent(claimRescindedId);

  return claimRescindedEvent;
};

export const getOrCreateClaimRejectedEvent = (
  claimRejectedId: string
): ClaimRejectedEvent => {
  let claimRejectedEvent = ClaimRejectedEvent.load(claimRejectedId);
  if (!claimRejectedEvent)
    claimRejectedEvent = new ClaimRejectedEvent(claimRejectedId);

  return claimRejectedEvent;
};

export const getOrCreateClaimPaymentEvent = (
  claimPaymentId: string
): ClaimPaymentEvent => {
  let claimPaymentEvent = ClaimPaymentEvent.load(claimPaymentId);
  if (!claimPaymentEvent)
    claimPaymentEvent = new ClaimPaymentEvent(claimPaymentId);

  return claimPaymentEvent;
};

export const getOrCreateClaim = (claimId: string): Claim => {
  let claim = Claim.load(claimId);
  if (!claim) claim = new Claim(claimId);

  return claim;
};
