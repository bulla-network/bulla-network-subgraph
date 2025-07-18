import { InvoiceCreated, InvoicePaid, PurchaseOrderAccepted, PurchaseOrderDelivered } from "../../generated/BullaInvoice/BullaInvoice";
import {
  createInvoiceCreatedEvent,
  createInvoicePaidEvent,
  createPurchaseOrderAcceptedEvent,
  createPurchaseOrderStateFromEvent,
  getPurchaseOrderState,
  getPurchaseOrderDeliveredEventId,
} from "../functions/BullaInvoice";
import { getOrCreateClaim } from "../functions/BullaClaimERC721";
import { CLAIM_STATUS_PAID, CLAIM_STATUS_REPAYING, getOrCreateUser } from "../functions/common";
import { Address } from "@graphprotocol/graph-ts";
import { PurchaseOrderDeliveredEvent } from "../../generated/schema";

export function handleInvoiceCreated(event: InvoiceCreated): void {
  const ev = event.params;
  const claimId = ev.claimId.toString();

  // Create the PurchaseOrderState entity only if it's a purchase order
  const purchaseOrderState = createPurchaseOrderStateFromEvent(event);
  if (purchaseOrderState) {
    purchaseOrderState.save();
  }

  // Create the InvoiceCreatedEvent
  const invoiceCreatedEvent = createInvoiceCreatedEvent(event);
  const invoiceDetails = event.params.invoiceDetails;
  const purchaseOrder = invoiceDetails.purchaseOrder;
  const lateFeeConfig = invoiceDetails.lateFeeConfig;
  const interestState = invoiceDetails.interestComputationState;

  invoiceCreatedEvent.claim = claimId;
  invoiceCreatedEvent.requestedByCreditor = invoiceDetails.requestedByCreditor;
  invoiceCreatedEvent.isProtocolFeeExempt = invoiceDetails.isProtocolFeeExempt;
  invoiceCreatedEvent.deliveryDate = purchaseOrder.deliveryDate;
  invoiceCreatedEvent.depositAmount = purchaseOrder.depositAmount;
  invoiceCreatedEvent.isDelivered = purchaseOrder.isDelivered;
  invoiceCreatedEvent.interestRateBps = lateFeeConfig.interestRateBps;
  invoiceCreatedEvent.accruedInterest = interestState.accruedInterest;
  invoiceCreatedEvent.protocolFeeBps = interestState.protocolFeeBps;
  invoiceCreatedEvent.totalGrossInterestPaid = interestState.totalGrossInterestPaid;
  invoiceCreatedEvent.fee = ev.fee;
  invoiceCreatedEvent.tokenURI = ev.metadata.tokenURI;
  invoiceCreatedEvent.attachmentURI = ev.metadata.attachmentURI;
  invoiceCreatedEvent.eventName = "InvoiceCreated";
  invoiceCreatedEvent.blockNumber = event.block.number;
  invoiceCreatedEvent.transactionHash = event.transaction.hash;
  invoiceCreatedEvent.logIndex = event.logIndex;
  invoiceCreatedEvent.timestamp = event.block.timestamp;
  invoiceCreatedEvent.save();

  // Add the invoice created event to creditor and debtor's invoiceEvents
  const claim = getOrCreateClaim(claimId);
  const user_creditor = getOrCreateUser(Address.fromString(claim.creditor));
  const user_debtor = getOrCreateUser(Address.fromString(claim.debtor));

  user_creditor.invoiceEvents = user_creditor.invoiceEvents ? user_creditor.invoiceEvents.concat([invoiceCreatedEvent.id]) : [invoiceCreatedEvent.id];
  user_debtor.invoiceEvents = user_debtor.invoiceEvents ? user_debtor.invoiceEvents.concat([invoiceCreatedEvent.id]) : [invoiceCreatedEvent.id];

  user_creditor.save();
  user_debtor.save();
}

export function handleInvoicePaid(event: InvoicePaid): void {
  const ev = event.params;
  const invoicePaidEvent = createInvoicePaidEvent(event);

  invoicePaidEvent.claim = ev.claimId.toString();
  invoicePaidEvent.grossInterestPaid = ev.grossInterestPaid;
  invoicePaidEvent.principalPaid = ev.principalPaid;
  invoicePaidEvent.protocolFee = ev.protocolFee;
  invoicePaidEvent.eventName = "InvoicePaid";
  invoicePaidEvent.blockNumber = event.block.number;
  invoicePaidEvent.transactionHash = event.transaction.hash;
  invoicePaidEvent.logIndex = event.logIndex;
  invoicePaidEvent.timestamp = event.block.timestamp;
  invoicePaidEvent.save();

  // Update the underlying claim
  const claim = getOrCreateClaim(ev.claimId.toString());
  const newPaidAmount = claim.paidAmount.plus(ev.principalPaid);
  const isClaimPaid = newPaidAmount.ge(claim.amount);

  claim.paidAmount = newPaidAmount;
  claim.status = isClaimPaid ? CLAIM_STATUS_PAID : CLAIM_STATUS_REPAYING;
  claim.lastUpdatedBlockNumber = event.block.number;
  claim.lastUpdatedTimestamp = event.block.timestamp;
  claim.save();

  // Add the invoice paid event to creditor and debtor's invoiceEvents
  const user_creditor = getOrCreateUser(Address.fromString(claim.creditor));
  const user_debtor = getOrCreateUser(Address.fromString(claim.debtor));

  user_creditor.invoiceEvents = user_creditor.invoiceEvents ? user_creditor.invoiceEvents.concat([invoicePaidEvent.id]) : [invoicePaidEvent.id];
  user_debtor.invoiceEvents = user_debtor.invoiceEvents ? user_debtor.invoiceEvents.concat([invoicePaidEvent.id]) : [invoicePaidEvent.id];

  user_creditor.save();
  user_debtor.save();
}

export function handlePurchaseOrderAccepted(event: PurchaseOrderAccepted): void {
  const ev = event.params;
  const claimId = ev.claimId.toString();

  // Update the PurchaseOrderState entity if it exists
  const purchaseOrderState = getPurchaseOrderState(claimId);
  if (purchaseOrderState) {
    // Track the deposit payment
    const currentPayments = purchaseOrderState.depositPayments;
    purchaseOrderState.depositPayments = currentPayments.concat([ev.depositAmount]);
    purchaseOrderState.totalDepositPaid = purchaseOrderState.totalDepositPaid.plus(ev.depositAmount);
    purchaseOrderState.lastUpdatedAt = event.block.timestamp;
    purchaseOrderState.save();
  }

  // Create the PurchaseOrderAcceptedEvent
  const purchaseOrderAcceptedEvent = createPurchaseOrderAcceptedEvent(event);
  purchaseOrderAcceptedEvent.claim = claimId;
  purchaseOrderAcceptedEvent.debtor = ev.debtor;
  purchaseOrderAcceptedEvent.depositAmount = ev.depositAmount;
  purchaseOrderAcceptedEvent.bound = ev.bound;
  purchaseOrderAcceptedEvent.eventName = "PurchaseOrderAccepted";
  purchaseOrderAcceptedEvent.blockNumber = event.block.number;
  purchaseOrderAcceptedEvent.transactionHash = event.transaction.hash;
  purchaseOrderAcceptedEvent.logIndex = event.logIndex;
  purchaseOrderAcceptedEvent.timestamp = event.block.timestamp;
  purchaseOrderAcceptedEvent.save();

  // Update the underlying claim
  const claim = getOrCreateClaim(claimId);
  claim.lastUpdatedBlockNumber = event.block.number;
  claim.lastUpdatedTimestamp = event.block.timestamp;
  claim.save();

  // Add the purchase order accepted event to creditor and debtor's invoiceEvents
  const user_creditor = getOrCreateUser(Address.fromString(claim.creditor));
  const user_debtor = getOrCreateUser(Address.fromString(claim.debtor));

  user_creditor.invoiceEvents = user_creditor.invoiceEvents ? user_creditor.invoiceEvents.concat([purchaseOrderAcceptedEvent.id]) : [purchaseOrderAcceptedEvent.id];
  user_debtor.invoiceEvents = user_debtor.invoiceEvents ? user_debtor.invoiceEvents.concat([purchaseOrderAcceptedEvent.id]) : [purchaseOrderAcceptedEvent.id];

  user_creditor.save();
  user_debtor.save();
}

export function handlePurchaseOrderDelivered(event: PurchaseOrderDelivered): void {
  const ev = event.params;
  const claimId = ev.claimId.toString();

  // Update the PurchaseOrderState entity if it exists
  const purchaseOrderState = getPurchaseOrderState(claimId);
  if (purchaseOrderState) {
    purchaseOrderState.isDelivered = true;
    purchaseOrderState.lastUpdatedAt = event.block.timestamp;
    purchaseOrderState.save();
  }

  // Create the PurchaseOrderDeliveredEvent
  const purchaseOrderDeliveredEvent = getPurchaseOrderDeliveredEventId(ev.claimId, event);
  const eventEntity = new PurchaseOrderDeliveredEvent(purchaseOrderDeliveredEvent);
  eventEntity.claim = claimId;
  eventEntity.eventName = "PurchaseOrderDelivered";
  eventEntity.blockNumber = event.block.number;
  eventEntity.transactionHash = event.transaction.hash;
  eventEntity.logIndex = event.logIndex;
  eventEntity.timestamp = event.block.timestamp;
  eventEntity.save();

  // Update the underlying claim
  const claim = getOrCreateClaim(claimId);
  claim.lastUpdatedBlockNumber = event.block.number;
  claim.lastUpdatedTimestamp = event.block.timestamp;
  claim.save();

  // Add the purchase order delivered event to creditor and debtor's invoiceEvents
  const user_creditor = getOrCreateUser(Address.fromString(claim.creditor));
  const user_debtor = getOrCreateUser(Address.fromString(claim.debtor));

  user_creditor.invoiceEvents = user_creditor.invoiceEvents ? user_creditor.invoiceEvents.concat([purchaseOrderDeliveredEvent]) : [purchaseOrderDeliveredEvent];
  user_debtor.invoiceEvents = user_debtor.invoiceEvents ? user_debtor.invoiceEvents.concat([purchaseOrderDeliveredEvent]) : [purchaseOrderDeliveredEvent];

  user_creditor.save();
  user_debtor.save();
}
