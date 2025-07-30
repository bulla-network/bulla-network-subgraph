import { BigInt, log } from "@graphprotocol/graph-ts";
import { assert, test } from "matchstick-as/assembly/index";
import { FactoringPricePerShare, FactoringStatisticsEntry, HistoricalFactoringStatistics, PnlHistoryEntry, PoolPnl, PriceHistoryEntry } from "../generated/schema";
import {
  getDepositMadeEventId,
  getInvoiceFundedEventId,
  getInvoiceImpairedEventId,
  getInvoiceKickbackAmountSentEventId,
  getInvoiceReconciledEventId,
  getInvoiceUnfactoredEventId,
  getSharesRedeemedEventId,
} from "../src/functions/BullaFactoring";
import { CLAIM_TYPE_INVOICE } from "../src/functions/common";
import { handleClaimCreatedV1, handleClaimCreatedV2 } from "../src/mappings/BullaClaimERC721";
import {
  handleDepositV2,
  handleDepositV3,
  handleInvoiceFundedV2,
  handleInvoiceFundedV3,
  handleInvoiceImpairedV2,
  handleInvoiceImpairedV3,
  handleInvoiceKickbackAmountSentV2,
  handleInvoiceKickbackAmountSentV3,
  handleInvoicePaidV2,
  handleInvoicePaidV3,
  handleInvoiceUnfactoredV1,
  handleInvoiceUnfactoredV2,
  handleInvoiceUnfactoredV3,
  handleWithdrawV2,
  handleWithdrawV3,
} from "../src/mappings/BullaFactoring";
import { newClaimCreatedEventV1, newClaimCreatedEventV2 } from "./functions/BullaClaimERC721.testtools";
import {
  newDepositMadeEvent,
  newInvoiceFundedEventV2,
  newInvoiceFundedEventV3,
  newInvoiceImpairedEvent,
  newInvoiceKickbackAmountSentEvent,
  newInvoicePaidEventV2,
  newInvoicePaidEventV3,
  newInvoiceUnfactoredEventV1,
  newInvoiceUnfactoredEventV2,
  newInvoiceUnfactoredEventV3,
  newSharesRedeemedEvent,
} from "./functions/BullaFactoring.testtools";
import { ADDRESS_1, ADDRESS_2, ADDRESS_3, MOCK_BULLA_FACTORING_ADDRESS, afterEach, setupContracts, updateFundInfoMock, updatePricePerShareMock } from "./helpers";

test("it handles BullaFactoring v2 events and stores historical factoring statistics", () => {
  setupContracts();

  const claimId1 = BigInt.fromI32(1);
  const claimId2 = BigInt.fromI32(2);
  const fundedAmount = BigInt.fromI32(10000);
  const originalCreditor = ADDRESS_1;

  const timestamp = BigInt.fromI32(100);
  const blockNum = BigInt.fromI32(100);

  // Create the first claim
  const claimCreatedEvent1 = newClaimCreatedEventV1(claimId1.toU32(), CLAIM_TYPE_INVOICE);
  claimCreatedEvent1.block.timestamp = timestamp;
  claimCreatedEvent1.block.number = blockNum;
  handleClaimCreatedV1(claimCreatedEvent1);

  // Create the second claim
  const claimCreatedEvent2 = newClaimCreatedEventV1(claimId2.toU32(), CLAIM_TYPE_INVOICE);
  claimCreatedEvent2.block.timestamp = timestamp;
  claimCreatedEvent2.block.number = blockNum;
  handleClaimCreatedV1(claimCreatedEvent2);

  // First InvoiceFunded event
  const invoiceFundedEvent1 = newInvoiceFundedEventV2(claimId1, fundedAmount, originalCreditor);
  invoiceFundedEvent1.block.timestamp = timestamp;
  invoiceFundedEvent1.block.number = blockNum;

  handleInvoiceFundedV2(invoiceFundedEvent1);

  let historicalFactoringStats = HistoricalFactoringStatistics.load(MOCK_BULLA_FACTORING_ADDRESS.toHexString());
  assert.assertNotNull(historicalFactoringStats);

  const statisticsEntryId = historicalFactoringStats!.statistics[0];
  const factoringStatisticsEntry = FactoringStatisticsEntry.load(statisticsEntryId);
  assert.assertNotNull(factoringStatisticsEntry);
  assert.bigIntEquals(BigInt.fromI32(10000), factoringStatisticsEntry!.fundBalance);
  assert.bigIntEquals(BigInt.fromI32(5000), factoringStatisticsEntry!.deployedCapital);
  assert.bigIntEquals(BigInt.fromI32(15000), factoringStatisticsEntry!.capitalAccount);

  // Update the mock to return new fund info
  updateFundInfoMock(BigInt.fromI32(15000), BigInt.fromI32(7500), BigInt.fromI32(22500));

  const invoiceFundedEvent2 = newInvoiceFundedEventV2(claimId2, fundedAmount, originalCreditor);
  invoiceFundedEvent2.block.timestamp = timestamp.plus(BigInt.fromI32(1));
  invoiceFundedEvent2.block.number = blockNum.plus(BigInt.fromI32(1));

  handleInvoiceFundedV2(invoiceFundedEvent2);

  historicalFactoringStats = HistoricalFactoringStatistics.load(MOCK_BULLA_FACTORING_ADDRESS.toHexString());

  assert.assertNotNull(historicalFactoringStats);
  assert.i32Equals(2, historicalFactoringStats!.statistics.length);

  const newStatisticsEntryId = historicalFactoringStats!.statistics[1];
  const newFactoringStatisticsEntry = FactoringStatisticsEntry.load(newStatisticsEntryId);
  assert.assertNotNull(newFactoringStatisticsEntry);
  assert.bigIntEquals(BigInt.fromI32(15000), newFactoringStatisticsEntry!.fundBalance);
  assert.bigIntEquals(BigInt.fromI32(7500), newFactoringStatisticsEntry!.deployedCapital);
  assert.bigIntEquals(BigInt.fromI32(22500), newFactoringStatisticsEntry!.capitalAccount);
});

test("it handles BullaFactoring v2 events", () => {
  setupContracts();

  const claimId = BigInt.fromI32(1);
  const fundedAmount = BigInt.fromI32(10000);
  const originalCreditor = ADDRESS_1;

  const timestamp = BigInt.fromI32(100);
  const blockNum = BigInt.fromI32(100);

  const claimCreatedEvent = newClaimCreatedEventV1(claimId.toU32(), CLAIM_TYPE_INVOICE);
  claimCreatedEvent.block.timestamp = timestamp;
  claimCreatedEvent.block.number = blockNum;

  handleClaimCreatedV1(claimCreatedEvent);

  const invoiceFundedEvent = newInvoiceFundedEventV2(claimId, fundedAmount, originalCreditor);
  invoiceFundedEvent.block.timestamp = timestamp;
  invoiceFundedEvent.block.number = blockNum;

  handleInvoiceFundedV2(invoiceFundedEvent);

  const invoiceFundedEventId = getInvoiceFundedEventId(claimId, invoiceFundedEvent);
  assert.fieldEquals("InvoiceFundedEvent", invoiceFundedEventId, "invoiceId", invoiceFundedEvent.params.invoiceId.toString());
  assert.fieldEquals("InvoiceFundedEvent", invoiceFundedEventId, "fundedAmount", invoiceFundedEvent.params.fundedAmount.toString());
  assert.fieldEquals("InvoiceFundedEvent", invoiceFundedEventId, "upfrontBps", "10000");
  assert.fieldEquals("InvoiceFundedEvent", invoiceFundedEventId, "originalCreditor", invoiceFundedEvent.params.originalCreditor.toHexString());
  assert.fieldEquals("InvoiceFundedEvent", invoiceFundedEventId, "poolAddress", MOCK_BULLA_FACTORING_ADDRESS.toHexString());
  assert.fieldEquals("InvoiceFundedEvent", invoiceFundedEventId, "claim", claimId.toString() + "-v1");

  log.info("✅ should create a InvoiceFunded event with correct claim ID", []);

  const kickbackAmount = BigInt.fromI32(2000);

  const invoiceKickbackAmountSentEvent = newInvoiceKickbackAmountSentEvent(claimId, kickbackAmount, originalCreditor);
  invoiceKickbackAmountSentEvent.block.timestamp = timestamp;
  invoiceKickbackAmountSentEvent.block.number = blockNum;

  handleInvoiceKickbackAmountSentV2(invoiceKickbackAmountSentEvent);

  const invoiceKickbackAmountSentEventId = getInvoiceKickbackAmountSentEventId(claimId, invoiceKickbackAmountSentEvent);
  assert.fieldEquals("InvoiceKickbackAmountSentEvent", invoiceKickbackAmountSentEventId, "invoiceId", invoiceKickbackAmountSentEvent.params.invoiceId.toString());
  assert.fieldEquals(
    "InvoiceKickbackAmountSentEvent",
    invoiceKickbackAmountSentEventId,
    "kickbackAmount",
    invoiceKickbackAmountSentEvent.params.kickbackAmount.toString(),
  );
  assert.fieldEquals(
    "InvoiceKickbackAmountSentEvent",
    invoiceKickbackAmountSentEventId,
    "originalCreditor",
    invoiceKickbackAmountSentEvent.params.originalCreditor.toHexString(),
  );
  assert.fieldEquals("InvoiceKickbackAmountSentEvent", invoiceKickbackAmountSentEventId, "poolAddress", MOCK_BULLA_FACTORING_ADDRESS.toHexString());
  assert.fieldEquals("InvoiceKickbackAmountSentEvent", invoiceKickbackAmountSentEventId, "claim", claimId.toString() + "-v1");

  log.info("✅ should create a InvoiceKickbackAmountSent event with correct claim ID", []);

  const totalRefundAmount = BigInt.fromI32(9000);
  const interestToCharge = BigInt.fromI32(100);

  const invoiceUnfactoredEvent = newInvoiceUnfactoredEventV2(claimId, originalCreditor, totalRefundAmount, interestToCharge);
  invoiceUnfactoredEvent.block.timestamp = timestamp;
  invoiceUnfactoredEvent.block.number = blockNum;

  handleInvoiceUnfactoredV2(invoiceUnfactoredEvent);

  const invoiceUnfactoredEventId = getInvoiceUnfactoredEventId(claimId, invoiceUnfactoredEvent);
  assert.fieldEquals("InvoiceUnfactoredEvent", invoiceUnfactoredEventId, "invoiceId", invoiceUnfactoredEvent.params.invoiceId.toString());
  assert.fieldEquals("InvoiceUnfactoredEvent", invoiceUnfactoredEventId, "originalCreditor", invoiceUnfactoredEvent.params.originalCreditor.toHexString());
  assert.fieldEquals("InvoiceUnfactoredEvent", invoiceUnfactoredEventId, "totalRefundAmount", invoiceUnfactoredEvent.params.totalRefundOrPaymentAmount.toString());
  assert.fieldEquals("InvoiceUnfactoredEvent", invoiceUnfactoredEventId, "interestToCharge", invoiceUnfactoredEvent.params.interestToCharge.toString());
  assert.fieldEquals("InvoiceUnfactoredEvent", invoiceUnfactoredEventId, "poolAddress", MOCK_BULLA_FACTORING_ADDRESS.toHexString());
  assert.fieldEquals("InvoiceUnfactoredEvent", invoiceUnfactoredEventId, "claim", claimId.toString() + "-v1");

  log.info("✅ should create a InvoiceUnfactored event with correct claim ID", []);

  const invoiceUnfactoredEventV1 = newInvoiceUnfactoredEventV1(claimId, originalCreditor, totalRefundAmount, interestToCharge);
  invoiceUnfactoredEventV1.block.timestamp = timestamp;
  invoiceUnfactoredEventV1.block.number = blockNum;

  handleInvoiceUnfactoredV1(invoiceUnfactoredEventV1);
  const invoiceUnfactoredEventV1Id = getInvoiceUnfactoredEventId(claimId, invoiceUnfactoredEventV1);
  assert.fieldEquals("InvoiceUnfactoredEvent", invoiceUnfactoredEventV1Id, "invoiceId", invoiceUnfactoredEventV1.params.invoiceId.toString());
  assert.fieldEquals("InvoiceUnfactoredEvent", invoiceUnfactoredEventV1Id, "originalCreditor", invoiceUnfactoredEventV1.params.originalCreditor.toHexString());
  assert.fieldEquals("InvoiceUnfactoredEvent", invoiceUnfactoredEventV1Id, "totalRefundAmount", invoiceUnfactoredEventV1.params.totalRefundAmount.toString());
  assert.fieldEquals("InvoiceUnfactoredEvent", invoiceUnfactoredEventV1Id, "interestToCharge", invoiceUnfactoredEventV1.params.interestToCharge.toString());
  assert.fieldEquals("InvoiceUnfactoredEvent", invoiceUnfactoredEventV1Id, "poolAddress", MOCK_BULLA_FACTORING_ADDRESS.toHexString());
  assert.fieldEquals("InvoiceUnfactoredEvent", invoiceUnfactoredEventV1Id, "claim", claimId.toString() + "-v1");

  log.info("✅ should create a InvoiceUnfactoredV1 event with correct claim ID", []);

  const depositor = ADDRESS_2;
  const assets = BigInt.fromI32(10000);
  const shares = BigInt.fromI32(10000);

  const depositMadeEvent = newDepositMadeEvent(depositor, assets, shares);
  depositMadeEvent.block.timestamp = timestamp;
  depositMadeEvent.block.number = blockNum;

  handleDepositV2(depositMadeEvent);

  const depositMadeEventId = getDepositMadeEventId(depositMadeEvent, null);
  assert.fieldEquals("DepositMadeEvent", depositMadeEventId, "depositor", depositMadeEvent.params.sender.toHexString());
  assert.fieldEquals("DepositMadeEvent", depositMadeEventId, "assets", depositMadeEvent.params.assets.toString());
  assert.fieldEquals("DepositMadeEvent", depositMadeEventId, "sharesIssued", depositMadeEvent.params.shares.toString());
  assert.fieldEquals("DepositMadeEvent", depositMadeEventId, "poolAddress", MOCK_BULLA_FACTORING_ADDRESS.toHexString());

  log.info("✅ should create a DepositMade event", []);

  const redeemer = ADDRESS_3;

  const sharesRedeemedEvent = newSharesRedeemedEvent(redeemer, shares, assets);
  sharesRedeemedEvent.block.timestamp = timestamp;
  sharesRedeemedEvent.block.number = blockNum;

  handleWithdrawV2(sharesRedeemedEvent);

  const sharesRedeemedEventId = getSharesRedeemedEventId(sharesRedeemedEvent, null);
  assert.fieldEquals("SharesRedeemedEvent", sharesRedeemedEventId, "redeemer", sharesRedeemedEvent.params.receiver.toHexString());
  assert.fieldEquals("SharesRedeemedEvent", sharesRedeemedEventId, "shares", sharesRedeemedEvent.params.shares.toString());
  assert.fieldEquals("SharesRedeemedEvent", sharesRedeemedEventId, "assets", sharesRedeemedEvent.params.assets.toString());
  assert.fieldEquals("SharesRedeemedEvent", sharesRedeemedEventId, "poolAddress", MOCK_BULLA_FACTORING_ADDRESS.toHexString());

  log.info("✅ should create a SharesRedeemed event", []);

  const lossAmount = BigInt.fromI32(2000);
  const gainAmount = BigInt.fromI32(50);

  const invoiceImpairedEvent = newInvoiceImpairedEvent(claimId, lossAmount, gainAmount);
  invoiceImpairedEvent.block.timestamp = timestamp;
  invoiceImpairedEvent.block.number = blockNum;

  handleInvoiceImpairedV2(invoiceImpairedEvent);

  const invoiceImpairedEventId = getInvoiceImpairedEventId(claimId, invoiceImpairedEvent);
  assert.fieldEquals("InvoiceImpairedEvent", invoiceImpairedEventId, "invoiceId", invoiceImpairedEvent.params.invoiceId.toString());
  assert.fieldEquals("InvoiceImpairedEvent", invoiceImpairedEventId, "fundedAmount", invoiceImpairedEvent.params.lossAmount.toString());
  assert.fieldEquals("InvoiceImpairedEvent", invoiceImpairedEventId, "impairAmount", invoiceImpairedEvent.params.gainAmount.toString());
  assert.fieldEquals("InvoiceImpairedEvent", invoiceImpairedEventId, "poolAddress", MOCK_BULLA_FACTORING_ADDRESS.toHexString());
  assert.fieldEquals("InvoiceImpairedEvent", invoiceImpairedEventId, "claim", claimId.toString() + "-v1");

  let poolPnl = PoolPnl.load(MOCK_BULLA_FACTORING_ADDRESS.toHexString());
  assert.assertNotNull(poolPnl);

  const pnlHistoryEntryId = poolPnl!.pnlHistory[0];
  const pnlHistoryEntry = PnlHistoryEntry.load(pnlHistoryEntryId);
  assert.assertNotNull(pnlHistoryEntry);
  assert.bigIntEquals(lossAmount.minus(gainAmount).neg(), pnlHistoryEntry!.pnl);

  log.info("✅ should create a InvoiceImpaired event", []);

  afterEach();
});

test("it handles InvoicePaid event for v2", () => {
  setupContracts();

  const claimId = BigInt.fromI32(3);
  const fundedAmount = BigInt.fromI32(10000);
  const originalCreditor = ADDRESS_1;

  const timestamp = BigInt.fromI32(100);
  const blockNum = BigInt.fromI32(100);

  const claimCreatedEvent = newClaimCreatedEventV1(claimId.toU32(), CLAIM_TYPE_INVOICE);
  claimCreatedEvent.block.timestamp = timestamp;
  claimCreatedEvent.block.number = blockNum;

  handleClaimCreatedV1(claimCreatedEvent);

  const kickbackAmount = BigInt.fromI32(2000);
  const trueInterest = BigInt.fromI32(1000);
  const trueAdminFee = BigInt.fromI32(1000);
  const trueProtocolFee = BigInt.fromI32(1000);

  const invoicePaidEvent = newInvoicePaidEventV2(claimId, fundedAmount, kickbackAmount, originalCreditor, trueInterest, trueAdminFee, trueProtocolFee);

  handleInvoicePaidV2(invoicePaidEvent);

  let poolPnl = PoolPnl.load(MOCK_BULLA_FACTORING_ADDRESS.toHexString());
  assert.assertNotNull(poolPnl);

  const pnlHistoryEntryId = poolPnl!.pnlHistory[0];
  const pnlHistoryEntry = PnlHistoryEntry.load(pnlHistoryEntryId);
  assert.assertNotNull(pnlHistoryEntry);
  assert.bigIntEquals(trueInterest, pnlHistoryEntry!.pnl);

  const invoiceReconciledEventId = getInvoiceReconciledEventId(claimId, invoicePaidEvent);
  assert.fieldEquals("InvoiceReconciledEvent", invoiceReconciledEventId, "invoiceId", invoicePaidEvent.params.invoiceId.toString());
  assert.fieldEquals("InvoiceReconciledEvent", invoiceReconciledEventId, "trueInterest", invoicePaidEvent.params.trueInterest.toString());
  assert.fieldEquals("InvoiceReconciledEvent", invoiceReconciledEventId, "trueAdminFee", invoicePaidEvent.params.adminFee.toString());
  assert.fieldEquals("InvoiceReconciledEvent", invoiceReconciledEventId, "trueProtocolFee", invoicePaidEvent.params.trueProtocolFee.toString());
  assert.fieldEquals("InvoiceReconciledEvent", invoiceReconciledEventId, "poolAddress", MOCK_BULLA_FACTORING_ADDRESS.toHexString());
  assert.fieldEquals("InvoiceReconciledEvent", invoiceReconciledEventId, "claim", claimId.toString() + "-v1");

  log.info("✅ should create a InvoicePaid event", []);

  afterEach();
});

test("it handles BullaFactoring v2 events and stores price history", () => {
  setupContracts();

  const claimId1 = BigInt.fromI32(1);
  const claimId2 = BigInt.fromI32(2);
  const fundedAmount = BigInt.fromI32(10000);
  const originalCreditor = ADDRESS_1;

  const timestamp = BigInt.fromI32(100);
  const blockNum = BigInt.fromI32(100);

  // Create the first claim
  const claimCreatedEvent1 = newClaimCreatedEventV1(claimId1.toU32(), CLAIM_TYPE_INVOICE);
  claimCreatedEvent1.block.timestamp = timestamp;
  claimCreatedEvent1.block.number = blockNum;
  handleClaimCreatedV1(claimCreatedEvent1);

  // Create the second claim
  const claimCreatedEvent2 = newClaimCreatedEventV1(claimId2.toU32(), CLAIM_TYPE_INVOICE);
  claimCreatedEvent2.block.timestamp = timestamp;
  claimCreatedEvent2.block.number = blockNum;
  handleClaimCreatedV1(claimCreatedEvent2);

  // First InvoiceFunded event
  const invoiceFundedEvent1 = newInvoiceFundedEventV2(claimId1, fundedAmount, originalCreditor);
  invoiceFundedEvent1.block.timestamp = timestamp;
  invoiceFundedEvent1.block.number = blockNum;

  handleInvoiceFundedV2(invoiceFundedEvent1);

  let factoringPrice = FactoringPricePerShare.load(MOCK_BULLA_FACTORING_ADDRESS.toHexString());

  assert.assertNotNull(factoringPrice);
  assert.i32Equals(1, factoringPrice!.priceHistory.length);

  const historyEntryId = factoringPrice!.priceHistory[0];
  const priceHistoryEntry = PriceHistoryEntry.load(historyEntryId);
  assert.assertNotNull(priceHistoryEntry);
  assert.bigIntEquals(BigInt.fromI32(1000000), priceHistoryEntry!.price);

  // Update the mock to return a new price
  updatePricePerShareMock(BigInt.fromI32(1100000));

  const invoiceFundedEvent2 = newInvoiceFundedEventV2(claimId2, fundedAmount, originalCreditor);

  handleInvoiceFundedV2(invoiceFundedEvent2);

  factoringPrice = FactoringPricePerShare.load(MOCK_BULLA_FACTORING_ADDRESS.toHexString());

  assert.assertNotNull(factoringPrice);
  assert.i32Equals(2, factoringPrice!.priceHistory.length);

  const newHistoryEntryId = factoringPrice!.priceHistory[1];
  const newPriceHistoryEntry = PriceHistoryEntry.load(newHistoryEntryId);
  assert.assertNotNull(newPriceHistoryEntry);
  assert.bigIntEquals(BigInt.fromI32(1100000), newPriceHistoryEntry!.price);
});

test("it handles BullaFactoring v3 events", () => {
  setupContracts();

  const claimId = BigInt.fromI32(1);
  const fundedAmount = BigInt.fromI32(10000);
  const originalCreditor = ADDRESS_1;

  const timestamp = BigInt.fromI32(100);
  const blockNum = BigInt.fromI32(100);

  const claimCreatedEvent = newClaimCreatedEventV2(claimId.toU32(), CLAIM_TYPE_INVOICE);
  claimCreatedEvent.block.timestamp = timestamp;
  claimCreatedEvent.block.number = blockNum;

  handleClaimCreatedV2(claimCreatedEvent);

  const upfrontBps = BigInt.fromI32(10000);
  const dueDate = timestamp.plus(BigInt.fromI32(30 * 24 * 60 * 60)); // 30 days from timestamp

  const invoiceFundedEvent = newInvoiceFundedEventV3(claimId, fundedAmount, originalCreditor, dueDate, upfrontBps);
  invoiceFundedEvent.block.timestamp = timestamp;
  invoiceFundedEvent.block.number = blockNum;

  handleInvoiceFundedV3(invoiceFundedEvent);

  const invoiceFundedEventId = getInvoiceFundedEventId(claimId, invoiceFundedEvent);
  assert.fieldEquals("InvoiceFundedEvent", invoiceFundedEventId, "invoiceId", invoiceFundedEvent.params.invoiceId.toString());
  assert.fieldEquals("InvoiceFundedEvent", invoiceFundedEventId, "fundedAmount", invoiceFundedEvent.params.fundedAmount.toString());
  assert.fieldEquals("InvoiceFundedEvent", invoiceFundedEventId, "upfrontBps", upfrontBps.toString());
  assert.fieldEquals("InvoiceFundedEvent", invoiceFundedEventId, "originalCreditor", invoiceFundedEvent.params.originalCreditor.toHexString());
  assert.fieldEquals("InvoiceFundedEvent", invoiceFundedEventId, "poolAddress", MOCK_BULLA_FACTORING_ADDRESS.toHexString());
  assert.fieldEquals("InvoiceFundedEvent", invoiceFundedEventId, "claim", claimId.toString() + "-v2");
  // @notice: values are as specified in the helper mock function calculateTargetFees
  assert.fieldEquals("InvoiceFundedEvent", invoiceFundedEventId, "targetSpreadAmount", "1000");
  assert.fieldEquals("InvoiceFundedEvent", invoiceFundedEventId, "targetInterest", "10000");
  assert.fieldEquals("InvoiceFundedEvent", invoiceFundedEventId, "targetProtocolFee", "1000");
  assert.fieldEquals("InvoiceFundedEvent", invoiceFundedEventId, "targetAdminFee", "5000");

  log.info("✅ should create a InvoiceFundedV3 event with correct params", []);

  const totalRefundAmount = BigInt.fromI32(9000);
  const interestToCharge = BigInt.fromI32(100);
  const protocolFee = BigInt.fromI32(1000);
  const adminFee = BigInt.fromI32(5000);
  const spreadAmount = BigInt.fromI32(1000);

  const invoiceUnfactoredEvent = newInvoiceUnfactoredEventV3(claimId, originalCreditor, totalRefundAmount, interestToCharge, protocolFee, adminFee, spreadAmount);
  invoiceUnfactoredEvent.block.timestamp = timestamp;
  invoiceUnfactoredEvent.block.number = blockNum;

  handleInvoiceUnfactoredV3(invoiceUnfactoredEvent);

  const invoiceUnfactoredEventId = getInvoiceUnfactoredEventId(claimId, invoiceUnfactoredEvent);
  assert.fieldEquals("InvoiceUnfactoredEvent", invoiceUnfactoredEventId, "invoiceId", invoiceUnfactoredEvent.params.invoiceId.toString());
  assert.fieldEquals("InvoiceUnfactoredEvent", invoiceUnfactoredEventId, "originalCreditor", invoiceUnfactoredEvent.params.originalCreditor.toHexString());
  assert.fieldEquals("InvoiceUnfactoredEvent", invoiceUnfactoredEventId, "totalRefundAmount", invoiceUnfactoredEvent.params.totalRefundOrPaymentAmount.toString());
  assert.fieldEquals("InvoiceUnfactoredEvent", invoiceUnfactoredEventId, "interestToCharge", invoiceUnfactoredEvent.params.interestToCharge.toString());
  assert.fieldEquals("InvoiceUnfactoredEvent", invoiceUnfactoredEventId, "poolAddress", MOCK_BULLA_FACTORING_ADDRESS.toHexString());
  assert.fieldEquals("InvoiceUnfactoredEvent", invoiceUnfactoredEventId, "claim", claimId.toString() + "-v2");
  assert.fieldEquals("InvoiceUnfactoredEvent", invoiceUnfactoredEventId, "trueProtocolFee", protocolFee.toString());
  assert.fieldEquals("InvoiceUnfactoredEvent", invoiceUnfactoredEventId, "trueAdminFee", adminFee.toString());
  assert.fieldEquals("InvoiceUnfactoredEvent", invoiceUnfactoredEventId, "trueSpreadAmount", spreadAmount.toString());

  log.info("✅ should create a InvoiceUnfactoredV3 event with correct claim ID and params", []);

  const kickbackAmount = BigInt.fromI32(2000);
  const trueInterest = BigInt.fromI32(1000);
  const trueAdminFee = BigInt.fromI32(1000);
  const trueProtocolFee = BigInt.fromI32(1000);

  const invoicePaidEvent = newInvoicePaidEventV3(claimId, fundedAmount, kickbackAmount, originalCreditor, trueInterest, trueAdminFee, trueProtocolFee, spreadAmount);

  handleInvoicePaidV3(invoicePaidEvent);

  let poolPnl = PoolPnl.load(MOCK_BULLA_FACTORING_ADDRESS.toHexString());
  assert.assertNotNull(poolPnl);

  const pnlHistoryEntryId = poolPnl!.pnlHistory[0];
  const pnlHistoryEntry = PnlHistoryEntry.load(pnlHistoryEntryId);
  assert.assertNotNull(pnlHistoryEntry);
  assert.bigIntEquals(trueInterest, pnlHistoryEntry!.pnl);

  const invoiceReconciledEventId = getInvoiceReconciledEventId(claimId, invoicePaidEvent);
  assert.fieldEquals("InvoiceReconciledEvent", invoiceReconciledEventId, "invoiceId", invoicePaidEvent.params.invoiceId.toString());
  assert.fieldEquals("InvoiceReconciledEvent", invoiceReconciledEventId, "trueInterest", invoicePaidEvent.params.trueInterest.toString());
  assert.fieldEquals("InvoiceReconciledEvent", invoiceReconciledEventId, "trueSpreadAmount", invoicePaidEvent.params.trueSpreadAmount.toString());
  assert.fieldEquals("InvoiceReconciledEvent", invoiceReconciledEventId, "trueProtocolFee", invoicePaidEvent.params.trueProtocolFee.toString());
  assert.fieldEquals("InvoiceReconciledEvent", invoiceReconciledEventId, "poolAddress", MOCK_BULLA_FACTORING_ADDRESS.toHexString());
  assert.fieldEquals("InvoiceReconciledEvent", invoiceReconciledEventId, "claim", claimId.toString() + "-v2");
  assert.fieldEquals("InvoiceReconciledEvent", invoiceReconciledEventId, "trueAdminFee", invoicePaidEvent.params.trueAdminFee.toString());
  assert.fieldEquals("InvoiceReconciledEvent", invoiceReconciledEventId, "fundedAmountNet", invoicePaidEvent.params.fundedAmountNet.toString());
  assert.fieldEquals("InvoiceReconciledEvent", invoiceReconciledEventId, "kickbackAmount", invoicePaidEvent.params.kickbackAmount.toString());
  assert.fieldEquals("InvoiceReconciledEvent", invoiceReconciledEventId, "originalCreditor", invoicePaidEvent.params.originalCreditor.toHexString());

  log.info("✅ should create a InvoiceReconciledV3 event", []);

  afterEach();
});

test("it handles BullaFactoring v3 events for InvoiceKickbackAmountSent, Deposit, Withdraw, and InvoiceImpaired", () => {
  setupContracts();

  const claimId = BigInt.fromI32(1);
  const fundedAmount = BigInt.fromI32(10000);
  const originalCreditor = ADDRESS_1;

  const timestamp = BigInt.fromI32(100);
  const blockNum = BigInt.fromI32(100);

  const claimCreatedEvent = newClaimCreatedEventV2(claimId.toU32(), CLAIM_TYPE_INVOICE);
  claimCreatedEvent.block.timestamp = timestamp;
  claimCreatedEvent.block.number = blockNum;

  handleClaimCreatedV2(claimCreatedEvent);

  // Test handleInvoiceKickbackAmountSentV3
  const kickbackAmount = BigInt.fromI32(2000);

  const invoiceKickbackAmountSentEvent = newInvoiceKickbackAmountSentEvent(claimId, kickbackAmount, originalCreditor);
  invoiceKickbackAmountSentEvent.block.timestamp = timestamp;
  invoiceKickbackAmountSentEvent.block.number = blockNum;

  handleInvoiceKickbackAmountSentV3(invoiceKickbackAmountSentEvent);

  const invoiceKickbackAmountSentEventId = getInvoiceKickbackAmountSentEventId(claimId, invoiceKickbackAmountSentEvent);
  assert.fieldEquals("InvoiceKickbackAmountSentEvent", invoiceKickbackAmountSentEventId, "invoiceId", invoiceKickbackAmountSentEvent.params.invoiceId.toString());
  assert.fieldEquals(
    "InvoiceKickbackAmountSentEvent",
    invoiceKickbackAmountSentEventId,
    "kickbackAmount",
    invoiceKickbackAmountSentEvent.params.kickbackAmount.toString(),
  );
  assert.fieldEquals(
    "InvoiceKickbackAmountSentEvent",
    invoiceKickbackAmountSentEventId,
    "originalCreditor",
    invoiceKickbackAmountSentEvent.params.originalCreditor.toHexString(),
  );
  assert.fieldEquals("InvoiceKickbackAmountSentEvent", invoiceKickbackAmountSentEventId, "poolAddress", MOCK_BULLA_FACTORING_ADDRESS.toHexString());
  assert.fieldEquals("InvoiceKickbackAmountSentEvent", invoiceKickbackAmountSentEventId, "claim", claimId.toString() + "-v2");

  log.info("✅ should create a InvoiceKickbackAmountSentV3 event with correct claim ID", []);

  // Test handleDepositV3
  const depositor = ADDRESS_2;
  const assets = BigInt.fromI32(5000);
  const shares = BigInt.fromI32(4000);

  const depositMadeEvent = newDepositMadeEvent(depositor, assets, shares);
  depositMadeEvent.block.timestamp = timestamp;
  depositMadeEvent.block.number = blockNum;

  handleDepositV3(depositMadeEvent);

  const depositMadeEventId = getDepositMadeEventId(depositMadeEvent, null);
  assert.fieldEquals("DepositMadeEvent", depositMadeEventId, "depositor", depositMadeEvent.params.sender.toHexString());
  assert.fieldEquals("DepositMadeEvent", depositMadeEventId, "assets", depositMadeEvent.params.assets.toString());
  assert.fieldEquals("DepositMadeEvent", depositMadeEventId, "sharesIssued", depositMadeEvent.params.shares.toString());
  assert.fieldEquals("DepositMadeEvent", depositMadeEventId, "poolAddress", MOCK_BULLA_FACTORING_ADDRESS.toHexString());

  log.info("✅ should create a DepositV3 event", []);

  // Test handleWithdrawV3
  const redeemer = ADDRESS_3;

  const sharesRedeemedEvent = newSharesRedeemedEvent(redeemer, shares, assets);
  sharesRedeemedEvent.block.timestamp = timestamp;
  sharesRedeemedEvent.block.number = blockNum;

  handleWithdrawV3(sharesRedeemedEvent);

  const sharesRedeemedEventId = getSharesRedeemedEventId(sharesRedeemedEvent, null);
  assert.fieldEquals("SharesRedeemedEvent", sharesRedeemedEventId, "redeemer", sharesRedeemedEvent.params.receiver.toHexString());
  assert.fieldEquals("SharesRedeemedEvent", sharesRedeemedEventId, "shares", sharesRedeemedEvent.params.shares.toString());
  assert.fieldEquals("SharesRedeemedEvent", sharesRedeemedEventId, "assets", sharesRedeemedEvent.params.assets.toString());
  assert.fieldEquals("SharesRedeemedEvent", sharesRedeemedEventId, "poolAddress", MOCK_BULLA_FACTORING_ADDRESS.toHexString());

  log.info("✅ should create a WithdrawV3 event", []);

  // Test handleInvoiceImpairedV3
  const lossAmount = BigInt.fromI32(2000);
  const gainAmount = BigInt.fromI32(50);

  const invoiceImpairedEvent = newInvoiceImpairedEvent(claimId, lossAmount, gainAmount);
  invoiceImpairedEvent.block.timestamp = timestamp;
  invoiceImpairedEvent.block.number = blockNum;

  handleInvoiceImpairedV3(invoiceImpairedEvent);

  const invoiceImpairedEventId = getInvoiceImpairedEventId(claimId, invoiceImpairedEvent);
  assert.fieldEquals("InvoiceImpairedEvent", invoiceImpairedEventId, "invoiceId", invoiceImpairedEvent.params.invoiceId.toString());
  assert.fieldEquals("InvoiceImpairedEvent", invoiceImpairedEventId, "fundedAmount", invoiceImpairedEvent.params.lossAmount.toString());
  assert.fieldEquals("InvoiceImpairedEvent", invoiceImpairedEventId, "impairAmount", invoiceImpairedEvent.params.gainAmount.toString());
  assert.fieldEquals("InvoiceImpairedEvent", invoiceImpairedEventId, "poolAddress", MOCK_BULLA_FACTORING_ADDRESS.toHexString());
  assert.fieldEquals("InvoiceImpairedEvent", invoiceImpairedEventId, "claim", claimId.toString() + "-v2");

  log.info("✅ should create a InvoiceImpairedV3 event with correct claim ID and amounts", []);

  afterEach();
});

// exporting for test coverage
export { handleClaimCreatedV1, handleInvoiceFundedV2, handleInvoiceKickbackAmountSentV2, handleInvoicePaidV2, handleInvoiceUnfactoredV2 };
