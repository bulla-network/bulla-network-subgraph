import { BigInt, ethereum } from "@graphprotocol/graph-ts";
import { FeeWithdrawn, InvoiceCreated, InvoicePaid, PurchaseOrderAccepted } from "../../generated/BullaInvoice/BullaInvoice";
import { FeeWithdrawnEvent, InvoiceCreatedEvent, InvoiceDetails, InvoicePaidEvent, PurchaseOrderAcceptedEvent } from "../../generated/schema";

export const getInvoiceCreatedEventId = (tokenId: BigInt, event: ethereum.Event): string =>
  "InvoiceCreated-" + tokenId.toString() + "-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString();

export const createInvoiceCreatedEvent = (event: InvoiceCreated): InvoiceCreatedEvent => new InvoiceCreatedEvent(getInvoiceCreatedEventId(event.params.claimId, event));

export const getInvoicePaidEventId = (tokenId: BigInt, event: ethereum.Event): string =>
  "InvoicePaid-" + tokenId.toString() + "-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString();

export const createInvoicePaidEvent = (event: InvoicePaid): InvoicePaidEvent => new InvoicePaidEvent(getInvoicePaidEventId(event.params.claimId, event));

export const getPurchaseOrderAcceptedEventId = (tokenId: BigInt, event: ethereum.Event): string =>
  "PurchaseOrderAccepted-" + tokenId.toString() + "-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString();

export const createPurchaseOrderAcceptedEvent = (event: PurchaseOrderAccepted): PurchaseOrderAcceptedEvent =>
  new PurchaseOrderAcceptedEvent(getPurchaseOrderAcceptedEventId(event.params.claimId, event));

export const getPurchaseOrderDeliveredEventId = (tokenId: BigInt, event: ethereum.Event): string =>
  "PurchaseOrderDelivered-" + tokenId.toString() + "-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString();

export const getFeeWithdrawnEventId = (event: ethereum.Event): string => "FeeWithdrawn-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString();

export const createFeeWithdrawnEvent = (event: FeeWithdrawn): FeeWithdrawnEvent => new FeeWithdrawnEvent(getFeeWithdrawnEventId(event));

export const getOrCreateInvoiceDetails = (claimId: string, event: ethereum.Event): InvoiceDetails => {
  let invoiceDetails = InvoiceDetails.load(claimId);
  if (!invoiceDetails) {
    invoiceDetails = new InvoiceDetails(claimId);
    invoiceDetails.claim = claimId;
    invoiceDetails.deliveryDate = BigInt.fromI32(0);
    invoiceDetails.depositAmount = BigInt.fromI32(0);
    invoiceDetails.interestRateBps = 0;
    invoiceDetails.numberOfPeriodsPerYear = 0;
    invoiceDetails.isDelivered = false;
    invoiceDetails.requestedByCreditor = false;
    invoiceDetails.isProtocolFeeExempt = false;
  }
  invoiceDetails.lastUpdatedTimestamp = event.block.timestamp;
  invoiceDetails.lastUpdatedBlock = event.block.number;
  return invoiceDetails;
};
