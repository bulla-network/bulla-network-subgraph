import { Address } from "@graphprotocol/graph-ts";
import { FeeWithdrawn, InvoiceCreated, InvoicePaid, PurchaseOrderAccepted, PurchaseOrderDelivered } from "../../generated/BullaInvoice/BullaInvoice";
import { PurchaseOrderDeliveredEvent } from "../../generated/schema";
import { getOrCreateClaim } from "../functions/BullaClaimERC721";
import {
  createFeeWithdrawnEvent,
  createInvoiceCreatedEvent,
  createInvoicePaidEvent,
  createPurchaseOrderAcceptedEvent,
  createPurchaseOrderStateFromEvent,
  getPurchaseOrderDeliveredEventId,
  getPurchaseOrderState,
} from "../functions/BullaInvoice";
import { getOrCreateToken, getOrCreateUser } from "../functions/common";

export function handleInvoiceCreated(event: InvoiceCreated): void {
  const ev = event.params;
  const claimId = ev.claimId.toString();
  // Add the invoice created event to creditor and debtor's invoiceEvents
  const claim = getOrCreateClaim(claimId, "v2");

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

  invoiceCreatedEvent.claim = claim.id;
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
  const claim = getOrCreateClaim(ev.claimId.toString(), "v2");

  invoicePaidEvent.claim = claim.id;
  invoicePaidEvent.grossInterestPaid = ev.grossInterestPaid;
  invoicePaidEvent.principalPaid = ev.principalPaid;
  invoicePaidEvent.protocolFee = ev.protocolFee;
  invoicePaidEvent.eventName = "InvoicePaid";
  invoicePaidEvent.blockNumber = event.block.number;
  invoicePaidEvent.transactionHash = event.transaction.hash;
  invoicePaidEvent.logIndex = event.logIndex;
  invoicePaidEvent.timestamp = event.block.timestamp;
  invoicePaidEvent.save();

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

  // Update the underlying claim
  const claim = getOrCreateClaim(claimId, "v2");

  // Create the PurchaseOrderAcceptedEvent
  const purchaseOrderAcceptedEvent = createPurchaseOrderAcceptedEvent(event);
  purchaseOrderAcceptedEvent.claim = claim.id;
  purchaseOrderAcceptedEvent.debtor = ev.debtor;
  purchaseOrderAcceptedEvent.depositAmount = ev.depositAmount;
  purchaseOrderAcceptedEvent.bound = ev.bound;
  purchaseOrderAcceptedEvent.eventName = "PurchaseOrderAccepted";
  purchaseOrderAcceptedEvent.blockNumber = event.block.number;
  purchaseOrderAcceptedEvent.transactionHash = event.transaction.hash;
  purchaseOrderAcceptedEvent.logIndex = event.logIndex;
  purchaseOrderAcceptedEvent.timestamp = event.block.timestamp;
  purchaseOrderAcceptedEvent.save();

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

  // Update the underlying claim
  const claim = getOrCreateClaim(claimId, "v2");

  // Create the PurchaseOrderDeliveredEvent
  const purchaseOrderDeliveredEvent = getPurchaseOrderDeliveredEventId(ev.claimId, event);
  const eventEntity = new PurchaseOrderDeliveredEvent(purchaseOrderDeliveredEvent);
  eventEntity.claim = claim.id;
  eventEntity.eventName = "PurchaseOrderDelivered";
  eventEntity.blockNumber = event.block.number;
  eventEntity.transactionHash = event.transaction.hash;
  eventEntity.logIndex = event.logIndex;
  eventEntity.timestamp = event.block.timestamp;
  eventEntity.save();

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

export function handleFeeWithdrawn(event: FeeWithdrawn): void {
  const ev = event.params;

  // Create the FeeWithdrawnEvent
  const feeWithdrawnEvent = createFeeWithdrawnEvent(event);

  // Get or create the token entity
  const token = getOrCreateToken(ev.token);

  // Get or create the admin user
  const admin = getOrCreateUser(ev.admin);

  feeWithdrawnEvent.admin = ev.admin;
  feeWithdrawnEvent.token = token.id;
  feeWithdrawnEvent.amount = ev.amount;
  feeWithdrawnEvent.eventName = "FeeWithdrawn";
  feeWithdrawnEvent.blockNumber = event.block.number;
  feeWithdrawnEvent.transactionHash = event.transaction.hash;
  feeWithdrawnEvent.logIndex = event.logIndex;
  feeWithdrawnEvent.timestamp = event.block.timestamp;
  feeWithdrawnEvent.save();

  admin.invoiceEvents = admin.invoiceEvents ? admin.invoiceEvents.concat([feeWithdrawnEvent.id]) : [feeWithdrawnEvent.id];
  admin.save();
}
