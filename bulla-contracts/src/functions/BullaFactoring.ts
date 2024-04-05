import { BigInt, ethereum } from "@graphprotocol/graph-ts";
import { InvoiceFundedEvent } from "../../generated/schema";
import { InvoiceFunded } from "../../generated/BullaFactoring/BullaFactoring";

export const getInvoiceFundedEventId = (underlyingClaimId: BigInt, event: ethereum.Event): string =>
  "InvoiceFunded-" + underlyingClaimId.toString() + "-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString();

export const createInvoiceFundedEvent = (underlyingTokenId: BigInt, event: InvoiceFunded): InvoiceFundedEvent =>
  new InvoiceFundedEvent(getInvoiceFundedEventId(underlyingTokenId, event));
