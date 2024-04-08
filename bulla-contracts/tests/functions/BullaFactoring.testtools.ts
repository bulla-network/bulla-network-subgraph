import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";
import { InvoiceFunded, InvoiceKickbackAmountSent, InvoiceUnfactored } from "../../generated/BullaFactoring/BullaFactoring";
import { toEthAddress, toUint256 } from "../helpers";

export const newInvoiceFundedEvent = (originatingClaimId: BigInt, fundedAmount: BigInt, originalCreditor: Address): InvoiceFunded => {
  const event: InvoiceFunded = changetype<InvoiceFunded>(newMockEvent());

  const invoiceId = new ethereum.EventParam("invoiceId", toUint256(originatingClaimId));
  const fundedAmountParam = new ethereum.EventParam("fundedAmount", toUint256(fundedAmount));
  const originalCreditorParam = new ethereum.EventParam("originalCreditor", toEthAddress(originalCreditor));

  event.parameters = [invoiceId, fundedAmountParam, originalCreditorParam];

  return event;
};

export const newInvoiceKickbackAmountSentEvent = (originatingClaimId: BigInt, kickbackAmount: BigInt, originalCreditor: Address): InvoiceKickbackAmountSent => {
  const event: InvoiceKickbackAmountSent = changetype<InvoiceKickbackAmountSent>(newMockEvent());

  const invoiceId = new ethereum.EventParam("invoiceId", toUint256(originatingClaimId));
  const kickbackAmountParam = new ethereum.EventParam("kickbackAmount", toUint256(kickbackAmount));
  const originalCreditorParam = new ethereum.EventParam("originalCreditor", toEthAddress(originalCreditor));

  event.parameters = [invoiceId, kickbackAmountParam, originalCreditorParam];

  return event;
};

export const newInvoiceUnfactoredEvent = (originatingClaimId: BigInt, originalCreditor: Address): InvoiceUnfactored => {
  const event: InvoiceUnfactored = changetype<InvoiceUnfactored>(newMockEvent());

  const invoiceId = new ethereum.EventParam("invoiceId", toUint256(originatingClaimId));
  const originalCreditorParam = new ethereum.EventParam("originalCreditor", toEthAddress(originalCreditor));

  event.parameters = [invoiceId, originalCreditorParam];

  return event;
};
