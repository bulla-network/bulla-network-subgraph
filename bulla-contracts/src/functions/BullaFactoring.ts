import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { BullaFactoringV0, ActivePaidInvoicesReconciled, DepositMade, InvoiceUnfactored as InvoiceUnfactoredV0, SharesRedeemed } from "../../generated/BullaFactoringV0/BullaFactoringV0";
import {
  BullaFactoringV1,
  Deposit as DepositV1,
  InvoiceFunded as InvoiceFundedV1,
  InvoiceImpaired as InvoiceImpairedV1,
  InvoiceKickbackAmountSent as InvoiceKickbackAmountSentV1,
  InvoicePaid as InvoicePaidV1,
  InvoiceUnfactored as InvoiceUnfactoredV1,
  Withdraw as WithdrawV1,
} from "../../generated/BullaFactoringV1/BullaFactoringV1";
import {
  BullaFactoringV2_1,
  InvoiceApproved as InvoiceApprovedV2_1,
  InvoiceFunded as InvoiceFundedV2_1,
  InvoicePaid as InvoicePaidV2_1,
  InvoiceUnfactored as InvoiceUnfactoredV2_1,
} from "../../generated/BullaFactoringV2_1/BullaFactoringV2_1";
import {
  BullaFactoringV2_2,
  InvoiceApproved as InvoiceApprovedV2_2,
  InvoiceFunded as InvoiceFundedV2_2,
  InvoiceImpaired as InvoiceImpairedV2_2,
  InvoicePaid as InvoicePaidV2_2,
  InvoiceUnfactored as InvoiceUnfactoredV2_2,
} from "../../generated/BullaFactoringV2_2/BullaFactoringV2_2";
import {
  ClaimFactoringStatus,
  DepositMadeEvent,
  FactoringPool,
  FactoringPoolStats,
  FactoringPoolTotals,
  InvoiceApprovedEvent,
  InvoiceFundedEvent,
  InvoiceImpairedEvent,
  InvoiceKickbackAmountSentEvent,
  InvoiceReconciledEvent,
  InvoiceUnfactoredEvent,
  PoolPermissionsContractAddresses,
  PoolPosition,
  SharesRedeemedEvent,
} from "../../generated/schema";
import { ADDRESS_ZERO } from "./common";

export const getInvoiceFundedEventId = (underlyingClaimId: BigInt, event: ethereum.Event): string =>
  "InvoiceFunded-" + underlyingClaimId.toString() + "-" + event.address.toHexString();

export const createInvoiceFundedEventV1 = (underlyingTokenId: BigInt, event: InvoiceFundedV1): InvoiceFundedEvent => {
  return new InvoiceFundedEvent(getInvoiceFundedEventId(underlyingTokenId, event));
};

export const createInvoiceFundedEventV2_1 = (underlyingTokenId: BigInt, event: InvoiceFundedV2_1): InvoiceFundedEvent => {
  return new InvoiceFundedEvent(getInvoiceFundedEventId(underlyingTokenId, event));
};

export const createInvoiceFundedEventV2_2 = (underlyingTokenId: BigInt, event: InvoiceFundedV2_2): InvoiceFundedEvent => {
  return new InvoiceFundedEvent(getInvoiceFundedEventId(underlyingTokenId, event));
};

export const getInvoiceKickbackAmountSentEventId = (underlyingClaimId: BigInt, event: ethereum.Event): string =>
  "InvoiceKickbackAmountSent-" + underlyingClaimId.toString() + "-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString();

export const createInvoiceKickbackAmountSentEventV1 = (underlyingTokenId: BigInt, event: ethereum.Event): InvoiceKickbackAmountSentEvent =>
  new InvoiceKickbackAmountSentEvent(getInvoiceKickbackAmountSentEventId(underlyingTokenId, event));

export const getInvoiceUnfactoredEventId = (underlyingClaimId: BigInt, event: ethereum.Event): string =>
  "InvoiceUnfactored-" + underlyingClaimId.toString() + "-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString();

export const createInvoiceUnfactoredEventV0 = (underlyingTokenId: BigInt, event: InvoiceUnfactoredV0): InvoiceUnfactoredEvent =>
  new InvoiceUnfactoredEvent(getInvoiceUnfactoredEventId(underlyingTokenId, event));

export const createInvoiceUnfactoredEventV1 = (underlyingTokenId: BigInt, event: InvoiceUnfactoredV1): InvoiceUnfactoredEvent =>
  new InvoiceUnfactoredEvent(getInvoiceUnfactoredEventId(underlyingTokenId, event));

export const createInvoiceUnfactoredEventV2_1 = (underlyingTokenId: BigInt, event: InvoiceUnfactoredV2_1): InvoiceUnfactoredEvent =>
  new InvoiceUnfactoredEvent(getInvoiceUnfactoredEventId(underlyingTokenId, event));

export const createInvoiceUnfactoredEventV2_2 = (underlyingTokenId: BigInt, event: InvoiceUnfactoredV2_2): InvoiceUnfactoredEvent =>
  new InvoiceUnfactoredEvent(getInvoiceUnfactoredEventId(underlyingTokenId, event));

export const getDepositMadeEventId = (event: ethereum.Event, logIndexOverride: BigInt | null): string => {
  const poolAddress = event.address;
  return (
    "DepositMade-" + poolAddress.toHexString() + "-" + event.transaction.hash.toHexString() + "-" + (logIndexOverride ? logIndexOverride : event.logIndex).toString()
  );
};

export const createDepositMadeEventV0 = (event: DepositMade): DepositMadeEvent => new DepositMadeEvent(getDepositMadeEventId(event, null));

export const createDepositMadeEventV1 = (event: DepositV1): DepositMadeEvent => new DepositMadeEvent(getDepositMadeEventId(event, null));

export const getSharesRedeemedEventId = (event: ethereum.Event, logIndexOverride: BigInt | null): string => {
  const poolAddress = event.address;
  return (
    "SharesRedeemed-" + poolAddress.toHexString() + "-" + event.transaction.hash.toHexString() + "-" + (logIndexOverride ? logIndexOverride : event.logIndex).toString()
  );
};

export const createSharesRedeemedEventV0 = (event: SharesRedeemed): SharesRedeemedEvent => new SharesRedeemedEvent(getSharesRedeemedEventId(event, null));

export const createSharesRedeemedEventV1 = (event: WithdrawV1): SharesRedeemedEvent => new SharesRedeemedEvent(getSharesRedeemedEventId(event, null));

export const getInvoiceImpairedEventId = (underlyingClaimId: BigInt, event: ethereum.Event): string =>
  "InvoiceImpaired-" + underlyingClaimId.toString() + "-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString();

export const createInvoiceImpairedEventV1 = (underlyingTokenId: BigInt, event: InvoiceImpairedV1): InvoiceImpairedEvent =>
  new InvoiceImpairedEvent(getInvoiceImpairedEventId(underlyingTokenId, event));

export const createInvoiceImpairedEventV2_2 = (underlyingTokenId: BigInt, event: InvoiceImpairedV2_2): InvoiceImpairedEvent =>
  new InvoiceImpairedEvent(getInvoiceImpairedEventId(underlyingTokenId, event));

export const getInvoiceReconciledEventId = (invoiceId: BigInt, event: ethereum.Event): string => {
  const poolAddress = event.address;
  return "InvoiceReconciled-" + poolAddress.toHexString() + "-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString() + "-" + invoiceId.toString();
};

export const createInvoiceReconciledEventV0 = (invoiceId: BigInt, event: ActivePaidInvoicesReconciled): InvoiceReconciledEvent =>
  new InvoiceReconciledEvent(getInvoiceReconciledEventId(invoiceId, event));

export const createInvoiceReconciledEventV1 = (invoiceId: BigInt, event: InvoicePaidV1): InvoiceReconciledEvent =>
  new InvoiceReconciledEvent(getInvoiceReconciledEventId(invoiceId, event));

export const createInvoiceReconciledEventV2_1 = (invoiceId: BigInt, event: InvoicePaidV2_1): InvoiceReconciledEvent =>
  new InvoiceReconciledEvent(getInvoiceReconciledEventId(invoiceId, event));

export const createInvoiceReconciledEventV2_2 = (invoiceId: BigInt, event: InvoicePaidV2_2): InvoiceReconciledEvent =>
  new InvoiceReconciledEvent(getInvoiceReconciledEventId(invoiceId, event));

export const getTargetProtocolFeeFromFundedEvent = (invoiceId: BigInt, event: ethereum.Event): BigInt => {
  const fundedEventId = getInvoiceFundedEventId(invoiceId, event);
  const fundedEvent = InvoiceFundedEvent.load(fundedEventId);

  if (fundedEvent) {
    return fundedEvent.targetProtocolFee;
  }

  return BigInt.fromI32(0);
};

export const getOrCreatePoolPermissionsContractAddresses = (poolAddress: Address, version: string): PoolPermissionsContractAddresses => {
  let poolPermissions = PoolPermissionsContractAddresses.load(poolAddress.toHexString());

  if (!poolPermissions) {
    poolPermissions = new PoolPermissionsContractAddresses(poolAddress.toHexString());
    poolPermissions.poolAddress = poolAddress;

    if (version == "v0") {
      const contract = BullaFactoringV0.bind(poolAddress);
      poolPermissions.depositPermissions = contract.depositPermissions();
      poolPermissions.factoringPermissions = contract.factoringPermissions();
      poolPermissions.redeemPermissions = Address.fromString(ADDRESS_ZERO);
    } else if (version == "v1") {
      const contract = BullaFactoringV1.bind(poolAddress);
      poolPermissions.depositPermissions = contract.depositPermissions();
      poolPermissions.factoringPermissions = contract.factoringPermissions();
      poolPermissions.redeemPermissions = Address.fromString(ADDRESS_ZERO);
    } else if (version == "v2_1") {
      const contract = BullaFactoringV2_1.bind(poolAddress);
      poolPermissions.depositPermissions = contract.depositPermissions();
      poolPermissions.factoringPermissions = contract.factoringPermissions();
      poolPermissions.redeemPermissions = contract.redeemPermissions();
    } else {
      // v2_2
      const contract = BullaFactoringV2_2.bind(poolAddress);
      poolPermissions.depositPermissions = contract.depositPermissions();
      poolPermissions.factoringPermissions = contract.factoringPermissions();
      poolPermissions.redeemPermissions = contract.redeemPermissions();
    }
  }

  return poolPermissions;
};

export const getOrCreateFactoringPool = (poolAddress: Address, version: string, event: ethereum.Event): FactoringPool => {
  let pool = FactoringPool.load(poolAddress.toHexString());

  if (!pool) {
    pool = new FactoringPool(poolAddress.toHexString());
    pool.poolAddress = poolAddress;

    if (version == "v0") {
      const contract = BullaFactoringV0.bind(poolAddress);
      pool.owner = contract.owner();
      pool.asset = contract.asset();
      pool.poolName = contract.poolName();
      pool.tokenName = contract.name();
      pool.tokenSymbol = contract.symbol();
      pool.depositPermissions = contract.depositPermissions();
      pool.factoringPermissions = contract.factoringPermissions();
      pool.redeemPermissions = Address.fromString(ADDRESS_ZERO);
    } else if (version == "v1") {
      const contract = BullaFactoringV1.bind(poolAddress);
      pool.owner = contract.owner();
      pool.asset = contract.asset();
      pool.poolName = contract.poolName();
      pool.tokenName = contract.name();
      pool.tokenSymbol = contract.symbol();
      pool.depositPermissions = contract.depositPermissions();
      pool.factoringPermissions = contract.factoringPermissions();
      pool.redeemPermissions = Address.fromString(ADDRESS_ZERO);
    } else if (version == "v2_1") {
      const contract = BullaFactoringV2_1.bind(poolAddress);
      pool.owner = contract.owner();
      pool.asset = contract.asset();
      pool.poolName = contract.poolName();
      pool.tokenName = contract.name();
      pool.tokenSymbol = contract.symbol();
      pool.depositPermissions = contract.depositPermissions();
      pool.factoringPermissions = contract.factoringPermissions();
      pool.redeemPermissions = contract.redeemPermissions();
    } else {
      // v2_2
      const contract = BullaFactoringV2_2.bind(poolAddress);
      pool.owner = contract.owner();
      pool.asset = contract.asset();
      pool.poolName = contract.poolName();
      pool.tokenName = contract.name();
      pool.tokenSymbol = contract.symbol();
      pool.depositPermissions = contract.depositPermissions();
      pool.factoringPermissions = contract.factoringPermissions();
      pool.redeemPermissions = contract.redeemPermissions();
    }

    // For pools not created via factory, use zero address
    pool.factory = Address.fromString(ADDRESS_ZERO);
    pool.createdAtBlock = event.block.number;
    pool.createdAtTimestamp = event.block.timestamp;
    pool.createdAtTransaction = event.transaction.hash;
    pool.factoringEvents = [];

    // For pools created via factory in the future, the entity-creation site
    // might shift around and we don't want the link to silently break.
    const existingStats = FactoringPoolStats.load(poolAddress.toHexString());
    if (existingStats) {
      pool.currentStats = existingStats.id;
    }
    const existingTotals = FactoringPoolTotals.load(poolAddress.toHexString());
    if (existingTotals) {
      pool.currentTotals = existingTotals.id;
    }

    pool.save();
  }

  return pool;
};

export const getInvoiceApprovedEventId = (invoiceId: BigInt, event: ethereum.Event): string =>
  "InvoiceApproved-" + invoiceId.toString() + "-" + event.address.toHexString();

export const createInvoiceApprovedEventV2_1 = (invoiceId: BigInt, event: InvoiceApprovedV2_1): InvoiceApprovedEvent =>
  new InvoiceApprovedEvent(getInvoiceApprovedEventId(invoiceId, event));

export const createInvoiceApprovedEventV2_2 = (invoiceId: BigInt, event: InvoiceApprovedV2_2): InvoiceApprovedEvent =>
  new InvoiceApprovedEvent(getInvoiceApprovedEventId(invoiceId, event));

export const addEventToFactoringPool = (poolAddress: Address, eventId: string): void => {
  const pool = FactoringPool.load(poolAddress.toHexString());
  if (pool) {
    pool.factoringEvents = pool.factoringEvents ? pool.factoringEvents.concat([eventId]) : [eventId];
    pool.save();
  }
};

const getPoolPositionId = (poolAddress: Address, investorAddress: Address): string =>
  poolAddress.toHexString() + "-" + investorAddress.toHexString();

const getOrCreatePoolPosition = (poolAddress: Address, investorAddress: Address, event: ethereum.Event): PoolPosition => {
  const id = getPoolPositionId(poolAddress, investorAddress);
  let position = PoolPosition.load(id);
  if (!position) {
    position = new PoolPosition(id);
    position.pool = poolAddress.toHexString();
    position.investor = investorAddress.toHexString();
    position.shares = BigInt.fromI32(0);
    position.costBasis = BigInt.fromI32(0);
    position.totalDeposited = BigInt.fromI32(0);
    position.totalWithdrawn = BigInt.fromI32(0);
    position.realizedPnl = BigInt.fromI32(0);
    position.firstDepositTimestamp = event.block.timestamp;
    position.firstDepositBlock = event.block.number;
  }
  return position;
};

/**
 * Credit a deposit to the investor's pool position.
 * Shares and cost basis both increase by the assets/shares the depositor
 * contributed in this event. lifetime totals advance.
 */
export const applyDepositToPoolPosition = (
  poolAddress: Address,
  investorAddress: Address,
  assets: BigInt,
  shares: BigInt,
  event: ethereum.Event,
): void => {
  const position = getOrCreatePoolPosition(poolAddress, investorAddress, event);
  position.shares = position.shares.plus(shares);
  position.costBasis = position.costBasis.plus(assets);
  position.totalDeposited = position.totalDeposited.plus(assets);
  position.lastUpdatedTimestamp = event.block.timestamp;
  position.lastUpdatedBlock = event.block.number;
  position.save();
};

/**
 * Debit a withdrawal from the investor's pool position.
 * Cost basis is removed proportionally to the shares burned; the assets
 * actually received in excess of the proportional basis are booked as
 * realized PnL (can be negative on a loss).
 */
export const applyWithdrawToPoolPosition = (
  poolAddress: Address,
  investorAddress: Address,
  assets: BigInt,
  shares: BigInt,
  event: ethereum.Event,
): void => {
  const id = getPoolPositionId(poolAddress, investorAddress);
  const position = PoolPosition.load(id);
  if (!position || position.shares.equals(BigInt.fromI32(0))) return;

  // Proportional basis removal: basisOut = costBasis * sharesBurned / sharesBefore
  const sharesBefore = position.shares;
  const basisOut = position.costBasis.times(shares).div(sharesBefore);
  const realizedDelta = assets.minus(basisOut);

  position.shares = position.shares.minus(shares);
  position.costBasis = position.costBasis.minus(basisOut);
  position.totalWithdrawn = position.totalWithdrawn.plus(assets);
  position.realizedPnl = position.realizedPnl.plus(realizedDelta);
  position.lastUpdatedTimestamp = event.block.timestamp;
  position.lastUpdatedBlock = event.block.number;
  position.save();
};

// ============================================================================
// ClaimFactoringStatus — denormalized factoring lifecycle state machine.
// ============================================================================

export const FACTORING_STATE_APPROVED = "Approved";
export const FACTORING_STATE_FUNDED = "Funded";
export const FACTORING_STATE_RECONCILED = "Reconciled";
export const FACTORING_STATE_UNFACTORED = "Unfactored";
export const FACTORING_STATE_IMPAIRED = "Impaired";

const isTerminalFactoringState = (state: string): boolean => {
  return state == FACTORING_STATE_RECONCILED || state == FACTORING_STATE_UNFACTORED;
};

const getOrCreateClaimFactoringStatus = (claimId: string, poolAddress: Address, event: ethereum.Event): ClaimFactoringStatus => {
  let status = ClaimFactoringStatus.load(claimId);
  if (!status) {
    status = new ClaimFactoringStatus(claimId);
    status.claim = claimId;
    status.pool = poolAddress.toHexString();
    // Sentinel initial state; the caller is expected to set the real state
    // and any relevant snapshot fields before save.
    status.state = FACTORING_STATE_APPROVED;
  }
  status.lastUpdatedTimestamp = event.block.timestamp;
  status.lastUpdatedBlock = event.block.number;
  return status;
};

export class InvoiceApprovedSnapshot {
  validUntil: BigInt;
  targetYieldBps: i32;
  spreadBps: i32;
  upfrontBps: i32;
  protocolFeeBps: i32;
  adminFeeBps: i32;

  constructor(
    validUntil: BigInt,
    targetYieldBps: i32,
    spreadBps: i32,
    upfrontBps: i32,
    protocolFeeBps: i32,
    adminFeeBps: i32,
  ) {
    this.validUntil = validUntil;
    this.targetYieldBps = targetYieldBps;
    this.spreadBps = spreadBps;
    this.upfrontBps = upfrontBps;
    this.protocolFeeBps = protocolFeeBps;
    this.adminFeeBps = adminFeeBps;
  }
}

export const applyApprovedToFactoringStatus = (
  claimId: string,
  poolAddress: Address,
  snapshot: InvoiceApprovedSnapshot,
  event: ethereum.Event,
): void => {
  const status = getOrCreateClaimFactoringStatus(claimId, poolAddress, event);
  if (isTerminalFactoringState(status.state)) return;

  status.state = FACTORING_STATE_APPROVED;
  status.approvedAtTimestamp = event.block.timestamp;
  status.approvedAtBlock = event.block.number;
  status.validUntil = snapshot.validUntil;
  status.targetYieldBps = snapshot.targetYieldBps;
  status.spreadBps = snapshot.spreadBps;
  status.upfrontBps = snapshot.upfrontBps;
  status.protocolFeeBps = snapshot.protocolFeeBps;
  status.adminFeeBps = snapshot.adminFeeBps;
  status.save();
};

export const applyFundedToFactoringStatus = (
  claimId: string,
  poolAddress: Address,
  fundedAmount: BigInt,
  originalCreditor: Bytes,
  fundsReceiver: Bytes,
  event: ethereum.Event,
): void => {
  const status = getOrCreateClaimFactoringStatus(claimId, poolAddress, event);
  if (isTerminalFactoringState(status.state)) return;

  status.state = FACTORING_STATE_FUNDED;
  status.fundedAtTimestamp = event.block.timestamp;
  status.fundedAtBlock = event.block.number;
  status.fundedAmount = fundedAmount;
  status.originalCreditor = originalCreditor;
  status.fundsReceiver = fundsReceiver;
  status.save();
};

// Note: InvoiceKickbackAmountSent does NOT transition lifecycle state on
// its own. On every contract version, the kickback event and the
// corresponding reconcile event fire in the SAME transaction:
//  - V0: reconcileActivePaidInvoices() emits InvoiceKickbackAmountSent
//    (per invoice, only if non-zero) immediately before the per-invoice
//    InvoicePaid and the trailing ActivePaidInvoicesReconciled summary.
//  - V1 / V2_1 / V2_2: reconcileSingleInvoice() emits kickback right
//    before InvoicePaid in the same call.
// So a separate KickbackPaid state would never be queryable at a block
// boundary — Reconciled would always overwrite it in the same block. The
// kickbackAmount is preserved on the Reconciled snapshot from the
// InvoicePaid event payload (V1+) or, for V0, reconstructed via the
// deterministic `calculateKickbackAmount` view inside the batch handler
// (safe because `approvedInvoices` isn't deleted on reconcile and
// block.timestamp is fixed for the tx).
//
// We still track the kickback event in pool-level totals
// (applyKickbackToPoolTotals) and in the standalone InvoiceKickbackAmountSentEvent
// entity; only the per-claim lifecycle enum doesn't expand to include it.

export class InvoiceReconciledSnapshot {
  kickbackAmount: BigInt;
  trueInterest: BigInt;
  trueProtocolFee: BigInt;
  trueAdminFee: BigInt;
  trueTax: BigInt;
  trueSpreadAmount: BigInt;

  constructor(kickbackAmount: BigInt, trueInterest: BigInt, trueProtocolFee: BigInt, trueAdminFee: BigInt, trueTax: BigInt, trueSpreadAmount: BigInt) {
    this.kickbackAmount = kickbackAmount;
    this.trueInterest = trueInterest;
    this.trueProtocolFee = trueProtocolFee;
    this.trueAdminFee = trueAdminFee;
    this.trueTax = trueTax;
    this.trueSpreadAmount = trueSpreadAmount;
  }
}

/**
 * Record the Reconciled terminal state. Locks the resolution: subsequent
 * Unfactored transitions are ignored (Impaired is non-terminal, but the
 * contract doesn't take an invoice from Reconciled to Impaired in
 * practice — that would be a bad event ordering and the guard is
 * intentionally conservative).
 *
 * The kickbackAmount carried in the snapshot is the canonical record of
 * any kickback paid. For V1+ it comes directly from the InvoicePaid event
 * payload. For V0 it's reconstructed via the contract's
 * `calculateKickbackAmount` view inside the same-transaction handler that
 * processes ActivePaidInvoicesReconciled — the view is deterministic over
 * the preserved approval struct and a fixed block.timestamp, so it
 * returns the same value the contract transferred earlier in the same
 * tx. The standalone InvoiceKickbackAmountSent event still appears in
 * pool totals and event-log entities.
 */
export const applyReconciledToFactoringStatus = (
  claimId: string,
  poolAddress: Address,
  snapshot: InvoiceReconciledSnapshot,
  event: ethereum.Event,
): void => {
  const status = getOrCreateClaimFactoringStatus(claimId, poolAddress, event);
  if (isTerminalFactoringState(status.state)) return;

  status.state = FACTORING_STATE_RECONCILED;
  status.kickbackAmount = snapshot.kickbackAmount;
  status.trueInterest = snapshot.trueInterest;
  status.trueProtocolFee = snapshot.trueProtocolFee;
  status.trueAdminFee = snapshot.trueAdminFee;
  status.trueTax = snapshot.trueTax;
  status.trueSpreadAmount = snapshot.trueSpreadAmount;
  status.resolvedAtTimestamp = event.block.timestamp;
  status.resolvedAtBlock = event.block.number;
  status.save();
};

/**
 * Record the Unfactored terminal state. The creditor pulled the invoice
 * out of the pool before maturity (or the pool owner did, indicated by
 * `byPoolOwner`).
 */
export const applyUnfactoredToFactoringStatus = (
  claimId: string,
  poolAddress: Address,
  refundAmount: BigInt,
  byPoolOwner: boolean,
  event: ethereum.Event,
): void => {
  const status = getOrCreateClaimFactoringStatus(claimId, poolAddress, event);
  if (isTerminalFactoringState(status.state)) return;

  status.state = FACTORING_STATE_UNFACTORED;
  status.unfactoredRefundAmount = refundAmount;
  status.unfactoredByPoolOwner = byPoolOwner;
  status.resolvedAtTimestamp = event.block.timestamp;
  status.resolvedAtBlock = event.block.number;
  status.save();
};

/**
 * Record the Impaired state — the pool wrote the invoice down as bad debt.
 *
 * Treated as non-terminal because deployed V2_2 already supports two
 * exits from Impaired on-chain:
 *  - reconcileSingleInvoice() on an impaired invoice splits the recovered
 *    payment into insurance + investor shares and emits InsuranceRecovered
 *    + ImpairedInvoiceReconciled.
 *  - unfactorInvoice() with unfactoredByOwner=true lets the pool owner
 *    take back an impaired invoice and emits InvoiceUnfactored.
 *
 * The manifest does not yet subscribe to InsuranceRecovered or
 * ImpairedInvoiceReconciled, so in indexed practice the only exit that
 * fires today is the owner-unfactor path (caught by the existing
 * InvoiceUnfactored handler, which transitions to Unfactored). Keeping
 * the guard permissive now means wiring up the recovery handler later
 * won't need to retroactively unlock historical entities.
 */
export const applyImpairedToFactoringStatus = (
  claimId: string,
  poolAddress: Address,
  lossAmount: BigInt,
  gainAmount: BigInt,
  event: ethereum.Event,
): void => {
  const status = getOrCreateClaimFactoringStatus(claimId, poolAddress, event);
  if (isTerminalFactoringState(status.state)) return;

  status.state = FACTORING_STATE_IMPAIRED;
  status.impairLossAmount = lossAmount;
  status.impairGainAmount = gainAmount;
  status.resolvedAtTimestamp = event.block.timestamp;
  status.resolvedAtBlock = event.block.number;
  status.save();
};

// ============================================================================
// FactoringPoolTotals — denormalized invoice-flow running totals.
// ============================================================================

const getOrCreateFactoringPoolTotals = (poolAddress: Address, event: ethereum.Event): FactoringPoolTotals => {
  const poolId = poolAddress.toHexString();
  let totals = FactoringPoolTotals.load(poolId);
  if (!totals) {
    totals = new FactoringPoolTotals(poolId);
    totals.pool = poolId;
    totals.totalAssetsFunded = BigInt.fromI32(0);
    totals.totalKickbackPaid = BigInt.fromI32(0);
    totals.totalInvoicesFunded = BigInt.fromI32(0);
    totals.totalInvoicesReconciled = BigInt.fromI32(0);
    totals.totalInvoicesImpaired = BigInt.fromI32(0);
    totals.totalImpairedAmount = BigInt.fromI32(0);
    totals.totalRealizedInterest = BigInt.fromI32(0);
  }
  totals.lastUpdatedTimestamp = event.block.timestamp;
  totals.lastUpdatedBlock = event.block.number;
  return totals;
};

/**
 * Link the FactoringPool to its totals entity. Mirrors the
 * FactoringPoolStats late-link pattern: if the pool entity exists and
 * doesn't yet point at currentTotals, set the pointer. Pools created
 * later (via Deposit handler) pick up the existing totals via the same
 * defensive load in getOrCreateFactoringPool.
 */
const linkPoolToTotals = (poolAddress: Address, totalsId: string): void => {
  const pool = FactoringPool.load(poolAddress.toHexString());
  if (pool && !pool.currentTotals) {
    pool.currentTotals = totalsId;
    pool.save();
  }
};

export const applyFundingToPoolTotals = (poolAddress: Address, fundedAmount: BigInt, event: ethereum.Event): void => {
  const totals = getOrCreateFactoringPoolTotals(poolAddress, event);
  totals.totalAssetsFunded = totals.totalAssetsFunded.plus(fundedAmount);
  totals.totalInvoicesFunded = totals.totalInvoicesFunded.plus(BigInt.fromI32(1));
  totals.lastFundedAtTimestamp = event.block.timestamp;
  totals.lastFundedAtBlock = event.block.number;
  totals.save();
  linkPoolToTotals(poolAddress, totals.id);
};

export const applyKickbackToPoolTotals = (poolAddress: Address, kickbackAmount: BigInt, event: ethereum.Event): void => {
  const totals = getOrCreateFactoringPoolTotals(poolAddress, event);
  totals.totalKickbackPaid = totals.totalKickbackPaid.plus(kickbackAmount);
  totals.save();
  linkPoolToTotals(poolAddress, totals.id);
};

export const applyReconcileToPoolTotals = (poolAddress: Address, trueInterest: BigInt, event: ethereum.Event): void => {
  const totals = getOrCreateFactoringPoolTotals(poolAddress, event);
  totals.totalInvoicesReconciled = totals.totalInvoicesReconciled.plus(BigInt.fromI32(1));
  totals.totalRealizedInterest = totals.totalRealizedInterest.plus(trueInterest);
  totals.save();
  linkPoolToTotals(poolAddress, totals.id);
};

export const applyUnfactorToPoolTotals = (poolAddress: Address, trueInterest: BigInt, event: ethereum.Event): void => {
  // Unfactor doesn't bump the reconciled counter — Unfactored is a distinct
  // terminal from Reconciled in the lifecycle state machine. But it does
  // contribute to realized interest: the unfactoring creditor pays
  // `interestToCharge` (a uint256 in every contract version) to redeem
  // the invoice early, which the existing PnL handlers already book as
  // positive pool income. So we accumulate it on totalRealizedInterest
  // the same way reconciliation interest accumulates.
  const totals = getOrCreateFactoringPoolTotals(poolAddress, event);
  totals.totalRealizedInterest = totals.totalRealizedInterest.plus(trueInterest);
  totals.save();
  linkPoolToTotals(poolAddress, totals.id);
};

export const applyImpairToPoolTotals = (poolAddress: Address, impairAmount: BigInt, event: ethereum.Event): void => {
  const totals = getOrCreateFactoringPoolTotals(poolAddress, event);
  totals.totalInvoicesImpaired = totals.totalInvoicesImpaired.plus(BigInt.fromI32(1));
  totals.totalImpairedAmount = totals.totalImpairedAmount.plus(impairAmount);
  totals.save();
  linkPoolToTotals(poolAddress, totals.id);
};
