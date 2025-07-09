import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";
import {
  ActivePaidInvoicesReconciled,
  Deposit,
  InvoiceFunded as InvoiceFundedV2,
  InvoiceImpaired,
  InvoiceKickbackAmountSent,
  InvoicePaid,
  InvoicePaid as InvoicePaidV2,
  InvoiceUnfactored as InvoiceUnfactoredV2,
  SharesRedeemedWithAttachment,
  Withdraw,
} from "../../generated/BullaFactoringv2/BullaFactoringv2";
import {
  InvoiceFunded as InvoiceFundedV3,
  InvoiceUnfactored as InvoiceUnfactoredV3,
  InvoicePaid as InvoicePaidV3,
  DepositMadeWithAttachment as DepositMadeWithAttachmentV3,
  SharesRedeemedWithAttachment as SharesRedeemedWithAttachmentV3,
} from "../../generated/BullaFactoringv3/BullaFactoringv3";
import { InvoiceUnfactored as InvoiceUnfactoredV1, DepositMadeWithAttachment } from "../../generated/BullaFactoring/BullaFactoring";
import { MOCK_BULLA_FACTORING_ADDRESS, MULTIHASH_BYTES, MULTIHASH_FUNCTION, MULTIHASH_SIZE, toEthAddress, toUint256 } from "../helpers";

/// @NOTICE: event parameters should be in the same order as the event declaration in the contract

export function newInvoiceFundedEventV2(invoiceId: BigInt, fundedAmount: BigInt, originalCreditor: Address): InvoiceFundedV2 {
  const mockEvent = newMockEvent();
  const invoiceFundedEvent = new InvoiceFundedV2(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    mockEvent.receipt,
  );

  invoiceFundedEvent.address = MOCK_BULLA_FACTORING_ADDRESS;
  invoiceFundedEvent.parameters = new Array();
  invoiceFundedEvent.parameters.push(new ethereum.EventParam("invoiceId", ethereum.Value.fromUnsignedBigInt(invoiceId)));
  invoiceFundedEvent.parameters.push(new ethereum.EventParam("fundedAmount", ethereum.Value.fromUnsignedBigInt(fundedAmount)));
  invoiceFundedEvent.parameters.push(new ethereum.EventParam("originalCreditor", ethereum.Value.fromAddress(originalCreditor)));

  return invoiceFundedEvent;
}

export function newInvoiceFundedEventV3(invoiceId: BigInt, fundedAmount: BigInt, originalCreditor: Address, dueDate: BigInt, upfrontBps: BigInt): InvoiceFundedV3 {
  const mockEvent = newMockEvent();
  const invoiceFundedEvent = new InvoiceFundedV3(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    mockEvent.receipt,
  );

  invoiceFundedEvent.address = MOCK_BULLA_FACTORING_ADDRESS;
  invoiceFundedEvent.parameters = new Array();
  invoiceFundedEvent.parameters.push(new ethereum.EventParam("invoiceId", ethereum.Value.fromUnsignedBigInt(invoiceId)));
  invoiceFundedEvent.parameters.push(new ethereum.EventParam("fundedAmount", ethereum.Value.fromUnsignedBigInt(fundedAmount)));
  invoiceFundedEvent.parameters.push(new ethereum.EventParam("originalCreditor", ethereum.Value.fromAddress(originalCreditor)));
  invoiceFundedEvent.parameters.push(new ethereum.EventParam("dueDate", ethereum.Value.fromUnsignedBigInt(dueDate)));
  invoiceFundedEvent.parameters.push(new ethereum.EventParam("upfrontBps", ethereum.Value.fromUnsignedBigInt(upfrontBps)));

  return invoiceFundedEvent;
}

export const newInvoiceKickbackAmountSentEvent = (originatingClaimId: BigInt, kickbackAmount: BigInt, originalCreditor: Address): InvoiceKickbackAmountSent => {
  const mockEvent = newMockEvent();

  const InvoiceKickbackAmountSentEvent = new InvoiceKickbackAmountSent(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    mockEvent.receipt,
  );

  InvoiceKickbackAmountSentEvent.address = MOCK_BULLA_FACTORING_ADDRESS;
  InvoiceKickbackAmountSentEvent.parameters = new Array();

  const invoiceId = new ethereum.EventParam("invoiceId", toUint256(originatingClaimId));
  const kickbackAmountParam = new ethereum.EventParam("kickbackAmount", toUint256(kickbackAmount));
  const originalCreditorParam = new ethereum.EventParam("originalCreditor", toEthAddress(originalCreditor));

  InvoiceKickbackAmountSentEvent.parameters.push(invoiceId);
  InvoiceKickbackAmountSentEvent.parameters.push(kickbackAmountParam);
  InvoiceKickbackAmountSentEvent.parameters.push(originalCreditorParam);

  return InvoiceKickbackAmountSentEvent;
};

export const newInvoicePaidEventV2 = (
  originatingClaimId: BigInt,
  fundedAmount: BigInt,
  kickbackAmount: BigInt,
  originalCreditor: Address,
  trueInterest: BigInt,
  trueAdminFee: BigInt,
  trueProtocolFee: BigInt,
): InvoicePaidV2 => {
  const mockEvent = newMockEvent();

  const InvoicePaidEvent = new InvoicePaidV2(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    mockEvent.receipt,
  );

  InvoicePaidEvent.address = MOCK_BULLA_FACTORING_ADDRESS;
  InvoicePaidEvent.parameters = new Array();

  const invoiceId = new ethereum.EventParam("invoiceId", toUint256(originatingClaimId));
  const fundedAmountParam = new ethereum.EventParam("fundedAmount", toUint256(fundedAmount));
  const kickbackAmountParam = new ethereum.EventParam("kickbackAmount", toUint256(kickbackAmount));
  const originalCreditorParam = new ethereum.EventParam("originalCreditor", toEthAddress(originalCreditor));
  const trueInterestParam = new ethereum.EventParam("trueInterest", toUint256(trueInterest));
  const trueAdminFeeParam = new ethereum.EventParam("adminFee", toUint256(trueAdminFee));
  const trueProtocolFeeParam = new ethereum.EventParam("trueProtocolFee", toUint256(trueProtocolFee));

  InvoicePaidEvent.parameters.push(invoiceId);
  InvoicePaidEvent.parameters.push(trueInterestParam);
  InvoicePaidEvent.parameters.push(trueProtocolFeeParam);
  InvoicePaidEvent.parameters.push(trueAdminFeeParam);
  InvoicePaidEvent.parameters.push(fundedAmountParam);
  InvoicePaidEvent.parameters.push(kickbackAmountParam);
  InvoicePaidEvent.parameters.push(originalCreditorParam);

  return InvoicePaidEvent;
};

export const newInvoicePaidEventV3 = (
  originatingClaimId: BigInt,
  fundedAmount: BigInt,
  kickbackAmount: BigInt,
  originalCreditor: Address,
  trueInterest: BigInt,
  trueAdminFee: BigInt,
  trueProtocolFee: BigInt,
  trueSpreadAmount: BigInt,
): InvoicePaidV3 => {
  const mockEvent = newMockEvent();

  const InvoicePaidEvent = new InvoicePaidV3(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    mockEvent.receipt,
  );

  InvoicePaidEvent.address = MOCK_BULLA_FACTORING_ADDRESS;
  InvoicePaidEvent.parameters = new Array();

  const invoiceId = new ethereum.EventParam("invoiceId", toUint256(originatingClaimId));
  const trueInterestParam = new ethereum.EventParam("trueInterest", toUint256(trueInterest));
  const trueSpreadParam = new ethereum.EventParam("trueSpreadAmount", toUint256(trueSpreadAmount));
  const trueProtocolFeeParam = new ethereum.EventParam("trueProtocolFee", toUint256(trueProtocolFee));
  const trueAdminFeeParam = new ethereum.EventParam("trueAdminFee", toUint256(trueAdminFee));
  const fundedAmountParam = new ethereum.EventParam("fundedAmountNet", toUint256(fundedAmount));
  const kickbackAmountParam = new ethereum.EventParam("kickbackAmount", toUint256(kickbackAmount));
  const originalCreditorParam = new ethereum.EventParam("originalCreditor", toEthAddress(originalCreditor));

  InvoicePaidEvent.parameters.push(invoiceId);
  InvoicePaidEvent.parameters.push(trueInterestParam);
  InvoicePaidEvent.parameters.push(trueSpreadParam);
  InvoicePaidEvent.parameters.push(trueProtocolFeeParam);
  InvoicePaidEvent.parameters.push(trueAdminFeeParam);
  InvoicePaidEvent.parameters.push(fundedAmountParam);
  InvoicePaidEvent.parameters.push(kickbackAmountParam);
  InvoicePaidEvent.parameters.push(originalCreditorParam);

  return InvoicePaidEvent;
};

export function newInvoiceUnfactoredEventV2(
  originatingClaimId: BigInt,
  originalCreditor: Address,
  totalRefundAmount: BigInt,
  interestToCharge: BigInt,
): InvoiceUnfactoredV2 {
  const mockEvent = newMockEvent();
  const invoiceUnfactoredEvent = new InvoiceUnfactoredV2(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    mockEvent.receipt,
  );

  invoiceUnfactoredEvent.address = MOCK_BULLA_FACTORING_ADDRESS;
  invoiceUnfactoredEvent.parameters = new Array();
  invoiceUnfactoredEvent.parameters.push(new ethereum.EventParam("invoiceId", ethereum.Value.fromUnsignedBigInt(originatingClaimId)));
  invoiceUnfactoredEvent.parameters.push(new ethereum.EventParam("originalCreditor", ethereum.Value.fromAddress(originalCreditor)));
  invoiceUnfactoredEvent.parameters.push(new ethereum.EventParam("totalRefundOrPaymentAmount", ethereum.Value.fromUnsignedBigInt(totalRefundAmount)));
  invoiceUnfactoredEvent.parameters.push(new ethereum.EventParam("interestToCharge", ethereum.Value.fromUnsignedBigInt(interestToCharge)));

  return invoiceUnfactoredEvent;
}

export function newInvoiceUnfactoredEventV3(
  originatingClaimId: BigInt,
  originalCreditor: Address,
  totalRefundAmount: BigInt,
  interestToCharge: BigInt,
  protocolFee: BigInt,
  adminFee: BigInt,
  spreadAmount: BigInt,
): InvoiceUnfactoredV3 {
  const mockEvent = newMockEvent();
  const invoiceUnfactoredEvent = new InvoiceUnfactoredV3(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    mockEvent.receipt,
  );

  invoiceUnfactoredEvent.address = MOCK_BULLA_FACTORING_ADDRESS;
  invoiceUnfactoredEvent.parameters = new Array();
  invoiceUnfactoredEvent.parameters.push(new ethereum.EventParam("invoiceId", ethereum.Value.fromUnsignedBigInt(originatingClaimId)));
  invoiceUnfactoredEvent.parameters.push(new ethereum.EventParam("originalCreditor", ethereum.Value.fromAddress(originalCreditor)));
  invoiceUnfactoredEvent.parameters.push(new ethereum.EventParam("totalRefundOrPaymentAmount", ethereum.Value.fromUnsignedBigInt(totalRefundAmount)));
  invoiceUnfactoredEvent.parameters.push(new ethereum.EventParam("interestToCharge", ethereum.Value.fromUnsignedBigInt(interestToCharge)));
  invoiceUnfactoredEvent.parameters.push(new ethereum.EventParam("spreadAmount", ethereum.Value.fromUnsignedBigInt(spreadAmount)));
  invoiceUnfactoredEvent.parameters.push(new ethereum.EventParam("protocolFee", ethereum.Value.fromUnsignedBigInt(protocolFee)));
  invoiceUnfactoredEvent.parameters.push(new ethereum.EventParam("adminFee", ethereum.Value.fromUnsignedBigInt(adminFee)));

  return invoiceUnfactoredEvent;
}

export function newInvoiceUnfactoredEventV1(
  originatingClaimId: BigInt,
  originalCreditor: Address,
  totalRefundAmount: BigInt,
  interestToCharge: BigInt,
): InvoiceUnfactoredV1 {
  const mockEvent = newMockEvent();
  const invoiceUnfactoredEvent = new InvoiceUnfactoredV1(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    mockEvent.receipt,
  );

  invoiceUnfactoredEvent.address = MOCK_BULLA_FACTORING_ADDRESS;
  invoiceUnfactoredEvent.parameters = new Array();
  invoiceUnfactoredEvent.parameters.push(new ethereum.EventParam("invoiceId", ethereum.Value.fromUnsignedBigInt(originatingClaimId)));
  invoiceUnfactoredEvent.parameters.push(new ethereum.EventParam("originalCreditor", ethereum.Value.fromAddress(originalCreditor)));
  invoiceUnfactoredEvent.parameters.push(new ethereum.EventParam("totalRefundAmount", ethereum.Value.fromUnsignedBigInt(totalRefundAmount)));
  invoiceUnfactoredEvent.parameters.push(new ethereum.EventParam("interestToCharge", ethereum.Value.fromUnsignedBigInt(interestToCharge)));

  return invoiceUnfactoredEvent;
}

export function newDepositMadeEvent(depositor: Address, assets: BigInt, shares: BigInt): Deposit {
  const mockEvent = newMockEvent();
  const depositMadeEvent = new Deposit(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    mockEvent.receipt,
  );

  depositMadeEvent.address = MOCK_BULLA_FACTORING_ADDRESS;
  depositMadeEvent.parameters = new Array();
  depositMadeEvent.parameters.push(new ethereum.EventParam("sender", ethereum.Value.fromAddress(depositor)));
  depositMadeEvent.parameters.push(new ethereum.EventParam("owner", ethereum.Value.fromAddress(depositor)));
  depositMadeEvent.parameters.push(new ethereum.EventParam("assets", ethereum.Value.fromUnsignedBigInt(assets)));
  depositMadeEvent.parameters.push(new ethereum.EventParam("shares", ethereum.Value.fromUnsignedBigInt(shares)));

  return depositMadeEvent;
}

export function newDepositMadeWithAttachmentEvent(depositor: Address, assets: BigInt, shares: BigInt): DepositMadeWithAttachment {
  const mockEvent = newMockEvent();
  const depositMadeWithAttachmentEvent = new DepositMadeWithAttachment(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    mockEvent.receipt,
  );

  depositMadeWithAttachmentEvent.address = MOCK_BULLA_FACTORING_ADDRESS;
  depositMadeWithAttachmentEvent.parameters = new Array();
  depositMadeWithAttachmentEvent.parameters.push(new ethereum.EventParam("depositor", ethereum.Value.fromAddress(depositor)));
  depositMadeWithAttachmentEvent.parameters.push(new ethereum.EventParam("assets", ethereum.Value.fromUnsignedBigInt(assets)));
  depositMadeWithAttachmentEvent.parameters.push(new ethereum.EventParam("shares", ethereum.Value.fromUnsignedBigInt(shares)));
  depositMadeWithAttachmentEvent.parameters.push(new ethereum.EventParam("attachment", ethereum.Value.fromTuple(createMultihashTuple())));

  return depositMadeWithAttachmentEvent;
}

export function newDepositMadeWithAttachmentEventV3(depositor: Address, assets: BigInt, shares: BigInt): DepositMadeWithAttachmentV3 {
  const mockEvent = newMockEvent();
  const depositMadeWithAttachmentEvent = new DepositMadeWithAttachmentV3(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    mockEvent.receipt,
  );

  depositMadeWithAttachmentEvent.address = MOCK_BULLA_FACTORING_ADDRESS;
  depositMadeWithAttachmentEvent.parameters = new Array();
  depositMadeWithAttachmentEvent.parameters.push(new ethereum.EventParam("depositor", ethereum.Value.fromAddress(depositor)));
  depositMadeWithAttachmentEvent.parameters.push(new ethereum.EventParam("assets", ethereum.Value.fromUnsignedBigInt(assets)));
  depositMadeWithAttachmentEvent.parameters.push(new ethereum.EventParam("shares", ethereum.Value.fromUnsignedBigInt(shares)));
  depositMadeWithAttachmentEvent.parameters.push(new ethereum.EventParam("attachment", ethereum.Value.fromTuple(createMultihashTuple())));

  return depositMadeWithAttachmentEvent;
}

export function newSharesRedeemedEvent(redeemer: Address, assets: BigInt, shares: BigInt): Withdraw {
  const mockEvent = newMockEvent();
  const sharesRedeemedEvent = new Withdraw(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    mockEvent.receipt,
  );

  sharesRedeemedEvent.address = MOCK_BULLA_FACTORING_ADDRESS;
  sharesRedeemedEvent.parameters = new Array();
  sharesRedeemedEvent.parameters.push(new ethereum.EventParam("sender", ethereum.Value.fromAddress(redeemer)));
  sharesRedeemedEvent.parameters.push(new ethereum.EventParam("receiver", ethereum.Value.fromAddress(redeemer)));
  sharesRedeemedEvent.parameters.push(new ethereum.EventParam("owner", ethereum.Value.fromAddress(redeemer)));
  sharesRedeemedEvent.parameters.push(new ethereum.EventParam("shares", ethereum.Value.fromUnsignedBigInt(shares)));
  sharesRedeemedEvent.parameters.push(new ethereum.EventParam("assets", ethereum.Value.fromUnsignedBigInt(assets)));

  return sharesRedeemedEvent;
}

export function newSharesRedeemedWithAttachmentEvent(redeemer: Address, assets: BigInt, shares: BigInt): SharesRedeemedWithAttachment {
  const mockEvent = newMockEvent();
  const sharesRedeemedWithAttachmentEvent = new SharesRedeemedWithAttachment(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    mockEvent.receipt,
  );

  sharesRedeemedWithAttachmentEvent.address = MOCK_BULLA_FACTORING_ADDRESS;
  sharesRedeemedWithAttachmentEvent.parameters = new Array();
  sharesRedeemedWithAttachmentEvent.parameters.push(new ethereum.EventParam("redeemer", ethereum.Value.fromAddress(redeemer)));
  sharesRedeemedWithAttachmentEvent.parameters.push(new ethereum.EventParam("shares", ethereum.Value.fromUnsignedBigInt(shares)));
  sharesRedeemedWithAttachmentEvent.parameters.push(new ethereum.EventParam("assets", ethereum.Value.fromUnsignedBigInt(assets)));
  sharesRedeemedWithAttachmentEvent.parameters.push(new ethereum.EventParam("attachment", ethereum.Value.fromTuple(createMultihashTuple())));

  return sharesRedeemedWithAttachmentEvent;
}

export function newSharesRedeemedWithAttachmentEventV3(redeemer: Address, assets: BigInt, shares: BigInt): SharesRedeemedWithAttachmentV3 {
  const mockEvent = newMockEvent();
  const sharesRedeemedWithAttachmentEvent = new SharesRedeemedWithAttachmentV3(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    mockEvent.receipt,
  );

  sharesRedeemedWithAttachmentEvent.address = MOCK_BULLA_FACTORING_ADDRESS;
  sharesRedeemedWithAttachmentEvent.parameters = new Array();
  sharesRedeemedWithAttachmentEvent.parameters.push(new ethereum.EventParam("redeemer", ethereum.Value.fromAddress(redeemer)));
  sharesRedeemedWithAttachmentEvent.parameters.push(new ethereum.EventParam("shares", ethereum.Value.fromUnsignedBigInt(shares)));
  sharesRedeemedWithAttachmentEvent.parameters.push(new ethereum.EventParam("assets", ethereum.Value.fromUnsignedBigInt(assets)));
  sharesRedeemedWithAttachmentEvent.parameters.push(new ethereum.EventParam("attachment", ethereum.Value.fromTuple(createMultihashTuple())));

  return sharesRedeemedWithAttachmentEvent;
}

export function newInvoiceImpairedEvent(originatingClaimId: BigInt, lossAmount: BigInt, gainAmount: BigInt): InvoiceImpaired {
  const mockEvent = newMockEvent();
  const invoiceImpairedEvent = new InvoiceImpaired(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    mockEvent.receipt,
  );

  invoiceImpairedEvent.address = MOCK_BULLA_FACTORING_ADDRESS;
  invoiceImpairedEvent.parameters = new Array();
  invoiceImpairedEvent.parameters.push(new ethereum.EventParam("invoiceId", ethereum.Value.fromUnsignedBigInt(originatingClaimId)));
  invoiceImpairedEvent.parameters.push(new ethereum.EventParam("lossAmount", ethereum.Value.fromUnsignedBigInt(lossAmount)));
  invoiceImpairedEvent.parameters.push(new ethereum.EventParam("gainAmount", ethereum.Value.fromUnsignedBigInt(gainAmount)));

  return invoiceImpairedEvent;
}

export const newActivePaidInvoicesReconciledEvent = (invoiceIds: BigInt[]): ActivePaidInvoicesReconciled => {
  const event: ActivePaidInvoicesReconciled = changetype<ActivePaidInvoicesReconciled>(newMockEvent());

  const paidInvoiceIdsArg = new Array<ethereum.Value>();
  for (let i = 0; i < invoiceIds.length; i++) {
    paidInvoiceIdsArg.push(ethereum.Value.fromUnsignedBigInt(invoiceIds[i]));
  }

  event.parameters = new Array();
  event.parameters.push(new ethereum.EventParam("paidInvoiceIds", ethereum.Value.fromArray(paidInvoiceIdsArg)));

  return event;
};

function createMultihashTuple(): ethereum.Tuple {
  const hash: Bytes = changetype<Bytes>(Bytes.fromHexString(MULTIHASH_BYTES));
  const multihashArray: Array<ethereum.Value> = [
    ethereum.Value.fromBytes(hash),
    ethereum.Value.fromUnsignedBigInt(BigInt.fromU32(MULTIHASH_FUNCTION)),
    ethereum.Value.fromUnsignedBigInt(BigInt.fromU32(MULTIHASH_SIZE)),
  ];
  return changetype<ethereum.Tuple>(multihashArray);
}
