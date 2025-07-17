import { InvoiceCreated, InvoicePaid } from "../../generated/BullaInvoice/BullaInvoice";
import { createInvoiceCreatedEvent, createInvoicePaidEvent } from "../functions/BullaInvoice";
import { getOrCreateClaim } from "../functions/BullaClaimERC721";
import { CLAIM_STATUS_PAID, CLAIM_STATUS_REPAYING, getOrCreateUser } from "../functions/common";
import { Address } from "@graphprotocol/graph-ts";

export function handleInvoiceCreated(event: InvoiceCreated): void {
  const ev = event.params;
  const invoiceCreatedEvent = createInvoiceCreatedEvent(event);

  const invoiceDetails = event.params.invoiceDetails;
  const purchaseOrder = invoiceDetails.purchaseOrder;
  const lateFeeConfig = invoiceDetails.lateFeeConfig;
  const interestState = invoiceDetails.interestComputationState;

  invoiceCreatedEvent.claim = ev.claimId.toString();
  invoiceCreatedEvent.requestedByCreditor = invoiceDetails.requestedByCreditor;
  invoiceCreatedEvent.isProtocolFeeExempt = invoiceDetails.isProtocolFeeExempt;
  invoiceCreatedEvent.deliveryDate = purchaseOrder.deliveryDate;
  invoiceCreatedEvent.depositAmount = purchaseOrder.depositAmount;
  invoiceCreatedEvent.isDelivered = purchaseOrder.isDelivered;
  invoiceCreatedEvent.interestRateBps = lateFeeConfig.interestRateBps;
  invoiceCreatedEvent.accruedInterest = interestState.accruedInterest;
  invoiceCreatedEvent.protocolFeeBps = interestState.protocolFeeBps;
  invoiceCreatedEvent.totalGrossInterestPaid = interestState.totalGrossInterestPaid;
  invoiceCreatedEvent.eventName = "InvoiceCreated";
  invoiceCreatedEvent.blockNumber = event.block.number;
  invoiceCreatedEvent.transactionHash = event.transaction.hash;
  invoiceCreatedEvent.logIndex = event.logIndex;
  invoiceCreatedEvent.timestamp = event.block.timestamp;
  invoiceCreatedEvent.save();

  // Add the invoice created event to creditor and debtor's invoiceEvents
  const claim = getOrCreateClaim(ev.claimId.toString());
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
