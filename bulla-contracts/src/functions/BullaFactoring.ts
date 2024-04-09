import { BigInt, ethereum } from "@graphprotocol/graph-ts";
import {
  DepositMadeEvent,
  DepositMadeWithAttachmentEvent,
  InvoiceFundedEvent,
  InvoiceKickbackAmountSentEvent,
  InvoiceUnfactoredEvent,
  SharesRedeemedEvent,
  SharesRedeemedWithAttachmentEvent
} from "../../generated/schema";
import {
  DepositMade,
  DepositMadeWithAttachment,
  InvoiceFunded,
  InvoiceKickbackAmountSent,
  InvoiceUnfactored,
  SharesRedeemed,
  SharesRedeemedWithAttachment
} from "../../generated/BullaFactoring/BullaFactoring";

export const getInvoiceFundedEventId = (underlyingClaimId: BigInt, event: ethereum.Event): string =>
  "InvoiceFunded-" + underlyingClaimId.toString() + "-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString();

export const createInvoiceFundedEvent = (underlyingTokenId: BigInt, event: InvoiceFunded): InvoiceFundedEvent =>
  new InvoiceFundedEvent(getInvoiceFundedEventId(underlyingTokenId, event));

export const getInvoiceKickbackAmountSentEventId = (underlyingClaimId: BigInt, event: ethereum.Event): string =>
  "InvoiceKickbackAmountSent-" + underlyingClaimId.toString() + "-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString();

export const createInvoiceKickbackAmountSentEvent = (underlyingTokenId: BigInt, event: InvoiceKickbackAmountSent): InvoiceKickbackAmountSentEvent =>
  new InvoiceKickbackAmountSentEvent(getInvoiceKickbackAmountSentEventId(underlyingTokenId, event));

export const getInvoiceUnfactoredEventId = (underlyingClaimId: BigInt, event: ethereum.Event): string =>
  "InvoiceUnfactored-" + underlyingClaimId.toString() + "-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString();

export const createInvoiceUnfactoredEvent = (underlyingTokenId: BigInt, event: InvoiceUnfactored): InvoiceUnfactoredEvent =>
  new InvoiceUnfactoredEvent(getInvoiceUnfactoredEventId(underlyingTokenId, event));

export const getDepositMadeEventId = (event: ethereum.Event): string => {
  const poolAddress = event.address;
  return "DepositMade-" + poolAddress.toString() + "-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
};

export const createDepositMadeEvent = (event: DepositMade): DepositMadeEvent => new DepositMadeEvent(getDepositMadeEventId(event));

export const getDepositMadeWithAttachmentEventId = (event: ethereum.Event): string => {
  const poolAddress = event.address;
  return "DepositMadeWithAttachment-" + poolAddress.toString() + "-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
};

export const createDepositMadeWithAttachmentEvent = (event: DepositMadeWithAttachment): DepositMadeWithAttachmentEvent =>
  new DepositMadeWithAttachmentEvent(getDepositMadeWithAttachmentEventId(event));

export const getSharesRedeemedEventId = (event: ethereum.Event): string => {
  const poolAddress = event.address;
  return "SharesRedeemed-" + poolAddress.toString() + "-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
};

export const createSharesRedeemedEvent = (event: SharesRedeemed): SharesRedeemedEvent => new SharesRedeemedEvent(getSharesRedeemedEventId(event));

export const getSharesRedeemedWithAttachmentEventId = (event: ethereum.Event): string => {
  const poolAddress = event.address;
  return "SharesRedeemedWithAttachment-" + poolAddress.toString() + "-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
};

export const createSharesRedeemedWithAttachmentEvent = (event: SharesRedeemedWithAttachment): SharesRedeemedWithAttachmentEvent =>
  new SharesRedeemedWithAttachmentEvent(getSharesRedeemedWithAttachmentEventId(event));
