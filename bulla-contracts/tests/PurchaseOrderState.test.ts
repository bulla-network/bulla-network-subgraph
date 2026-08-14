import { BigInt, log } from "@graphprotocol/graph-ts";
import { assert, test } from "matchstick-as/assembly/index";
import { CLAIM_TYPE_INVOICE, CLAIM_TYPE_PAYMENT } from "../src/functions/common";
import { handleClaimCreatedV2, handleClaimPaymentV2 } from "../src/mappings/BullaClaimERC721";
import { handleInvoiceCreated, handlePurchaseOrderDelivered } from "../src/mappings/BullaInvoice";
import { newClaimCreatedEventV2, newClaimPaymentEventV2WithAmount } from "./functions/BullaClaimERC721.testtools";
import { newInvoiceCreatedEvent, newPurchaseOrderDeliveredEvent } from "./functions/BullaInvoice.testtools";
import { ADDRESS_2, afterEach, setupContracts } from "./helpers";

// Claim.purchaseOrderState mirrors the client's getPurchaseOrderStatus:
//
//   deliveryDate == 0                                 -> NOT_A_PURCHASE_ORDER
//   isDelivered                                       -> DELIVERED
//   depositAmount > 0 && paidAmount < depositAmount   -> DEPOSIT_OUTSTANDING
//   otherwise                                         -> DELIVERY_OUTSTANDING
//
// It exists so the explorer can filter on the deposit rule server-side; that
// rule compares two fields of the same entity, which a `where` clause can't do.

const DEPOSIT = BigInt.fromI32(5000);
const DELIVERY_DATE = BigInt.fromI32(1700000000);

// Fires InvoiceCreated with the purchase-order fields under test, leaving the
// rest of the tuple at the testtool defaults.
function createInvoice(claimId: BigInt, deliveryDate: BigInt, depositAmount: BigInt, isDelivered: boolean): void {
  const claimCreatedEvent = newClaimCreatedEventV2(claimId.toU32(), CLAIM_TYPE_INVOICE);
  claimCreatedEvent.block.timestamp = BigInt.fromI32(100);
  claimCreatedEvent.block.number = BigInt.fromI32(100);
  handleClaimCreatedV2(claimCreatedEvent);

  const invoiceCreatedEvent = newInvoiceCreatedEvent(claimId, true, false, deliveryDate, depositAmount, isDelivered);
  invoiceCreatedEvent.block.timestamp = BigInt.fromI32(100);
  invoiceCreatedEvent.block.number = BigInt.fromI32(100);
  handleInvoiceCreated(invoiceCreatedEvent);
}

function payClaim(claimId: BigInt, paymentAmount: BigInt, totalPaidAmount: BigInt, logIndex: i32): void {
  const paymentEvent = newClaimPaymentEventV2WithAmount(claimId, ADDRESS_2, paymentAmount, totalPaidAmount);
  paymentEvent.block.timestamp = BigInt.fromI32(200);
  paymentEvent.block.number = BigInt.fromI32(200);
  paymentEvent.logIndex = BigInt.fromI32(logIndex);
  handleClaimPaymentV2(paymentEvent);
}

function assertState(claimId: BigInt, expected: string): void {
  assert.fieldEquals("Claim", claimId.toString() + "-v2", "purchaseOrderState", expected);
}

test("a claim with no invoice details is NOT_A_PURCHASE_ORDER", () => {
  setupContracts();

  const claimId = BigInt.fromI32(20);
  const claimCreatedEvent = newClaimCreatedEventV2(claimId.toU32(), CLAIM_TYPE_PAYMENT);
  handleClaimCreatedV2(claimCreatedEvent);

  assertState(claimId, "NOT_A_PURCHASE_ORDER");

  log.info("✅ plain claims default to NOT_A_PURCHASE_ORDER", []);

  afterEach();
});

test("an invoice with no delivery date is NOT_A_PURCHASE_ORDER", () => {
  setupContracts();

  const claimId = BigInt.fromI32(21);
  createInvoice(claimId, BigInt.fromI32(0), BigInt.fromI32(0), false);

  assertState(claimId, "NOT_A_PURCHASE_ORDER");

  log.info("✅ a plain invoice is not a purchase order", []);

  afterEach();
});

test("a purchase order with an unpaid deposit is DEPOSIT_OUTSTANDING until the deposit is covered", () => {
  setupContracts();

  const claimId = BigInt.fromI32(22);
  createInvoice(claimId, DELIVERY_DATE, DEPOSIT, false);

  assertState(claimId, "DEPOSIT_OUTSTANDING");

  // Partial deposit — still short.
  payClaim(claimId, BigInt.fromI32(2000), BigInt.fromI32(2000), 0);
  assertState(claimId, "DEPOSIT_OUTSTANDING");

  // Deposit exactly covered.
  payClaim(claimId, BigInt.fromI32(3000), DEPOSIT, 1);
  assertState(claimId, "DELIVERY_OUTSTANDING");

  // A deposit-only payment still moves Claim.status to Repaying — the reason
  // the client can't derive this state from status alone.
  assert.fieldEquals("Claim", claimId.toString() + "-v2", "status", "Repaying");

  handlePurchaseOrderDelivered(newPurchaseOrderDeliveredEvent(claimId));
  assertState(claimId, "DELIVERED");

  log.info("✅ deposit boundary and delivery move the state", []);

  afterEach();
});

test("a purchase order with no deposit is DELIVERY_OUTSTANDING from creation", () => {
  setupContracts();

  const claimId = BigInt.fromI32(23);
  createInvoice(claimId, DELIVERY_DATE, BigInt.fromI32(0), false);

  assertState(claimId, "DELIVERY_OUTSTANDING");

  log.info("✅ a zero deposit is never outstanding", []);

  afterEach();
});

test("delivery wins over an unpaid deposit", () => {
  setupContracts();

  const claimId = BigInt.fromI32(24);
  createInvoice(claimId, DELIVERY_DATE, DEPOSIT, true);

  assertState(claimId, "DELIVERED");

  log.info("✅ isDelivered takes precedence over the deposit rule", []);

  afterEach();
});
