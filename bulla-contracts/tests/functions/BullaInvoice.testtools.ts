import { BigInt, ethereum, Address } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";
import { InvoiceCreated, InvoicePaid, PurchaseOrderAccepted, PurchaseOrderDelivered, FeeWithdrawn } from "../../generated/BullaInvoice/BullaInvoice";
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
  fee: BigInt = BigInt.fromI32(100),
  tokenURI: string = "https://example.com/token",
  attachmentURI: string = "https://example.com/attachment",
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
  const purchaseOrderTuple = new ethereum.Tuple();
  purchaseOrderTuple.push(ethereum.Value.fromUnsignedBigInt(deliveryDate));
  purchaseOrderTuple.push(ethereum.Value.fromUnsignedBigInt(depositAmount));
  purchaseOrderTuple.push(ethereum.Value.fromBoolean(isDelivered));

  // Create InterestConfig tuple (lateFeeConfig)
  const lateFeeConfigTuple = new ethereum.Tuple();
  lateFeeConfigTuple.push(ethereum.Value.fromUnsignedBigInt(interestRateBps));
  lateFeeConfigTuple.push(ethereum.Value.fromUnsignedBigInt(numberOfPeriodsPerYear));

  // Create InterestComputationState tuple
  const interestComputationStateTuple = new ethereum.Tuple();
  interestComputationStateTuple.push(ethereum.Value.fromUnsignedBigInt(accruedInterest));
  interestComputationStateTuple.push(ethereum.Value.fromUnsignedBigInt(latestPeriodNumber));
  interestComputationStateTuple.push(ethereum.Value.fromUnsignedBigInt(protocolFeeBps));
  interestComputationStateTuple.push(ethereum.Value.fromUnsignedBigInt(totalGrossInterestPaid));

  // Create InvoiceDetails tuple
  const invoiceDetailsTuple = new ethereum.Tuple();
  invoiceDetailsTuple.push(ethereum.Value.fromBoolean(requestedByCreditor));
  invoiceDetailsTuple.push(ethereum.Value.fromBoolean(isProtocolFeeExempt));
  invoiceDetailsTuple.push(ethereum.Value.fromTuple(purchaseOrderTuple));
  invoiceDetailsTuple.push(ethereum.Value.fromTuple(lateFeeConfigTuple));
  invoiceDetailsTuple.push(ethereum.Value.fromTuple(interestComputationStateTuple));

  // Create ClaimMetadata tuple
  const metadataTuple = new ethereum.Tuple();
  metadataTuple.push(ethereum.Value.fromString(tokenURI));
  metadataTuple.push(ethereum.Value.fromString(attachmentURI));

  // Add all parameters
  invoiceCreatedEvent.parameters.push(new ethereum.EventParam("invoiceDetails", ethereum.Value.fromTuple(invoiceDetailsTuple)));
  invoiceCreatedEvent.parameters.push(new ethereum.EventParam("fee", ethereum.Value.fromUnsignedBigInt(fee)));
  invoiceCreatedEvent.parameters.push(new ethereum.EventParam("metadata", ethereum.Value.fromTuple(metadataTuple)));

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

export const newPurchaseOrderAcceptedEvent = (
  claimId: BigInt,
  debtor: Address = Address.fromString("0x0000000000000000000000000000000000000002"),
  depositAmount: BigInt = BigInt.fromI32(1000),
  bound: boolean = true,
): PurchaseOrderAccepted => {
  const mockEvent = newMockEvent();
  const purchaseOrderAcceptedEvent = new PurchaseOrderAccepted(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    mockEvent.receipt,
  );

  purchaseOrderAcceptedEvent.address = MOCK_MANAGER_ADDRESS;
  purchaseOrderAcceptedEvent.parameters = new Array();

  purchaseOrderAcceptedEvent.parameters.push(new ethereum.EventParam("claimId", ethereum.Value.fromUnsignedBigInt(claimId)));
  purchaseOrderAcceptedEvent.parameters.push(new ethereum.EventParam("debtor", ethereum.Value.fromAddress(debtor)));
  purchaseOrderAcceptedEvent.parameters.push(new ethereum.EventParam("depositAmount", ethereum.Value.fromUnsignedBigInt(depositAmount)));
  purchaseOrderAcceptedEvent.parameters.push(new ethereum.EventParam("bound", ethereum.Value.fromBoolean(bound)));

  return purchaseOrderAcceptedEvent;
};

export const newPurchaseOrderDeliveredEvent = (claimId: BigInt): PurchaseOrderDelivered => {
  const mockEvent = newMockEvent();
  const purchaseOrderDeliveredEvent = new PurchaseOrderDelivered(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    mockEvent.receipt,
  );

  purchaseOrderDeliveredEvent.address = MOCK_MANAGER_ADDRESS;
  purchaseOrderDeliveredEvent.parameters = new Array();

  purchaseOrderDeliveredEvent.parameters.push(new ethereum.EventParam("claimId", ethereum.Value.fromUnsignedBigInt(claimId)));

  return purchaseOrderDeliveredEvent;
};

export const newFeeWithdrawnEvent = (admin: Address, token: Address, amount: BigInt): FeeWithdrawn => {
  const mockEvent = newMockEvent();
  const feeWithdrawnEvent = new FeeWithdrawn(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    mockEvent.receipt,
  );

  feeWithdrawnEvent.address = MOCK_MANAGER_ADDRESS;
  feeWithdrawnEvent.parameters = new Array();

  feeWithdrawnEvent.parameters.push(new ethereum.EventParam("admin", ethereum.Value.fromAddress(admin)));
  feeWithdrawnEvent.parameters.push(new ethereum.EventParam("token", ethereum.Value.fromAddress(token)));
  feeWithdrawnEvent.parameters.push(new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount)));

  return feeWithdrawnEvent;
};
