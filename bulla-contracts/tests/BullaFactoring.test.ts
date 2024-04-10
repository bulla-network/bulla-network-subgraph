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
import { ADDRESS_1, ADDRESS_2, ADDRESS_3, IPFS_HASH, afterEach, setupContracts } from "./helpers";
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

  log.info("✅ should create a SharesRedeemedAttachment event", []);

  afterEach();
});

// exporting for test coverage
export { handleInvoiceFunded, handleClaimCreated, handleInvoiceKickbackAmountSent, handleInvoiceUnfactored };
