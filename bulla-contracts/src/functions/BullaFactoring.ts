import { BigInt, ethereum } from "@graphprotocol/graph-ts";
import {
  DepositMadeEvent,
  InvoiceFundedEvent,
  InvoiceImpairedEvent,
  InvoiceKickbackAmountSentEvent,
  InvoicePaidEvent,
  InvoiceReconciledEvent,
  InvoiceUnfactoredEvent,
  SharesRedeemedEvent
} from "../../generated/schema";
import {
  Deposit,
  InvoiceFunded,
  InvoiceImpaired,
  InvoiceKickbackAmountSent,
  InvoicePaid,
  InvoiceUnfactored,
  Withdraw,
  ActivePaidInvoicesReconciled
} from "../../generated/BullaFactoringv2/BullaFactoringv2";
import { InvoiceUnfactored as InvoiceUnfactoredV1 } from "../../generated/BullaFactoring/BullaFactoring";

export const getInvoiceFundedEventId = (underlyingClaimId: BigInt, event: ethereum.Event): string =>
  "InvoiceFunded-" + underlyingClaimId.toString() + "-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString();

export const createInvoiceFundedEvent = (underlyingTokenId: BigInt, event: InvoiceFunded): InvoiceFundedEvent => {
  return new InvoiceFundedEvent(getInvoiceFundedEventId(underlyingTokenId, event));
};

export const getInvoiceKickbackAmountSentEventId = (underlyingClaimId: BigInt, event: ethereum.Event): string =>
  "InvoiceKickbackAmountSent-" + underlyingClaimId.toString() + "-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString();

export const createInvoiceKickbackAmountSentEvent = (underlyingTokenId: BigInt, event: InvoiceKickbackAmountSent): InvoiceKickbackAmountSentEvent =>
  new InvoiceKickbackAmountSentEvent(getInvoiceKickbackAmountSentEventId(underlyingTokenId, event));

export const getInvoicePaidEventId = (underlyingClaimId: BigInt, event: ethereum.Event): string =>
  "InvoicePaid-" + underlyingClaimId.toString() + "-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString();

export const createInvoicePaidEvent = (underlyingTokenId: BigInt, event: InvoicePaid): InvoicePaidEvent =>
  new InvoicePaidEvent(getInvoicePaidEventId(underlyingTokenId, event));

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

export const createDepositMadeEvent = (event: Deposit): DepositMadeEvent => new DepositMadeEvent(getDepositMadeEventId(event, null));

export const getSharesRedeemedEventId = (event: ethereum.Event): string => {
  const poolAddress = event.address;
  return "SharesRedeemed-" + poolAddress.toHexString() + "-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
};

export const createSharesRedeemedEvent = (event: Withdraw): SharesRedeemedEvent => new SharesRedeemedEvent(getSharesRedeemedEventId(event));

export const getInvoiceImpairedEventId = (underlyingClaimId: BigInt, event: ethereum.Event): string =>
  "InvoiceImpaired-" + underlyingClaimId.toString() + "-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString();

export const createInvoiceImpairedEvent = (underlyingTokenId: BigInt, event: InvoiceImpaired): InvoiceImpairedEvent =>
  new InvoiceImpairedEvent(getInvoiceImpairedEventId(underlyingTokenId, event));

export const getInvoiceReconciledEventId = (invoiceId: BigInt, event: ethereum.Event): string => {
  const poolAddress = event.address;
  return "InvoiceReconciled-" + poolAddress.toHexString() + "-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString() + "-" + invoiceId.toString();
};

export const createInvoiceReconciledEvent = (invoiceId: BigInt, event: ActivePaidInvoicesReconciled): InvoiceReconciledEvent =>
  new InvoiceReconciledEvent(getInvoiceReconciledEventId(invoiceId, event));
