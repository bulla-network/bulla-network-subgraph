import { BigInt, log } from "@graphprotocol/graph-ts";
import { assert, test } from "matchstick-as/assembly/index";
import { CLAIM_TYPE_INVOICE } from "../src/functions/common";
import { handleClaimCreated } from "../src/mappings/BullaClaimERC721";
import {
  handleDepositMade,
  handleDepositMadeWithAttachment,
  handleInvoiceFunded,
  handleInvoiceKickbackAmountSent,
  handleInvoiceUnfactored,
  handleSharesRedeemed,
  handleSharesRedeemedWithAttachment
} from "../src/mappings/BullaFactoring";
import { newClaimCreatedEvent } from "./functions/BullaClaimERC721.testtools";
import { ADDRESS_1, ADDRESS_2, ADDRESS_3, IPFS_HASH, MOCK_BULLA_FACTORING_ADDRESS, afterEach, setupContracts, updatePricePerShareMock } from "./helpers";
import {
  newDepositMadeEvent,
  newDepositMadeWithAttachmentEvent,
  newInvoiceFundedEvent,
  newInvoiceKickbackAmountSentEvent,
  newInvoiceUnfactoredEvent,
  newSharesRedeemedEvent,
  newSharesRedeemedWithAttachmentEvent
} from "./functions/BullaFactoring.testtools";
import {
  getDepositMadeEventId,
  getDepositMadeWithAttachmentEventId,
  getInvoiceFundedEventId,
  getInvoiceKickbackAmountSentEventId,
  getInvoiceUnfactoredEventId,
  getSharesRedeemedEventId,
  getSharesRedeemedWithAttachmentEventId
} from "../src/functions/BullaFactoring";
import { FactoringPricePerShare, PriceHistoryEntry } from "../generated/schema";

test("it handles BullaFactoring events", () => {
  setupContracts();

  const claimId = BigInt.fromI32(1);
  const fundedAmount = BigInt.fromI32(10000);
  const originalCreditor = ADDRESS_1;

  const timestamp = BigInt.fromI32(100);
  const blockNum = BigInt.fromI32(100);

  const claimCreatedEvent = newClaimCreatedEvent(claimId.toU32(), CLAIM_TYPE_INVOICE);
  claimCreatedEvent.block.timestamp = timestamp;
  claimCreatedEvent.block.number = blockNum;

  handleClaimCreated(claimCreatedEvent);

  const invoiceFundedEvent = newInvoiceFundedEvent(claimId, fundedAmount, originalCreditor);
  invoiceFundedEvent.block.timestamp = timestamp;
  invoiceFundedEvent.block.number = blockNum;

  handleInvoiceFunded(invoiceFundedEvent);

  const invoiceFundedEventId = getInvoiceFundedEventId(claimId, invoiceFundedEvent);
  assert.fieldEquals("InvoiceFundedEvent", invoiceFundedEventId, "invoiceId", invoiceFundedEvent.params.invoiceId.toString());
  assert.fieldEquals("InvoiceFundedEvent", invoiceFundedEventId, "fundedAmount", invoiceFundedEvent.params.fundedAmount.toString());
  assert.fieldEquals("InvoiceFundedEvent", invoiceFundedEventId, "originalCreditor", invoiceFundedEvent.params.originalCreditor.toHexString());
  assert.fieldEquals("InvoiceFundedEvent", invoiceFundedEventId, "poolAddress", MOCK_BULLA_FACTORING_ADDRESS.toHexString());
  assert.fieldEquals("InvoiceFundedEvent", invoiceFundedEventId, "claim", claimId.toString());

  log.info("✅ should create a InvoiceFunded event with correct claim ID", []);

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
  assert.fieldEquals("InvoiceKickbackAmountSentEvent", invoiceKickbackAmountSentEventId, "poolAddress", MOCK_BULLA_FACTORING_ADDRESS.toHexString());
  assert.fieldEquals("InvoiceKickbackAmountSentEvent", invoiceKickbackAmountSentEventId, "claim", claimId.toString());

  log.info("✅ should create a InvoiceKickbackAmountSent event with correct claim ID", []);

  const totalRefundAmount = BigInt.fromI32(9000);
  const interestToCharge = BigInt.fromI32(100);

  const invoiceUnfactoredEvent = newInvoiceUnfactoredEvent(claimId, originalCreditor, totalRefundAmount, interestToCharge);
  invoiceUnfactoredEvent.block.timestamp = timestamp;
  invoiceUnfactoredEvent.block.number = blockNum;

  handleInvoiceUnfactored(invoiceUnfactoredEvent);

  const invoiceUnfactoredEventId = getInvoiceUnfactoredEventId(claimId, invoiceUnfactoredEvent);
  assert.fieldEquals("InvoiceUnfactoredEvent", invoiceUnfactoredEventId, "invoiceId", invoiceUnfactoredEvent.params.invoiceId.toString());
  assert.fieldEquals("InvoiceUnfactoredEvent", invoiceUnfactoredEventId, "originalCreditor", invoiceUnfactoredEvent.params.originalCreditor.toHexString());
  assert.fieldEquals("InvoiceUnfactoredEvent", invoiceUnfactoredEventId, "totalRefundAmount", invoiceUnfactoredEvent.params.totalRefundAmount.toString());
  assert.fieldEquals("InvoiceUnfactoredEvent", invoiceUnfactoredEventId, "interestToCharge", invoiceUnfactoredEvent.params.interestToCharge.toString());
  assert.fieldEquals("InvoiceUnfactoredEvent", invoiceUnfactoredEventId, "poolAddress", MOCK_BULLA_FACTORING_ADDRESS.toHexString());
  assert.fieldEquals("InvoiceUnfactoredEvent", invoiceUnfactoredEventId, "claim", claimId.toString());

  log.info("✅ should create a InvoiceUnfactored event with correct claim ID", []);

  const depositor = ADDRESS_2;
  const assets = BigInt.fromI32(10000);
  const shares = BigInt.fromI32(10000);

  const depositMadeEvent = newDepositMadeEvent(depositor, assets, shares);
  depositMadeEvent.block.timestamp = timestamp;
  depositMadeEvent.block.number = blockNum;

  handleDepositMade(depositMadeEvent);

  const depositMadeEventId = getDepositMadeEventId(depositMadeEvent);
  assert.fieldEquals("DepositMadeEvent", depositMadeEventId, "depositor", depositMadeEvent.params.depositor.toHexString());
  assert.fieldEquals("DepositMadeEvent", depositMadeEventId, "assets", depositMadeEvent.params.assets.toString());
  assert.fieldEquals("DepositMadeEvent", depositMadeEventId, "sharesIssued", depositMadeEvent.params.sharesIssued.toString());
  assert.fieldEquals("DepositMadeEvent", depositMadeEventId, "poolAddress", MOCK_BULLA_FACTORING_ADDRESS.toHexString());

  log.info("✅ should create a DepositMade event", []);

  const depositMadeWithAttachmentEvent = newDepositMadeWithAttachmentEvent(depositor, assets, shares);
  depositMadeEvent.block.timestamp = timestamp;
  depositMadeEvent.block.number = blockNum;

  handleDepositMadeWithAttachment(depositMadeWithAttachmentEvent);

  const depositMadeWithAttachmentEventId = getDepositMadeWithAttachmentEventId(depositMadeWithAttachmentEvent);
  assert.fieldEquals("DepositMadeWithAttachmentEvent", depositMadeWithAttachmentEventId, "depositor", depositMadeWithAttachmentEvent.params.depositor.toHexString());
  assert.fieldEquals("DepositMadeWithAttachmentEvent", depositMadeWithAttachmentEventId, "assets", depositMadeWithAttachmentEvent.params.assets.toString());
  assert.fieldEquals("DepositMadeWithAttachmentEvent", depositMadeWithAttachmentEventId, "sharesIssued", depositMadeWithAttachmentEvent.params.shares.toString());
  assert.fieldEquals("DepositMadeWithAttachmentEvent", depositMadeWithAttachmentEventId, "ipfsHash", IPFS_HASH);
  assert.fieldEquals("DepositMadeWithAttachmentEvent", depositMadeWithAttachmentEventId, "poolAddress", MOCK_BULLA_FACTORING_ADDRESS.toHexString());

  log.info("✅ should create a DepositMadeWithAttachment event", []);

  const redeemer = ADDRESS_3;

  const sharesRedeemedEvent = newSharesRedeemedEvent(redeemer, shares, assets);
  sharesRedeemedEvent.block.timestamp = timestamp;
  sharesRedeemedEvent.block.number = blockNum;

  handleSharesRedeemed(sharesRedeemedEvent);

  const sharesRedeemedEventId = getSharesRedeemedEventId(sharesRedeemedEvent);
  assert.fieldEquals("SharesRedeemedEvent", sharesRedeemedEventId, "redeemer", sharesRedeemedEvent.params.redeemer.toHexString());
  assert.fieldEquals("SharesRedeemedEvent", sharesRedeemedEventId, "shares", sharesRedeemedEvent.params.shares.toString());
  assert.fieldEquals("SharesRedeemedEvent", sharesRedeemedEventId, "assets", sharesRedeemedEvent.params.assets.toString());
  assert.fieldEquals("SharesRedeemedEvent", sharesRedeemedEventId, "poolAddress", MOCK_BULLA_FACTORING_ADDRESS.toHexString());

  log.info("✅ should create a SharesRedeemed event", []);

  const sharesRedeemedWithAttachmentEvent = newSharesRedeemedWithAttachmentEvent(redeemer, shares, assets);
  sharesRedeemedWithAttachmentEvent.block.timestamp = timestamp;
  sharesRedeemedWithAttachmentEvent.block.number = blockNum;

  handleSharesRedeemedWithAttachment(sharesRedeemedWithAttachmentEvent);

  const sharesRedeemedWithAttachmentEventId = getSharesRedeemedWithAttachmentEventId(sharesRedeemedWithAttachmentEvent);
  assert.fieldEquals(
    "SharesRedeemedWithAttachmentEvent",
    sharesRedeemedWithAttachmentEventId,
    "redeemer",
    sharesRedeemedWithAttachmentEvent.params.redeemer.toHexString()
  );
  assert.fieldEquals("SharesRedeemedWithAttachmentEvent", sharesRedeemedWithAttachmentEventId, "shares", sharesRedeemedWithAttachmentEvent.params.shares.toString());
  assert.fieldEquals("SharesRedeemedWithAttachmentEvent", sharesRedeemedWithAttachmentEventId, "assets", sharesRedeemedWithAttachmentEvent.params.assets.toString());
  assert.fieldEquals("SharesRedeemedWithAttachmentEvent", sharesRedeemedWithAttachmentEventId, "ipfsHash", IPFS_HASH);
  assert.fieldEquals("SharesRedeemedWithAttachmentEvent", sharesRedeemedWithAttachmentEventId, "poolAddress", MOCK_BULLA_FACTORING_ADDRESS.toHexString());

  log.info("✅ should create a SharesRedeemedAttachment event", []);

  afterEach();
});

test("it handles BullaFactoring events and stores price history", () => {
  setupContracts();

  const claimId1 = BigInt.fromI32(1);
  const claimId2 = BigInt.fromI32(2);
  const fundedAmount = BigInt.fromI32(10000);
  const originalCreditor = ADDRESS_1;

  const timestamp = BigInt.fromI32(100);
  const blockNum = BigInt.fromI32(100);

  // Create the first claim
  const claimCreatedEvent1 = newClaimCreatedEvent(claimId1.toU32(), CLAIM_TYPE_INVOICE);
  claimCreatedEvent1.block.timestamp = timestamp;
  claimCreatedEvent1.block.number = blockNum;
  handleClaimCreated(claimCreatedEvent1);

  // Create the second claim
  const claimCreatedEvent2 = newClaimCreatedEvent(claimId2.toU32(), CLAIM_TYPE_INVOICE);
  claimCreatedEvent2.block.timestamp = timestamp;
  claimCreatedEvent2.block.number = blockNum;
  handleClaimCreated(claimCreatedEvent2);

  // First InvoiceFunded event
  const invoiceFundedEvent1 = newInvoiceFundedEvent(claimId1, fundedAmount, originalCreditor);
  invoiceFundedEvent1.block.timestamp = timestamp;
  invoiceFundedEvent1.block.number = blockNum;

  handleInvoiceFunded(invoiceFundedEvent1);

  let factoringPrice = FactoringPricePerShare.load(MOCK_BULLA_FACTORING_ADDRESS.toHexString());

  assert.assertNotNull(factoringPrice);
  assert.i32Equals(1, factoringPrice!.priceHistory.length);

  const historyEntryId = factoringPrice!.priceHistory[0];
  const priceHistoryEntry = PriceHistoryEntry.load(historyEntryId);
  assert.assertNotNull(priceHistoryEntry);
  assert.bigIntEquals(BigInt.fromI32(1000000), priceHistoryEntry!.price);

  // Update the mock to return a new price
  updatePricePerShareMock(BigInt.fromI32(1100000));

  const invoiceFundedEvent2 = newInvoiceFundedEvent(claimId2, fundedAmount, originalCreditor);

  handleInvoiceFunded(invoiceFundedEvent2);

  factoringPrice = FactoringPricePerShare.load(MOCK_BULLA_FACTORING_ADDRESS.toHexString());

  assert.assertNotNull(factoringPrice);
  assert.i32Equals(2, factoringPrice!.priceHistory.length);

  const newHistoryEntryId = factoringPrice!.priceHistory[1];
  const newPriceHistoryEntry = PriceHistoryEntry.load(newHistoryEntryId);
  assert.assertNotNull(newPriceHistoryEntry);
  assert.bigIntEquals(BigInt.fromI32(1100000), newPriceHistoryEntry!.price);
});

// exporting for test coverage
export { handleInvoiceFunded, handleClaimCreated, handleInvoiceKickbackAmountSent, handleInvoiceUnfactored };
