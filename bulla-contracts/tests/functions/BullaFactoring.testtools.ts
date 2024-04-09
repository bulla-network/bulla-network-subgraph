import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";
import { DepositMade, DepositMadeWithAttachment, InvoiceFunded, InvoiceKickbackAmountSent, InvoiceUnfactored } from "../../generated/BullaFactoring/BullaFactoring";
import { MULTIHASH_BYTES, MULTIHASH_FUNCTION, MULTIHASH_SIZE, toEthAddress, toUint256 } from "../helpers";

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

export const newDepositMadeEvent = (depositor: Address, assets: BigInt, shares: BigInt): DepositMade => {
  const event: DepositMade = changetype<DepositMade>(newMockEvent());

  const depositorParam = new ethereum.EventParam("depositor", toEthAddress(depositor));
  const assetsParam = new ethereum.EventParam("assets", toUint256(assets));
  const sharesParam = new ethereum.EventParam("sharesIssued", toUint256(shares));

  event.parameters = [depositorParam, assetsParam, sharesParam];

  return event;
};

export const newDepositMadeWithAttachmentEvent = (depositor: Address, assets: BigInt, shares: BigInt): DepositMadeWithAttachment => {
  const event: DepositMadeWithAttachment = changetype<DepositMadeWithAttachment>(newMockEvent());

  const hash: Bytes = changetype<Bytes>(Bytes.fromHexString(MULTIHASH_BYTES));

  const multihashArray: Array<ethereum.Value> = [
    ethereum.Value.fromBytes(hash), // hash
    toUint256(BigInt.fromU32(MULTIHASH_FUNCTION)), // hashFunction
    toUint256(BigInt.fromU32(MULTIHASH_SIZE)) // size
  ];
  const multihashTuple: ethereum.Tuple = changetype<ethereum.Tuple>(multihashArray);

  const depositorParam = new ethereum.EventParam("depositor", toEthAddress(depositor));
  const assetsParam = new ethereum.EventParam("assets", toUint256(assets));
  const sharesParam = new ethereum.EventParam("shares", toUint256(shares)); // change name?
  const attachmentParam = new ethereum.EventParam("attachment", ethereum.Value.fromTuple(multihashTuple)); // change name?

  event.parameters = [depositorParam, assetsParam, sharesParam, attachmentParam];

  return event;
};
