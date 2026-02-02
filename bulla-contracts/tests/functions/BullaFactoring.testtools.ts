import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";
import {
  DepositPermissionsChanged as DepositPermissionsChangedV0,
  FactoringPermissionsChanged as FactoringPermissionsChangedV0,
  InvoiceUnfactored as InvoiceUnfactoredV0,
} from "../../generated/BullaFactoringV0/BullaFactoringV0";
import {
  ActivePaidInvoicesReconciled,
  Deposit,
  DepositPermissionsChanged as DepositPermissionsChangedV1,
  FactoringPermissionsChanged as FactoringPermissionsChangedV1,
  InvoiceFunded as InvoiceFundedV1,
  InvoiceImpaired,
  InvoiceKickbackAmountSent,
  InvoicePaid as InvoicePaidV1,
  InvoiceUnfactored as InvoiceUnfactoredV1,
  Withdraw,
} from "../../generated/BullaFactoringV1/BullaFactoringV1";
import {
  Deposit as DepositV2_1,
  DepositPermissionsChanged as DepositPermissionsChangedV2_1,
  FactoringPermissionsChanged as FactoringPermissionsChangedV2_1,
  InvoiceFunded as InvoiceFundedV2_1,
  InvoicePaid as InvoicePaidV2_1,
  InvoiceUnfactored as InvoiceUnfactoredV2_1,
  RedeemPermissionsChanged as RedeemPermissionsChangedV2_1,
} from "../../generated/BullaFactoringV2_1/BullaFactoringV2_1";
import { MOCK_BULLA_FACTORING_ADDRESS, toEthAddress, toUint256 } from "../helpers";

/// @NOTICE: event parameters should be in the same order as the event declaration in the contract

export function newInvoiceFundedEventV1(invoiceId: BigInt, fundedAmount: BigInt, originalCreditor: Address): InvoiceFundedV1 {
  const mockEvent = newMockEvent();
  const invoiceFundedEvent = new InvoiceFundedV1(
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

export function newInvoiceFundedEventV2_1(
  invoiceId: BigInt,
  fundedAmount: BigInt,
  originalCreditor: Address,
  dueDate: BigInt,
  upfrontBps: BigInt,
  protocolFee: BigInt,
  fundsReceiver: Address = originalCreditor, // Default to originalCreditor for backward compatibility
): InvoiceFundedV2_1 {
  const mockEvent = newMockEvent();
  const invoiceFundedEvent = new InvoiceFundedV2_1(
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
  invoiceFundedEvent.parameters.push(new ethereum.EventParam("protocolFee", ethereum.Value.fromUnsignedBigInt(protocolFee)));
  invoiceFundedEvent.parameters.push(new ethereum.EventParam("fundsReceiver", ethereum.Value.fromAddress(fundsReceiver)));

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

export const newInvoicePaidEventV1 = (
  originatingClaimId: BigInt,
  fundedAmount: BigInt,
  kickbackAmount: BigInt,
  originalCreditor: Address,
  trueInterest: BigInt,
  trueAdminFee: BigInt,
  trueProtocolFee: BigInt,
): InvoicePaidV1 => {
  const mockEvent = newMockEvent();

  const InvoicePaidEvent = new InvoicePaidV1(
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

export const newInvoicePaidEventV2_1 = (
  originatingClaimId: BigInt,
  fundedAmount: BigInt,
  kickbackAmount: BigInt,
  originalCreditor: Address,
  trueInterest: BigInt,
  trueAdminFee: BigInt,
  trueSpreadAmount: BigInt,
): InvoicePaidV2_1 => {
  const mockEvent = newMockEvent();

  const InvoicePaidEvent = new InvoicePaidV2_1(
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
  const trueAdminFeeParam = new ethereum.EventParam("trueAdminFee", toUint256(trueAdminFee));
  const fundedAmountParam = new ethereum.EventParam("fundedAmountNet", toUint256(fundedAmount));
  const kickbackAmountParam = new ethereum.EventParam("kickbackAmount", toUint256(kickbackAmount));
  const originalCreditorParam = new ethereum.EventParam("originalCreditor", toEthAddress(originalCreditor));

  InvoicePaidEvent.parameters.push(invoiceId);
  InvoicePaidEvent.parameters.push(trueInterestParam);
  InvoicePaidEvent.parameters.push(trueSpreadParam);
  InvoicePaidEvent.parameters.push(trueAdminFeeParam);
  InvoicePaidEvent.parameters.push(fundedAmountParam);
  InvoicePaidEvent.parameters.push(kickbackAmountParam);
  InvoicePaidEvent.parameters.push(originalCreditorParam);

  return InvoicePaidEvent;
};

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
  invoiceUnfactoredEvent.parameters.push(new ethereum.EventParam("totalRefundOrPaymentAmount", ethereum.Value.fromUnsignedBigInt(totalRefundAmount)));
  invoiceUnfactoredEvent.parameters.push(new ethereum.EventParam("interestToCharge", ethereum.Value.fromUnsignedBigInt(interestToCharge)));

  return invoiceUnfactoredEvent;
}

export function newInvoiceUnfactoredEventV2_1(
  originatingClaimId: BigInt,
  originalCreditor: Address,
  totalRefundAmount: BigInt,
  interestToCharge: BigInt,
  adminFee: BigInt,
  spreadAmount: BigInt,
  unfactoredByOwner: boolean = false,
): InvoiceUnfactoredV2_1 {
  const mockEvent = newMockEvent();
  const invoiceUnfactoredEvent = new InvoiceUnfactoredV2_1(
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
  invoiceUnfactoredEvent.parameters.push(new ethereum.EventParam("adminFee", ethereum.Value.fromUnsignedBigInt(adminFee)));
  invoiceUnfactoredEvent.parameters.push(new ethereum.EventParam("unfactoredByOwner", ethereum.Value.fromBoolean(unfactoredByOwner)));

  return invoiceUnfactoredEvent;
}

export function newInvoiceUnfactoredEventV0(
  originatingClaimId: BigInt,
  originalCreditor: Address,
  totalRefundAmount: BigInt,
  interestToCharge: BigInt,
): InvoiceUnfactoredV0 {
  const mockEvent = newMockEvent();
  const invoiceUnfactoredEvent = new InvoiceUnfactoredV0(
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

export function newDepositMadeEventV2_1(depositor: Address, assets: BigInt, shares: BigInt): DepositV2_1 {
  const mockEvent = newMockEvent();
  const depositMadeEvent = new DepositV2_1(
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

export function newDepositPermissionsChangedEventV0(newAddress: Address): DepositPermissionsChangedV0 {
  const mockEvent = newMockEvent();
  const event = new DepositPermissionsChangedV0(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    mockEvent.receipt,
  );

  event.address = MOCK_BULLA_FACTORING_ADDRESS;
  event.parameters = new Array();
  event.parameters.push(new ethereum.EventParam("newAddress", ethereum.Value.fromAddress(newAddress)));

  return event;
}

export function newFactoringPermissionsChangedEventV0(newAddress: Address): FactoringPermissionsChangedV0 {
  const mockEvent = newMockEvent();
  const event = new FactoringPermissionsChangedV0(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    mockEvent.receipt,
  );

  event.address = MOCK_BULLA_FACTORING_ADDRESS;
  event.parameters = new Array();
  event.parameters.push(new ethereum.EventParam("newAddress", ethereum.Value.fromAddress(newAddress)));

  return event;
}

export function newDepositPermissionsChangedEventV1(newAddress: Address): DepositPermissionsChangedV1 {
  const mockEvent = newMockEvent();
  const event = new DepositPermissionsChangedV1(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    mockEvent.receipt,
  );

  event.address = MOCK_BULLA_FACTORING_ADDRESS;
  event.parameters = new Array();
  event.parameters.push(new ethereum.EventParam("newAddress", ethereum.Value.fromAddress(newAddress)));

  return event;
}

export function newFactoringPermissionsChangedEventV1(newAddress: Address): FactoringPermissionsChangedV1 {
  const mockEvent = newMockEvent();
  const event = new FactoringPermissionsChangedV1(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    mockEvent.receipt,
  );

  event.address = MOCK_BULLA_FACTORING_ADDRESS;
  event.parameters = new Array();
  event.parameters.push(new ethereum.EventParam("newAddress", ethereum.Value.fromAddress(newAddress)));

  return event;
}

export function newDepositPermissionsChangedEventV2_1(newAddress: Address): DepositPermissionsChangedV2_1 {
  const mockEvent = newMockEvent();
  const event = new DepositPermissionsChangedV2_1(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    mockEvent.receipt,
  );

  event.address = MOCK_BULLA_FACTORING_ADDRESS;
  event.parameters = new Array();
  event.parameters.push(new ethereum.EventParam("newAddress", ethereum.Value.fromAddress(newAddress)));

  return event;
}

export function newFactoringPermissionsChangedEventV2_1(newAddress: Address): FactoringPermissionsChangedV2_1 {
  const mockEvent = newMockEvent();
  const event = new FactoringPermissionsChangedV2_1(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    mockEvent.receipt,
  );

  event.address = MOCK_BULLA_FACTORING_ADDRESS;
  event.parameters = new Array();
  event.parameters.push(new ethereum.EventParam("newAddress", ethereum.Value.fromAddress(newAddress)));

  return event;
}

export function newRedeemPermissionsChangedEventV2_1(newAddress: Address): RedeemPermissionsChangedV2_1 {
  const mockEvent = newMockEvent();
  const event = new RedeemPermissionsChangedV2_1(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    mockEvent.receipt,
  );

  event.address = MOCK_BULLA_FACTORING_ADDRESS;
  event.parameters = new Array();
  event.parameters.push(new ethereum.EventParam("newAddress", ethereum.Value.fromAddress(newAddress)));

  return event;
}
