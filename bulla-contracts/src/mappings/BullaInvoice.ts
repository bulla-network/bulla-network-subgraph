import { InvoiceCreated } from "../../generated/BullaInvoice/BullaInvoice";
import { createInvoiceCreatedEvent } from "../functions/BullaInvoice";

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
}
