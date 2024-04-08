import { BigInt, ethereum } from "@graphprotocol/graph-ts";
import { InvoiceFundedEvent, InvoiceKickbackAmountSentEvent } from "../../generated/schema";
import { InvoiceFunded, InvoiceKickbackAmountSent } from "../../generated/BullaFactoring/BullaFactoring";

export const getInvoiceFundedEventId = (underlyingClaimId: BigInt, event: ethereum.Event): string =>
  "InvoiceFunded-" + underlyingClaimId.toString() + "-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString();

export const createInvoiceFundedEvent = (underlyingTokenId: BigInt, event: InvoiceFunded): InvoiceFundedEvent =>
  new InvoiceFundedEvent(getInvoiceFundedEventId(underlyingTokenId, event));

export const getInvoiceKickbackAmountSentEventId = (underlyingClaimId: BigInt, event: ethereum.Event): string =>
  "InvoiceKickbackAmountSent-" + underlyingClaimId.toString() + "-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString();

export const createInvoiceKickbackAmountSentEvent = (underlyingTokenId: BigInt, event: InvoiceKickbackAmountSent): InvoiceKickbackAmountSentEvent =>
  new InvoiceKickbackAmountSentEvent(getInvoiceKickbackAmountSentEventId(underlyingTokenId, event));
