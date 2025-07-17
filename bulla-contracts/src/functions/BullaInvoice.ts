import { BigInt, ethereum } from "@graphprotocol/graph-ts";
import { InvoiceCreated } from "../../generated/BullaInvoice/BullaInvoice";
import { InvoiceCreatedEvent } from "../../generated/schema";

export const getInvoiceCreatedEventId = (tokenId: BigInt, event: ethereum.Event): string =>
  "InvoiceCreated-" + tokenId.toString() + "-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString();

export const createInvoiceCreatedEvent = (event: InvoiceCreated): InvoiceCreatedEvent => new InvoiceCreatedEvent(getInvoiceCreatedEventId(event.params.claimId, event));
