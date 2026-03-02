import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  ActivePaidInvoicesReconciled,
  DepositMade,
  DepositPermissionsChanged as DepositPermissionsChangedV0,
  FactoringPermissionsChanged as FactoringPermissionsChangedV0,
  InvoiceKickbackAmountSent as InvoiceKickbackAmountSentV0,
  InvoiceUnfactored as InvoiceUnfactoredV0,
  SharesRedeemed,
} from "../../generated/BullaFactoringV0/BullaFactoringV0";
import {
  BullaFactoringV1,
  DepositPermissionsChanged as DepositPermissionsChangedV1,
  Deposit as DepositV1,
  FactoringPermissionsChanged as FactoringPermissionsChangedV1,
  InvoiceFunded as InvoiceFundedV1,
  InvoiceImpaired,
  InvoiceKickbackAmountSent as InvoiceKickbackAmountSentV1,
  InvoicePaid as InvoicePaidV1,
  InvoicePaid__Params,
  InvoiceUnfactored as InvoiceUnfactoredV1,
  Withdraw as WithdrawV1,
} from "../../generated/BullaFactoringV1/BullaFactoringV1";
import {
  DepositPermissionsChanged as DepositPermissionsChangedV2_1,
  Deposit as DepositV2_1,
  FactoringPermissionsChanged as FactoringPermissionsChangedV2_1,
  InvoiceFunded as InvoiceFundedV2_1,
  InvoiceKickbackAmountSent as InvoiceKickbackAmountSentV2_1,
  InvoicePaid as InvoicePaidV2_1,
  InvoiceUnfactored as InvoiceUnfactoredV2_1,
  RedeemPermissionsChanged as RedeemPermissionsChangedV2_1,
  Withdraw as WithdrawV2_1,
} from "../../generated/BullaFactoringV2_1/BullaFactoringV2_1";
import { getClaim } from "../functions/BullaClaimERC721";
import {
  addEventToFactoringPool,
  createDepositMadeEventV0,
  createDepositMadeEventV1,
  createInvoiceFundedEventV1,
  createInvoiceFundedEventV2_1,
  createInvoiceImpairedEventV1,
  createInvoiceKickbackAmountSentEventV1,
  createInvoiceReconciledEventV0,
  createInvoiceReconciledEventV1,
  createInvoiceReconciledEventV2_1,
  createInvoiceUnfactoredEventV0,
  createInvoiceUnfactoredEventV1,
  createInvoiceUnfactoredEventV2_1,
  createSharesRedeemedEventV0,
  createSharesRedeemedEventV1,
  getOrCreateFactoringPool,
  getOrCreatePoolPermissionsContractAddresses,
  getTargetProtocolFeeFromFundedEvent,
} from "../functions/BullaFactoring";
import {
  calculateTax,
  getApprovedInvoiceOriginalCreditor,
  getApprovedInvoiceUpfrontBps,
  getLatestPrice,
  getOrCreateHistoricalFactoringStatistics,
  getOrCreatePoolProfitAndLoss,
  getOrCreatePricePerShare,
  getOrCreateUser,
  getPriceBeforeTransaction,
  getTargetFeesAndTaxes,
  getTrueFeesAndTaxesV0,
} from "../functions/common";

// ============================================================================
// InvoiceFunded
// ============================================================================

// Shared handler for V0/V1 (same event signature)
function handleInvoiceFunded(event: InvoiceFundedV1, version: string): void {
  const ev = event.params;
  const originatingClaimId = ev.invoiceId;

  const underlyingClaim = getClaim(originatingClaimId.toString(), version);
  const InvoiceFundedEvent = createInvoiceFundedEventV1(originatingClaimId, event);
  const debtor = getOrCreateUser(Address.fromString(underlyingClaim.debtor));

  const upfrontBps = getApprovedInvoiceUpfrontBps(event.address, version, originatingClaimId);

  InvoiceFundedEvent.invoiceId = underlyingClaim.tokenId;
  InvoiceFundedEvent.fundedAmount = ev.fundedAmount;
  InvoiceFundedEvent.originalCreditor = ev.originalCreditor;
  InvoiceFundedEvent.fundsReceiver = ev.originalCreditor; // V0/V1: fundsReceiver is same as originalCreditor
  InvoiceFundedEvent.upfrontBps = upfrontBps;
  const original_creditor = getOrCreateUser(ev.originalCreditor);
  const pool = getOrCreateUser(event.address);
  // Update the price history
  const priceBeforeTransaction = getPriceBeforeTransaction(event);
  const price_per_share = getOrCreatePricePerShare(event, version);

  // Get the latest price for the event
  const latestPrice = getLatestPrice(event, version);

  // Get the historical factoring statistics
  const historical_factoring_statistics = getOrCreateHistoricalFactoringStatistics(event, version);

  // Get target fees and taxes
  const targetFeesAndTaxes = getTargetFeesAndTaxes(event.address, version, ev.invoiceId);
  const targetInterest = targetFeesAndTaxes[0];
  const targetProtocolFee = targetFeesAndTaxes[1];
  const targetAdminFee = targetFeesAndTaxes[2];
  const targetTax = targetFeesAndTaxes[3];

  InvoiceFundedEvent.eventName = "InvoiceFunded";
  InvoiceFundedEvent.blockNumber = event.block.number;
  InvoiceFundedEvent.transactionHash = event.transaction.hash;
  InvoiceFundedEvent.logIndex = event.logIndex;
  InvoiceFundedEvent.timestamp = event.block.timestamp;
  InvoiceFundedEvent.poolAddress = event.address;
  InvoiceFundedEvent.priceBeforeTransaction = priceBeforeTransaction;
  InvoiceFundedEvent.priceAfterTransaction = latestPrice;
  InvoiceFundedEvent.claim = underlyingClaim.id;
  InvoiceFundedEvent.targetInterest = targetInterest;
  InvoiceFundedEvent.targetProtocolFee = targetProtocolFee;
  InvoiceFundedEvent.targetAdminFee = targetAdminFee;
  InvoiceFundedEvent.targetTax = targetTax;
  InvoiceFundedEvent.targetSpreadAmount = BigInt.fromI32(0);

  original_creditor.factoringEvents = original_creditor.factoringEvents ? original_creditor.factoringEvents.concat([InvoiceFundedEvent.id]) : [InvoiceFundedEvent.id];
  pool.factoringEvents = pool.factoringEvents ? pool.factoringEvents.concat([InvoiceFundedEvent.id]) : [InvoiceFundedEvent.id];
  debtor.factoringEvents = debtor.factoringEvents ? debtor.factoringEvents.concat([InvoiceFundedEvent.id]) : [InvoiceFundedEvent.id];

  InvoiceFundedEvent.save();
  original_creditor.save();
  pool.save();
  price_per_share.save();
  historical_factoring_statistics.save();
  debtor.save();
  addEventToFactoringPool(event.address, InvoiceFundedEvent.id);
}

export function handleInvoiceFundedV0(event: InvoiceFundedV1): void {
  handleInvoiceFunded(event, "v0");
}

export function handleInvoiceFundedV1(event: InvoiceFundedV1): void {
  handleInvoiceFunded(event, "v1");
}

// V2_1 has different event signature with additional params
export function handleInvoiceFundedV2_1(event: InvoiceFundedV2_1): void {
  const ev = event.params;
  const originatingClaimId = ev.invoiceId;

  const underlyingClaim = getClaim(originatingClaimId.toString(), "v2_1");
  const InvoiceFundedEvent = createInvoiceFundedEventV2_1(originatingClaimId, event);
  const debtor = getOrCreateUser(Address.fromString(underlyingClaim.debtor));

  InvoiceFundedEvent.invoiceId = underlyingClaim.tokenId;
  InvoiceFundedEvent.fundedAmount = ev.fundedAmount;
  InvoiceFundedEvent.originalCreditor = ev.originalCreditor;
  InvoiceFundedEvent.fundsReceiver = ev.fundsReceiver;
  InvoiceFundedEvent.upfrontBps = ev.upfrontBps;
  const original_creditor = getOrCreateUser(ev.originalCreditor);
  const pool = getOrCreateUser(event.address);
  // Update the price history
  const priceBeforeTransaction = getPriceBeforeTransaction(event);
  const price_per_share = getOrCreatePricePerShare(event, "v2_1");
  const latestPrice = getLatestPrice(event, "v2_1");
  const historical_factoring_statistics = getOrCreateHistoricalFactoringStatistics(event, "v2_1");

  const targetFees = getTargetFeesAndTaxes(event.address, "v2_1", ev.invoiceId);
  const targetInterest = targetFees[0];
  const targetAdminFee = targetFees[1];
  const targetSpreadAmount = targetFees[2];

  InvoiceFundedEvent.eventName = "InvoiceFunded";
  InvoiceFundedEvent.blockNumber = event.block.number;
  InvoiceFundedEvent.transactionHash = event.transaction.hash;
  InvoiceFundedEvent.logIndex = event.logIndex;
  InvoiceFundedEvent.timestamp = event.block.timestamp;
  InvoiceFundedEvent.poolAddress = event.address;
  InvoiceFundedEvent.priceBeforeTransaction = priceBeforeTransaction;
  InvoiceFundedEvent.priceAfterTransaction = latestPrice;
  InvoiceFundedEvent.claim = underlyingClaim.id;
  InvoiceFundedEvent.targetInterest = targetInterest;
  InvoiceFundedEvent.targetProtocolFee = ev.protocolFee;
  InvoiceFundedEvent.targetAdminFee = targetAdminFee;
  InvoiceFundedEvent.targetTax = BigInt.fromI32(0);
  InvoiceFundedEvent.targetSpreadAmount = targetSpreadAmount;

  original_creditor.factoringEvents = original_creditor.factoringEvents ? original_creditor.factoringEvents.concat([InvoiceFundedEvent.id]) : [InvoiceFundedEvent.id];
  pool.factoringEvents = pool.factoringEvents ? pool.factoringEvents.concat([InvoiceFundedEvent.id]) : [InvoiceFundedEvent.id];
  debtor.factoringEvents = debtor.factoringEvents ? debtor.factoringEvents.concat([InvoiceFundedEvent.id]) : [InvoiceFundedEvent.id];

  InvoiceFundedEvent.save();
  original_creditor.save();
  pool.save();
  price_per_share.save();
  historical_factoring_statistics.save();
  debtor.save();
  addEventToFactoringPool(event.address, InvoiceFundedEvent.id);
}

// ============================================================================
// InvoiceKickbackAmountSent
// ============================================================================

// Shared handler for V0/V1/V2_1 (same event signature)
function handleInvoiceKickbackAmountSent(event: InvoiceKickbackAmountSentV2_1, version: string): void {
  const ev = event.params;
  const originatingClaimId = ev.invoiceId;

  const underlyingClaim = getClaim(originatingClaimId.toString(), version);
  const InvoiceKickbackAmountSentEvent = createInvoiceKickbackAmountSentEventV1(originatingClaimId, event);

  InvoiceKickbackAmountSentEvent.invoiceId = underlyingClaim.tokenId;
  InvoiceKickbackAmountSentEvent.kickbackAmount = ev.kickbackAmount;
  InvoiceKickbackAmountSentEvent.originalCreditor = ev.originalCreditor;
  const original_creditor = getOrCreateUser(ev.originalCreditor);
  const pool = getOrCreateUser(event.address);
  const priceBeforeTransaction = getPriceBeforeTransaction(event);
  const price_per_share = getOrCreatePricePerShare(event, version);
  const latestPrice = getLatestPrice(event, version);
  const historical_factoring_statistics = getOrCreateHistoricalFactoringStatistics(event, version);

  InvoiceKickbackAmountSentEvent.eventName = "InvoiceKickbackAmountSent";
  InvoiceKickbackAmountSentEvent.blockNumber = event.block.number;
  InvoiceKickbackAmountSentEvent.transactionHash = event.transaction.hash;
  InvoiceKickbackAmountSentEvent.logIndex = event.logIndex;
  InvoiceKickbackAmountSentEvent.timestamp = event.block.timestamp;
  InvoiceKickbackAmountSentEvent.poolAddress = event.address;
  InvoiceKickbackAmountSentEvent.priceBeforeTransaction = priceBeforeTransaction;
  InvoiceKickbackAmountSentEvent.priceAfterTransaction = latestPrice;
  InvoiceKickbackAmountSentEvent.claim = underlyingClaim.id;

  original_creditor.factoringEvents = original_creditor.factoringEvents
    ? original_creditor.factoringEvents.concat([InvoiceKickbackAmountSentEvent.id])
    : [InvoiceKickbackAmountSentEvent.id];

  pool.factoringEvents = pool.factoringEvents ? pool.factoringEvents.concat([InvoiceKickbackAmountSentEvent.id]) : [InvoiceKickbackAmountSentEvent.id];

  InvoiceKickbackAmountSentEvent.save();
  original_creditor.save();
  pool.save();
  price_per_share.save();
  historical_factoring_statistics.save();
  addEventToFactoringPool(event.address, InvoiceKickbackAmountSentEvent.id);
}

export function handleInvoiceKickbackAmountSentV0(event: InvoiceKickbackAmountSentV0): void {
  handleInvoiceKickbackAmountSent(changetype<InvoiceKickbackAmountSentV2_1>(event), "v0");
}

export function handleInvoiceKickbackAmountSentV1(event: InvoiceKickbackAmountSentV1): void {
  handleInvoiceKickbackAmountSent(changetype<InvoiceKickbackAmountSentV2_1>(event), "v1");
}

export function handleInvoiceKickbackAmountSentV2_1(event: InvoiceKickbackAmountSentV2_1): void {
  handleInvoiceKickbackAmountSent(event, "v2_1");
}

// ============================================================================
// InvoicePaid / InvoiceReconciled
// ============================================================================

// V0: ActivePaidInvoicesReconciled (batch event)
export function handleActivePaidInvoicesReconciledV0(event: ActivePaidInvoicesReconciled): void {
  const ev = event.params;
  let pnlTotal = BigInt.fromI32(0);
  const pool = getOrCreateUser(event.address);

  for (let i = 0; i < ev.paidInvoiceIds.length; i++) {
    const invoiceId = ev.paidInvoiceIds[i];
    const InvoiceReconciledEvent = createInvoiceReconciledEventV0(invoiceId, event);

    const originalCreditorAddress = getApprovedInvoiceOriginalCreditor(event.address, "v0", invoiceId);
    const originalCreditor = getOrCreateUser(originalCreditorAddress);

    InvoiceReconciledEvent.poolAddress = event.address;

    const latestPrice = getLatestPrice(event, "v0");
    const priceBeforeTransaction = getPriceBeforeTransaction(event);

    const trueFeesAndTaxes = getTrueFeesAndTaxesV0(event.address, invoiceId);
    const trueNetInterest = trueFeesAndTaxes[0];
    const trueProtocolFee = trueFeesAndTaxes[1];
    const trueAdminFee = trueFeesAndTaxes[2];
    const trueTax = trueFeesAndTaxes[3];

    InvoiceReconciledEvent.eventName = "InvoiceReconciled";
    InvoiceReconciledEvent.invoiceId = invoiceId.toString();
    InvoiceReconciledEvent.blockNumber = event.block.number;
    InvoiceReconciledEvent.transactionHash = event.transaction.hash;
    InvoiceReconciledEvent.logIndex = event.logIndex;
    InvoiceReconciledEvent.timestamp = event.block.timestamp;
    InvoiceReconciledEvent.poolAddress = event.address;
    InvoiceReconciledEvent.priceBeforeTransaction = priceBeforeTransaction;
    InvoiceReconciledEvent.priceAfterTransaction = latestPrice;
    InvoiceReconciledEvent.claim = invoiceId.toString() + "-v1";
    InvoiceReconciledEvent.trueInterest = trueNetInterest.plus(trueTax);
    InvoiceReconciledEvent.trueProtocolFee = trueProtocolFee;
    InvoiceReconciledEvent.trueAdminFee = trueAdminFee;
    InvoiceReconciledEvent.trueTax = trueTax;
    InvoiceReconciledEvent.fundedAmountNet = BigInt.fromI32(0);
    InvoiceReconciledEvent.kickbackAmount = BigInt.fromI32(0);
    InvoiceReconciledEvent.trueSpreadAmount = BigInt.fromI32(0);
    InvoiceReconciledEvent.originalCreditor = originalCreditorAddress;

    originalCreditor.factoringEvents = originalCreditor.factoringEvents
      ? originalCreditor.factoringEvents.concat([InvoiceReconciledEvent.id])
      : [InvoiceReconciledEvent.id];
    pool.factoringEvents = pool.factoringEvents ? pool.factoringEvents.concat([InvoiceReconciledEvent.id]) : [InvoiceReconciledEvent.id];

    InvoiceReconciledEvent.save();
    originalCreditor.save();
    addEventToFactoringPool(event.address, InvoiceReconciledEvent.id);
    pnlTotal = pnlTotal.plus(trueNetInterest);
  }

  const pool_pnl = getOrCreatePoolProfitAndLoss(event, pnlTotal);
  const price_per_share = getOrCreatePricePerShare(event, "v0");
  const historical_factoring_statistics = getOrCreateHistoricalFactoringStatistics(event, "v0");

  price_per_share.save();
  historical_factoring_statistics.save();
  pool_pnl.save();
  pool.save();
}

// V1: InvoicePaid
export function handleInvoicePaidV1(event: InvoicePaidV1): void {
  const ev: InvoicePaid__Params = event.params;
  const originatingClaimId = ev.invoiceId;

  const underlyingClaim = getClaim(originatingClaimId.toString(), "v1");
  const InvoiceReconciledEvent = createInvoiceReconciledEventV1(originatingClaimId, event);

  InvoiceReconciledEvent.invoiceId = underlyingClaim.tokenId;
  InvoiceReconciledEvent.trueAdminFee = ev.adminFee;
  InvoiceReconciledEvent.trueInterest = ev.trueInterest;
  InvoiceReconciledEvent.trueProtocolFee = ev.trueProtocolFee;

  const trueTax = calculateTax(event.address, "v1", ev.trueInterest);
  InvoiceReconciledEvent.trueTax = trueTax;
  InvoiceReconciledEvent.fundedAmountNet = BigInt.fromI32(0);
  InvoiceReconciledEvent.trueSpreadAmount = BigInt.fromI32(0);
  InvoiceReconciledEvent.kickbackAmount = BigInt.fromI32(0);
  InvoiceReconciledEvent.originalCreditor = ev.originalCreditor;

  const original_creditor = getOrCreateUser(ev.originalCreditor);
  const pool = getOrCreateUser(event.address);
  const priceBeforeTransaction = getPriceBeforeTransaction(event);
  const price_per_share = getOrCreatePricePerShare(event, "v1");
  const latestPrice = getLatestPrice(event, "v1");
  const historical_factoring_statistics = getOrCreateHistoricalFactoringStatistics(event, "v1");
  const pool_pnl = getOrCreatePoolProfitAndLoss(event, ev.trueInterest);

  InvoiceReconciledEvent.eventName = "InvoiceReconciled";
  InvoiceReconciledEvent.blockNumber = event.block.number;
  InvoiceReconciledEvent.transactionHash = event.transaction.hash;
  InvoiceReconciledEvent.logIndex = event.logIndex;
  InvoiceReconciledEvent.timestamp = event.block.timestamp;
  InvoiceReconciledEvent.poolAddress = event.address;
  InvoiceReconciledEvent.priceBeforeTransaction = priceBeforeTransaction;
  InvoiceReconciledEvent.priceAfterTransaction = latestPrice;
  InvoiceReconciledEvent.claim = underlyingClaim.id;

  original_creditor.factoringEvents = original_creditor.factoringEvents
    ? original_creditor.factoringEvents.concat([InvoiceReconciledEvent.id])
    : [InvoiceReconciledEvent.id];

  pool.factoringEvents = pool.factoringEvents ? pool.factoringEvents.concat([InvoiceReconciledEvent.id]) : [InvoiceReconciledEvent.id];

  InvoiceReconciledEvent.save();
  original_creditor.save();
  pool.save();
  price_per_share.save();
  historical_factoring_statistics.save();
  pool_pnl.save();
  addEventToFactoringPool(event.address, InvoiceReconciledEvent.id);
}

// V2_1: InvoicePaid (different signature)
export function handleInvoicePaidV2_1(event: InvoicePaidV2_1): void {
  const ev = event.params;
  const originatingClaimId = ev.invoiceId;

  const underlyingClaim = getClaim(originatingClaimId.toString(), "v2_1");
  const InvoiceReconciledEvent = createInvoiceReconciledEventV2_1(originatingClaimId, event);

  const original_creditor = getOrCreateUser(ev.originalCreditor);
  const pool = getOrCreateUser(event.address);

  InvoiceReconciledEvent.invoiceId = underlyingClaim.tokenId;
  InvoiceReconciledEvent.trueAdminFee = ev.trueAdminFee;
  InvoiceReconciledEvent.trueInterest = ev.trueInterest;
  InvoiceReconciledEvent.trueProtocolFee = getTargetProtocolFeeFromFundedEvent(ev.invoiceId, event);
  InvoiceReconciledEvent.trueSpreadAmount = ev.trueSpreadAmount;
  InvoiceReconciledEvent.fundedAmountNet = ev.fundedAmountNet;
  InvoiceReconciledEvent.kickbackAmount = ev.kickbackAmount;
  InvoiceReconciledEvent.originalCreditor = ev.originalCreditor;

  InvoiceReconciledEvent.trueTax = BigInt.fromI32(0);
  const priceBeforeTransaction = getPriceBeforeTransaction(event);
  const price_per_share = getOrCreatePricePerShare(event, "v2_1");
  const latestPrice = getLatestPrice(event, "v2_1");
  const historical_factoring_statistics = getOrCreateHistoricalFactoringStatistics(event, "v2_1");
  const pool_pnl = getOrCreatePoolProfitAndLoss(event, ev.trueInterest);

  InvoiceReconciledEvent.eventName = "InvoiceReconciled";
  InvoiceReconciledEvent.blockNumber = event.block.number;
  InvoiceReconciledEvent.transactionHash = event.transaction.hash;
  InvoiceReconciledEvent.logIndex = event.logIndex;
  InvoiceReconciledEvent.timestamp = event.block.timestamp;
  InvoiceReconciledEvent.poolAddress = event.address;
  InvoiceReconciledEvent.priceBeforeTransaction = priceBeforeTransaction;
  InvoiceReconciledEvent.priceAfterTransaction = latestPrice;
  InvoiceReconciledEvent.claim = underlyingClaim.id;

  original_creditor.factoringEvents = original_creditor.factoringEvents
    ? original_creditor.factoringEvents.concat([InvoiceReconciledEvent.id])
    : [InvoiceReconciledEvent.id];

  pool.factoringEvents = pool.factoringEvents ? pool.factoringEvents.concat([InvoiceReconciledEvent.id]) : [InvoiceReconciledEvent.id];

  InvoiceReconciledEvent.save();
  original_creditor.save();
  pool.save();
  price_per_share.save();
  historical_factoring_statistics.save();
  pool_pnl.save();
  addEventToFactoringPool(event.address, InvoiceReconciledEvent.id);
}

// ============================================================================
// InvoiceUnfactored
// ============================================================================

// V0: InvoiceUnfactored(indexed uint256,address,uint256,uint256)
export function handleInvoiceUnfactoredV0(event: InvoiceUnfactoredV0): void {
  const ev = event.params;
  const originatingClaimId = ev.invoiceId;

  const underlyingClaim = getClaim(originatingClaimId.toString(), "v0");
  const InvoiceUnfactoredEvent = createInvoiceUnfactoredEventV0(originatingClaimId, event);

  const targetFees = getTargetFeesAndTaxes(event.address, "v0", ev.invoiceId);

  const trueProcotolFee = targetFees[1].times(ev.interestToCharge).div(targetFees[0]);

  const trueTax = calculateTax(event.address, "v0", ev.interestToCharge);

  InvoiceUnfactoredEvent.invoiceId = underlyingClaim.tokenId;
  InvoiceUnfactoredEvent.originalCreditor = ev.originalCreditor;
  const original_creditor = getOrCreateUser(ev.originalCreditor);
  const pool = getOrCreateUser(event.address);
  const priceBeforeTransaction = getPriceBeforeTransaction(event);
  const price_per_share = getOrCreatePricePerShare(event, "v0");
  const latestPrice = getLatestPrice(event, "v0");
  const historical_factoring_statistics = getOrCreateHistoricalFactoringStatistics(event, "v0");

  InvoiceUnfactoredEvent.eventName = "InvoiceUnfactored";
  InvoiceUnfactoredEvent.blockNumber = event.block.number;
  InvoiceUnfactoredEvent.transactionHash = event.transaction.hash;
  InvoiceUnfactoredEvent.logIndex = event.logIndex;
  InvoiceUnfactoredEvent.totalRefundAmount = ev.totalRefundAmount;
  InvoiceUnfactoredEvent.interestToCharge = ev.interestToCharge;
  InvoiceUnfactoredEvent.trueInterest = ev.interestToCharge;
  InvoiceUnfactoredEvent.trueAdminFee = targetFees[2];
  InvoiceUnfactoredEvent.trueProtocolFee = trueProcotolFee;
  InvoiceUnfactoredEvent.trueTax = trueTax;
  InvoiceUnfactoredEvent.trueSpreadAmount = BigInt.fromI32(0);
  InvoiceUnfactoredEvent.isPoolOwnerUnfactoring = false;
  InvoiceUnfactoredEvent.timestamp = event.block.timestamp;
  InvoiceUnfactoredEvent.poolAddress = event.address;
  InvoiceUnfactoredEvent.priceBeforeTransaction = priceBeforeTransaction;
  InvoiceUnfactoredEvent.priceAfterTransaction = latestPrice;
  InvoiceUnfactoredEvent.claim = underlyingClaim.id;

  original_creditor.factoringEvents = original_creditor.factoringEvents
    ? original_creditor.factoringEvents.concat([InvoiceUnfactoredEvent.id])
    : [InvoiceUnfactoredEvent.id];

  pool.factoringEvents = pool.factoringEvents ? pool.factoringEvents.concat([InvoiceUnfactoredEvent.id]) : [InvoiceUnfactoredEvent.id];

  const pool_pnl = getOrCreatePoolProfitAndLoss(event, ev.interestToCharge.minus(trueTax));

  InvoiceUnfactoredEvent.save();
  original_creditor.save();
  pool.save();
  price_per_share.save();
  historical_factoring_statistics.save();
  pool_pnl.save();
  addEventToFactoringPool(event.address, InvoiceUnfactoredEvent.id);
}

// V1: InvoiceUnfactored(indexed uint256,address,int256,uint256)
export function handleInvoiceUnfactoredV1(event: InvoiceUnfactoredV1): void {
  const ev = event.params;
  const originatingClaimId = ev.invoiceId;

  const underlyingClaim = getClaim(originatingClaimId.toString(), "v1");
  const InvoiceUnfactoredEvent = createInvoiceUnfactoredEventV1(originatingClaimId, event);

  const targetFees = getTargetFeesAndTaxes(event.address, "v1", ev.invoiceId);
  const approvedInvoice = BullaFactoringV1.bind(event.address).approvedInvoices(ev.invoiceId);

  const trueProcotolFee = targetFees[0].isZero()
    ? BigInt.fromI32(0)
    : targetFees[1] // targetProcotolFee
        .times(ev.interestToCharge)
        .div(targetFees[0]); // targetInterest

  const trueTax = calculateTax(event.address, "v1", ev.interestToCharge);

  const actualDays = event.block.timestamp.minus(approvedInvoice.getFundedTimestamp()).div(BigInt.fromI32(3600 * 24));

  const adminFee = actualDays
    .times(BigInt.fromI32(approvedInvoice.getAdminFeeBps()))
    .times(approvedInvoice.getTrueFaceValue())
    .div(BigInt.fromI32(365))
    .div(BigInt.fromI32(10_000));

  InvoiceUnfactoredEvent.invoiceId = underlyingClaim.tokenId;
  InvoiceUnfactoredEvent.originalCreditor = ev.originalCreditor;
  const original_creditor = getOrCreateUser(ev.originalCreditor);
  const pool = getOrCreateUser(event.address);
  const priceBeforeTransaction = getPriceBeforeTransaction(event);
  const price_per_share = getOrCreatePricePerShare(event, "v1");
  const latestPrice = getLatestPrice(event, "v1");
  const historical_factoring_statistics = getOrCreateHistoricalFactoringStatistics(event, "v1");

  InvoiceUnfactoredEvent.eventName = "InvoiceUnfactored";
  InvoiceUnfactoredEvent.blockNumber = event.block.number;
  InvoiceUnfactoredEvent.transactionHash = event.transaction.hash;
  InvoiceUnfactoredEvent.logIndex = event.logIndex;
  InvoiceUnfactoredEvent.totalRefundAmount = ev.totalRefundOrPaymentAmount;
  InvoiceUnfactoredEvent.interestToCharge = ev.interestToCharge;
  InvoiceUnfactoredEvent.trueAdminFee = adminFee;
  InvoiceUnfactoredEvent.trueInterest = ev.interestToCharge;
  InvoiceUnfactoredEvent.trueProtocolFee = trueProcotolFee;
  InvoiceUnfactoredEvent.trueTax = trueTax;
  InvoiceUnfactoredEvent.trueSpreadAmount = BigInt.fromI32(0); // V1 doesn't have spread amount, set to 0
  InvoiceUnfactoredEvent.isPoolOwnerUnfactoring = false; // V1 doesn't have this flag
  InvoiceUnfactoredEvent.timestamp = event.block.timestamp;
  InvoiceUnfactoredEvent.poolAddress = event.address;
  InvoiceUnfactoredEvent.priceBeforeTransaction = priceBeforeTransaction;
  InvoiceUnfactoredEvent.priceAfterTransaction = latestPrice;
  InvoiceUnfactoredEvent.claim = underlyingClaim.id;

  original_creditor.factoringEvents = original_creditor.factoringEvents
    ? original_creditor.factoringEvents.concat([InvoiceUnfactoredEvent.id])
    : [InvoiceUnfactoredEvent.id];

  pool.factoringEvents = pool.factoringEvents ? pool.factoringEvents.concat([InvoiceUnfactoredEvent.id]) : [InvoiceUnfactoredEvent.id];

  const pool_pnl = getOrCreatePoolProfitAndLoss(event, ev.interestToCharge.minus(trueTax));

  InvoiceUnfactoredEvent.save();
  original_creditor.save();
  pool.save();
  price_per_share.save();
  historical_factoring_statistics.save();
  pool_pnl.save();
  addEventToFactoringPool(event.address, InvoiceUnfactoredEvent.id);
}

// V2_1: InvoiceUnfactored (different signature with spreadAmount, unfactoredByOwner)
export function handleInvoiceUnfactoredV2_1(event: InvoiceUnfactoredV2_1): void {
  const ev = event.params;
  const originatingClaimId = ev.invoiceId;

  const underlyingClaim = getClaim(originatingClaimId.toString(), "v2_1");
  const InvoiceUnfactoredEvent = createInvoiceUnfactoredEventV2_1(originatingClaimId, event);

  const trueTax = BigInt.fromI32(0);
  const spreadAmount = ev.spreadAmount;

  InvoiceUnfactoredEvent.invoiceId = underlyingClaim.tokenId;
  InvoiceUnfactoredEvent.originalCreditor = ev.originalCreditor;
  const original_creditor = getOrCreateUser(ev.originalCreditor);
  const pool = getOrCreateUser(event.address);
  const priceBeforeTransaction = getPriceBeforeTransaction(event);
  const price_per_share = getOrCreatePricePerShare(event, "v2_1");
  const latestPrice = getLatestPrice(event, "v2_1");
  const historical_factoring_statistics = getOrCreateHistoricalFactoringStatistics(event, "v2_1");

  InvoiceUnfactoredEvent.eventName = "InvoiceUnfactored";
  InvoiceUnfactoredEvent.blockNumber = event.block.number;
  InvoiceUnfactoredEvent.transactionHash = event.transaction.hash;
  InvoiceUnfactoredEvent.logIndex = event.logIndex;
  InvoiceUnfactoredEvent.totalRefundAmount = ev.totalRefundOrPaymentAmount;
  InvoiceUnfactoredEvent.interestToCharge = ev.interestToCharge;
  InvoiceUnfactoredEvent.trueAdminFee = ev.adminFee;
  InvoiceUnfactoredEvent.trueInterest = ev.interestToCharge;
  InvoiceUnfactoredEvent.trueProtocolFee = getTargetProtocolFeeFromFundedEvent(ev.invoiceId, event);
  InvoiceUnfactoredEvent.trueTax = trueTax;
  InvoiceUnfactoredEvent.trueSpreadAmount = spreadAmount;
  InvoiceUnfactoredEvent.isPoolOwnerUnfactoring = ev.unfactoredByOwner;
  InvoiceUnfactoredEvent.timestamp = event.block.timestamp;
  InvoiceUnfactoredEvent.poolAddress = event.address;
  InvoiceUnfactoredEvent.priceBeforeTransaction = priceBeforeTransaction;
  InvoiceUnfactoredEvent.priceAfterTransaction = latestPrice;
  InvoiceUnfactoredEvent.claim = underlyingClaim.id;

  original_creditor.factoringEvents = original_creditor.factoringEvents
    ? original_creditor.factoringEvents.concat([InvoiceUnfactoredEvent.id])
    : [InvoiceUnfactoredEvent.id];

  pool.factoringEvents = pool.factoringEvents ? pool.factoringEvents.concat([InvoiceUnfactoredEvent.id]) : [InvoiceUnfactoredEvent.id];

  const pool_pnl = getOrCreatePoolProfitAndLoss(event, ev.interestToCharge.minus(trueTax));

  InvoiceUnfactoredEvent.save();
  original_creditor.save();
  pool.save();
  price_per_share.save();
  historical_factoring_statistics.save();
  pool_pnl.save();
  addEventToFactoringPool(event.address, InvoiceUnfactoredEvent.id);
}

// ============================================================================
// Deposit / DepositMade
// ============================================================================

// V0: DepositMade(indexed address,uint256,uint256)
export function handleDepositMadeV0(event: DepositMade): void {
  const ev = event.params;

  // Create FactoringPool entity if it doesn't exist (for pools not created via factory)
  const factoringPool = getOrCreateFactoringPool(event.address, "v0", event);

  const DepositMadeEvent = createDepositMadeEventV0(event);

  DepositMadeEvent.poolAddress = event.address;
  DepositMadeEvent.depositor = ev.depositor;
  DepositMadeEvent.assets = ev.assets;
  DepositMadeEvent.sharesIssued = ev.sharesIssued;

  const investor = getOrCreateUser(ev.depositor);
  const pool = getOrCreateUser(event.address);
  const priceBeforeTransaction = getPriceBeforeTransaction(event);
  const price_per_share = getOrCreatePricePerShare(event, "v0");
  const latestPrice = getLatestPrice(event, "v0");
  const historical_factoring_statistics = getOrCreateHistoricalFactoringStatistics(event, "v0");

  const poolPermissions = getOrCreatePoolPermissionsContractAddresses(event.address, "v0");

  DepositMadeEvent.eventName = "DepositMade";
  DepositMadeEvent.blockNumber = event.block.number;
  DepositMadeEvent.transactionHash = event.transaction.hash;
  DepositMadeEvent.logIndex = event.logIndex;
  DepositMadeEvent.timestamp = event.block.timestamp;
  DepositMadeEvent.poolAddress = event.address;
  DepositMadeEvent.priceBeforeTransaction = priceBeforeTransaction;
  DepositMadeEvent.priceAfterTransaction = latestPrice;

  investor.factoringEvents = investor.factoringEvents ? investor.factoringEvents.concat([DepositMadeEvent.id]) : [DepositMadeEvent.id];
  pool.factoringEvents = pool.factoringEvents ? pool.factoringEvents.concat([DepositMadeEvent.id]) : [DepositMadeEvent.id];

  DepositMadeEvent.save();
  pool.save();
  investor.save();
  price_per_share.save();
  historical_factoring_statistics.save();
  poolPermissions.save();
  addEventToFactoringPool(event.address, DepositMadeEvent.id);
}

// Shared handler for V1/V2_1 Deposit (same event signature)
function handleDeposit(event: DepositV1, version: string): void {
  const ev = event.params;

  // Create FactoringPool entity if it doesn't exist (for pools not created via factory)
  const factoringPool = getOrCreateFactoringPool(event.address, version, event);

  const DepositMadeEvent = createDepositMadeEventV1(event);

  DepositMadeEvent.poolAddress = event.address;
  DepositMadeEvent.depositor = ev.sender;
  DepositMadeEvent.assets = ev.assets;
  DepositMadeEvent.sharesIssued = ev.shares;

  const investor = getOrCreateUser(ev.sender);
  const pool = getOrCreateUser(event.address);
  const priceBeforeTransaction = getPriceBeforeTransaction(event);
  const price_per_share = getOrCreatePricePerShare(event, version);
  const latestPrice = getLatestPrice(event, version);
  const historical_factoring_statistics = getOrCreateHistoricalFactoringStatistics(event, version);

  const poolPermissions = getOrCreatePoolPermissionsContractAddresses(event.address, version);

  DepositMadeEvent.eventName = "DepositMade";
  DepositMadeEvent.blockNumber = event.block.number;
  DepositMadeEvent.transactionHash = event.transaction.hash;
  DepositMadeEvent.logIndex = event.logIndex;
  DepositMadeEvent.timestamp = event.block.timestamp;
  DepositMadeEvent.poolAddress = event.address;
  DepositMadeEvent.priceBeforeTransaction = priceBeforeTransaction;
  DepositMadeEvent.priceAfterTransaction = latestPrice;

  investor.factoringEvents = investor.factoringEvents ? investor.factoringEvents.concat([DepositMadeEvent.id]) : [DepositMadeEvent.id];
  pool.factoringEvents = pool.factoringEvents ? pool.factoringEvents.concat([DepositMadeEvent.id]) : [DepositMadeEvent.id];

  DepositMadeEvent.save();
  pool.save();
  investor.save();
  price_per_share.save();
  historical_factoring_statistics.save();
  poolPermissions.save();
  addEventToFactoringPool(event.address, DepositMadeEvent.id);
}

export function handleDepositV1(event: DepositV1): void {
  handleDeposit(event, "v1");
}

export function handleDepositV2_1(event: DepositV2_1): void {
  handleDeposit(changetype<DepositV1>(event), "v2_1");
}

// ============================================================================
// Withdraw / SharesRedeemed
// ============================================================================

// V0: SharesRedeemed(indexed address,uint256,uint256)
export function handleSharesRedeemedV0(event: SharesRedeemed): void {
  const ev = event.params;

  const SharesRedeemedEvent = createSharesRedeemedEventV0(event);

  SharesRedeemedEvent.poolAddress = event.address;
  SharesRedeemedEvent.redeemer = ev.redeemer;
  SharesRedeemedEvent.assets = ev.assets;
  SharesRedeemedEvent.shares = ev.shares;
  const investor = getOrCreateUser(ev.redeemer);
  const pool = getOrCreateUser(ev.redeemer);
  const priceBeforeTransaction = getPriceBeforeTransaction(event);
  const price_per_share = getOrCreatePricePerShare(event, "v0");
  const latestPrice = getLatestPrice(event, "v0");
  const historical_factoring_statistics = getOrCreateHistoricalFactoringStatistics(event, "v0");

  SharesRedeemedEvent.eventName = "SharesRedeemed";
  SharesRedeemedEvent.blockNumber = event.block.number;
  SharesRedeemedEvent.transactionHash = event.transaction.hash;
  SharesRedeemedEvent.logIndex = event.logIndex;
  SharesRedeemedEvent.timestamp = event.block.timestamp;
  SharesRedeemedEvent.poolAddress = event.address;
  SharesRedeemedEvent.priceBeforeTransaction = priceBeforeTransaction;
  SharesRedeemedEvent.priceAfterTransaction = latestPrice;

  investor.factoringEvents = investor.factoringEvents ? investor.factoringEvents.concat([SharesRedeemedEvent.id]) : [SharesRedeemedEvent.id];
  pool.factoringEvents = pool.factoringEvents ? pool.factoringEvents.concat([SharesRedeemedEvent.id]) : [SharesRedeemedEvent.id];

  SharesRedeemedEvent.save();
  pool.save();
  investor.save();
  price_per_share.save();
  historical_factoring_statistics.save();
  addEventToFactoringPool(event.address, SharesRedeemedEvent.id);
}

// Shared handler for V1/V2_1 Withdraw (same event signature)
function handleWithdraw(event: WithdrawV1, version: string): void {
  const ev = event.params;

  const SharesRedeemedEvent = createSharesRedeemedEventV1(event);

  SharesRedeemedEvent.poolAddress = event.address;
  SharesRedeemedEvent.redeemer = ev.receiver;
  SharesRedeemedEvent.assets = ev.assets;
  SharesRedeemedEvent.shares = ev.shares;
  const investor = getOrCreateUser(ev.receiver);
  const pool = getOrCreateUser(ev.receiver);
  const priceBeforeTransaction = getPriceBeforeTransaction(event);
  const price_per_share = getOrCreatePricePerShare(event, version);
  const latestPrice = getLatestPrice(event, version);
  const historical_factoring_statistics = getOrCreateHistoricalFactoringStatistics(event, version);

  SharesRedeemedEvent.eventName = "SharesRedeemed";
  SharesRedeemedEvent.blockNumber = event.block.number;
  SharesRedeemedEvent.transactionHash = event.transaction.hash;
  SharesRedeemedEvent.logIndex = event.logIndex;
  SharesRedeemedEvent.timestamp = event.block.timestamp;
  SharesRedeemedEvent.poolAddress = event.address;
  SharesRedeemedEvent.priceBeforeTransaction = priceBeforeTransaction;
  SharesRedeemedEvent.priceAfterTransaction = latestPrice;

  investor.factoringEvents = investor.factoringEvents ? investor.factoringEvents.concat([SharesRedeemedEvent.id]) : [SharesRedeemedEvent.id];
  pool.factoringEvents = pool.factoringEvents ? pool.factoringEvents.concat([SharesRedeemedEvent.id]) : [SharesRedeemedEvent.id];

  SharesRedeemedEvent.save();
  pool.save();
  investor.save();
  price_per_share.save();
  historical_factoring_statistics.save();
  addEventToFactoringPool(event.address, SharesRedeemedEvent.id);
}

export function handleWithdrawV1(event: WithdrawV1): void {
  handleWithdraw(event, "v1");
}

export function handleWithdrawV2_1(event: WithdrawV2_1): void {
  handleWithdraw(changetype<WithdrawV1>(event), "v2_1");
}

// ============================================================================
// InvoiceImpaired
// ============================================================================

// Shared handler for V0/V1 (same event signature)
function handleInvoiceImpaired(event: InvoiceImpaired, version: string): void {
  const ev = event.params;
  const originatingClaimId = ev.invoiceId;

  const underlyingClaim = getClaim(originatingClaimId.toString(), version);

  const InvoiceImpairedEvent = createInvoiceImpairedEventV1(originatingClaimId, event);

  InvoiceImpairedEvent.invoiceId = underlyingClaim.tokenId;
  const pool = getOrCreateUser(event.address);
  const priceBeforeTransaction = getPriceBeforeTransaction(event);
  const price_per_share = getOrCreatePricePerShare(event, version);
  const latestPrice = getLatestPrice(event, version);
  const historical_factoring_statistics = getOrCreateHistoricalFactoringStatistics(event, version);

  InvoiceImpairedEvent.eventName = "InvoiceImpaired";
  InvoiceImpairedEvent.blockNumber = event.block.number;
  InvoiceImpairedEvent.transactionHash = event.transaction.hash;
  InvoiceImpairedEvent.logIndex = event.logIndex;
  InvoiceImpairedEvent.fundedAmount = ev.lossAmount;
  InvoiceImpairedEvent.impairAmount = ev.gainAmount;
  InvoiceImpairedEvent.timestamp = event.block.timestamp;
  InvoiceImpairedEvent.poolAddress = event.address;
  InvoiceImpairedEvent.priceBeforeTransaction = priceBeforeTransaction;
  InvoiceImpairedEvent.priceAfterTransaction = latestPrice;
  InvoiceImpairedEvent.claim = underlyingClaim.id;
  const lossAccrued = ev.lossAmount.minus(underlyingClaim.paidAmount).minus(ev.gainAmount).neg();
  const pool_pnl = getOrCreatePoolProfitAndLoss(event, lossAccrued);

  pool.factoringEvents = pool.factoringEvents ? pool.factoringEvents.concat([InvoiceImpairedEvent.id]) : [InvoiceImpairedEvent.id];

  InvoiceImpairedEvent.save();
  price_per_share.save();
  historical_factoring_statistics.save();
  pool_pnl.save();
  pool.save();
  addEventToFactoringPool(event.address, InvoiceImpairedEvent.id);
}

export function handleInvoiceImpairedV0(event: InvoiceImpaired): void {
  handleInvoiceImpaired(event, "v0");
}

export function handleInvoiceImpairedV1(event: InvoiceImpaired): void {
  handleInvoiceImpaired(event, "v1");
}

// ============================================================================
// DepositPermissionsChanged
// ============================================================================

export function handleDepositPermissionsChangedV0(event: DepositPermissionsChangedV0): void {
  const poolPermissions = getOrCreatePoolPermissionsContractAddresses(event.address, "v0");
  poolPermissions.depositPermissions = event.params.newAddress;
  poolPermissions.save();
}

export function handleDepositPermissionsChangedV1(event: DepositPermissionsChangedV1): void {
  const poolPermissions = getOrCreatePoolPermissionsContractAddresses(event.address, "v1");
  poolPermissions.depositPermissions = event.params.newAddress;
  poolPermissions.save();
}

export function handleDepositPermissionsChangedV2_1(event: DepositPermissionsChangedV2_1): void {
  const poolPermissions = getOrCreatePoolPermissionsContractAddresses(event.address, "v2_1");
  poolPermissions.depositPermissions = event.params.newAddress;
  poolPermissions.save();
}

// ============================================================================
// FactoringPermissionsChanged
// ============================================================================

export function handleFactoringPermissionsChangedV0(event: FactoringPermissionsChangedV0): void {
  const poolPermissions = getOrCreatePoolPermissionsContractAddresses(event.address, "v0");
  poolPermissions.factoringPermissions = event.params.newAddress;
  poolPermissions.save();
}

export function handleFactoringPermissionsChangedV1(event: FactoringPermissionsChangedV1): void {
  const poolPermissions = getOrCreatePoolPermissionsContractAddresses(event.address, "v1");
  poolPermissions.factoringPermissions = event.params.newAddress;
  poolPermissions.save();
}

export function handleFactoringPermissionsChangedV2_1(event: FactoringPermissionsChangedV2_1): void {
  const poolPermissions = getOrCreatePoolPermissionsContractAddresses(event.address, "v2_1");
  poolPermissions.factoringPermissions = event.params.newAddress;
  poolPermissions.save();
}

// ============================================================================
// RedeemPermissionsChanged (V2_1 only)
// ============================================================================

export function handleRedeemPermissionsChangedV2_1(event: RedeemPermissionsChangedV2_1): void {
  const poolPermissions = getOrCreatePoolPermissionsContractAddresses(event.address, "v2_1");
  poolPermissions.redeemPermissions = event.params.newAddress;
  poolPermissions.save();
}
