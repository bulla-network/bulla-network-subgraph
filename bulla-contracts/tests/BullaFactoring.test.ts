import { BigInt, log } from "@graphprotocol/graph-ts";
import { assert, test } from "matchstick-as/assembly/index";
import { InvoiceKickbackAmountSent as InvoiceKickbackAmountSentV2_1 } from "../generated/BullaFactoringV2_1/BullaFactoringV2_1";
import { InvoiceUnfactored as InvoiceUnfactoredV2_2 } from "../generated/BullaFactoringV2_2/BullaFactoringV2_2";
import {
  ClaimFactoringStatus,
  FactoringPool,
  FactoringPoolStats,
  FactoringPoolTotals,
  FactoringPricePerShare,
  FactoringStatisticsEntry,
  HistoricalFactoringStatistics,
  InvoiceFundedEvent as InvoiceFundedEventEntity,
  InvoiceReconciledEvent as InvoiceReconciledEventEntity,
  PnlHistoryEntry,
  PoolPermissionsContractAddresses,
  PoolPnl,
  PoolPosition,
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
  handleInvoiceApprovedV2_1,
  handleInvoiceFundedV1,
  handleInvoiceFundedV2_1,
  handleInvoiceImpairedV1,
  handleInvoiceImpairedV2_2,
  handleInvoiceKickbackAmountSentV1,
  handleInvoiceKickbackAmountSentV2_1,
  handleInvoicePaidV1,
  handleInvoicePaidV2_1,
  handleInvoiceUnfactoredV0,
  handleInvoiceUnfactoredV1,
  handleInvoiceUnfactoredV2_1,
  handleInvoiceUnfactoredV2_2,
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
  newInvoiceApprovedEventV2_1,
  newInvoiceFundedEventV1,
  newInvoiceFundedEventV2_1,
  newInvoiceImpairedEvent,
  newInvoiceImpairedEventV2_2,
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

test("it denormalizes pool capital state onto FactoringPool.currentStats", () => {
  setupContracts();

  const poolId = MOCK_BULLA_FACTORING_ADDRESS.toHexString();
  const timestamp1 = BigInt.fromI32(100);
  const blockNum1 = BigInt.fromI32(100);

  // Step 1: a Deposit creates the FactoringPool entity and writes the first
  // FactoringPoolStats snapshot (mocked default: 10000/5000/15000, ppx 1000000).
  const depositMadeEvent = newDepositMadeEvent(ADDRESS_2, BigInt.fromI32(10000), BigInt.fromI32(10000));
  depositMadeEvent.block.timestamp = timestamp1;
  depositMadeEvent.block.number = blockNum1;
  handleDepositV1(depositMadeEvent);

  const pool1 = FactoringPool.load(poolId);
  assert.assertNotNull(pool1);
  assert.stringEquals(poolId, pool1!.currentStats!);

  let stats = FactoringPoolStats.load(poolId);
  assert.assertNotNull(stats);
  assert.bigIntEquals(BigInt.fromI32(10000), stats!.fundBalance);
  assert.bigIntEquals(BigInt.fromI32(5000), stats!.deployedCapital);
  assert.bigIntEquals(BigInt.fromI32(15000), stats!.capitalAccount);
  assert.bigIntEquals(BigInt.fromI32(1000000), stats!.pricePerShare);
  assert.bigIntEquals(timestamp1, stats!.lastUpdatedTimestamp);
  assert.bigIntEquals(blockNum1, stats!.lastUpdatedBlock);

  // Step 2: a subsequent InvoiceFunded should overwrite the snapshot in
  // place (not create a new entity) and the pool's pointer is unchanged.
  updateFundInfoMock(BigInt.fromI32(20000), BigInt.fromI32(8000), BigInt.fromI32(28000));
  updatePricePerShareMock(BigInt.fromI32(1100000));

  const timestamp2 = timestamp1.plus(BigInt.fromI32(1));
  const blockNum2 = blockNum1.plus(BigInt.fromI32(1));

  const claimId = BigInt.fromI32(1);
  const claimCreatedEvent = newClaimCreatedEventV1(claimId.toU32(), CLAIM_TYPE_INVOICE);
  claimCreatedEvent.block.timestamp = timestamp2;
  claimCreatedEvent.block.number = blockNum2;
  handleClaimCreatedV1(claimCreatedEvent);

  const invoiceFundedEvent = newInvoiceFundedEventV1(claimId, BigInt.fromI32(5000), ADDRESS_1);
  invoiceFundedEvent.block.timestamp = timestamp2;
  invoiceFundedEvent.block.number = blockNum2;
  handleInvoiceFundedV1(invoiceFundedEvent);

  stats = FactoringPoolStats.load(poolId);
  assert.assertNotNull(stats);
  assert.bigIntEquals(BigInt.fromI32(20000), stats!.fundBalance);
  assert.bigIntEquals(BigInt.fromI32(8000), stats!.deployedCapital);
  assert.bigIntEquals(BigInt.fromI32(28000), stats!.capitalAccount);
  assert.bigIntEquals(BigInt.fromI32(1100000), stats!.pricePerShare);
  assert.bigIntEquals(timestamp2, stats!.lastUpdatedTimestamp);
  assert.bigIntEquals(blockNum2, stats!.lastUpdatedBlock);

  const pool2 = FactoringPool.load(poolId);
  assert.stringEquals(poolId, pool2!.currentStats!);

  afterEach();
});

test("it denormalizes per-investor PoolPosition on Deposit and Withdraw", () => {
  setupContracts();

  const poolAddr = MOCK_BULLA_FACTORING_ADDRESS.toHexString();
  const investor = ADDRESS_2;
  const investorId = investor.toHexString();
  const positionId = poolAddr + "-" + investorId;

  const t0 = BigInt.fromI32(100);
  const b0 = BigInt.fromI32(100);

  // Step 1: First deposit — 1000 assets for 1000 shares (ppx 1.0).
  const deposit1 = newDepositMadeEvent(investor, BigInt.fromI32(1000), BigInt.fromI32(1000));
  deposit1.block.timestamp = t0;
  deposit1.block.number = b0;
  handleDepositV1(deposit1);

  let position = PoolPosition.load(positionId);
  assert.assertNotNull(position);
  assert.stringEquals(poolAddr, position!.pool);
  assert.stringEquals(investorId, position!.investor);
  assert.bigIntEquals(BigInt.fromI32(1000), position!.shares);
  assert.bigIntEquals(BigInt.fromI32(1000), position!.costBasis);
  assert.bigIntEquals(BigInt.fromI32(1000), position!.totalDeposited);
  assert.bigIntEquals(BigInt.fromI32(0), position!.totalWithdrawn);
  assert.bigIntEquals(BigInt.fromI32(0), position!.realizedPnl);
  assert.bigIntEquals(t0, position!.firstDepositTimestamp);
  assert.bigIntEquals(b0, position!.firstDepositBlock);
  assert.bigIntEquals(t0, position!.lastUpdatedTimestamp);

  // Step 2: Second deposit — 500 assets for 500 shares. Cost basis stacks.
  const t1 = t0.plus(BigInt.fromI32(10));
  const b1 = b0.plus(BigInt.fromI32(10));
  const deposit2 = newDepositMadeEvent(investor, BigInt.fromI32(500), BigInt.fromI32(500));
  deposit2.block.timestamp = t1;
  deposit2.block.number = b1;
  handleDepositV1(deposit2);

  position = PoolPosition.load(positionId);
  assert.bigIntEquals(BigInt.fromI32(1500), position!.shares);
  assert.bigIntEquals(BigInt.fromI32(1500), position!.costBasis);
  assert.bigIntEquals(BigInt.fromI32(1500), position!.totalDeposited);
  // firstDepositTimestamp should NOT advance on subsequent deposits.
  assert.bigIntEquals(t0, position!.firstDepositTimestamp);
  assert.bigIntEquals(t1, position!.lastUpdatedTimestamp);

  // Step 3: Partial withdrawal — 500 shares burned for 600 assets received
  // (pool gained value; ppx now 1.2). Proportional basis removed:
  //   basisOut    = 1500 * 500 / 1500 = 500
  //   realizedPnl = 600 - 500         = +100
  const t2 = t1.plus(BigInt.fromI32(10));
  const b2 = b1.plus(BigInt.fromI32(10));
  const withdraw1 = newSharesRedeemedEvent(investor, BigInt.fromI32(600), BigInt.fromI32(500));
  withdraw1.block.timestamp = t2;
  withdraw1.block.number = b2;
  handleWithdrawV1(withdraw1);

  position = PoolPosition.load(positionId);
  assert.bigIntEquals(BigInt.fromI32(1000), position!.shares);
  assert.bigIntEquals(BigInt.fromI32(1000), position!.costBasis);
  assert.bigIntEquals(BigInt.fromI32(1500), position!.totalDeposited);
  assert.bigIntEquals(BigInt.fromI32(600), position!.totalWithdrawn);
  assert.bigIntEquals(BigInt.fromI32(100), position!.realizedPnl);
  assert.bigIntEquals(t2, position!.lastUpdatedTimestamp);

  // Step 4: Full withdrawal at a loss — 1000 shares burned for 900 assets.
  //   basisOut    = 1000 * 1000 / 1000 = 1000
  //   realizedPnl = 900 - 1000         = -100 (cumulative: +100 - 100 = 0)
  const t3 = t2.plus(BigInt.fromI32(10));
  const b3 = b2.plus(BigInt.fromI32(10));
  const withdraw2 = newSharesRedeemedEvent(investor, BigInt.fromI32(900), BigInt.fromI32(1000));
  withdraw2.block.timestamp = t3;
  withdraw2.block.number = b3;
  handleWithdrawV1(withdraw2);

  position = PoolPosition.load(positionId);
  assert.bigIntEquals(BigInt.fromI32(0), position!.shares);
  assert.bigIntEquals(BigInt.fromI32(0), position!.costBasis);
  assert.bigIntEquals(BigInt.fromI32(1500), position!.totalWithdrawn);
  assert.bigIntEquals(BigInt.fromI32(0), position!.realizedPnl);

  // A withdraw with no remaining shares is a defensive no-op.
  const withdraw3 = newSharesRedeemedEvent(investor, BigInt.fromI32(1), BigInt.fromI32(1));
  withdraw3.block.timestamp = t3.plus(BigInt.fromI32(1));
  withdraw3.block.number = b3.plus(BigInt.fromI32(1));
  handleWithdrawV1(withdraw3);

  position = PoolPosition.load(positionId);
  assert.bigIntEquals(BigInt.fromI32(0), position!.shares);
  assert.bigIntEquals(BigInt.fromI32(1500), position!.totalWithdrawn);

  afterEach();
});

test("it tracks PoolPosition per (pool, investor): different investors don't collide", () => {
  setupContracts();

  const poolAddr = MOCK_BULLA_FACTORING_ADDRESS.toHexString();
  const t0 = BigInt.fromI32(100);
  const b0 = BigInt.fromI32(100);

  const deposit1 = newDepositMadeEvent(ADDRESS_1, BigInt.fromI32(1000), BigInt.fromI32(1000));
  deposit1.block.timestamp = t0;
  deposit1.block.number = b0;
  handleDepositV1(deposit1);

  const deposit2 = newDepositMadeEvent(ADDRESS_2, BigInt.fromI32(2000), BigInt.fromI32(2000));
  deposit2.block.timestamp = t0;
  deposit2.block.number = b0;
  handleDepositV1(deposit2);

  const pos1 = PoolPosition.load(poolAddr + "-" + ADDRESS_1.toHexString());
  const pos2 = PoolPosition.load(poolAddr + "-" + ADDRESS_2.toHexString());
  assert.assertNotNull(pos1);
  assert.assertNotNull(pos2);
  assert.bigIntEquals(BigInt.fromI32(1000), pos1!.shares);
  assert.bigIntEquals(BigInt.fromI32(2000), pos2!.shares);

  afterEach();
});

// V2_2 routes through the same handlers (handleInvoiceFundedV2_2, etc.)
// via changetype to the V2_1 event types and delegates to the shared
// V2_1or2 handlers — the ABIs for Funded / Kickback / Paid / Approved are
// byte-identical between V2_1 and V2_2. So this test exercises both.
test("ClaimFactoringStatus: V2_1/V2_2 happy path Approved -> Funded -> Reconciled (kickback captured on Reconciled)", () => {
  setupContracts();

  const claimId = BigInt.fromI32(1);
  const claimEntityId = claimId.toString() + "-v2";
  const fundedAmount = BigInt.fromI32(10000);
  const originalCreditor = ADDRESS_1;
  const poolAddr = MOCK_BULLA_FACTORING_ADDRESS.toHexString();

  const t0 = BigInt.fromI32(100);
  const b0 = BigInt.fromI32(100);

  const claimCreated = newClaimCreatedEventV2(claimId.toU32(), CLAIM_TYPE_INVOICE);
  claimCreated.block.timestamp = t0;
  claimCreated.block.number = b0;
  handleClaimCreatedV2(claimCreated);

  // Approved
  const approved = newInvoiceApprovedEventV2_1(claimId, t0.plus(BigInt.fromI32(86400)), 800, 100, 9000, 50, 200);
  approved.block.timestamp = t0;
  approved.block.number = b0;
  handleInvoiceApprovedV2_1(approved);

  let status = ClaimFactoringStatus.load(claimEntityId);
  assert.assertNotNull(status);
  assert.stringEquals("Approved", status!.state);
  assert.stringEquals(claimEntityId, status!.claim);
  assert.stringEquals(poolAddr, status!.pool);
  assert.bigIntEquals(t0, status!.approvedAtTimestamp!);
  assert.i32Equals(800, status!.targetYieldBps!);
  assert.i32Equals(9000, status!.upfrontBps!);
  // Funding/resolution snapshots untouched.
  assert.assertTrue(status!.fundedAtTimestamp === null);
  assert.assertTrue(status!.resolvedAtTimestamp === null);
  // Target absolute amounts are only populated on Funded.
  assert.assertTrue(status!.targetInterest === null);
  assert.assertTrue(status!.targetAdminFee === null);
  assert.assertTrue(status!.targetProtocolFee === null);
  assert.assertTrue(status!.targetTax === null);

  // Funded
  const t1 = t0.plus(BigInt.fromI32(10));
  const b1 = b0.plus(BigInt.fromI32(10));
  const funded = newInvoiceFundedEventV2_1(claimId, fundedAmount, originalCreditor, t0.plus(BigInt.fromI32(86400)), BigInt.fromI32(9000), BigInt.fromI32(50));
  funded.block.timestamp = t1;
  funded.block.number = b1;
  handleInvoiceFundedV2_1(funded);

  status = ClaimFactoringStatus.load(claimEntityId);
  assert.stringEquals("Funded", status!.state);
  assert.bigIntEquals(t1, status!.fundedAtTimestamp!);
  assert.bigIntEquals(fundedAmount, status!.fundedAmount!);
  // Approval snapshot still preserved.
  assert.bigIntEquals(t0, status!.approvedAtTimestamp!);

  // Target absolute amounts mirror what was written onto the matching
  // InvoiceFundedEvent — same source values, no separate contract calls.
  const fundedEventIdV2 = getInvoiceFundedEventId(claimId, funded);
  const fundedEntityV2 = InvoiceFundedEventEntity.load(fundedEventIdV2)!;
  assert.bigIntEquals(fundedEntityV2.targetInterest, status!.targetInterest!);
  assert.bigIntEquals(fundedEntityV2.targetAdminFee, status!.targetAdminFee!);
  assert.bigIntEquals(fundedEntityV2.targetProtocolFee, status!.targetProtocolFee!);
  assert.bigIntEquals(fundedEntityV2.targetTax, status!.targetTax!);

  // Kickback fires in the same tx as the reconcile event on every contract
  // version (V1+: just before InvoicePaid; V0: inside the same batch
  // reconcile call as ActivePaidInvoicesReconciled). Lifecycle state
  // intentionally does NOT advance here — Funded is preserved until the
  // reconcile handler captures kickbackAmount on the Reconciled snapshot.
  const t2 = t1.plus(BigInt.fromI32(10));
  const b2 = b1.plus(BigInt.fromI32(10));
  const kickbackAmount = BigInt.fromI32(2000);
  const kickback = newInvoiceKickbackAmountSentEvent(claimId, kickbackAmount, originalCreditor);
  kickback.block.timestamp = t2;
  kickback.block.number = b2;
  // The V2_1 handler accepts the same event shape as V1; the kickback ABI didn't change.
  handleInvoiceKickbackAmountSentV2_1(changetype<InvoiceKickbackAmountSentV2_1>(kickback));

  status = ClaimFactoringStatus.load(claimEntityId);
  assert.stringEquals("Funded", status!.state);
  assert.assertTrue(status!.kickbackAmount === null);
  assert.assertTrue(status!.resolvedAtTimestamp === null);

  // Reconciled
  const t3 = t2.plus(BigInt.fromI32(10));
  const b3 = b2.plus(BigInt.fromI32(10));
  const trueInterest = BigInt.fromI32(1000);
  const trueAdminFee = BigInt.fromI32(500);
  const spreadAmount = BigInt.fromI32(150);
  const reconciled = newInvoicePaidEventV2_1(claimId, fundedAmount, kickbackAmount, originalCreditor, trueInterest, trueAdminFee, spreadAmount);
  reconciled.block.timestamp = t3;
  reconciled.block.number = b3;
  handleInvoicePaidV2_1(reconciled);

  status = ClaimFactoringStatus.load(claimEntityId);
  assert.stringEquals("Reconciled", status!.state);
  assert.bigIntEquals(trueInterest, status!.trueInterest!);
  assert.bigIntEquals(trueAdminFee, status!.trueAdminFee!);
  assert.bigIntEquals(spreadAmount, status!.trueSpreadAmount!);
  assert.bigIntEquals(t3, status!.resolvedAtTimestamp!);
  // Terminal-state lock is asserted in the V1 Impaired test below.

  afterEach();
});

// V1 happy path. Separate from V2_1 because handleInvoicePaidV1 reads
// different fields than V2_1+: ev.adminFee (not ev.trueAdminFee), no
// trueSpreadAmount, computes trueTax via calculateTax, no protocol-fee
// lookback via prior InvoiceFundedEvent. The V2_1+ path is delegated to
// handleInvoicePaidV2_1or2 with a different field-read shape, so V2_1
// coverage doesn't transit V1 code.
test("ClaimFactoringStatus: V1 Funded -> Reconciled writes V1-shaped reconcile snapshot (kickback bumps totals only)", () => {
  setupContracts();

  const claimId = BigInt.fromI32(1);
  const claimEntityId = claimId.toString() + "-v1";
  const fundedAmount = BigInt.fromI32(10000);
  const originalCreditor = ADDRESS_1;
  const poolAddr = MOCK_BULLA_FACTORING_ADDRESS.toHexString();

  const t0 = BigInt.fromI32(100);
  const b0 = BigInt.fromI32(100);

  const claimCreated = newClaimCreatedEventV1(claimId.toU32(), CLAIM_TYPE_INVOICE);
  claimCreated.block.timestamp = t0;
  claimCreated.block.number = b0;
  handleClaimCreatedV1(claimCreated);

  // Funded (V0/V1 have no InvoiceApproved subscription, so the entity is
  // born at the Funded step).
  const funded = newInvoiceFundedEventV1(claimId, fundedAmount, originalCreditor);
  funded.block.timestamp = t0;
  funded.block.number = b0;
  handleInvoiceFundedV1(funded);

  let status = ClaimFactoringStatus.load(claimEntityId);
  assert.assertNotNull(status);
  assert.stringEquals("Funded", status!.state);
  assert.stringEquals(poolAddr, status!.pool);
  // Approval snapshot stays null for V0/V1.
  assert.assertTrue(status!.approvedAtTimestamp === null);

  // Target absolute amounts mirror what was written onto the matching
  // InvoiceFundedEvent — same source values, no separate contract calls.
  const fundedEventIdV1 = getInvoiceFundedEventId(claimId, funded);
  const fundedEntityV1 = InvoiceFundedEventEntity.load(fundedEventIdV1)!;
  assert.bigIntEquals(fundedEntityV1.targetInterest, status!.targetInterest!);
  assert.bigIntEquals(fundedEntityV1.targetAdminFee, status!.targetAdminFee!);
  assert.bigIntEquals(fundedEntityV1.targetProtocolFee, status!.targetProtocolFee!);
  assert.bigIntEquals(fundedEntityV1.targetTax, status!.targetTax!);

  // Kickback fires (state stays Funded; kickback is captured on the
  // Reconciled snapshot below). The kickback handler still increments the
  // pool-level total.
  const t1 = t0.plus(BigInt.fromI32(10));
  const kickbackAmount = BigInt.fromI32(2000);
  const kickback = newInvoiceKickbackAmountSentEvent(claimId, kickbackAmount, originalCreditor);
  kickback.block.timestamp = t1;
  kickback.block.number = b0.plus(BigInt.fromI32(10));
  handleInvoiceKickbackAmountSentV1(kickback);

  status = ClaimFactoringStatus.load(claimEntityId);
  assert.stringEquals("Funded", status!.state);
  assert.assertTrue(status!.kickbackAmount === null);

  // Reconcile via V1 InvoicePaid (different fields: adminFee, trueProtocolFee
  // present in event payload, no trueSpreadAmount).
  const t2 = t1.plus(BigInt.fromI32(10));
  const trueInterest = BigInt.fromI32(1000);
  const trueAdminFee = BigInt.fromI32(500);
  const trueProtocolFee = BigInt.fromI32(250);
  const paid = newInvoicePaidEventV1(claimId, fundedAmount, kickbackAmount, originalCreditor, trueInterest, trueAdminFee, trueProtocolFee);
  paid.block.timestamp = t2;
  paid.block.number = b0.plus(BigInt.fromI32(20));
  handleInvoicePaidV1(paid);

  status = ClaimFactoringStatus.load(claimEntityId);
  assert.stringEquals("Reconciled", status!.state);
  assert.bigIntEquals(trueInterest, status!.trueInterest!);
  assert.bigIntEquals(trueAdminFee, status!.trueAdminFee!);   // V1 ev.adminFee landed here
  assert.bigIntEquals(trueProtocolFee, status!.trueProtocolFee!); // V1 ev.trueProtocolFee directly
  // V1 has no spread — should be zero, not null (it's set explicitly).
  assert.bigIntEquals(BigInt.fromI32(0), status!.trueSpreadAmount!);
  // trueTax is computed via calculateTax (depends on the taxBps mock = 500).
  assert.assertTrue(status!.trueTax !== null);
  assert.bigIntEquals(kickbackAmount, status!.kickbackAmount!);
  assert.bigIntEquals(t2, status!.resolvedAtTimestamp!);

  afterEach();
});

test("ClaimFactoringStatus: V0/V1 path with no Approved event leaves approval snapshot null", () => {
  setupContracts();

  const claimId = BigInt.fromI32(1);
  const claimEntityId = claimId.toString() + "-v1";
  const fundedAmount = BigInt.fromI32(10000);
  const originalCreditor = ADDRESS_1;

  const t0 = BigInt.fromI32(100);
  const b0 = BigInt.fromI32(100);

  const claimCreated = newClaimCreatedEventV1(claimId.toU32(), CLAIM_TYPE_INVOICE);
  claimCreated.block.timestamp = t0;
  claimCreated.block.number = b0;
  handleClaimCreatedV1(claimCreated);

  // Funded directly (no Approved event in V0/V1).
  const funded = newInvoiceFundedEventV1(claimId, fundedAmount, originalCreditor);
  funded.block.timestamp = t0;
  funded.block.number = b0;
  handleInvoiceFundedV1(funded);

  const status = ClaimFactoringStatus.load(claimEntityId);
  assert.assertNotNull(status);
  assert.stringEquals("Funded", status!.state);
  assert.bigIntEquals(fundedAmount, status!.fundedAmount!);
  // Approval snapshot must be null.
  assert.assertTrue(status!.approvedAtTimestamp === null);
  assert.assertTrue(status!.validUntil === null);

  afterEach();
});

// Tests the actual V2_2 on-chain flow where an impaired invoice can be
// pool-owner-unfactored: V2_2's unfactorInvoice() permits the pool owner
// to take back an impaired invoice and emits InvoiceUnfactored with
// `unfactoredByOwner=true`. V0/V1 contracts don't allow this transition
// (only the original creditor can unfactor there, and the original
// creditor has no incentive to do so on an impaired invoice), so this
// scenario is V2_2-specific.
test("ClaimFactoringStatus: V2_2 pool-owner-unfactor of an impaired invoice transitions Impaired -> Unfactored", () => {
  setupContracts();

  const claimId = BigInt.fromI32(1);
  const claimEntityId = claimId.toString() + "-v2";
  const originalCreditor = ADDRESS_1;

  const t0 = BigInt.fromI32(100);
  const b0 = BigInt.fromI32(100);

  const claimCreated = newClaimCreatedEventV2(claimId.toU32(), CLAIM_TYPE_INVOICE);
  claimCreated.block.timestamp = t0;
  claimCreated.block.number = b0;
  handleClaimCreatedV2(claimCreated);

  // Fund via V2_1 handler — V2_2 delegates to the shared V2_1or2 handler
  // for funding, and the ABI shape is identical.
  const funded = newInvoiceFundedEventV2_1(claimId, BigInt.fromI32(10000), originalCreditor, t0.plus(BigInt.fromI32(86400)), BigInt.fromI32(9000), BigInt.fromI32(50));
  funded.block.timestamp = t0;
  funded.block.number = b0;
  handleInvoiceFundedV2_1(funded);

  // V2_2 InvoiceImpaired (new 4-field shape).
  const t1 = t0.plus(BigInt.fromI32(86400));
  const outstandingBalance = BigInt.fromI32(8000);
  const impairmentGrossGain = BigInt.fromI32(800);
  const impairmentNetGain = BigInt.fromI32(600);
  const impaired = newInvoiceImpairedEventV2_2(claimId, outstandingBalance, impairmentGrossGain, impairmentNetGain);
  impaired.block.timestamp = t1;
  impaired.block.number = b0.plus(BigInt.fromI32(100));
  handleInvoiceImpairedV2_2(impaired);

  let status = ClaimFactoringStatus.load(claimEntityId);
  assert.stringEquals("Impaired", status!.state);
  assert.bigIntEquals(outstandingBalance, status!.impairLossAmount!);
  assert.bigIntEquals(t1, status!.resolvedAtTimestamp!);

  // V2_2 pool-owner unfactor of the impaired invoice. The fixture sets
  // unfactoredByOwner=true to model the real on-chain flag.
  const t2 = t1.plus(BigInt.fromI32(10));
  const refundAmount = BigInt.fromI32(5000);
  const unfactored = newInvoiceUnfactoredEventV2_1(
    claimId,
    originalCreditor,
    refundAmount,
    BigInt.fromI32(100), // interestToCharge
    BigInt.fromI32(50),  // adminFee
    BigInt.fromI32(25),  // spreadAmount
    true,                // unfactoredByOwner
  );
  unfactored.block.timestamp = t2;
  unfactored.block.number = b0.plus(BigInt.fromI32(200));
  handleInvoiceUnfactoredV2_2(changetype<InvoiceUnfactoredV2_2>(unfactored));

  status = ClaimFactoringStatus.load(claimEntityId);
  assert.stringEquals("Unfactored", status!.state);
  assert.bigIntEquals(refundAmount, status!.unfactoredRefundAmount!);
  assert.booleanEquals(true, status!.unfactoredByPoolOwner!);
  assert.bigIntEquals(t2, status!.resolvedAtTimestamp!);
  // The earlier impairment snapshot fields are preserved on transition —
  // we don't clear them, so consumers can still see the historical context.
  assert.bigIntEquals(outstandingBalance, status!.impairLossAmount!);

  afterEach();
});

test("ClaimFactoringStatus: Unfactored populates refund and byPoolOwner flag", () => {
  setupContracts();

  const claimId = BigInt.fromI32(1);
  const claimEntityId = claimId.toString() + "-v1";
  const originalCreditor = ADDRESS_1;
  const refundAmount = BigInt.fromI32(7500);

  const t0 = BigInt.fromI32(100);
  const b0 = BigInt.fromI32(100);

  const claimCreated = newClaimCreatedEventV1(claimId.toU32(), CLAIM_TYPE_INVOICE);
  claimCreated.block.timestamp = t0;
  claimCreated.block.number = b0;
  handleClaimCreatedV1(claimCreated);

  const funded = newInvoiceFundedEventV1(claimId, BigInt.fromI32(10000), originalCreditor);
  funded.block.timestamp = t0;
  funded.block.number = b0;
  handleInvoiceFundedV1(funded);

  const t1 = t0.plus(BigInt.fromI32(86400));
  const unfactored = newInvoiceUnfactoredEventV1(claimId, originalCreditor, refundAmount, BigInt.fromI32(150));
  unfactored.block.timestamp = t1;
  unfactored.block.number = b0.plus(BigInt.fromI32(100));
  handleInvoiceUnfactoredV1(unfactored);

  const status = ClaimFactoringStatus.load(claimEntityId);
  assert.stringEquals("Unfactored", status!.state);
  assert.bigIntEquals(refundAmount, status!.unfactoredRefundAmount!);
  // V1 doesn't carry the byPoolOwner flag — defaults to false.
  assert.booleanEquals(false, status!.unfactoredByPoolOwner!);
  assert.bigIntEquals(t1, status!.resolvedAtTimestamp!);

  afterEach();
});

test("ClaimFactoringStatus + FactoringPoolTotals: V2_2 InvoiceImpaired maps new event shape", () => {
  setupContracts();

  const claimId = BigInt.fromI32(1);
  const claimEntityId = claimId.toString() + "-v2";
  const poolAddr = MOCK_BULLA_FACTORING_ADDRESS.toHexString();

  const t0 = BigInt.fromI32(100);
  const b0 = BigInt.fromI32(100);

  const claimCreated = newClaimCreatedEventV2(claimId.toU32(), CLAIM_TYPE_INVOICE);
  claimCreated.block.timestamp = t0;
  claimCreated.block.number = b0;
  handleClaimCreatedV2(claimCreated);

  // Deposit to materialize the FactoringPool entity so the late-link path
  // for FactoringPoolTotals fires.
  const deposit = newDepositMadeEventV2_1(ADDRESS_2, BigInt.fromI32(100000), BigInt.fromI32(100000));
  deposit.block.timestamp = t0;
  deposit.block.number = b0;
  handleDepositV2_1(deposit);

  // Fund first so the impair has something meaningful to write down.
  const t1 = t0.plus(BigInt.fromI32(10));
  const funded = newInvoiceFundedEventV2_1(claimId, BigInt.fromI32(10000), ADDRESS_1, t0.plus(BigInt.fromI32(86400)), BigInt.fromI32(9000), BigInt.fromI32(50));
  funded.block.timestamp = t1;
  funded.block.number = b0.plus(BigInt.fromI32(10));
  handleInvoiceFundedV2_1(funded);

  // V2_2 InvoiceImpaired: (invoiceId, outstandingBalance, impairmentGrossGain, impairmentNetGain).
  const t2 = t1.plus(BigInt.fromI32(86400));
  const outstandingBalance = BigInt.fromI32(8000);
  const impairmentGrossGain = BigInt.fromI32(800);
  const impairmentNetGain = BigInt.fromI32(600);
  const impaired = newInvoiceImpairedEventV2_2(claimId, outstandingBalance, impairmentGrossGain, impairmentNetGain);
  impaired.block.timestamp = t2;
  impaired.block.number = b0.plus(BigInt.fromI32(100));
  handleInvoiceImpairedV2_2(impaired);

  // ClaimFactoringStatus: outstandingBalance -> impairLossAmount,
  // impairmentNetGain -> impairGainAmount. impairmentGrossGain is lost
  // (not currently surfaced in the schema).
  const status = ClaimFactoringStatus.load(claimEntityId);
  assert.assertNotNull(status);
  assert.stringEquals("Impaired", status!.state);
  assert.bigIntEquals(outstandingBalance, status!.impairLossAmount!);
  assert.bigIntEquals(impairmentNetGain, status!.impairGainAmount!);
  assert.bigIntEquals(t2, status!.resolvedAtTimestamp!);

  // FactoringPoolTotals: impair counter + impairmentNetGain accumulated
  // (matches the V0/V1 convention of using the "gain side").
  const totals = FactoringPoolTotals.load(poolAddr);
  assert.assertNotNull(totals);
  assert.bigIntEquals(BigInt.fromI32(1), totals!.totalInvoicesImpaired);
  assert.bigIntEquals(impairmentNetGain, totals!.totalImpairedAmount);
  // Funded counter unchanged by impairment.
  assert.bigIntEquals(BigInt.fromI32(1), totals!.totalInvoicesFunded);

  afterEach();
});

test("FactoringPoolTotals: fund -> kickback -> reconcile advances counters and totals", () => {
  setupContracts();

  const poolAddr = MOCK_BULLA_FACTORING_ADDRESS.toHexString();
  const originalCreditor = ADDRESS_1;
  const t0 = BigInt.fromI32(100);
  const b0 = BigInt.fromI32(100);

  // Funding 1
  const claim1 = BigInt.fromI32(1);
  const fundedAmount1 = BigInt.fromI32(10000);
  const claimCreated1 = newClaimCreatedEventV1(claim1.toU32(), CLAIM_TYPE_INVOICE);
  claimCreated1.block.timestamp = t0;
  claimCreated1.block.number = b0;
  handleClaimCreatedV1(claimCreated1);

  const funded1 = newInvoiceFundedEventV1(claim1, fundedAmount1, originalCreditor);
  funded1.block.timestamp = t0;
  funded1.block.number = b0;
  handleInvoiceFundedV1(funded1);

  let totals = FactoringPoolTotals.load(poolAddr);
  assert.assertNotNull(totals);
  assert.bigIntEquals(fundedAmount1, totals!.totalAssetsFunded);
  assert.bigIntEquals(BigInt.fromI32(1), totals!.totalInvoicesFunded);
  assert.bigIntEquals(BigInt.fromI32(0), totals!.totalInvoicesReconciled);
  assert.bigIntEquals(BigInt.fromI32(0), totals!.totalKickbackPaid);
  assert.bigIntEquals(t0, totals!.lastFundedAtTimestamp!);
  // Pool should be linked to the totals entity.
  const pool1 = FactoringPool.load(poolAddr);
  // (FactoringPool may not exist yet — only created on Deposit. Trigger a
  // deposit so the late-link path runs.)
  if (pool1 === null) {
    const deposit = newDepositMadeEvent(ADDRESS_2, BigInt.fromI32(50000), BigInt.fromI32(50000));
    deposit.block.timestamp = t0;
    deposit.block.number = b0;
    handleDepositV1(deposit);
  }
  const linkedPool = FactoringPool.load(poolAddr);
  assert.stringEquals(poolAddr, linkedPool!.currentTotals!);

  // Funding 2 — totals stack.
  const t1 = t0.plus(BigInt.fromI32(10));
  const b1 = b0.plus(BigInt.fromI32(10));
  const claim2 = BigInt.fromI32(2);
  const fundedAmount2 = BigInt.fromI32(7500);
  const claimCreated2 = newClaimCreatedEventV1(claim2.toU32(), CLAIM_TYPE_INVOICE);
  claimCreated2.block.timestamp = t1;
  claimCreated2.block.number = b1;
  handleClaimCreatedV1(claimCreated2);

  const funded2 = newInvoiceFundedEventV1(claim2, fundedAmount2, originalCreditor);
  funded2.block.timestamp = t1;
  funded2.block.number = b1;
  handleInvoiceFundedV1(funded2);

  totals = FactoringPoolTotals.load(poolAddr);
  assert.bigIntEquals(fundedAmount1.plus(fundedAmount2), totals!.totalAssetsFunded);
  assert.bigIntEquals(BigInt.fromI32(2), totals!.totalInvoicesFunded);
  assert.bigIntEquals(t1, totals!.lastFundedAtTimestamp!);

  // Kickback on claim 1.
  const t2 = t1.plus(BigInt.fromI32(10));
  const kickbackAmount = BigInt.fromI32(2000);
  const kickback = newInvoiceKickbackAmountSentEvent(claim1, kickbackAmount, originalCreditor);
  kickback.block.timestamp = t2;
  kickback.block.number = b1.plus(BigInt.fromI32(10));
  handleInvoiceKickbackAmountSentV1(kickback);

  totals = FactoringPoolTotals.load(poolAddr);
  assert.bigIntEquals(kickbackAmount, totals!.totalKickbackPaid);
  assert.bigIntEquals(BigInt.fromI32(2), totals!.totalInvoicesFunded); // unchanged

  // Reconcile claim 1.
  const t3 = t2.plus(BigInt.fromI32(10));
  const trueInterest = BigInt.fromI32(1000);
  const trueAdminFee = BigInt.fromI32(500);
  const trueProtocolFee = BigInt.fromI32(250);
  const paid = newInvoicePaidEventV1(claim1, fundedAmount1, kickbackAmount, originalCreditor, trueInterest, trueAdminFee, trueProtocolFee);
  paid.block.timestamp = t3;
  paid.block.number = b1.plus(BigInt.fromI32(20));
  handleInvoicePaidV1(paid);

  totals = FactoringPoolTotals.load(poolAddr);
  assert.bigIntEquals(BigInt.fromI32(1), totals!.totalInvoicesReconciled);
  assert.bigIntEquals(trueInterest, totals!.totalRealizedInterest);
  // Funded counter unchanged by reconcile.
  assert.bigIntEquals(BigInt.fromI32(2), totals!.totalInvoicesFunded);

  // lastFundedAtTimestamp should not have moved during kickback/reconcile.
  assert.bigIntEquals(t1, totals!.lastFundedAtTimestamp!);

  afterEach();
});

test("FactoringPoolTotals: impairment advances impaired counter and impaired amount", () => {
  setupContracts();

  const poolAddr = MOCK_BULLA_FACTORING_ADDRESS.toHexString();
  const originalCreditor = ADDRESS_1;
  const t0 = BigInt.fromI32(100);
  const b0 = BigInt.fromI32(100);

  // Fund first so we have something to impair.
  const claimId = BigInt.fromI32(1);
  const fundedAmount = BigInt.fromI32(10000);
  const claimCreated = newClaimCreatedEventV1(claimId.toU32(), CLAIM_TYPE_INVOICE);
  claimCreated.block.timestamp = t0;
  claimCreated.block.number = b0;
  handleClaimCreatedV1(claimCreated);

  const funded = newInvoiceFundedEventV1(claimId, fundedAmount, originalCreditor);
  funded.block.timestamp = t0;
  funded.block.number = b0;
  handleInvoiceFundedV1(funded);

  let totals = FactoringPoolTotals.load(poolAddr);
  assert.bigIntEquals(BigInt.fromI32(0), totals!.totalInvoicesImpaired);
  assert.bigIntEquals(BigInt.fromI32(0), totals!.totalImpairedAmount);

  // Impair.
  const t1 = t0.plus(BigInt.fromI32(86400));
  const lossAmount = BigInt.fromI32(8000);
  const gainAmount = BigInt.fromI32(500);
  const impaired = newInvoiceImpairedEvent(claimId, lossAmount, gainAmount);
  impaired.block.timestamp = t1;
  impaired.block.number = b0.plus(BigInt.fromI32(100));
  handleInvoiceImpairedV1(impaired);

  totals = FactoringPoolTotals.load(poolAddr);
  assert.bigIntEquals(BigInt.fromI32(1), totals!.totalInvoicesImpaired);
  // The mapping uses ev.gainAmount as the InvoiceImpairedEvent.impairAmount,
  // so the totals match that convention.
  assert.bigIntEquals(gainAmount, totals!.totalImpairedAmount);
  // Funded counter preserved; reconciled counter untouched.
  assert.bigIntEquals(BigInt.fromI32(1), totals!.totalInvoicesFunded);
  assert.bigIntEquals(BigInt.fromI32(0), totals!.totalInvoicesReconciled);

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

