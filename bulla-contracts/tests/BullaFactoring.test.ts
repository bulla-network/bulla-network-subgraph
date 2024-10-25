import { BigInt, log } from "@graphprotocol/graph-ts";
import { assert, test } from "matchstick-as/assembly/index";
import {
  DepositMadeEvent,
  FactoringPricePerShare,
  FactoringStatisticsEntry,
  HistoricalFactoringStatistics,
  PnlHistoryEntry,
  PoolPnl,
  PriceHistoryEntry,
  SharesRedeemedEvent,
  User
} from "../generated/schema";
import {
  getDepositMadeEventId,
  getInvoiceFundedEventId,
  getInvoiceImpairedEventId,
  getInvoiceKickbackAmountSentEventId,
  getInvoiceReconciledEventId,
  getInvoiceUnfactoredEventId,
  getSharesRedeemedEventId
} from "../src/functions/BullaFactoring";
import { CLAIM_TYPE_INVOICE } from "../src/functions/common";
import { handleClaimCreated } from "../src/mappings/BullaClaimERC721";
import {
  handleActivePaidInvoicesReconciledV2,
  handleDepositMadeWithAttachmentV2,
  handleDepositV2,
  handleInvoiceFundedV2,
  handleInvoiceImpairedV2,
  handleInvoiceKickbackAmountSentV2,
  handleInvoicePaidV2,
  handleInvoiceUnfactoredV1,
  handleInvoiceUnfactoredV2,
  handleSharesRedeemedWithAttachmentV2,
  handleWithdraw
} from "../src/mappings/BullaFactoring";
import { newClaimCreatedEvent } from "./functions/BullaClaimERC721.testtools";
import {
  newActivePaidInvoicesReconciledEvent,
  newDepositMadeEvent,
  newDepositMadeWithAttachmentEvent,
  newInvoiceFundedEvent,
  newInvoiceImpairedEvent,
  newInvoiceKickbackAmountSentEvent,
  newInvoicePaidEvent,
  newInvoiceUnfactoredEvent,
  newInvoiceUnfactoredEventV1,
  newSharesRedeemedEvent,
  newSharesRedeemedWithAttachmentEvent
} from "./functions/BullaFactoring.testtools";
import {
  ADDRESS_1,
  ADDRESS_2,
  ADDRESS_3,
  IPFS_HASH,
  MOCK_BULLA_FACTORING_ADDRESS,
  afterEach,
  setupContracts,
  updateFundInfoMock,
  updatePricePerShareMock
} from "./helpers";

test("it handles BullaFactoring v2 events and stores historical factoring statistics", () => {
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

  const invoiceFundedEvent2 = newInvoiceFundedEvent(claimId2, fundedAmount, originalCreditor);
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

  const claimCreatedEvent = newClaimCreatedEvent(claimId.toU32(), CLAIM_TYPE_INVOICE);
  claimCreatedEvent.block.timestamp = timestamp;
  claimCreatedEvent.block.number = blockNum;

  handleClaimCreated(claimCreatedEvent);

  const invoiceFundedEvent = newInvoiceFundedEvent(claimId, fundedAmount, originalCreditor);
  invoiceFundedEvent.block.timestamp = timestamp;
  invoiceFundedEvent.block.number = blockNum;

  handleInvoiceFundedV2(invoiceFundedEvent);

  const invoiceFundedEventId = getInvoiceFundedEventId(claimId, invoiceFundedEvent);
  assert.fieldEquals("InvoiceFundedEvent", invoiceFundedEventId, "invoiceId", invoiceFundedEvent.params.invoiceId.toString());
  assert.fieldEquals("InvoiceFundedEvent", invoiceFundedEventId, "fundedAmount", invoiceFundedEvent.params.fundedAmount.toString());
  assert.fieldEquals("InvoiceFundedEvent", invoiceFundedEventId, "upfrontBps", "10000");
  assert.fieldEquals("InvoiceFundedEvent", invoiceFundedEventId, "originalCreditor", invoiceFundedEvent.params.originalCreditor.toHexString());
  assert.fieldEquals("InvoiceFundedEvent", invoiceFundedEventId, "poolAddress", MOCK_BULLA_FACTORING_ADDRESS.toHexString());
  assert.fieldEquals("InvoiceFundedEvent", invoiceFundedEventId, "claim", claimId.toString());

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

  handleInvoiceUnfactoredV2(invoiceUnfactoredEvent);

  const invoiceUnfactoredEventId = getInvoiceUnfactoredEventId(claimId, invoiceUnfactoredEvent);
  assert.fieldEquals("InvoiceUnfactoredEvent", invoiceUnfactoredEventId, "invoiceId", invoiceUnfactoredEvent.params.invoiceId.toString());
  assert.fieldEquals("InvoiceUnfactoredEvent", invoiceUnfactoredEventId, "originalCreditor", invoiceUnfactoredEvent.params.originalCreditor.toHexString());
  assert.fieldEquals("InvoiceUnfactoredEvent", invoiceUnfactoredEventId, "totalRefundAmount", invoiceUnfactoredEvent.params.totalRefundOrPaymentAmount.toString());
  assert.fieldEquals("InvoiceUnfactoredEvent", invoiceUnfactoredEventId, "interestToCharge", invoiceUnfactoredEvent.params.interestToCharge.toString());
  assert.fieldEquals("InvoiceUnfactoredEvent", invoiceUnfactoredEventId, "poolAddress", MOCK_BULLA_FACTORING_ADDRESS.toHexString());
  assert.fieldEquals("InvoiceUnfactoredEvent", invoiceUnfactoredEventId, "claim", claimId.toString());

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
  assert.fieldEquals("InvoiceUnfactoredEvent", invoiceUnfactoredEventV1Id, "claim", claimId.toString());

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

  // Check that ipfsHash is not set
  const depositMadeEventEntity = DepositMadeEvent.load(depositMadeEventId);
  const hasNoIpfsHashForDepositMade = depositMadeEventEntity !== null && depositMadeEventEntity.ipfsHash === null;
  assert.assertTrue(hasNoIpfsHashForDepositMade);

  log.info("✅ ipfsHash is not set for DepositMadeEvent", []);

  const depositMadeWithAttachmentEvent = newDepositMadeWithAttachmentEvent(depositor, assets, shares);
  depositMadeWithAttachmentEvent.block.timestamp = timestamp;
  depositMadeWithAttachmentEvent.block.number = blockNum;
  depositMadeWithAttachmentEvent.logIndex = depositMadeEvent.logIndex.plus(BigInt.fromI32(1));

  handleDepositMadeWithAttachmentV2(depositMadeWithAttachmentEvent);

  assert.fieldEquals("DepositMadeEvent", depositMadeEventId, "ipfsHash", IPFS_HASH);

  log.info("✅ should attach IPFS hash to DepositMade event", []);

  const redeemer = ADDRESS_3;

  const sharesRedeemedEvent = newSharesRedeemedEvent(redeemer, shares, assets);
  sharesRedeemedEvent.block.timestamp = timestamp;
  sharesRedeemedEvent.block.number = blockNum;

  handleWithdraw(sharesRedeemedEvent);

  const sharesRedeemedEventId = getSharesRedeemedEventId(sharesRedeemedEvent, null);
  assert.fieldEquals("SharesRedeemedEvent", sharesRedeemedEventId, "redeemer", sharesRedeemedEvent.params.receiver.toHexString());
  assert.fieldEquals("SharesRedeemedEvent", sharesRedeemedEventId, "shares", sharesRedeemedEvent.params.shares.toString());
  assert.fieldEquals("SharesRedeemedEvent", sharesRedeemedEventId, "assets", sharesRedeemedEvent.params.assets.toString());
  assert.fieldEquals("SharesRedeemedEvent", sharesRedeemedEventId, "poolAddress", MOCK_BULLA_FACTORING_ADDRESS.toHexString());

  log.info("✅ should create a SharesRedeemed event", []);

  // Check that ipfsHash is not set
  const sharesRedeemedEventEntity = SharesRedeemedEvent.load(sharesRedeemedEventId);
  const hasNoIpfsHashForSharesRedeemed = sharesRedeemedEventEntity !== null && sharesRedeemedEventEntity.ipfsHash === null;
  assert.assertTrue(hasNoIpfsHashForSharesRedeemed);

  log.info("✅ ipfsHash is not set for SharesRedeemed Event", []);

  const sharesRedeemedWithAttachmentEvent = newSharesRedeemedWithAttachmentEvent(redeemer, shares, assets);
  sharesRedeemedWithAttachmentEvent.block.timestamp = timestamp;
  sharesRedeemedWithAttachmentEvent.block.number = blockNum;
  sharesRedeemedWithAttachmentEvent.logIndex = depositMadeEvent.logIndex.plus(BigInt.fromI32(1));

  handleSharesRedeemedWithAttachmentV2(sharesRedeemedWithAttachmentEvent);

  assert.fieldEquals("SharesRedeemedEvent", sharesRedeemedEventId, "ipfsHash", IPFS_HASH);

  log.info("✅ should attach IPFS hash to SharesRedeemed event", []);

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
  assert.fieldEquals("InvoiceImpairedEvent", invoiceImpairedEventId, "claim", claimId.toString());

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

  const claimCreatedEvent = newClaimCreatedEvent(claimId.toU32(), CLAIM_TYPE_INVOICE);
  claimCreatedEvent.block.timestamp = timestamp;
  claimCreatedEvent.block.number = blockNum;

  handleClaimCreated(claimCreatedEvent);

  const kickbackAmount = BigInt.fromI32(2000);
  const trueInterest = BigInt.fromI32(1000);
  const trueAdminFee = BigInt.fromI32(1000);
  const trueProtocolFee = BigInt.fromI32(1000);

  const invoicePaidEvent = newInvoicePaidEvent(claimId, fundedAmount, kickbackAmount, originalCreditor, trueInterest, trueAdminFee, trueProtocolFee);

  handleInvoicePaidV2(invoicePaidEvent);

  let poolPnl = PoolPnl.load(MOCK_BULLA_FACTORING_ADDRESS.toHexString());
  assert.assertNotNull(poolPnl);

  const pnlHistoryEntryId = poolPnl!.pnlHistory[0];
  const pnlHistoryEntry = PnlHistoryEntry.load(pnlHistoryEntryId);
  assert.assertNotNull(pnlHistoryEntry);
  assert.bigIntEquals(trueInterest, pnlHistoryEntry!.pnl);

  const invoiceReconciledEventId = getInvoiceReconciledEventId(claimId, invoicePaidEvent);
  assert.fieldEquals("InvoicePaidEvent", invoiceReconciledEventId, "invoiceId", invoicePaidEvent.params.invoiceId.toString());
  assert.fieldEquals("InvoicePaidEvent", invoiceReconciledEventId, "trueInterest", invoicePaidEvent.params.trueInterest.toString());
  assert.fieldEquals("InvoicePaidEvent", invoiceReconciledEventId, "trueAdminFee", invoicePaidEvent.params.adminFee.toString());
  assert.fieldEquals("InvoicePaidEvent", invoiceReconciledEventId, "trueProtocolFee", invoicePaidEvent.params.trueProtocolFee.toString());
  assert.fieldEquals("InvoicePaidEvent", invoiceReconciledEventId, "poolAddress", MOCK_BULLA_FACTORING_ADDRESS.toHexString());
  assert.fieldEquals("InvoicePaidEvent", invoiceReconciledEventId, "claim", claimId.toString());

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

  const invoiceFundedEvent2 = newInvoiceFundedEvent(claimId2, fundedAmount, originalCreditor);

  handleInvoiceFundedV2(invoiceFundedEvent2);

  factoringPrice = FactoringPricePerShare.load(MOCK_BULLA_FACTORING_ADDRESS.toHexString());

  assert.assertNotNull(factoringPrice);
  assert.i32Equals(2, factoringPrice!.priceHistory.length);

  const newHistoryEntryId = factoringPrice!.priceHistory[1];
  const newPriceHistoryEntry = PriceHistoryEntry.load(newHistoryEntryId);
  assert.assertNotNull(newPriceHistoryEntry);
  assert.bigIntEquals(BigInt.fromI32(1100000), newPriceHistoryEntry!.price);
});

test("it handles active paid invoice event", () => {
  setupContracts();

  const claimId1 = BigInt.fromI32(1);
  const claimId2 = BigInt.fromI32(2);

  const timestamp = BigInt.fromI32(100);
  const blockNum = BigInt.fromI32(100);

  const claimCreatedEvent1 = newClaimCreatedEvent(claimId1.toU32(), CLAIM_TYPE_INVOICE);
  claimCreatedEvent1.block.timestamp = timestamp;
  claimCreatedEvent1.block.number = blockNum;
  handleClaimCreated(claimCreatedEvent1);

  const claimCreatedEvent2 = newClaimCreatedEvent(claimId2.toU32(), CLAIM_TYPE_INVOICE);
  claimCreatedEvent2.block.timestamp = timestamp;
  claimCreatedEvent2.block.number = blockNum;
  handleClaimCreated(claimCreatedEvent2);

  const originalCreditorAddress = ADDRESS_1;
  const user = new User(originalCreditorAddress.toHexString().toLowerCase());
  user.address = originalCreditorAddress;
  user.claims = [];
  user.instantPayments = [];
  user.financeEvents = [];
  user.frendLendEvents = [];
  user.factoringEvents = [];
  user.save();

  const activePaidInvoiceReconciled = newActivePaidInvoicesReconciledEvent([claimId1, claimId2]);
  activePaidInvoiceReconciled.block.timestamp = timestamp;
  activePaidInvoiceReconciled.block.number = blockNum;

  handleActivePaidInvoicesReconciledV2(activePaidInvoiceReconciled);

  const updatedUser = User.load(originalCreditorAddress.toHexString().toLowerCase());
  assert.assertNotNull(updatedUser);

  assert.i32Equals(updatedUser!.factoringEvents.length, 2);
});

// exporting for test coverage
export {
  handleActivePaidInvoicesReconciledV2, handleClaimCreated, handleInvoiceFundedV2, handleInvoiceKickbackAmountSentV2, handleInvoicePaidV2, handleInvoiceUnfactoredV2
};

