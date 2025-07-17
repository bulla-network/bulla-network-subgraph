import { BigInt, ethereum } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";
import { InvoiceCreated, InvoicePaid } from "../../generated/BullaInvoice/BullaInvoice";
import { MOCK_MANAGER_ADDRESS } from "../helpers";

export const newInvoiceCreatedEvent = (
  claimId: BigInt,
  requestedByCreditor: boolean = true,
  isProtocolFeeExempt: boolean = false,
  deliveryDate: BigInt = BigInt.fromI32(1700000000),
  depositAmount: BigInt = BigInt.fromI32(5000),
  isDelivered: boolean = false,
  interestRateBps: BigInt = BigInt.fromI32(1000), // 10%
  numberOfPeriodsPerYear: BigInt = BigInt.fromI32(12),
  accruedInterest: BigInt = BigInt.fromI32(0),
  latestPeriodNumber: BigInt = BigInt.fromI32(0),
  protocolFeeBps: BigInt = BigInt.fromI32(500), // 5%
  totalGrossInterestPaid: BigInt = BigInt.fromI32(0),
): InvoiceCreated => {
  const mockEvent = newMockEvent();
  const invoiceCreatedEvent = new InvoiceCreated(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    mockEvent.receipt,
  );

  invoiceCreatedEvent.address = MOCK_MANAGER_ADDRESS;
  invoiceCreatedEvent.parameters = new Array();

  // claimId parameter (indexed)
  invoiceCreatedEvent.parameters.push(new ethereum.EventParam("claimId", ethereum.Value.fromUnsignedBigInt(claimId)));

  // Create PurchaseOrderState tuple
  const purchaseOrderArray = [ethereum.Value.fromUnsignedBigInt(deliveryDate), ethereum.Value.fromUnsignedBigInt(depositAmount), ethereum.Value.fromBoolean(isDelivered)];
  const purchaseOrderTuple: ethereum.Tuple = changetype<ethereum.Tuple>(purchaseOrderArray);

  // Create InterestConfig tuple (lateFeeConfig)
  const lateFeeConfigArray = [ethereum.Value.fromUnsignedBigInt(interestRateBps), ethereum.Value.fromUnsignedBigInt(numberOfPeriodsPerYear)];
  const lateFeeConfigTuple: ethereum.Tuple = changetype<ethereum.Tuple>(lateFeeConfigArray);

  // Create InterestComputationState tuple
  const interestComputationStateArray = [
    ethereum.Value.fromUnsignedBigInt(accruedInterest),
    ethereum.Value.fromUnsignedBigInt(latestPeriodNumber),
    ethereum.Value.fromUnsignedBigInt(protocolFeeBps),
    ethereum.Value.fromUnsignedBigInt(totalGrossInterestPaid),
  ];
  const interestComputationStateTuple: ethereum.Tuple = changetype<ethereum.Tuple>(interestComputationStateArray);

  // Create InvoiceDetails tuple
  const invoiceDetailsArray = [
    ethereum.Value.fromBoolean(requestedByCreditor),
    ethereum.Value.fromBoolean(isProtocolFeeExempt),
    ethereum.Value.fromTuple(purchaseOrderTuple),
    ethereum.Value.fromTuple(lateFeeConfigTuple),
    ethereum.Value.fromTuple(interestComputationStateTuple),
  ];
  const invoiceDetailsTuple: ethereum.Tuple = changetype<ethereum.Tuple>(invoiceDetailsArray);

  // invoiceDetails parameter
  invoiceCreatedEvent.parameters.push(new ethereum.EventParam("invoiceDetails", ethereum.Value.fromTuple(invoiceDetailsTuple)));

  return invoiceCreatedEvent;
};

export const newInvoicePaidEvent = (
  claimId: BigInt,
  grossInterestPaid: BigInt = BigInt.fromI32(1000),
  principalPaid: BigInt = BigInt.fromI32(5000),
  protocolFee: BigInt = BigInt.fromI32(250),
): InvoicePaid => {
  const mockEvent = newMockEvent();
  const invoicePaidEvent = new InvoicePaid(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    mockEvent.receipt,
  );

  invoicePaidEvent.address = MOCK_MANAGER_ADDRESS;
  invoicePaidEvent.parameters = new Array();

  invoicePaidEvent.parameters.push(new ethereum.EventParam("claimId", ethereum.Value.fromUnsignedBigInt(claimId)));
  invoicePaidEvent.parameters.push(new ethereum.EventParam("grossInterestPaid", ethereum.Value.fromUnsignedBigInt(grossInterestPaid)));
  invoicePaidEvent.parameters.push(new ethereum.EventParam("principalPaid", ethereum.Value.fromUnsignedBigInt(principalPaid)));
  invoicePaidEvent.parameters.push(new ethereum.EventParam("protocolFee", ethereum.Value.fromUnsignedBigInt(protocolFee)));

  return invoicePaidEvent;
};
