import { BigInt, log } from "@graphprotocol/graph-ts";
import { assert, test } from "matchstick-as/assembly/index";
import { PurchaseOrderState, User } from "../generated/schema";
import {
  getFeeWithdrawnEventId,
  getInvoiceCreatedEventId,
  getInvoicePaidEventId,
  getPurchaseOrderAcceptedEventId,
  getPurchaseOrderDeliveredEventId,
} from "../src/functions/BullaInvoice";
import { CLAIM_TYPE_INVOICE } from "../src/functions/common";
import { handleClaimCreatedV2 } from "../src/mappings/BullaClaimERC721";
import { handleFeeWithdrawn, handleInvoiceCreated, handleInvoicePaid, handlePurchaseOrderAccepted, handlePurchaseOrderDelivered } from "../src/mappings/BullaInvoice";
import { newClaimCreatedEventV2 } from "./functions/BullaClaimERC721.testtools";
import {
  newFeeWithdrawnEvent,
  newInvoiceCreatedEvent,
  newInvoicePaidEvent,
  newPurchaseOrderAcceptedEvent,
  newPurchaseOrderDeliveredEvent,
} from "./functions/BullaInvoice.testtools";
import { ADDRESS_1, ADDRESS_2, afterEach, setupContracts } from "./helpers";

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
  const fee = BigInt.fromI32(100);
  const tokenURI = "https://example.com/token";
  const attachmentURI = "https://example.com/attachment";

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
    fee,
    tokenURI,
    attachmentURI,
  );
  invoiceCreatedEvent.block.timestamp = timestamp;
  invoiceCreatedEvent.block.number = blockNum;

  handleInvoiceCreated(invoiceCreatedEvent);

  const invoiceCreatedEventId = getInvoiceCreatedEventId(claimId, invoiceCreatedEvent);

  // Test InvoiceCreatedEvent creation
  assert.fieldEquals("InvoiceCreatedEvent", invoiceCreatedEventId, "claim", claimId.toString() + "-v2");
  assert.fieldEquals("InvoiceCreatedEvent", invoiceCreatedEventId, "requestedByCreditor", requestedByCreditor.toString());
  assert.fieldEquals("InvoiceCreatedEvent", invoiceCreatedEventId, "isProtocolFeeExempt", isProtocolFeeExempt.toString());
  assert.fieldEquals("InvoiceCreatedEvent", invoiceCreatedEventId, "deliveryDate", deliveryDate.toString());
  assert.fieldEquals("InvoiceCreatedEvent", invoiceCreatedEventId, "depositAmount", depositAmount.toString());
  assert.fieldEquals("InvoiceCreatedEvent", invoiceCreatedEventId, "isDelivered", isDelivered.toString());
  assert.fieldEquals("InvoiceCreatedEvent", invoiceCreatedEventId, "interestRateBps", interestRateBps.toString());
  assert.fieldEquals("InvoiceCreatedEvent", invoiceCreatedEventId, "accruedInterest", accruedInterest.toString());
  assert.fieldEquals("InvoiceCreatedEvent", invoiceCreatedEventId, "protocolFeeBps", protocolFeeBps.toString());
  assert.fieldEquals("InvoiceCreatedEvent", invoiceCreatedEventId, "totalGrossInterestPaid", totalGrossInterestPaid.toString());
  assert.fieldEquals("InvoiceCreatedEvent", invoiceCreatedEventId, "fee", fee.toString());
  assert.fieldEquals("InvoiceCreatedEvent", invoiceCreatedEventId, "tokenURI", tokenURI);
  assert.fieldEquals("InvoiceCreatedEvent", invoiceCreatedEventId, "attachmentURI", attachmentURI);
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

  // Test PurchaseOrderState creation (should be created since deliveryDate != 0)
  assert.entityCount("PurchaseOrderState", 1);
  assert.fieldEquals("PurchaseOrderState", claimId.toString() + "-v2", "claim", claimId.toString() + "-v2");
  assert.fieldEquals("PurchaseOrderState", claimId.toString() + "-v2", "deliveryDate", deliveryDate.toString());
  assert.fieldEquals("PurchaseOrderState", claimId.toString() + "-v2", "depositAmount", depositAmount.toString());
  assert.fieldEquals("PurchaseOrderState", claimId.toString() + "-v2", "totalDepositPaid", "0");
  assert.fieldEquals("PurchaseOrderState", claimId.toString() + "-v2", "isDelivered", isDelivered.toString());
  assert.fieldEquals("PurchaseOrderState", claimId.toString() + "-v2", "createdAt", timestamp.toString());
  assert.fieldEquals("PurchaseOrderState", claimId.toString() + "-v2", "lastUpdatedAt", timestamp.toString());

  log.info("✅ should create PurchaseOrderState when deliveryDate is set", []);

  afterEach();
});

test("it handles InvoiceCreated events without purchase order", () => {
  setupContracts();

  const claimId = BigInt.fromI32(2);
  const requestedByCreditor = true;
  const isProtocolFeeExempt = false;
  const deliveryDate = BigInt.fromI32(0); // No delivery date = regular invoice
  const depositAmount = BigInt.fromI32(0); // No deposit for regular invoice
  const isDelivered = false;
  const interestRateBps = BigInt.fromI32(1000); // 10%
  const numberOfPeriodsPerYear = BigInt.fromI32(12);
  const accruedInterest = BigInt.fromI32(0);
  const latestPeriodNumber = BigInt.fromI32(0);
  const protocolFeeBps = BigInt.fromI32(500); // 5%
  const totalGrossInterestPaid = BigInt.fromI32(0);
  const fee = BigInt.fromI32(100);
  const tokenURI = "https://example.com/token";
  const attachmentURI = "https://example.com/attachment";

  const timestamp = BigInt.fromI32(200);
  const blockNum = BigInt.fromI32(200);

  // Create a corresponding claim first
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
    fee,
    tokenURI,
    attachmentURI,
  );
  invoiceCreatedEvent.block.timestamp = timestamp;
  invoiceCreatedEvent.block.number = blockNum;

  handleInvoiceCreated(invoiceCreatedEvent);

  const invoiceCreatedEventId = getInvoiceCreatedEventId(claimId, invoiceCreatedEvent);

  // Test InvoiceCreatedEvent creation (should always be created)
  assert.fieldEquals("InvoiceCreatedEvent", invoiceCreatedEventId, "claim", claimId.toString() + "-v2");
  assert.fieldEquals("InvoiceCreatedEvent", invoiceCreatedEventId, "deliveryDate", deliveryDate.toString());
  assert.fieldEquals("InvoiceCreatedEvent", invoiceCreatedEventId, "eventName", "InvoiceCreated");

  log.info("✅ should create an InvoiceCreated event for regular invoice", []);

  // Test PurchaseOrderState NOT created (deliveryDate = 0)
  assert.notInStore("PurchaseOrderState", claimId.toString() + "-v2");

  log.info("✅ should NOT create PurchaseOrderState when deliveryDate is 0", []);

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
  assert.fieldEquals("InvoicePaidEvent", invoicePaidEventId, "claim", claimId.toString() + "-v2");
  assert.fieldEquals("InvoicePaidEvent", invoicePaidEventId, "grossInterestPaid", grossInterestPaid.toString());
  assert.fieldEquals("InvoicePaidEvent", invoicePaidEventId, "principalPaid", principalPaid.toString());
  assert.fieldEquals("InvoicePaidEvent", invoicePaidEventId, "protocolFee", protocolFee.toString());
  assert.fieldEquals("InvoicePaidEvent", invoicePaidEventId, "eventName", "InvoicePaid");
  assert.fieldEquals("InvoicePaidEvent", invoicePaidEventId, "blockNumber", invoicePaidEvent.block.number.toString());
  assert.fieldEquals("InvoicePaidEvent", invoicePaidEventId, "transactionHash", invoicePaidEvent.transaction.hash.toHexString());
  assert.fieldEquals("InvoicePaidEvent", invoicePaidEventId, "timestamp", invoicePaidEvent.block.timestamp.toString());
  assert.fieldEquals("InvoicePaidEvent", invoicePaidEventId, "logIndex", invoicePaidEvent.logIndex.toString());

  log.info("✅ should create an InvoicePaid event", []);

  assert.fieldEquals("Claim", claimId.toString() + "-v2", "lastUpdatedBlockNumber", blockNum.toString());
  assert.fieldEquals("Claim", claimId.toString() + "-v2", "lastUpdatedTimestamp", timestamp.toString());

  log.info("✅ should update claim with payment details", []);

  // Test that invoiceEvents are added to creditor and debtor
  const creditorId = ADDRESS_1.toHexString();
  const debtorId = ADDRESS_2.toHexString();

  assert.fieldEquals("User", creditorId, "invoiceEvents", `[${invoicePaidEventId}]`);
  assert.fieldEquals("User", debtorId, "invoiceEvents", `[${invoicePaidEventId}]`);

  log.info("✅ should add InvoicePaid event to creditor and debtor invoiceEvents", []);

  afterEach();
});

test("it handles PurchaseOrderAccepted with full payment", () => {
  setupContracts();

  const claimId = BigInt.fromI32(10);
  const depositAmountRequired = BigInt.fromI32(5000);
  const fullPayment = BigInt.fromI32(5000);
  const deliveryDate = BigInt.fromI32(1700000000); // Non-zero for purchase order
  const debtor = ADDRESS_2;

  // Create invoice with purchase order first
  const claimCreatedEvent = newClaimCreatedEventV2(claimId.toU32(), CLAIM_TYPE_INVOICE);
  claimCreatedEvent.block.timestamp = BigInt.fromI32(100);
  claimCreatedEvent.block.number = BigInt.fromI32(100);
  handleClaimCreatedV2(claimCreatedEvent);

  const invoiceCreatedEvent = newInvoiceCreatedEvent(
    claimId,
    true, // requestedByCreditor
    false, // isProtocolFeeExempt
    deliveryDate,
    depositAmountRequired,
    false, // isDelivered
    BigInt.fromI32(1000), // interestRateBps
    BigInt.fromI32(12), // numberOfPeriodsPerYear
    BigInt.fromI32(0), // accruedInterest
    BigInt.fromI32(0), // latestPeriodNumber
    BigInt.fromI32(500), // protocolFeeBps
    BigInt.fromI32(0), // totalGrossInterestPaid
    BigInt.fromI32(100), // fee
    "https://example.com/token",
    "https://example.com/attachment",
  );
  invoiceCreatedEvent.block.timestamp = BigInt.fromI32(100);
  invoiceCreatedEvent.block.number = BigInt.fromI32(100);
  handleInvoiceCreated(invoiceCreatedEvent);

  // Now handle PurchaseOrderAccepted with full payment
  const purchaseOrderAcceptedEvent = newPurchaseOrderAcceptedEvent(claimId, debtor, fullPayment, true);
  purchaseOrderAcceptedEvent.block.timestamp = BigInt.fromI32(200);
  purchaseOrderAcceptedEvent.block.number = BigInt.fromI32(200);
  purchaseOrderAcceptedEvent.logIndex = BigInt.fromI32(0); // Unique log index

  handlePurchaseOrderAccepted(purchaseOrderAcceptedEvent);

  // Test PurchaseOrderState updates
  assert.fieldEquals("PurchaseOrderState", claimId.toString() + "-v2", "totalDepositPaid", fullPayment.toString());
  assert.fieldEquals("PurchaseOrderState", claimId.toString() + "-v2", "lastUpdatedAt", "200");

  // Check that depositPayments array contains the single payment
  const purchaseOrderState = PurchaseOrderState.load(claimId.toString() + "-v2");
  assert.assertNotNull(purchaseOrderState, "PurchaseOrderState should exist");
  if (purchaseOrderState) {
    assert.i32Equals(purchaseOrderState.depositPayments.length, 1);
    assert.bigIntEquals(purchaseOrderState.depositPayments[0], fullPayment);
  }

  // Test PurchaseOrderAcceptedEvent creation
  const purchaseOrderAcceptedEventId = getPurchaseOrderAcceptedEventId(claimId, purchaseOrderAcceptedEvent);
  assert.fieldEquals("PurchaseOrderAcceptedEvent", purchaseOrderAcceptedEventId, "claim", claimId.toString() + "-v2");
  assert.fieldEquals("PurchaseOrderAcceptedEvent", purchaseOrderAcceptedEventId, "debtor", debtor.toHexString());
  assert.fieldEquals("PurchaseOrderAcceptedEvent", purchaseOrderAcceptedEventId, "depositAmount", fullPayment.toString());
  assert.fieldEquals("PurchaseOrderAcceptedEvent", purchaseOrderAcceptedEventId, "bound", "true");

  log.info("✅ should handle full deposit payment correctly", []);

  afterEach();
});

test("it handles PurchaseOrderAccepted with partial payments", () => {
  setupContracts();

  const claimId = BigInt.fromI32(11);
  const depositAmountRequired = BigInt.fromI32(10000);
  const firstPayment = BigInt.fromI32(3000);
  const secondPayment = BigInt.fromI32(4000);
  const totalExpected = firstPayment.plus(secondPayment); // 7000
  const deliveryDate = BigInt.fromI32(1700000000); // Non-zero for purchase order
  const debtor = ADDRESS_2;

  // Create invoice with purchase order first
  const claimCreatedEvent = newClaimCreatedEventV2(claimId.toU32(), CLAIM_TYPE_INVOICE);
  claimCreatedEvent.block.timestamp = BigInt.fromI32(100);
  claimCreatedEvent.block.number = BigInt.fromI32(100);
  handleClaimCreatedV2(claimCreatedEvent);

  const invoiceCreatedEvent = newInvoiceCreatedEvent(
    claimId,
    true, // requestedByCreditor
    false, // isProtocolFeeExempt
    deliveryDate,
    depositAmountRequired,
    false, // isDelivered
    BigInt.fromI32(1000), // interestRateBps
    BigInt.fromI32(12), // numberOfPeriodsPerYear
    BigInt.fromI32(0), // accruedInterest
    BigInt.fromI32(0), // latestPeriodNumber
    BigInt.fromI32(500), // protocolFeeBps
    BigInt.fromI32(0), // totalGrossInterestPaid
    BigInt.fromI32(100), // fee
    "https://example.com/token",
    "https://example.com/attachment",
  );
  invoiceCreatedEvent.block.timestamp = BigInt.fromI32(100);
  invoiceCreatedEvent.block.number = BigInt.fromI32(100);
  handleInvoiceCreated(invoiceCreatedEvent);

  // First payment
  const firstPurchaseOrderAcceptedEvent = newPurchaseOrderAcceptedEvent(claimId, debtor, firstPayment, false);
  firstPurchaseOrderAcceptedEvent.block.timestamp = BigInt.fromI32(200);
  firstPurchaseOrderAcceptedEvent.block.number = BigInt.fromI32(200);
  firstPurchaseOrderAcceptedEvent.logIndex = BigInt.fromI32(0); // Unique log index
  handlePurchaseOrderAccepted(firstPurchaseOrderAcceptedEvent);

  // Check state after first payment
  assert.fieldEquals("PurchaseOrderState", claimId.toString() + "-v2", "totalDepositPaid", firstPayment.toString());

  // Second payment
  const secondPurchaseOrderAcceptedEvent = newPurchaseOrderAcceptedEvent(claimId, debtor, secondPayment, true);
  secondPurchaseOrderAcceptedEvent.block.timestamp = BigInt.fromI32(300);
  secondPurchaseOrderAcceptedEvent.block.number = BigInt.fromI32(300);
  secondPurchaseOrderAcceptedEvent.logIndex = BigInt.fromI32(1); // Different log index
  handlePurchaseOrderAccepted(secondPurchaseOrderAcceptedEvent);

  // Check final state after both payments
  assert.fieldEquals("PurchaseOrderState", claimId.toString() + "-v2", "totalDepositPaid", totalExpected.toString());
  assert.fieldEquals("PurchaseOrderState", claimId.toString() + "-v2", "lastUpdatedAt", "300");

  // Check that depositPayments array contains both payments in order
  const purchaseOrderState = PurchaseOrderState.load(claimId.toString() + "-v2");
  assert.assertNotNull(purchaseOrderState, "PurchaseOrderState should exist");
  if (purchaseOrderState) {
    assert.i32Equals(purchaseOrderState.depositPayments.length, 2);
    assert.bigIntEquals(purchaseOrderState.depositPayments[0], firstPayment);
    assert.bigIntEquals(purchaseOrderState.depositPayments[1], secondPayment);
  }

  // Check that both events were created
  const firstEventId = getPurchaseOrderAcceptedEventId(claimId, firstPurchaseOrderAcceptedEvent);
  const secondEventId = getPurchaseOrderAcceptedEventId(claimId, secondPurchaseOrderAcceptedEvent);

  assert.fieldEquals("PurchaseOrderAcceptedEvent", firstEventId, "depositAmount", firstPayment.toString());
  assert.fieldEquals("PurchaseOrderAcceptedEvent", firstEventId, "bound", "false");
  assert.fieldEquals("PurchaseOrderAcceptedEvent", secondEventId, "depositAmount", secondPayment.toString());
  assert.fieldEquals("PurchaseOrderAcceptedEvent", secondEventId, "bound", "true");

  log.info("✅ should handle partial deposit payments correctly", []);

  afterEach();
});

test("it handles PurchaseOrderDelivered for existing purchase order", () => {
  setupContracts();

  const claimId = BigInt.fromI32(12);
  const deliveryDate = BigInt.fromI32(1700000000); // Non-zero for purchase order
  const depositAmount = BigInt.fromI32(5000);

  // Create invoice with purchase order first
  const claimCreatedEvent = newClaimCreatedEventV2(claimId.toU32(), CLAIM_TYPE_INVOICE);
  claimCreatedEvent.block.timestamp = BigInt.fromI32(100);
  claimCreatedEvent.block.number = BigInt.fromI32(100);
  handleClaimCreatedV2(claimCreatedEvent);

  const invoiceCreatedEvent = newInvoiceCreatedEvent(
    claimId,
    true, // requestedByCreditor
    false, // isProtocolFeeExempt
    deliveryDate,
    depositAmount,
    false, // isDelivered
    BigInt.fromI32(1000), // interestRateBps
    BigInt.fromI32(12), // numberOfPeriodsPerYear
    BigInt.fromI32(0), // accruedInterest
    BigInt.fromI32(0), // latestPeriodNumber
    BigInt.fromI32(500), // protocolFeeBps
    BigInt.fromI32(0), // totalGrossInterestPaid
    BigInt.fromI32(100), // fee
    "https://example.com/token",
    "https://example.com/attachment",
  );
  invoiceCreatedEvent.block.timestamp = BigInt.fromI32(100);
  invoiceCreatedEvent.block.number = BigInt.fromI32(100);
  handleInvoiceCreated(invoiceCreatedEvent);

  // Now handle PurchaseOrderDelivered
  const purchaseOrderDeliveredEvent = newPurchaseOrderDeliveredEvent(claimId);
  purchaseOrderDeliveredEvent.block.timestamp = BigInt.fromI32(200);
  purchaseOrderDeliveredEvent.block.number = BigInt.fromI32(200);
  purchaseOrderDeliveredEvent.logIndex = BigInt.fromI32(0);

  handlePurchaseOrderDelivered(purchaseOrderDeliveredEvent);

  // Test PurchaseOrderState updates
  assert.fieldEquals("PurchaseOrderState", claimId.toString(), "isDelivered", "true");
  assert.fieldEquals("PurchaseOrderState", claimId.toString(), "lastUpdatedAt", "200");

  // Test PurchaseOrderDeliveredEvent creation
  const purchaseOrderDeliveredEventId = getPurchaseOrderDeliveredEventId(claimId, purchaseOrderDeliveredEvent);
  assert.fieldEquals("PurchaseOrderDeliveredEvent", purchaseOrderDeliveredEventId, "claim", claimId.toString() + "-v2");
  assert.fieldEquals("PurchaseOrderDeliveredEvent", purchaseOrderDeliveredEventId, "eventName", "PurchaseOrderDelivered");
  assert.fieldEquals("PurchaseOrderDeliveredEvent", purchaseOrderDeliveredEventId, "blockNumber", "200");
  assert.fieldEquals("PurchaseOrderDeliveredEvent", purchaseOrderDeliveredEventId, "timestamp", "200");

  // Test that the event was added to creditor and debtor's invoiceEvents
  const creditorId = ADDRESS_1.toHexString();
  const debtorId = ADDRESS_2.toHexString();

  const invoiceCreatedEventId = getInvoiceCreatedEventId(claimId, invoiceCreatedEvent);

  // Check that the PurchaseOrderDelivered event exists
  assert.entityCount("PurchaseOrderDeliveredEvent", 1);
  assert.fieldEquals("PurchaseOrderDeliveredEvent", purchaseOrderDeliveredEventId, "claim", claimId.toString() + "-v2");

  // Check that both users have the PurchaseOrderDelivered event in their invoiceEvents arrays
  const creditorUser = User.load(creditorId);
  const debtorUser = User.load(debtorId);

  assert.assertNotNull(creditorUser, "Creditor user should exist");
  assert.assertNotNull(debtorUser, "Debtor user should exist");

  if (creditorUser && debtorUser) {
    assert.i32Equals(creditorUser.invoiceEvents.length, 2);
    assert.stringEquals(creditorUser.invoiceEvents[0], invoiceCreatedEventId);
    assert.stringEquals(creditorUser.invoiceEvents[1], purchaseOrderDeliveredEventId);

    assert.i32Equals(debtorUser.invoiceEvents.length, 2);
    assert.stringEquals(debtorUser.invoiceEvents[0], invoiceCreatedEventId);
    assert.stringEquals(debtorUser.invoiceEvents[1], purchaseOrderDeliveredEventId);
  }

  log.info("✅ should handle purchase order delivery correctly", []);

  afterEach();
});

test("it handles FeeWithdrawn events", () => {
  setupContracts();

  const admin = ADDRESS_1;
  const token = ADDRESS_2;
  const amount = BigInt.fromI32(1000);

  const feeWithdrawnEvent = newFeeWithdrawnEvent(admin, token, amount);
  feeWithdrawnEvent.block.timestamp = BigInt.fromI32(100);
  feeWithdrawnEvent.block.number = BigInt.fromI32(100);
  feeWithdrawnEvent.logIndex = BigInt.fromI32(0);

  handleFeeWithdrawn(feeWithdrawnEvent);

  const eventId = getFeeWithdrawnEventId(feeWithdrawnEvent);

  // Test FeeWithdrawnEvent creation
  assert.entityCount("FeeWithdrawnEvent", 1);
  assert.fieldEquals("FeeWithdrawnEvent", eventId, "admin", admin.toHexString());
  assert.fieldEquals("FeeWithdrawnEvent", eventId, "token", token.toHexString().toLowerCase());
  assert.fieldEquals("FeeWithdrawnEvent", eventId, "amount", amount.toString());
  assert.fieldEquals("FeeWithdrawnEvent", eventId, "eventName", "FeeWithdrawn");
  assert.fieldEquals("FeeWithdrawnEvent", eventId, "blockNumber", "100");
  assert.fieldEquals("FeeWithdrawnEvent", eventId, "timestamp", "100");

  // Test that the event was added to admin's invoiceEvents
  const adminUser = User.load(admin.toHexString());
  assert.assertNotNull(adminUser);
  if (adminUser) {
    assert.i32Equals(1, adminUser.invoiceEvents.length);
    assert.stringEquals(adminUser.invoiceEvents[0], eventId);
  }

  log.info("✅ should handle fee withdrawal correctly", []);

  afterEach();
});

// exporting for test coverage
export { handleFeeWithdrawn, handleInvoiceCreated, handleInvoicePaid, handlePurchaseOrderAccepted, handlePurchaseOrderDelivered };
