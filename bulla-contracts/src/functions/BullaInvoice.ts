import { BigInt, ethereum } from "@graphprotocol/graph-ts";
import { InvoiceCreated, InvoicePaid } from "../../generated/BullaInvoice/BullaInvoice";
import { InvoiceCreatedEvent, InvoicePaidEvent } from "../../generated/schema";

export const getInvoiceCreatedEventId = (tokenId: BigInt, event: ethereum.Event): string =>
  "InvoiceCreated-" + tokenId.toString() + "-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString();

export const createInvoiceCreatedEvent = (event: InvoiceCreated): InvoiceCreatedEvent => new InvoiceCreatedEvent(getInvoiceCreatedEventId(event.params.claimId, event));

export const getInvoicePaidEventId = (tokenId: BigInt, event: ethereum.Event): string =>
  "InvoicePaid-" + tokenId.toString() + "-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString();

export const createInvoicePaidEvent = (event: InvoicePaid): InvoicePaidEvent => new InvoicePaidEvent(getInvoicePaidEventId(event.params.claimId, event));
