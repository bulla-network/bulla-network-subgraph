import { BigInt, log } from "@graphprotocol/graph-ts";
import { assert, test } from "matchstick-as/assembly/index";
import { CLAIM_TYPE_INVOICE } from "../src/functions/common";
import { handleClaimCreated } from "../src/mappings/BullaClaimERC721";
import { handleInvoiceFunded, handleInvoiceKickbackAmountSent, handleInvoiceUnfactored } from "../src/mappings/BullaFactoring";
import { newClaimCreatedEvent } from "./functions/BullaClaimERC721.testtools";
import { ADDRESS_1, afterEach, setupContracts } from "./helpers";
import { newInvoiceFundedEvent, newInvoiceKickbackAmountSentEvent, newInvoiceUnfactoredEvent } from "./functions/BullaFactoring.testtools";
import { getInvoiceFundedEventId, getInvoiceKickbackAmountSentEventId, getInvoiceUnfactoredEventId } from "../src/functions/BullaFactoring";

test("it handles BullaFactoring events", () => {
  setupContracts();

  const claimId = BigInt.fromI32(1);
  const fundedAmount = BigInt.fromI32(10000);
  const originalCreditor = ADDRESS_1;

  const timestamp = BigInt.fromI32(100);
  const blockNum = BigInt.fromI32(100);

  const invoiceFundedEvent = newInvoiceFundedEvent(claimId, fundedAmount, originalCreditor);
  invoiceFundedEvent.block.timestamp = timestamp;
  invoiceFundedEvent.block.number = blockNum;

  const claimCreatedEvent = newClaimCreatedEvent(claimId.toU32(), CLAIM_TYPE_INVOICE);
  claimCreatedEvent.block.timestamp = timestamp;
  claimCreatedEvent.block.number = blockNum;

  handleClaimCreated(claimCreatedEvent);
  handleInvoiceFunded(invoiceFundedEvent);

  const invoiceFundedEventId = getInvoiceFundedEventId(claimId, invoiceFundedEvent);
  assert.fieldEquals("InvoiceFundedEvent", invoiceFundedEventId, "invoiceId", invoiceFundedEvent.params.invoiceId.toString());
  assert.fieldEquals("InvoiceFundedEvent", invoiceFundedEventId, "fundedAmount", invoiceFundedEvent.params.fundedAmount.toString());
  assert.fieldEquals("InvoiceFundedEvent", invoiceFundedEventId, "originalCreditor", invoiceFundedEvent.params.originalCreditor.toHexString());

  log.info("✅ should create a InvoiceFunded event", []);

  const kickbackAmount = BigInt.fromI32(2000);

  const invoiceKickbackAmountSentEvent = newInvoiceKickbackAmountSentEvent(claimId, kickbackAmount, originalCreditor);
  invoiceKickbackAmountSentEvent.block.timestamp = timestamp;
  invoiceKickbackAmountSentEvent.block.number = blockNum;

  handleInvoiceKickbackAmountSent(invoiceKickbackAmountSentEvent);

  const invoiceKickbackAmountSentEventId = getInvoiceKickbackAmountSentEventId(claimId, invoiceKickbackAmountSentEvent);
  assert.fieldEquals("InvoiceKickbackAmountSentEvent", invoiceKickbackAmountSentEventId, "invoiceId", invoiceKickbackAmountSentEvent.params.invoiceId.toString());
  assert.fieldEquals(
    "InvoiceKickbackAmountSentEvent",
    invoiceKickbackAmountSentEventId,
    "kickbackAmount",
    invoiceKickbackAmountSentEvent.params.kickbackAmount.toString()
  );
  assert.fieldEquals(
    "InvoiceKickbackAmountSentEvent",
    invoiceKickbackAmountSentEventId,
    "originalCreditor",
    invoiceKickbackAmountSentEvent.params.originalCreditor.toHexString()
  );

  log.info("✅ should create a InvoiceKickbackAmountSent event", []);

  const invoiceUnfactoredEvent = newInvoiceUnfactoredEvent(claimId, originalCreditor);
  invoiceUnfactoredEvent.block.timestamp = timestamp;
  invoiceUnfactoredEvent.block.number = blockNum;

  handleInvoiceUnfactored(invoiceUnfactoredEvent);

  const invoiceUnfactoredEventId = getInvoiceUnfactoredEventId(claimId, invoiceUnfactoredEvent);
  assert.fieldEquals("InvoiceUnfactoredEvent", invoiceUnfactoredEventId, "invoiceId", invoiceUnfactoredEvent.params.invoiceId.toString());
  assert.fieldEquals("InvoiceUnfactoredEvent", invoiceUnfactoredEventId, "originalCreditor", invoiceUnfactoredEvent.params.originalCreditor.toHexString());

  log.info("✅ should create a InvoiceUnfactored event", []);

  afterEach();
});

// exporting for test coverage
export { handleInvoiceFunded, handleClaimCreated, handleInvoiceKickbackAmountSent };
