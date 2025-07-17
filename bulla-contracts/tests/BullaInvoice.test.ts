import { BigInt, log, Address } from "@graphprotocol/graph-ts";
import { assert, test } from "matchstick-as/assembly/index";
import { CLAIM_TYPE_INVOICE, CLAIM_STATUS_PAID, CLAIM_STATUS_REPAYING } from "../src/functions/common";
import { getInvoiceCreatedEventId, getInvoicePaidEventId } from "../src/functions/BullaInvoice";
import { handleInvoiceCreated, handleInvoicePaid } from "../src/mappings/BullaInvoice";
import { newClaimCreatedEventV2 } from "./functions/BullaClaimERC721.testtools";
import { newInvoiceCreatedEvent, newInvoicePaidEvent } from "./functions/BullaInvoice.testtools";
import { afterEach, setupContracts, ADDRESS_1, ADDRESS_2 } from "./helpers";
import { handleClaimCreatedV2 } from "../src/mappings/BullaClaimERC721";

test("it handles InvoiceCreated events", () => {
  setupContracts();

  const claimId = BigInt.fromI32(1);
  const requestedByCreditor = true;
  const isProtocolFeeExempt = false;
  const deliveryDate = BigInt.fromI32(1700000000);
  const depositAmount = BigInt.fromI32(5000);
  const isDelivered = false;
  const interestRateBps = BigInt.fromI32(1000); // 10%
  const numberOfPeriodsPerYear = BigInt.fromI32(12);
  const accruedInterest = BigInt.fromI32(0);
  const latestPeriodNumber = BigInt.fromI32(0);
  const protocolFeeBps = BigInt.fromI32(500); // 5%
  const totalGrossInterestPaid = BigInt.fromI32(0);

  const timestamp = BigInt.fromI32(100);
  const blockNum = BigInt.fromI32(100);

  // Create a corresponding claim first. In real implementation it's created contextually
  const claimCreatedEvent = newClaimCreatedEventV2(claimId.toU32(), CLAIM_TYPE_INVOICE);
  claimCreatedEvent.block.timestamp = timestamp;
  claimCreatedEvent.block.number = blockNum;
  handleClaimCreatedV2(claimCreatedEvent);

  const invoiceCreatedEvent = newInvoiceCreatedEvent(
    claimId,
    requestedByCreditor,
    isProtocolFeeExempt,
    deliveryDate,
    depositAmount,
    isDelivered,
    interestRateBps,
    numberOfPeriodsPerYear,
    accruedInterest,
    latestPeriodNumber,
    protocolFeeBps,
    totalGrossInterestPaid,
  );
  invoiceCreatedEvent.block.timestamp = timestamp;
  invoiceCreatedEvent.block.number = blockNum;

  handleInvoiceCreated(invoiceCreatedEvent);

  const invoiceCreatedEventId = getInvoiceCreatedEventId(claimId, invoiceCreatedEvent);

  // Test InvoiceCreatedEvent creation
  assert.fieldEquals("InvoiceCreatedEvent", invoiceCreatedEventId, "claim", claimId.toString());
  assert.fieldEquals("InvoiceCreatedEvent", invoiceCreatedEventId, "requestedByCreditor", requestedByCreditor.toString());
  assert.fieldEquals("InvoiceCreatedEvent", invoiceCreatedEventId, "isProtocolFeeExempt", isProtocolFeeExempt.toString());
  assert.fieldEquals("InvoiceCreatedEvent", invoiceCreatedEventId, "deliveryDate", deliveryDate.toString());
  assert.fieldEquals("InvoiceCreatedEvent", invoiceCreatedEventId, "depositAmount", depositAmount.toString());
  assert.fieldEquals("InvoiceCreatedEvent", invoiceCreatedEventId, "isDelivered", isDelivered.toString());
  assert.fieldEquals("InvoiceCreatedEvent", invoiceCreatedEventId, "interestRateBps", interestRateBps.toString());
  assert.fieldEquals("InvoiceCreatedEvent", invoiceCreatedEventId, "accruedInterest", accruedInterest.toString());
  assert.fieldEquals("InvoiceCreatedEvent", invoiceCreatedEventId, "protocolFeeBps", protocolFeeBps.toString());
  assert.fieldEquals("InvoiceCreatedEvent", invoiceCreatedEventId, "totalGrossInterestPaid", totalGrossInterestPaid.toString());
  assert.fieldEquals("InvoiceCreatedEvent", invoiceCreatedEventId, "eventName", "InvoiceCreated");
  assert.fieldEquals("InvoiceCreatedEvent", invoiceCreatedEventId, "blockNumber", invoiceCreatedEvent.block.number.toString());
  assert.fieldEquals("InvoiceCreatedEvent", invoiceCreatedEventId, "transactionHash", invoiceCreatedEvent.transaction.hash.toHexString());
  assert.fieldEquals("InvoiceCreatedEvent", invoiceCreatedEventId, "timestamp", invoiceCreatedEvent.block.timestamp.toString());
  assert.fieldEquals("InvoiceCreatedEvent", invoiceCreatedEventId, "logIndex", invoiceCreatedEvent.logIndex.toString());

  log.info("✅ should create an InvoiceCreated event", []);

  // Test that invoiceEvents are added to creditor and debtor
  const creditorId = ADDRESS_1.toHexString();
  const debtorId = ADDRESS_2.toHexString();

  assert.fieldEquals("User", creditorId, "invoiceEvents", `[${invoiceCreatedEventId}]`);
  assert.fieldEquals("User", debtorId, "invoiceEvents", `[${invoiceCreatedEventId}]`);

  log.info("✅ should add InvoiceCreated event to creditor and debtor invoiceEvents", []);

  afterEach();
});

test("it handles InvoicePaid events", () => {
  setupContracts();

  const claimId = BigInt.fromI32(1);
  const grossInterestPaid = BigInt.fromI32(1000);
  const principalPaid = BigInt.fromI32(5000);
  const protocolFee = BigInt.fromI32(250);
  const claimAmount = BigInt.fromI32(10000);

  const timestamp = BigInt.fromI32(200);
  const blockNum = BigInt.fromI32(200);

  // Create a corresponding claim first
  const claimCreatedEvent = newClaimCreatedEventV2(claimId.toU32(), CLAIM_TYPE_INVOICE);
  claimCreatedEvent.block.timestamp = BigInt.fromI32(100);
  claimCreatedEvent.block.number = BigInt.fromI32(100);
  handleClaimCreatedV2(claimCreatedEvent);

  const invoicePaidEvent = newInvoicePaidEvent(claimId, grossInterestPaid, principalPaid, protocolFee);
  invoicePaidEvent.block.timestamp = timestamp;
  invoicePaidEvent.block.number = blockNum;

  handleInvoicePaid(invoicePaidEvent);

  const invoicePaidEventId = getInvoicePaidEventId(claimId, invoicePaidEvent);

  // Test InvoicePaidEvent creation
  assert.fieldEquals("InvoicePaidEvent", invoicePaidEventId, "claim", claimId.toString());
  assert.fieldEquals("InvoicePaidEvent", invoicePaidEventId, "grossInterestPaid", grossInterestPaid.toString());
  assert.fieldEquals("InvoicePaidEvent", invoicePaidEventId, "principalPaid", principalPaid.toString());
  assert.fieldEquals("InvoicePaidEvent", invoicePaidEventId, "protocolFee", protocolFee.toString());
  assert.fieldEquals("InvoicePaidEvent", invoicePaidEventId, "eventName", "InvoicePaid");
  assert.fieldEquals("InvoicePaidEvent", invoicePaidEventId, "blockNumber", invoicePaidEvent.block.number.toString());
  assert.fieldEquals("InvoicePaidEvent", invoicePaidEventId, "transactionHash", invoicePaidEvent.transaction.hash.toHexString());
  assert.fieldEquals("InvoicePaidEvent", invoicePaidEventId, "timestamp", invoicePaidEvent.block.timestamp.toString());
  assert.fieldEquals("InvoicePaidEvent", invoicePaidEventId, "logIndex", invoicePaidEvent.logIndex.toString());

  log.info("✅ should create an InvoicePaid event", []);

  // Test claim updates
  const newPaidAmount = principalPaid; // Since this is the first payment
  const expectedStatus = newPaidAmount.ge(claimAmount) ? CLAIM_STATUS_PAID : CLAIM_STATUS_REPAYING;

  assert.fieldEquals("Claim", claimId.toString(), "paidAmount", newPaidAmount.toString());
  assert.fieldEquals("Claim", claimId.toString(), "status", expectedStatus);
  assert.fieldEquals("Claim", claimId.toString(), "lastUpdatedBlockNumber", blockNum.toString());
  assert.fieldEquals("Claim", claimId.toString(), "lastUpdatedTimestamp", timestamp.toString());

  log.info("✅ should update claim with payment details", []);

  // Test that invoiceEvents are added to creditor and debtor
  const creditorId = ADDRESS_1.toHexString();
  const debtorId = ADDRESS_2.toHexString();

  assert.fieldEquals("User", creditorId, "invoiceEvents", `[${invoicePaidEventId}]`);
  assert.fieldEquals("User", debtorId, "invoiceEvents", `[${invoicePaidEventId}]`);

  log.info("✅ should add InvoicePaid event to creditor and debtor invoiceEvents", []);

  afterEach();
});

// exporting for test coverage
export { handleInvoiceCreated, handleInvoicePaid };
