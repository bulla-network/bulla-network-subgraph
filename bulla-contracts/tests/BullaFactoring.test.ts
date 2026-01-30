import { BigInt, log } from "@graphprotocol/graph-ts";
import { assert, test } from "matchstick-as/assembly/index";
import {
  FactoringPool,
  FactoringPricePerShare,
  FactoringStatisticsEntry,
  HistoricalFactoringStatistics,
  InvoiceFundedEvent as InvoiceFundedEventEntity,
  InvoiceReconciledEvent as InvoiceReconciledEventEntity,
  PnlHistoryEntry,
  PoolPermissionsContractAddresses,
  PoolPnl,
  PriceHistoryEntry,
} from "../generated/schema";
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
  handleDepositPermissionsChangedV0,
  handleDepositPermissionsChangedV1,
  handleDepositPermissionsChangedV2_1,
  handleDepositV1,
  handleDepositV2_1,
  handleFactoringPermissionsChangedV0,
  handleFactoringPermissionsChangedV1,
  handleFactoringPermissionsChangedV2_1,
  handleInvoiceFundedV1,
  handleInvoiceFundedV2_1,
  handleInvoiceImpairedV1,
  handleInvoiceKickbackAmountSentV1,
  handleInvoicePaidV1,
  handleInvoicePaidV2_1,
  handleInvoiceUnfactoredV0,
  handleInvoiceUnfactoredV1,
  handleInvoiceUnfactoredV2_1,
  handleRedeemPermissionsChangedV2_1,
  handleWithdrawV1,
} from "../src/mappings/BullaFactoring";
import { newClaimCreatedEventV1, newClaimCreatedEventV2 } from "./functions/BullaClaimERC721.testtools";
import {
  newDepositMadeEvent,
  newDepositMadeEventV2_1,
  newDepositPermissionsChangedEventV0,
  newDepositPermissionsChangedEventV1,
  newDepositPermissionsChangedEventV2_1,
  newFactoringPermissionsChangedEventV0,
  newFactoringPermissionsChangedEventV1,
  newFactoringPermissionsChangedEventV2_1,
  newInvoiceFundedEventV1,
  newInvoiceFundedEventV2_1,
  newInvoiceImpairedEvent,
  newInvoiceKickbackAmountSentEvent,
  newInvoicePaidEventV1,
  newInvoicePaidEventV2_1,
  newInvoiceUnfactoredEventV0,
  newInvoiceUnfactoredEventV1,
  newInvoiceUnfactoredEventV2_1,
  newRedeemPermissionsChangedEventV2_1,
  newSharesRedeemedEvent,
} from "./functions/BullaFactoring.testtools";
import { ADDRESS_1, ADDRESS_2, ADDRESS_3, ADDRESS_ZERO, MOCK_BULLA_FACTORING_ADDRESS, MOCK_DEPOSIT_PERMISSIONS_ADDRESS, MOCK_FACTORING_PERMISSIONS_ADDRESS, afterEach, setupContracts, updateFundInfoMock, updatePricePerShareMock } from "./helpers";

test("it handles BullaFactoring V1 events and stores historical factoring statistics", () => {
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
  const invoiceFundedEvent1 = newInvoiceFundedEventV1(claimId1, fundedAmount, originalCreditor);
  invoiceFundedEvent1.block.timestamp = timestamp;
  invoiceFundedEvent1.block.number = blockNum;

  handleInvoiceFundedV1(invoiceFundedEvent1);

  let historicalFactoringStats = HistoricalFactoringStatistics.load(MOCK_BULLA_FACTORING_ADDRESS.toHexString());
  assert.assertNotNull(historicalFactoringStats);

  const statisticsEntryId = historicalFactoringStats!.statistics[0];
  const factoringStatisticsEntry = FactoringStatisticsEntry.load(statisticsEntryId);
  assert.assertNotNull(factoringStatisticsEntry);
  assert.bigIntEquals(BigInt.fromI32(10000), factoringStatisticsEntry!.fundBalance);
  assert.bigIntEquals(BigInt.fromI32(5000), factoringStatisticsEntry!.deployedCapital);
  assert.bigIntEquals(BigInt.fromI32(15000), factoringStatisticsEntry!.capitalAccount);

  // Test that debtor user has the factoring event added
  // For CLAIM_TYPE_INVOICE: creditor = ADDRESS_1, debtor = ADDRESS_2
  const invoiceFundedEvent1Id = getInvoiceFundedEventId(claimId1, invoiceFundedEvent1);
  const debtorId = ADDRESS_2.toHexString();
  assert.fieldEquals("User", debtorId, "factoringEvents", `[${invoiceFundedEvent1Id}]`);

  // Update the mock to return new fund info
  updateFundInfoMock(BigInt.fromI32(15000), BigInt.fromI32(7500), BigInt.fromI32(22500));

  const invoiceFundedEvent2 = newInvoiceFundedEventV1(claimId2, fundedAmount, originalCreditor);
  invoiceFundedEvent2.block.timestamp = timestamp.plus(BigInt.fromI32(1));
  invoiceFundedEvent2.block.number = blockNum.plus(BigInt.fromI32(1));

  handleInvoiceFundedV1(invoiceFundedEvent2);

  historicalFactoringStats = HistoricalFactoringStatistics.load(MOCK_BULLA_FACTORING_ADDRESS.toHexString());

  assert.assertNotNull(historicalFactoringStats);
  assert.i32Equals(2, historicalFactoringStats!.statistics.length);

  const newStatisticsEntryId = historicalFactoringStats!.statistics[1];
  const newFactoringStatisticsEntry = FactoringStatisticsEntry.load(newStatisticsEntryId);
  assert.assertNotNull(newFactoringStatisticsEntry);
  assert.bigIntEquals(BigInt.fromI32(15000), newFactoringStatisticsEntry!.fundBalance);
  assert.bigIntEquals(BigInt.fromI32(7500), newFactoringStatisticsEntry!.deployedCapital);
  assert.bigIntEquals(BigInt.fromI32(22500), newFactoringStatisticsEntry!.capitalAccount);

  afterEach();
});

test("it handles BullaFactoring V1 events", () => {
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

  // Create a deposit event first to initialize the FactoringPool
  const depositor = ADDRESS_2;
  const assets = BigInt.fromI32(10000);
  const shares = BigInt.fromI32(10000);

  const depositMadeEvent = newDepositMadeEvent(depositor, assets, shares);
  depositMadeEvent.block.timestamp = timestamp;
  depositMadeEvent.block.number = blockNum;

  handleDepositV1(depositMadeEvent);

  const depositMadeEventId = getDepositMadeEventId(depositMadeEvent, null);
  assert.fieldEquals("DepositMadeEvent", depositMadeEventId, "depositor", depositMadeEvent.params.sender.toHexString());
  assert.fieldEquals("DepositMadeEvent", depositMadeEventId, "assets", depositMadeEvent.params.assets.toString());
  assert.fieldEquals("DepositMadeEvent", depositMadeEventId, "sharesIssued", depositMadeEvent.params.shares.toString());
  assert.fieldEquals("DepositMadeEvent", depositMadeEventId, "poolAddress", MOCK_BULLA_FACTORING_ADDRESS.toHexString());

  log.info("✅ should create a DepositMade event", []);

  const invoiceFundedEvent = newInvoiceFundedEventV1(claimId, fundedAmount, originalCreditor);
  invoiceFundedEvent.block.timestamp = timestamp;
  invoiceFundedEvent.block.number = blockNum;

  handleInvoiceFundedV1(invoiceFundedEvent);

  const invoiceFundedEventId = getInvoiceFundedEventId(claimId, invoiceFundedEvent);
  assert.fieldEquals("InvoiceFundedEvent", invoiceFundedEventId, "invoiceId", invoiceFundedEvent.params.invoiceId.toString());
  assert.fieldEquals("InvoiceFundedEvent", invoiceFundedEventId, "fundedAmount", invoiceFundedEvent.params.fundedAmount.toString());
  assert.fieldEquals("InvoiceFundedEvent", invoiceFundedEventId, "upfrontBps", "10000");
  assert.fieldEquals("InvoiceFundedEvent", invoiceFundedEventId, "originalCreditor", invoiceFundedEvent.params.originalCreditor.toHexString());
  assert.fieldEquals("InvoiceFundedEvent", invoiceFundedEventId, "fundsReceiver", invoiceFundedEvent.params.originalCreditor.toHexString()); // V2: fundsReceiver = originalCreditor
  assert.fieldEquals("InvoiceFundedEvent", invoiceFundedEventId, "poolAddress", MOCK_BULLA_FACTORING_ADDRESS.toHexString());
  assert.fieldEquals("InvoiceFundedEvent", invoiceFundedEventId, "claim", claimId.toString() + "-v1");

  log.info("✅ should create a InvoiceFunded event with correct claim ID", []);

  // Test that debtor user has the factoring event added
  // For CLAIM_TYPE_INVOICE: creditor = ADDRESS_1, debtor = ADDRESS_2
  // Note: ADDRESS_2 is also the depositor, so they have both DepositMade and InvoiceFunded events
  const debtorId = ADDRESS_2.toHexString();
  assert.fieldEquals("User", debtorId, "factoringEvents", `[${depositMadeEventId}, ${invoiceFundedEventId}]`);

  log.info("✅ should add InvoiceFunded event to debtor's factoringEvents", []);

  const kickbackAmount = BigInt.fromI32(2000);

  const invoiceKickbackAmountSentEvent = newInvoiceKickbackAmountSentEvent(claimId, kickbackAmount, originalCreditor);
  invoiceKickbackAmountSentEvent.block.timestamp = timestamp;
  invoiceKickbackAmountSentEvent.block.number = blockNum;

  handleInvoiceKickbackAmountSentV1(invoiceKickbackAmountSentEvent);

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

  const invoiceUnfactoredEvent = newInvoiceUnfactoredEventV1(claimId, originalCreditor, totalRefundAmount, interestToCharge);
  invoiceUnfactoredEvent.block.timestamp = timestamp;
  invoiceUnfactoredEvent.block.number = blockNum;

  handleInvoiceUnfactoredV1(invoiceUnfactoredEvent);

  const invoiceUnfactoredEventId = getInvoiceUnfactoredEventId(claimId, invoiceUnfactoredEvent);
  assert.fieldEquals("InvoiceUnfactoredEvent", invoiceUnfactoredEventId, "invoiceId", invoiceUnfactoredEvent.params.invoiceId.toString());
  assert.fieldEquals("InvoiceUnfactoredEvent", invoiceUnfactoredEventId, "originalCreditor", invoiceUnfactoredEvent.params.originalCreditor.toHexString());
  assert.fieldEquals("InvoiceUnfactoredEvent", invoiceUnfactoredEventId, "totalRefundAmount", invoiceUnfactoredEvent.params.totalRefundOrPaymentAmount.toString());
  assert.fieldEquals("InvoiceUnfactoredEvent", invoiceUnfactoredEventId, "interestToCharge", invoiceUnfactoredEvent.params.interestToCharge.toString());
  assert.fieldEquals("InvoiceUnfactoredEvent", invoiceUnfactoredEventId, "poolAddress", MOCK_BULLA_FACTORING_ADDRESS.toHexString());
  assert.fieldEquals("InvoiceUnfactoredEvent", invoiceUnfactoredEventId, "claim", claimId.toString() + "-v1");

  log.info("✅ should create a InvoiceUnfactored event with correct claim ID", []);

  const invoiceUnfactoredEventV1 = newInvoiceUnfactoredEventV0(claimId, originalCreditor, totalRefundAmount, interestToCharge);
  invoiceUnfactoredEventV1.block.timestamp = timestamp;
  invoiceUnfactoredEventV1.block.number = blockNum;

  handleInvoiceUnfactoredV0(invoiceUnfactoredEventV1);
  const invoiceUnfactoredEventV1Id = getInvoiceUnfactoredEventId(claimId, invoiceUnfactoredEventV1);
  assert.fieldEquals("InvoiceUnfactoredEvent", invoiceUnfactoredEventV1Id, "invoiceId", invoiceUnfactoredEventV1.params.invoiceId.toString());
  assert.fieldEquals("InvoiceUnfactoredEvent", invoiceUnfactoredEventV1Id, "originalCreditor", invoiceUnfactoredEventV1.params.originalCreditor.toHexString());
  assert.fieldEquals("InvoiceUnfactoredEvent", invoiceUnfactoredEventV1Id, "totalRefundAmount", invoiceUnfactoredEventV1.params.totalRefundAmount.toString());
  assert.fieldEquals("InvoiceUnfactoredEvent", invoiceUnfactoredEventV1Id, "interestToCharge", invoiceUnfactoredEventV1.params.interestToCharge.toString());
  assert.fieldEquals("InvoiceUnfactoredEvent", invoiceUnfactoredEventV1Id, "poolAddress", MOCK_BULLA_FACTORING_ADDRESS.toHexString());
  assert.fieldEquals("InvoiceUnfactoredEvent", invoiceUnfactoredEventV1Id, "claim", claimId.toString() + "-v1");

  log.info("✅ should create a InvoiceUnfactoredV0 event with correct claim ID", []);

  const redeemer = ADDRESS_3;

  const sharesRedeemedEvent = newSharesRedeemedEvent(redeemer, shares, assets);
  sharesRedeemedEvent.block.timestamp = timestamp;
  sharesRedeemedEvent.block.number = blockNum;

  handleWithdrawV1(sharesRedeemedEvent);

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

  handleInvoiceImpairedV1(invoiceImpairedEvent);

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

  // Test that FactoringPool has all the factoring events
  const factoringPool = FactoringPool.load(MOCK_BULLA_FACTORING_ADDRESS.toHexString());
  assert.assertNotNull(factoringPool);
  // Should contain: DepositMade, InvoiceFunded, InvoiceKickbackAmountSent, InvoiceUnfactoredV1, InvoiceUnfactoredV0, SharesRedeemed, InvoiceImpaired
  assert.i32Equals(7, factoringPool!.factoringEvents.length);
  assert.assertTrue(factoringPool!.factoringEvents.includes(invoiceFundedEventId));
  assert.assertTrue(factoringPool!.factoringEvents.includes(invoiceKickbackAmountSentEventId));
  assert.assertTrue(factoringPool!.factoringEvents.includes(invoiceUnfactoredEventId));
  assert.assertTrue(factoringPool!.factoringEvents.includes(invoiceUnfactoredEventV1Id));
  assert.assertTrue(factoringPool!.factoringEvents.includes(depositMadeEventId));
  assert.assertTrue(factoringPool!.factoringEvents.includes(sharesRedeemedEventId));
  assert.assertTrue(factoringPool!.factoringEvents.includes(invoiceImpairedEventId));

  log.info("✅ FactoringPool should have all factoring events", []);

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

  // Create a deposit event to initialize the FactoringPool
  const depositor = ADDRESS_2;
  const assets = BigInt.fromI32(10000);
  const shares = BigInt.fromI32(10000);

  const depositMadeEvent = newDepositMadeEvent(depositor, assets, shares);
  depositMadeEvent.block.timestamp = timestamp;
  depositMadeEvent.block.number = blockNum;

  handleDepositV1(depositMadeEvent);

  const kickbackAmount = BigInt.fromI32(2000);
  const trueInterest = BigInt.fromI32(1000);
  const trueAdminFee = BigInt.fromI32(1000);
  const trueProtocolFee = BigInt.fromI32(1000);

  const invoicePaidEvent = newInvoicePaidEventV1(claimId, fundedAmount, kickbackAmount, originalCreditor, trueInterest, trueAdminFee, trueProtocolFee);

  handleInvoicePaidV1(invoicePaidEvent);

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

  // Test that FactoringPool has the InvoiceReconciled event
  const factoringPool = FactoringPool.load(MOCK_BULLA_FACTORING_ADDRESS.toHexString());
  assert.assertNotNull(factoringPool);
  assert.assertTrue(factoringPool!.factoringEvents.includes(invoiceReconciledEventId));

  log.info("✅ FactoringPool should have InvoiceReconciled event", []);

  afterEach();
});

test("it handles BullaFactoring V1 events and stores price history", () => {
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
  const invoiceFundedEvent1 = newInvoiceFundedEventV1(claimId1, fundedAmount, originalCreditor);
  invoiceFundedEvent1.block.timestamp = timestamp;
  invoiceFundedEvent1.block.number = blockNum;

  handleInvoiceFundedV1(invoiceFundedEvent1);

  let factoringPrice = FactoringPricePerShare.load(MOCK_BULLA_FACTORING_ADDRESS.toHexString());

  assert.assertNotNull(factoringPrice);
  assert.i32Equals(1, factoringPrice!.priceHistory.length);

  const historyEntryId = factoringPrice!.priceHistory[0];
  const priceHistoryEntry = PriceHistoryEntry.load(historyEntryId);
  assert.assertNotNull(priceHistoryEntry);
  assert.bigIntEquals(BigInt.fromI32(1000000), priceHistoryEntry!.price);

  // Test that debtor user has the factoring event added
  const invoiceFundedEvent1Id = getInvoiceFundedEventId(claimId1, invoiceFundedEvent1);
  const debtorId = ADDRESS_2.toHexString();
  assert.fieldEquals("User", debtorId, "factoringEvents", `[${invoiceFundedEvent1Id}]`);

  // Update the mock to return a new price
  updatePricePerShareMock(BigInt.fromI32(1100000));

  const invoiceFundedEvent2 = newInvoiceFundedEventV1(claimId2, fundedAmount, originalCreditor);

  handleInvoiceFundedV1(invoiceFundedEvent2);

  factoringPrice = FactoringPricePerShare.load(MOCK_BULLA_FACTORING_ADDRESS.toHexString());

  assert.assertNotNull(factoringPrice);
  assert.i32Equals(2, factoringPrice!.priceHistory.length);

  const newHistoryEntryId = factoringPrice!.priceHistory[1];
  const newPriceHistoryEntry = PriceHistoryEntry.load(newHistoryEntryId);
  assert.assertNotNull(newPriceHistoryEntry);
  assert.bigIntEquals(BigInt.fromI32(1100000), newPriceHistoryEntry!.price);

  afterEach();
});

test("it handles BullaFactoring v2_1 events for InvoiceFunded, InvoicePaid, InvoiceUnfactored", () => {
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

  // Create a deposit event to initialize the FactoringPool
  const depositor = ADDRESS_2;
  const assets = BigInt.fromI32(10000);
  const shares = BigInt.fromI32(10000);

  const depositMadeEvent = newDepositMadeEventV2_1(depositor, assets, shares);
  depositMadeEvent.block.timestamp = timestamp;
  depositMadeEvent.block.number = blockNum;

  handleDepositV2_1(depositMadeEvent);

  const upfrontBps = BigInt.fromI32(10000);
  const dueDate = timestamp.plus(BigInt.fromI32(30 * 24 * 60 * 60)); // 30 days from timestamp
  const protocolFee = BigInt.fromI32(1000);

  const invoiceFundedEvent = newInvoiceFundedEventV2_1(claimId, fundedAmount, originalCreditor, dueDate, upfrontBps, protocolFee);
  invoiceFundedEvent.block.timestamp = timestamp;
  invoiceFundedEvent.block.number = blockNum;

  handleInvoiceFundedV2_1(invoiceFundedEvent);

  const invoiceFundedEventId = getInvoiceFundedEventId(claimId, invoiceFundedEvent);
  assert.fieldEquals("InvoiceFundedEvent", invoiceFundedEventId, "invoiceId", invoiceFundedEvent.params.invoiceId.toString());
  assert.fieldEquals("InvoiceFundedEvent", invoiceFundedEventId, "fundedAmount", invoiceFundedEvent.params.fundedAmount.toString());
  assert.fieldEquals("InvoiceFundedEvent", invoiceFundedEventId, "upfrontBps", upfrontBps.toString());
  assert.fieldEquals("InvoiceFundedEvent", invoiceFundedEventId, "targetProtocolFee", protocolFee.toString());
  assert.fieldEquals("InvoiceFundedEvent", invoiceFundedEventId, "originalCreditor", invoiceFundedEvent.params.originalCreditor.toHexString());
  assert.fieldEquals("InvoiceFundedEvent", invoiceFundedEventId, "fundsReceiver", invoiceFundedEvent.params.fundsReceiver.toHexString()); // V2_1: explicit fundsReceiver
  assert.fieldEquals("InvoiceFundedEvent", invoiceFundedEventId, "poolAddress", MOCK_BULLA_FACTORING_ADDRESS.toHexString());
  assert.fieldEquals("InvoiceFundedEvent", invoiceFundedEventId, "claim", claimId.toString() + "-v2");
  // @notice: values are as specified in the helper mock function calculateTargetFees
  assert.fieldEquals("InvoiceFundedEvent", invoiceFundedEventId, "targetSpreadAmount", "1000");
  assert.fieldEquals("InvoiceFundedEvent", invoiceFundedEventId, "targetInterest", "10000");
  assert.fieldEquals("InvoiceFundedEvent", invoiceFundedEventId, "targetAdminFee", "5000");

  log.info("✅ should create a InvoiceFundedV2_1 event with correct params", []);

  const kickbackAmount = BigInt.fromI32(2000);
  const trueInterest = BigInt.fromI32(1000);
  const trueAdminFee = BigInt.fromI32(1000);
  const spreadAmount = BigInt.fromI32(1000);

  const invoicePaidEvent = newInvoicePaidEventV2_1(claimId, fundedAmount, kickbackAmount, originalCreditor, trueInterest, trueAdminFee, spreadAmount);

  handleInvoicePaidV2_1(invoicePaidEvent);

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
  assert.fieldEquals("InvoiceReconciledEvent", invoiceReconciledEventId, "trueProtocolFee", protocolFee.toString());
  assert.fieldEquals("InvoiceReconciledEvent", invoiceReconciledEventId, "poolAddress", MOCK_BULLA_FACTORING_ADDRESS.toHexString());
  assert.fieldEquals("InvoiceReconciledEvent", invoiceReconciledEventId, "claim", claimId.toString() + "-v2");
  assert.fieldEquals("InvoiceReconciledEvent", invoiceReconciledEventId, "trueAdminFee", invoicePaidEvent.params.trueAdminFee.toString());
  assert.fieldEquals("InvoiceReconciledEvent", invoiceReconciledEventId, "fundedAmountNet", invoicePaidEvent.params.fundedAmountNet.toString());
  assert.fieldEquals("InvoiceReconciledEvent", invoiceReconciledEventId, "kickbackAmount", invoicePaidEvent.params.kickbackAmount.toString());
  assert.fieldEquals("InvoiceReconciledEvent", invoiceReconciledEventId, "originalCreditor", invoicePaidEvent.params.originalCreditor.toHexString());

  const fundedEntityV2_1 = InvoiceFundedEventEntity.load(invoiceFundedEventId);
  assert.assertNotNull(fundedEntityV2_1);
  const reconciledEntityV2_1 = InvoiceReconciledEventEntity.load(invoiceReconciledEventId);
  assert.assertNotNull(reconciledEntityV2_1);
  assert.bigIntEquals(fundedEntityV2_1!.targetProtocolFee, reconciledEntityV2_1!.trueProtocolFee);

  log.info("✅ should create a InvoiceReconciledV2_1 event", []);

  const totalRefundAmount = BigInt.fromI32(9000);
  const interestToCharge = BigInt.fromI32(100);
  const adminFee = BigInt.fromI32(5000);

  const invoiceUnfactoredEvent = newInvoiceUnfactoredEventV2_1(claimId, originalCreditor, totalRefundAmount, interestToCharge, adminFee, spreadAmount);
  invoiceUnfactoredEvent.block.timestamp = timestamp;
  invoiceUnfactoredEvent.block.number = blockNum;

  handleInvoiceUnfactoredV2_1(invoiceUnfactoredEvent);

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
  assert.fieldEquals("InvoiceUnfactoredEvent", invoiceUnfactoredEventId, "isPoolOwnerUnfactoring", "false");

  log.info("✅ should create a InvoiceUnfactoredV2_1 event with correct claim ID and params", []);

  // Test that FactoringPool has all the V2_1 factoring events
  const factoringPool = FactoringPool.load(MOCK_BULLA_FACTORING_ADDRESS.toHexString());
  assert.assertNotNull(factoringPool);
  // Should contain: DepositMade, InvoiceFunded, InvoiceReconciled, InvoiceUnfactored
  assert.i32Equals(4, factoringPool!.factoringEvents.length);
  assert.assertTrue(factoringPool!.factoringEvents.includes(invoiceFundedEventId));
  assert.assertTrue(factoringPool!.factoringEvents.includes(invoiceReconciledEventId));
  assert.assertTrue(factoringPool!.factoringEvents.includes(invoiceUnfactoredEventId));

  log.info("✅ FactoringPool should have all V2_1 factoring events", []);

  afterEach();
});

test("it handles permission changed events for V1", () => {
  setupContracts();

  const timestamp = BigInt.fromI32(100);
  const blockNum = BigInt.fromI32(100);

  // Test DepositPermissionsChanged V1
  const newDepositPermissionsAddress = ADDRESS_1;
  const depositPermissionsChangedEvent = newDepositPermissionsChangedEventV0(newDepositPermissionsAddress);
  depositPermissionsChangedEvent.block.timestamp = timestamp;
  depositPermissionsChangedEvent.block.number = blockNum;

  handleDepositPermissionsChangedV0(depositPermissionsChangedEvent);

  let poolPermissions = PoolPermissionsContractAddresses.load(MOCK_BULLA_FACTORING_ADDRESS.toHexString());
  assert.assertNotNull(poolPermissions);
  assert.bytesEquals(newDepositPermissionsAddress, poolPermissions!.depositPermissions);

  log.info("✅ should update deposit permissions on DepositPermissionsChanged V1 event", []);

  // Test FactoringPermissionsChanged V1
  const newFactoringPermissionsAddress = ADDRESS_2;
  const factoringPermissionsChangedEvent = newFactoringPermissionsChangedEventV0(newFactoringPermissionsAddress);
  factoringPermissionsChangedEvent.block.timestamp = timestamp;
  factoringPermissionsChangedEvent.block.number = blockNum;

  handleFactoringPermissionsChangedV0(factoringPermissionsChangedEvent);

  poolPermissions = PoolPermissionsContractAddresses.load(MOCK_BULLA_FACTORING_ADDRESS.toHexString());
  assert.assertNotNull(poolPermissions);
  assert.bytesEquals(newFactoringPermissionsAddress, poolPermissions!.factoringPermissions);

  log.info("✅ should update factoring permissions on FactoringPermissionsChanged V1 event", []);

  afterEach();
});

test("it handles permission changed events and initializes pool permissions on deposit", () => {
  setupContracts();

  const timestamp = BigInt.fromI32(100);
  const blockNum = BigInt.fromI32(100);

  // Test that deposit initializes pool permissions
  const depositor = ADDRESS_2;
  const assets = BigInt.fromI32(10000);
  const shares = BigInt.fromI32(10000);

  const depositMadeEvent = newDepositMadeEvent(depositor, assets, shares);
  depositMadeEvent.block.timestamp = timestamp;
  depositMadeEvent.block.number = blockNum;

  handleDepositV1(depositMadeEvent);

  // Pool permissions should be initialized with mock permissions values, simulating the contract's initial deployment state
  // Note: V2 doesn't have redeemPermissions, so it should be ADDRESS_ZERO
  let poolPermissions = PoolPermissionsContractAddresses.load(MOCK_BULLA_FACTORING_ADDRESS.toHexString());
  assert.assertNotNull(poolPermissions);
  assert.bytesEquals(MOCK_DEPOSIT_PERMISSIONS_ADDRESS, poolPermissions!.depositPermissions);
  assert.bytesEquals(MOCK_FACTORING_PERMISSIONS_ADDRESS, poolPermissions!.factoringPermissions);
  assert.bytesEquals(ADDRESS_ZERO, poolPermissions!.redeemPermissions);

  log.info("✅ should initialize pool permissions on first deposit", []);

  // Test DepositPermissionsChanged V2
  const newDepositPermissionsAddress = ADDRESS_1;
  const depositPermissionsChangedEvent = newDepositPermissionsChangedEventV1(newDepositPermissionsAddress);
  depositPermissionsChangedEvent.block.timestamp = timestamp;
  depositPermissionsChangedEvent.block.number = blockNum;

  handleDepositPermissionsChangedV1(depositPermissionsChangedEvent);

  poolPermissions = PoolPermissionsContractAddresses.load(MOCK_BULLA_FACTORING_ADDRESS.toHexString());
  assert.assertNotNull(poolPermissions);
  assert.bytesEquals(newDepositPermissionsAddress, poolPermissions!.depositPermissions);

  log.info("✅ should update deposit permissions on DepositPermissionsChanged event", []);

  // Test FactoringPermissionsChanged V2
  const newFactoringPermissionsAddress = ADDRESS_2;
  const factoringPermissionsChangedEvent = newFactoringPermissionsChangedEventV1(newFactoringPermissionsAddress);
  factoringPermissionsChangedEvent.block.timestamp = timestamp;
  factoringPermissionsChangedEvent.block.number = blockNum;

  handleFactoringPermissionsChangedV1(factoringPermissionsChangedEvent);

  poolPermissions = PoolPermissionsContractAddresses.load(MOCK_BULLA_FACTORING_ADDRESS.toHexString());
  assert.assertNotNull(poolPermissions);
  assert.bytesEquals(newFactoringPermissionsAddress, poolPermissions!.factoringPermissions);

  log.info("✅ should update factoring permissions on FactoringPermissionsChanged event", []);

  afterEach();
});

test("it handles permission changed events for V2_1 including redeem permissions", () => {
  setupContracts();

  const timestamp = BigInt.fromI32(100);
  const blockNum = BigInt.fromI32(100);

  // Test DepositPermissionsChanged V2_1
  const newDepositPermissionsAddress = ADDRESS_1;
  const depositPermissionsChangedEvent = newDepositPermissionsChangedEventV2_1(newDepositPermissionsAddress);
  depositPermissionsChangedEvent.block.timestamp = timestamp;
  depositPermissionsChangedEvent.block.number = blockNum;

  handleDepositPermissionsChangedV2_1(depositPermissionsChangedEvent);

  let poolPermissions = PoolPermissionsContractAddresses.load(MOCK_BULLA_FACTORING_ADDRESS.toHexString());
  assert.assertNotNull(poolPermissions);
  assert.bytesEquals(newDepositPermissionsAddress, poolPermissions!.depositPermissions);

  log.info("✅ should update deposit permissions on DepositPermissionsChanged V2_1 event", []);

  // Test FactoringPermissionsChanged V2_1
  const newFactoringPermissionsAddress = ADDRESS_2;
  const factoringPermissionsChangedEvent = newFactoringPermissionsChangedEventV2_1(newFactoringPermissionsAddress);
  factoringPermissionsChangedEvent.block.timestamp = timestamp;
  factoringPermissionsChangedEvent.block.number = blockNum;

  handleFactoringPermissionsChangedV2_1(factoringPermissionsChangedEvent);

  poolPermissions = PoolPermissionsContractAddresses.load(MOCK_BULLA_FACTORING_ADDRESS.toHexString());
  assert.assertNotNull(poolPermissions);
  assert.bytesEquals(newFactoringPermissionsAddress, poolPermissions!.factoringPermissions);

  log.info("✅ should update factoring permissions on FactoringPermissionsChanged V2_1 event", []);

  // Test RedeemPermissionsChanged V2_1
  const newRedeemPermissionsAddress = ADDRESS_3;
  const redeemPermissionsChangedEvent = newRedeemPermissionsChangedEventV2_1(newRedeemPermissionsAddress);
  redeemPermissionsChangedEvent.block.timestamp = timestamp;
  redeemPermissionsChangedEvent.block.number = blockNum;

  handleRedeemPermissionsChangedV2_1(redeemPermissionsChangedEvent);

  poolPermissions = PoolPermissionsContractAddresses.load(MOCK_BULLA_FACTORING_ADDRESS.toHexString());
  assert.assertNotNull(poolPermissions);
  assert.bytesEquals(newRedeemPermissionsAddress, poolPermissions!.redeemPermissions);

  log.info("✅ should update redeem permissions on RedeemPermissionsChanged V2_1 event", []);

  afterEach();
});

// exporting for test coverage
export {
  handleClaimCreatedV1,
  handleDepositPermissionsChangedV0,
  handleDepositPermissionsChangedV1,
  handleDepositPermissionsChangedV2_1,
  handleFactoringPermissionsChangedV0,
  handleFactoringPermissionsChangedV1,
  handleFactoringPermissionsChangedV2_1,
  handleInvoiceFundedV1,
  handleInvoiceKickbackAmountSentV1,
  handleInvoicePaidV1,
  handleInvoiceUnfactoredV1,
  handleRedeemPermissionsChangedV2_1
};

