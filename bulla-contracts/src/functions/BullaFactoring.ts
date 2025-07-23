import { BigInt, ethereum } from "@graphprotocol/graph-ts";
import { DepositMade, ActivePaidInvoicesReconciled, InvoiceUnfactored as InvoiceUnfactoredV1, SharesRedeemed } from "../../generated/BullaFactoring/BullaFactoring";
import {
  Deposit as DepositV2,
  InvoiceFunded as InvoiceFundedV2,
  InvoiceImpaired as InvoiceImpairedV2,
  InvoiceKickbackAmountSent as InvoiceKickbackAmountSentV2,
  InvoicePaid as InvoicePaidV2,
  InvoiceUnfactored as InvoiceUnfactoredV2,
  Withdraw as WithdrawV2,
} from "../../generated/BullaFactoringv2/BullaFactoringv2";
import {
  InvoicePaid as InvoicePaidV3,
  InvoiceFunded as InvoiceFundedV3,
  InvoiceUnfactored as InvoiceUnfactoredV3,
} from "../../generated/BullaFactoringv3/BullaFactoringv3";
import {
  DepositMadeEvent,
  InvoiceFundedEvent,
  InvoiceImpairedEvent,
  InvoiceKickbackAmountSentEvent,
  InvoiceReconciledEvent,
  InvoiceUnfactoredEvent,
  SharesRedeemedEvent,
} from "../../generated/schema";

export const getInvoiceFundedEventId = (underlyingClaimId: BigInt, event: ethereum.Event): string =>
  "InvoiceFunded-" + underlyingClaimId.toString() + "-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString();

export const createInvoiceFundedEventV2 = (underlyingTokenId: BigInt, event: InvoiceFundedV2): InvoiceFundedEvent => {
  return new InvoiceFundedEvent(getInvoiceFundedEventId(underlyingTokenId, event));
};

export const createInvoiceFundedEventV3 = (underlyingTokenId: BigInt, event: InvoiceFundedV3): InvoiceFundedEvent => {
  return new InvoiceFundedEvent(getInvoiceFundedEventId(underlyingTokenId, event));
};

export const getInvoiceKickbackAmountSentEventId = (underlyingClaimId: BigInt, event: ethereum.Event): string =>
  "InvoiceKickbackAmountSent-" + underlyingClaimId.toString() + "-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString();

export const createInvoiceKickbackAmountSentEventV2 = (underlyingTokenId: BigInt, event: InvoiceKickbackAmountSentV2): InvoiceKickbackAmountSentEvent =>
  new InvoiceKickbackAmountSentEvent(getInvoiceKickbackAmountSentEventId(underlyingTokenId, event));

export const getInvoiceUnfactoredEventId = (underlyingClaimId: BigInt, event: ethereum.Event): string =>
  "InvoiceUnfactored-" + underlyingClaimId.toString() + "-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString();

export const createInvoiceUnfactoredEventV1 = (underlyingTokenId: BigInt, event: InvoiceUnfactoredV1): InvoiceUnfactoredEvent =>
  new InvoiceUnfactoredEvent(getInvoiceUnfactoredEventId(underlyingTokenId, event));

export const createInvoiceUnfactoredEventV2 = (underlyingTokenId: BigInt, event: InvoiceUnfactoredV2): InvoiceUnfactoredEvent =>
  new InvoiceUnfactoredEvent(getInvoiceUnfactoredEventId(underlyingTokenId, event));

export const createInvoiceUnfactoredEventV3 = (underlyingTokenId: BigInt, event: InvoiceUnfactoredV3): InvoiceUnfactoredEvent =>
  new InvoiceUnfactoredEvent(getInvoiceUnfactoredEventId(underlyingTokenId, event));

export const getDepositMadeEventId = (event: ethereum.Event, logIndexOverride: BigInt | null): string => {
  const poolAddress = event.address;
  return (
    "DepositMade-" + poolAddress.toHexString() + "-" + event.transaction.hash.toHexString() + "-" + (logIndexOverride ? logIndexOverride : event.logIndex).toString()
  );
};

export const createDepositMadeEventV1 = (event: DepositMade): DepositMadeEvent => new DepositMadeEvent(getDepositMadeEventId(event, null));

export const createDepositMadeEventV2 = (event: DepositV2): DepositMadeEvent => new DepositMadeEvent(getDepositMadeEventId(event, null));

export const getSharesRedeemedEventId = (event: ethereum.Event, logIndexOverride: BigInt | null): string => {
  const poolAddress = event.address;
  return (
    "SharesRedeemed-" + poolAddress.toHexString() + "-" + event.transaction.hash.toHexString() + "-" + (logIndexOverride ? logIndexOverride : event.logIndex).toString()
  );
};

export const createSharesRedeemedEventV1 = (event: SharesRedeemed): SharesRedeemedEvent => new SharesRedeemedEvent(getSharesRedeemedEventId(event, null));

export const createSharesRedeemedEventV2 = (event: WithdrawV2): SharesRedeemedEvent => new SharesRedeemedEvent(getSharesRedeemedEventId(event, null));

export const getInvoiceImpairedEventId = (underlyingClaimId: BigInt, event: ethereum.Event): string =>
  "InvoiceImpaired-" + underlyingClaimId.toString() + "-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString();

export const createInvoiceImpairedEventV2 = (underlyingTokenId: BigInt, event: InvoiceImpairedV2): InvoiceImpairedEvent =>
  new InvoiceImpairedEvent(getInvoiceImpairedEventId(underlyingTokenId, event));

export const getInvoiceReconciledEventId = (invoiceId: BigInt, event: ethereum.Event): string => {
  const poolAddress = event.address;
  return "InvoiceReconciled-" + poolAddress.toHexString() + "-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString() + "-" + invoiceId.toString();
};

export const createInvoiceReconciledEventV1 = (invoiceId: BigInt, event: ActivePaidInvoicesReconciled): InvoiceReconciledEvent =>
  new InvoiceReconciledEvent(getInvoiceReconciledEventId(invoiceId, event));

export const createInvoiceReconciledEventV2 = (invoiceId: BigInt, event: InvoicePaidV2): InvoiceReconciledEvent =>
  new InvoiceReconciledEvent(getInvoiceReconciledEventId(invoiceId, event));

export const createInvoiceReconciledEventV3 = (invoiceId: BigInt, event: InvoicePaidV3): InvoiceReconciledEvent =>
  new InvoiceReconciledEvent(getInvoiceReconciledEventId(invoiceId, event));
