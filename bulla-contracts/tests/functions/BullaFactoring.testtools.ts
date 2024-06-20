import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";
import {
  DepositMade,
  DepositMadeWithAttachment,
  InvoiceFunded,
  InvoiceKickbackAmountSent,
  InvoiceUnfactored,
  SharesRedeemed,
  SharesRedeemedWithAttachment
} from "../../generated/BullaFactoring/BullaFactoring";
import { MOCK_BULLA_FACTORING_ADDRESS, MULTIHASH_BYTES, MULTIHASH_FUNCTION, MULTIHASH_SIZE, toEthAddress, toUint256 } from "../helpers";

export function newInvoiceFundedEvent(invoiceId: BigInt, fundedAmount: BigInt, originalCreditor: Address): InvoiceFunded {
  const mockEvent = newMockEvent();
  const invoiceFundedEvent = new InvoiceFunded(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    mockEvent.receipt
  );

  invoiceFundedEvent.address = MOCK_BULLA_FACTORING_ADDRESS;
  invoiceFundedEvent.parameters = new Array();
  invoiceFundedEvent.parameters.push(new ethereum.EventParam("invoiceId", ethereum.Value.fromUnsignedBigInt(invoiceId)));
  invoiceFundedEvent.parameters.push(new ethereum.EventParam("fundedAmount", ethereum.Value.fromUnsignedBigInt(fundedAmount)));
  invoiceFundedEvent.parameters.push(new ethereum.EventParam("originalCreditor", ethereum.Value.fromAddress(originalCreditor)));

  return invoiceFundedEvent;
}

export const newInvoiceKickbackAmountSentEvent = (originatingClaimId: BigInt, kickbackAmount: BigInt, originalCreditor: Address): InvoiceKickbackAmountSent => {
  const event: InvoiceKickbackAmountSent = changetype<InvoiceKickbackAmountSent>(newMockEvent());

  const invoiceId = new ethereum.EventParam("invoiceId", toUint256(originatingClaimId));
  const kickbackAmountParam = new ethereum.EventParam("kickbackAmount", toUint256(kickbackAmount));
  const originalCreditorParam = new ethereum.EventParam("originalCreditor", toEthAddress(originalCreditor));

  event.parameters = [invoiceId, kickbackAmountParam, originalCreditorParam];

  return event;
};

export const newInvoiceUnfactoredEvent = (
  originatingClaimId: BigInt,
  originalCreditor: Address,
  totalRefundAmount: BigInt,
  interestToCharge: BigInt
): InvoiceUnfactored => {
  const event: InvoiceUnfactored = changetype<InvoiceUnfactored>(newMockEvent());

  const invoiceId = new ethereum.EventParam("invoiceId", toUint256(originatingClaimId));
  const originalCreditorParam = new ethereum.EventParam("originalCreditor", toEthAddress(originalCreditor));
  const totalRefundAmountParam = new ethereum.EventParam("totalRefundAmount", toUint256(totalRefundAmount));
  const interestToChargeParam = new ethereum.EventParam("interestToCharge", toUint256(interestToCharge));

  event.parameters = [invoiceId, originalCreditorParam, totalRefundAmountParam, interestToChargeParam];

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
  const sharesParam = new ethereum.EventParam("shares", toUint256(shares));
  const attachmentParam = new ethereum.EventParam("attachment", ethereum.Value.fromTuple(multihashTuple)); // change name?

  event.parameters = [depositorParam, assetsParam, sharesParam, attachmentParam];

  return event;
};

export const newSharesRedeemedEvent = (redeemer: Address, assets: BigInt, shares: BigInt): SharesRedeemed => {
  const event: SharesRedeemed = changetype<SharesRedeemed>(newMockEvent());

  const redeemerParam = new ethereum.EventParam("redeemer", toEthAddress(redeemer));
  const sharesParam = new ethereum.EventParam("shares", toUint256(shares));
  const assetsParam = new ethereum.EventParam("assets", toUint256(assets));

  event.parameters = [redeemerParam, sharesParam, assetsParam];

  return event;
};

export const newSharesRedeemedWithAttachmentEvent = (redeemer: Address, assets: BigInt, shares: BigInt): SharesRedeemedWithAttachment => {
  const event: SharesRedeemedWithAttachment = changetype<SharesRedeemedWithAttachment>(newMockEvent());

  const hash: Bytes = changetype<Bytes>(Bytes.fromHexString(MULTIHASH_BYTES));

  const multihashArray: Array<ethereum.Value> = [
    ethereum.Value.fromBytes(hash), // hash
    toUint256(BigInt.fromU32(MULTIHASH_FUNCTION)), // hashFunction
    toUint256(BigInt.fromU32(MULTIHASH_SIZE)) // size
  ];
  const multihashTuple: ethereum.Tuple = changetype<ethereum.Tuple>(multihashArray);

  const depositorParam = new ethereum.EventParam("depositor", toEthAddress(redeemer));
  const sharesParam = new ethereum.EventParam("shares", toUint256(shares));
  const assetsParam = new ethereum.EventParam("assets", toUint256(assets));
  const attachmentParam = new ethereum.EventParam("attachment", ethereum.Value.fromTuple(multihashTuple)); // change name?

  event.parameters = [depositorParam, sharesParam, assetsParam, attachmentParam];

  return event;
};
