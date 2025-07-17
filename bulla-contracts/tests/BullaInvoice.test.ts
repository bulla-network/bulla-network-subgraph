import { BigInt, log } from "@graphprotocol/graph-ts";
import { assert, test } from "matchstick-as/assembly/index";
import { CLAIM_TYPE_INVOICE } from "../src/functions/common";
import { getInvoiceCreatedEventId } from "../src/functions/BullaInvoice";
import { handleInvoiceCreated } from "../src/mappings/BullaInvoice";
import { newClaimCreatedEventV2 } from "./functions/BullaClaimERC721.testtools";
import { newInvoiceCreatedEvent } from "./functions/BullaInvoice.testtools";
import { afterEach, setupContracts } from "./helpers";
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

  afterEach();
});

// exporting for test coverage
export { handleInvoiceCreated };
