import { BigInt, ethereum } from "@graphprotocol/graph-ts";
import { InvoiceCreated, InvoicePaid, PurchaseOrderAccepted, PurchaseOrderDelivered } from "../../generated/BullaInvoice/BullaInvoice";
import { PurchaseOrderState, InvoiceCreatedEvent, InvoicePaidEvent, PurchaseOrderAcceptedEvent } from "../../generated/schema";

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

export const getPurchaseOrderState = (claimId: string): PurchaseOrderState | null => {
  return PurchaseOrderState.load(claimId);
};

export const getOrCreatePurchaseOrderState = (claimId: string): PurchaseOrderState => {
  let purchaseOrderState = PurchaseOrderState.load(claimId);
  if (!purchaseOrderState) {
    purchaseOrderState = new PurchaseOrderState(claimId);
  }
  return purchaseOrderState;
};

export const createPurchaseOrderStateFromEvent = (event: InvoiceCreated): PurchaseOrderState | null => {
  const invoiceDetails = event.params.invoiceDetails;
  const purchaseOrder = invoiceDetails.purchaseOrder;

  // Only create if there's a delivery date (indicating it's a purchase order)
  if (purchaseOrder.deliveryDate.equals(BigInt.fromI32(0))) {
    return null;
  }

  const claimId = event.params.claimId.toString();
  const purchaseOrderState = new PurchaseOrderState(claimId);

  // Set purchase order data
  purchaseOrderState.claim = claimId;
  purchaseOrderState.deliveryDate = purchaseOrder.deliveryDate;
  purchaseOrderState.depositAmount = purchaseOrder.depositAmount; // Total required
  purchaseOrderState.totalDepositPaid = BigInt.fromI32(0); // Initialize as 0
  purchaseOrderState.depositPayments = []; // Initialize empty array
  purchaseOrderState.isDelivered = purchaseOrder.isDelivered;

  // Timestamps
  purchaseOrderState.createdAt = event.block.timestamp;
  purchaseOrderState.lastUpdatedAt = event.block.timestamp;

  return purchaseOrderState;
};
