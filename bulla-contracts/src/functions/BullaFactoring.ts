import { BigInt, ethereum } from "@graphprotocol/graph-ts";
import { DepositMade, InvoiceUnfactored as InvoiceUnfactoredV1, SharesRedeemed } from "../../generated/BullaFactoring/BullaFactoring";
import {
  ActivePaidInvoicesReconciled,
  Deposit,
  DepositMadeWithAttachment,
  InvoiceFunded,
  InvoiceImpaired,
  InvoiceKickbackAmountSent,
  InvoicePaid,
  InvoiceUnfactored,
  SharesRedeemedWithAttachment,
  Withdraw
} from "../../generated/BullaFactoringv2/BullaFactoringv2";
import {
  DepositMadeEvent,
  InvoiceFundedEvent,
  InvoiceImpairedEvent,
  InvoiceKickbackAmountSentEvent,
  InvoiceReconciledEvent,
  InvoiceUnfactoredEvent,
  SharesRedeemedEvent
} from "../../generated/schema";

export const getInvoiceFundedEventId = (underlyingClaimId: BigInt, event: ethereum.Event): string =>
  "InvoiceFunded-" + underlyingClaimId.toString() + "-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString();

export const createInvoiceFundedEvent = (underlyingTokenId: BigInt, event: InvoiceFunded): InvoiceFundedEvent => {
  return new InvoiceFundedEvent(getInvoiceFundedEventId(underlyingTokenId, event));
};

export const getInvoiceKickbackAmountSentEventId = (underlyingClaimId: BigInt, event: ethereum.Event): string =>
  "InvoiceKickbackAmountSent-" + underlyingClaimId.toString() + "-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString();

export const createInvoiceKickbackAmountSentEvent = (underlyingTokenId: BigInt, event: InvoiceKickbackAmountSent): InvoiceKickbackAmountSentEvent =>
  new InvoiceKickbackAmountSentEvent(getInvoiceKickbackAmountSentEventId(underlyingTokenId, event));

export const getInvoiceUnfactoredEventId = (underlyingClaimId: BigInt, event: ethereum.Event): string =>
  "InvoiceUnfactored-" + underlyingClaimId.toString() + "-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString();

export const createInvoiceUnfactoredEventv1 = (underlyingTokenId: BigInt, event: InvoiceUnfactoredV1): InvoiceUnfactoredEvent =>
  new InvoiceUnfactoredEvent(getInvoiceUnfactoredEventId(underlyingTokenId, event));

export const createInvoiceUnfactoredEvent = (underlyingTokenId: BigInt, event: InvoiceUnfactored): InvoiceUnfactoredEvent =>
  new InvoiceUnfactoredEvent(getInvoiceUnfactoredEventId(underlyingTokenId, event));

export const getDepositMadeEventId = (event: ethereum.Event, logIndexOverride: BigInt | null): string => {
  const poolAddress = event.address;
  return (
    "DepositMade-" + poolAddress.toHexString() + "-" + event.transaction.hash.toHexString() + "-" + (logIndexOverride ? logIndexOverride : event.logIndex).toString()
  );
};

export const createDepositMadeEventV1 = (event: DepositMade): DepositMadeEvent => new DepositMadeEvent(getDepositMadeEventId(event, null));

export const createDepositMadeWithAttachmentEventV1 = (event: DepositMadeWithAttachment): DepositMadeEvent => new DepositMadeEvent(getDepositMadeEventId(event, null));

export const createDepositMadeEventV2 = (event: Deposit): DepositMadeEvent => new DepositMadeEvent(getDepositMadeEventId(event, null));

export const getSharesRedeemedEventId = (event: ethereum.Event, logIndexOverride: BigInt | null): string => {
  const poolAddress = event.address;
  return (
    "SharesRedeemed-" + poolAddress.toHexString() + "-" + event.transaction.hash.toHexString() + "-" + (logIndexOverride ? logIndexOverride : event.logIndex).toString()
  );
};

export const createSharesRedeemedEventV1 = (event: SharesRedeemed): SharesRedeemedEvent => new SharesRedeemedEvent(getSharesRedeemedEventId(event, null));

export const createSharesRedeemedEventV2 = (event: Withdraw): SharesRedeemedEvent => new SharesRedeemedEvent(getSharesRedeemedEventId(event, null));

export const createSharesRedeemedWithAttachmentEventV1 = (event: SharesRedeemedWithAttachment): SharesRedeemedEvent =>
  new SharesRedeemedEvent(getSharesRedeemedEventId(event, null));

export const getInvoiceImpairedEventId = (underlyingClaimId: BigInt, event: ethereum.Event): string =>
  "InvoiceImpaired-" + underlyingClaimId.toString() + "-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString();

export const createInvoiceImpairedEvent = (underlyingTokenId: BigInt, event: InvoiceImpaired): InvoiceImpairedEvent =>
  new InvoiceImpairedEvent(getInvoiceImpairedEventId(underlyingTokenId, event));

export const getInvoiceReconciledEventId = (invoiceId: BigInt, event: ethereum.Event): string => {
  const poolAddress = event.address;
  return "InvoiceReconciled-" + poolAddress.toHexString() + "-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString() + "-" + invoiceId.toString();
};

export const createInvoiceReconciledEventV1 = (invoiceId: BigInt, event: ActivePaidInvoicesReconciled): InvoiceReconciledEvent =>
  new InvoiceReconciledEvent(getInvoiceReconciledEventId(invoiceId, event));

export const createInvoiceReconciledEventV2 = (invoiceId: BigInt, event: InvoicePaid): InvoiceReconciledEvent =>
  new InvoiceReconciledEvent(getInvoiceReconciledEventId(invoiceId, event));
