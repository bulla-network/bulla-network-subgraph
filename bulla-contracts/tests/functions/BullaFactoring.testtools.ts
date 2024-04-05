import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";
import { InvoiceFunded } from "../../generated/BullaFactoring/BullaFactoring";
import { toEthAddress, toUint256 } from "../helpers";

export const newInvoiceFundedEvent = (originatingClaimId: BigInt, fundedAmount: BigInt, originalCreditor: Address): InvoiceFunded => {
  const event: InvoiceFunded = changetype<InvoiceFunded>(newMockEvent());

  const invoiceId = new ethereum.EventParam("invoiceId", toUint256(originatingClaimId));
  const fundedAmountParam = new ethereum.EventParam("fundedAmount", toUint256(fundedAmount));
  const originalCreditorParam = new ethereum.EventParam("originalCreditor", toEthAddress(originalCreditor));

  event.parameters = [invoiceId, fundedAmountParam, originalCreditorParam];

  return event;
};
