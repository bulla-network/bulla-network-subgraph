import {
  ActivePaidInvoicesReconciled,
  Deposit,
  DepositMadeWithAttachment,
  InvoiceFunded,
  InvoiceImpaired,
  InvoiceKickbackAmountSent,
  InvoicePaid,
  InvoicePaid__Params,
  InvoiceUnfactored,
  SharesRedeemedWithAttachment,
  Withdraw
} from "../../generated/BullaFactoringv2/BullaFactoringv2";
import { InvoiceUnfactored as InvoiceUnfactoredV1, DepositMade, SharesRedeemed } from "../../generated/BullaFactoring/BullaFactoring";
import { getClaim } from "../functions/BullaClaimERC721";
import {
  createDepositMadeEventV1,
  createDepositMadeEventV2,
  createDepositMadeWithAttachmentEventV1,
  createInvoiceFundedEvent,
  createInvoiceImpairedEvent,
  createInvoiceKickbackAmountSentEvent,
  createInvoicePaidEvent,
  createInvoiceReconciledEvent,
  createInvoiceUnfactoredEvent,
  createInvoiceUnfactoredEventv1,
  createSharesRedeemedEventV1,
  createSharesRedeemedEventV2,
  createSharesRedeemedWithAttachmentEventV1,
  getDepositMadeEventId,
  getSharesRedeemedEventId
} from "../functions/BullaFactoring";
import {
  calculateTax,
  getApprovedInvoiceOriginalCreditor,
  getApprovedInvoiceUpfrontBps,
  getIPFSHash_depositWithAttachment,
  getIPFSHash_redeemWithAttachment,
  getLatestPrice,
  getOrCreateHistoricalFactoringStatistics,
  getOrCreatePoolProfitAndLoss,
  getOrCreatePricePerShare,
  getOrCreateUser,
  getTargetFeesAndTaxes,
  getTrueFeesAndTaxes
} from "../functions/common";
import { DepositMadeEvent, SharesRedeemedEvent } from "../../generated/schema";
import { BigInt, log } from "@graphprotocol/graph-ts";

export function handleInvoiceFunded(event: InvoiceFunded, version: string): void {
  const ev = event.params;
  const originatingClaimId = ev.invoiceId;

  const underlyingClaim = getClaim(originatingClaimId.toString());
  const InvoiceFundedEvent = createInvoiceFundedEvent(originatingClaimId, event);

  const upfrontBps = getApprovedInvoiceUpfrontBps(event.address, version, originatingClaimId);

  InvoiceFundedEvent.invoiceId = underlyingClaim.id;
  InvoiceFundedEvent.fundedAmount = ev.fundedAmount;
  InvoiceFundedEvent.originalCreditor = ev.originalCreditor;
  InvoiceFundedEvent.upfrontBps = upfrontBps;
  const original_creditor = getOrCreateUser(ev.originalCreditor);
  // Update the price history
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
  InvoiceFundedEvent.priceAfterTransaction = latestPrice;
  InvoiceFundedEvent.claim = underlyingClaim.id;
  InvoiceFundedEvent.targetInterest = targetInterest;
  InvoiceFundedEvent.targetProtocolFee = targetProtocolFee;
  InvoiceFundedEvent.targetAdminFee = targetAdminFee;
  InvoiceFundedEvent.targetTax = targetTax;

  original_creditor.factoringEvents = original_creditor.factoringEvents ? original_creditor.factoringEvents.concat([InvoiceFundedEvent.id]) : [InvoiceFundedEvent.id];

  InvoiceFundedEvent.save();
  original_creditor.save();
  price_per_share.save();
  historical_factoring_statistics.save();
}

export function handleInvoiceFundedV1(event: InvoiceFunded): void {
  handleInvoiceFunded(event, "v1");
}

export function handleInvoiceFundedV2(event: InvoiceFunded): void {
  handleInvoiceFunded(event, "v2");
}

export function handleInvoiceKickbackAmountSent(event: InvoiceKickbackAmountSent, version: string): void {
  const ev = event.params;
  const originatingClaimId = ev.invoiceId;

  const underlyingClaim = getClaim(originatingClaimId.toString());
  const InvoiceKickbackAmountSentEvent = createInvoiceKickbackAmountSentEvent(originatingClaimId, event);

  InvoiceKickbackAmountSentEvent.invoiceId = underlyingClaim.id;
  InvoiceKickbackAmountSentEvent.kickbackAmount = ev.kickbackAmount;
  InvoiceKickbackAmountSentEvent.originalCreditor = ev.originalCreditor;
  const original_creditor = getOrCreateUser(ev.originalCreditor);
  const price_per_share = getOrCreatePricePerShare(event, version);
  const latestPrice = getLatestPrice(event, version);
  const historical_factoring_statistics = getOrCreateHistoricalFactoringStatistics(event, version);

  InvoiceKickbackAmountSentEvent.eventName = "InvoiceKickbackAmountSent";
  InvoiceKickbackAmountSentEvent.blockNumber = event.block.number;
  InvoiceKickbackAmountSentEvent.transactionHash = event.transaction.hash;
  InvoiceKickbackAmountSentEvent.logIndex = event.logIndex;
  InvoiceKickbackAmountSentEvent.timestamp = event.block.timestamp;
  InvoiceKickbackAmountSentEvent.poolAddress = event.address;
  InvoiceKickbackAmountSentEvent.priceAfterTransaction = latestPrice;
  InvoiceKickbackAmountSentEvent.claim = underlyingClaim.id;

  original_creditor.factoringEvents = original_creditor.factoringEvents
    ? original_creditor.factoringEvents.concat([InvoiceKickbackAmountSentEvent.id])
    : [InvoiceKickbackAmountSentEvent.id];

  InvoiceKickbackAmountSentEvent.save();
  original_creditor.save();
  price_per_share.save();
  historical_factoring_statistics.save();
}

export function handleInvoiceKickbackAmountSentV1(event: InvoiceKickbackAmountSent): void {
  handleInvoiceKickbackAmountSent(event, "v1");
}

export function handleInvoiceKickbackAmountSentV2(event: InvoiceKickbackAmountSent): void {
  handleInvoiceKickbackAmountSent(event, "v2");
}

export function handleInvoicePaid(event: InvoicePaid, version: string): void {
  const ev: InvoicePaid__Params = event.params;
  const originatingClaimId = ev.invoiceId;

  const underlyingClaim = getClaim(originatingClaimId.toString());
  const InvoicePaidEvent = createInvoicePaidEvent(originatingClaimId, event);

  InvoicePaidEvent.invoiceId = underlyingClaim.id;
  InvoicePaidEvent.fundedAmount = ev.fundedAmountNet;
  InvoicePaidEvent.kickbackAmount = ev.kickbackAmount;
  InvoicePaidEvent.trueAdminFee = ev.adminFee;
  InvoicePaidEvent.trueInterest = ev.trueInterest;
  InvoicePaidEvent.trueProtocolFee = ev.trueProtocolFee;
  InvoicePaidEvent.originalCreditor = ev.originalCreditor;

  // Get true taxes
  const trueTax = calculateTax(event.address, version, ev.trueInterest);
  InvoicePaidEvent.trueTax = trueTax;

  const original_creditor = getOrCreateUser(ev.originalCreditor);
  const price_per_share = getOrCreatePricePerShare(event, version);
  const latestPrice = getLatestPrice(event, version);
  const historical_factoring_statistics = getOrCreateHistoricalFactoringStatistics(event, version);
  const pool_pnl = getOrCreatePoolProfitAndLoss(event, ev.trueInterest);

  InvoicePaidEvent.eventName = "InvoicePaid";
  InvoicePaidEvent.blockNumber = event.block.number;
  InvoicePaidEvent.transactionHash = event.transaction.hash;
  InvoicePaidEvent.logIndex = event.logIndex;
  InvoicePaidEvent.timestamp = event.block.timestamp;
  InvoicePaidEvent.poolAddress = event.address;
  InvoicePaidEvent.priceAfterTransaction = latestPrice;
  InvoicePaidEvent.claim = underlyingClaim.id;

  original_creditor.factoringEvents = original_creditor.factoringEvents ? original_creditor.factoringEvents.concat([InvoicePaidEvent.id]) : [InvoicePaidEvent.id];

  InvoicePaidEvent.save();
  original_creditor.save();
  price_per_share.save();
  historical_factoring_statistics.save();
  pool_pnl.save();
}

export function handleInvoicePaidV1(event: InvoicePaid): void {
  handleInvoicePaid(event, "v1");
}

export function handleInvoicePaidV2(event: InvoicePaid): void {
  handleInvoicePaid(event, "v2");
}

export function handleInvoiceUnfactoredV1(event: InvoiceUnfactoredV1): void {
  const ev = event.params;
  const originatingClaimId = ev.invoiceId;

  const underlyingClaim = getClaim(originatingClaimId.toString());
  const InvoiceUnfactoredEvent = createInvoiceUnfactoredEventv1(originatingClaimId, event);

  InvoiceUnfactoredEvent.invoiceId = underlyingClaim.id;
  InvoiceUnfactoredEvent.originalCreditor = ev.originalCreditor;
  const original_creditor = getOrCreateUser(ev.originalCreditor);
  const price_per_share = getOrCreatePricePerShare(event, "v1");
  const latestPrice = getLatestPrice(event, "v1");
  const historical_factoring_statistics = getOrCreateHistoricalFactoringStatistics(event, "v1");

  InvoiceUnfactoredEvent.eventName = "InvoiceUnfactored";
  InvoiceUnfactoredEvent.blockNumber = event.block.number;
  InvoiceUnfactoredEvent.transactionHash = event.transaction.hash;
  InvoiceUnfactoredEvent.logIndex = event.logIndex;
  InvoiceUnfactoredEvent.totalRefundAmount = ev.totalRefundAmount;
  InvoiceUnfactoredEvent.interestToCharge = ev.interestToCharge;
  InvoiceUnfactoredEvent.timestamp = event.block.timestamp;
  InvoiceUnfactoredEvent.poolAddress = event.address;
  InvoiceUnfactoredEvent.priceAfterTransaction = latestPrice;
  InvoiceUnfactoredEvent.claim = underlyingClaim.id;

  original_creditor.factoringEvents = original_creditor.factoringEvents
    ? original_creditor.factoringEvents.concat([InvoiceUnfactoredEvent.id])
    : [InvoiceUnfactoredEvent.id];

  InvoiceUnfactoredEvent.save();
  original_creditor.save();
  price_per_share.save();
  historical_factoring_statistics.save();
}

export function handleInvoiceUnfactoredV2(event: InvoiceUnfactored): void {
  const ev = event.params;
  const originatingClaimId = ev.invoiceId;

  const underlyingClaim = getClaim(originatingClaimId.toString());
  const InvoiceUnfactoredEvent = createInvoiceUnfactoredEvent(originatingClaimId, event);

  InvoiceUnfactoredEvent.invoiceId = underlyingClaim.id;
  InvoiceUnfactoredEvent.originalCreditor = ev.originalCreditor;
  const original_creditor = getOrCreateUser(ev.originalCreditor);
  const price_per_share = getOrCreatePricePerShare(event, "v1");
  const latestPrice = getLatestPrice(event, "v1");
  const historical_factoring_statistics = getOrCreateHistoricalFactoringStatistics(event, "v1");

  InvoiceUnfactoredEvent.eventName = "InvoiceUnfactored";
  InvoiceUnfactoredEvent.blockNumber = event.block.number;
  InvoiceUnfactoredEvent.transactionHash = event.transaction.hash;
  InvoiceUnfactoredEvent.logIndex = event.logIndex;
  InvoiceUnfactoredEvent.totalRefundAmount = ev.totalRefundOrPaymentAmount;
  InvoiceUnfactoredEvent.interestToCharge = ev.interestToCharge;
  InvoiceUnfactoredEvent.timestamp = event.block.timestamp;
  InvoiceUnfactoredEvent.poolAddress = event.address;
  InvoiceUnfactoredEvent.priceAfterTransaction = latestPrice;
  InvoiceUnfactoredEvent.claim = underlyingClaim.id;

  original_creditor.factoringEvents = original_creditor.factoringEvents
    ? original_creditor.factoringEvents.concat([InvoiceUnfactoredEvent.id])
    : [InvoiceUnfactoredEvent.id];

  InvoiceUnfactoredEvent.save();
  original_creditor.save();
  price_per_share.save();
  historical_factoring_statistics.save();
}

export function handleDepositV2(event: Deposit): void {
  const ev = event.params;

  const DepositMadeEvent = createDepositMadeEventV2(event);

  DepositMadeEvent.poolAddress = event.address;
  DepositMadeEvent.depositor = ev.sender;
  DepositMadeEvent.assets = ev.assets;
  DepositMadeEvent.sharesIssued = ev.shares;

  const investor = getOrCreateUser(ev.sender);
  const price_per_share = getOrCreatePricePerShare(event, "v2");
  const latestPrice = getLatestPrice(event, "v2");
  const historical_factoring_statistics = getOrCreateHistoricalFactoringStatistics(event, "v2");

  DepositMadeEvent.eventName = "DepositMade";
  DepositMadeEvent.blockNumber = event.block.number;
  DepositMadeEvent.transactionHash = event.transaction.hash;
  DepositMadeEvent.logIndex = event.logIndex;
  DepositMadeEvent.timestamp = event.block.timestamp;
  DepositMadeEvent.poolAddress = event.address;
  DepositMadeEvent.priceAfterTransaction = latestPrice;

  investor.factoringEvents = investor.factoringEvents ? investor.factoringEvents.concat([DepositMadeEvent.id]) : [DepositMadeEvent.id];

  DepositMadeEvent.save();
  investor.save();
  price_per_share.save();
  historical_factoring_statistics.save();
}

export function handleDepositMadeV1(event: DepositMade): void {
  const ev = event.params;

  const DepositMadeEvent = createDepositMadeEventV1(event);

  DepositMadeEvent.poolAddress = event.address;
  DepositMadeEvent.depositor = ev.depositor;
  DepositMadeEvent.assets = ev.assets;
  DepositMadeEvent.sharesIssued = ev.sharesIssued;

  const investor = getOrCreateUser(ev.depositor);
  const price_per_share = getOrCreatePricePerShare(event, "v1");
  const latestPrice = getLatestPrice(event, "v1");
  const historical_factoring_statistics = getOrCreateHistoricalFactoringStatistics(event, "v1");

  DepositMadeEvent.eventName = "DepositMade";
  DepositMadeEvent.blockNumber = event.block.number;
  DepositMadeEvent.transactionHash = event.transaction.hash;
  DepositMadeEvent.logIndex = event.logIndex;
  DepositMadeEvent.timestamp = event.block.timestamp;
  DepositMadeEvent.poolAddress = event.address;
  DepositMadeEvent.priceAfterTransaction = latestPrice;

  investor.factoringEvents = investor.factoringEvents ? investor.factoringEvents.concat([DepositMadeEvent.id]) : [DepositMadeEvent.id];

  DepositMadeEvent.save();
  investor.save();
  price_per_share.save();
  historical_factoring_statistics.save();
}

export function handleDepositMadeWithAttachmentV1(event: DepositMadeWithAttachment): void {
  const ev = event.params;

  const DepositMadeEvent = createDepositMadeWithAttachmentEventV1(event);

  DepositMadeEvent.poolAddress = event.address;
  DepositMadeEvent.depositor = ev.depositor;
  DepositMadeEvent.assets = ev.assets;
  DepositMadeEvent.sharesIssued = ev.shares;
  DepositMadeEvent.ipfsHash = getIPFSHash_depositWithAttachment(ev.attachment);

  const investor = getOrCreateUser(ev.depositor);
  const price_per_share = getOrCreatePricePerShare(event, "v1");
  const latestPrice = getLatestPrice(event, "v1");
  const historical_factoring_statistics = getOrCreateHistoricalFactoringStatistics(event, "v1");

  DepositMadeEvent.eventName = "DepositMade";
  DepositMadeEvent.blockNumber = event.block.number;
  DepositMadeEvent.transactionHash = event.transaction.hash;
  DepositMadeEvent.logIndex = event.logIndex;
  DepositMadeEvent.timestamp = event.block.timestamp;
  DepositMadeEvent.poolAddress = event.address;
  DepositMadeEvent.priceAfterTransaction = latestPrice;

  investor.factoringEvents = investor.factoringEvents ? investor.factoringEvents.concat([DepositMadeEvent.id]) : [DepositMadeEvent.id];

  DepositMadeEvent.save();
  investor.save();
  price_per_share.save();
  historical_factoring_statistics.save();
}

// @notice WithAttachment events only on V2 are called together with native ERC4626 events, hence we can append the IPFS hash to the existing DepositMadeEvent
export function handleDepositMadeWithAttachmentV2(event: DepositMadeWithAttachment): void {
  const ev = event.params;

  // Fetch the existing DepositMadeEvent using the event ID, adjusting the log index
  const depositEventId = getDepositMadeEventId(event, event.logIndex.minus(BigInt.fromI32(1)));
  const depositMadeEvent = DepositMadeEvent.load(depositEventId) as DepositMadeEvent;

  depositMadeEvent.ipfsHash = getIPFSHash_depositWithAttachment(ev.attachment);

  depositMadeEvent.save();
}

// @notice handler for V2 redeem/withdraw functions
export function handleWithdraw(event: Withdraw): void {
  const ev = event.params;

  const SharesRedeemedEvent = createSharesRedeemedEventV2(event);

  SharesRedeemedEvent.poolAddress = event.address;
  SharesRedeemedEvent.redeemer = ev.receiver;
  SharesRedeemedEvent.assets = ev.assets;
  SharesRedeemedEvent.shares = ev.shares;
  const investor = getOrCreateUser(ev.receiver);
  const price_per_share = getOrCreatePricePerShare(event, "v2");
  const latestPrice = getLatestPrice(event, "v2");
  const historical_factoring_statistics = getOrCreateHistoricalFactoringStatistics(event, "v2");

  SharesRedeemedEvent.eventName = "SharesRedeemed";
  SharesRedeemedEvent.blockNumber = event.block.number;
  SharesRedeemedEvent.transactionHash = event.transaction.hash;
  SharesRedeemedEvent.logIndex = event.logIndex;
  SharesRedeemedEvent.timestamp = event.block.timestamp;
  SharesRedeemedEvent.poolAddress = event.address;
  SharesRedeemedEvent.priceAfterTransaction = latestPrice;

  investor.factoringEvents = investor.factoringEvents ? investor.factoringEvents.concat([SharesRedeemedEvent.id]) : [SharesRedeemedEvent.id];

  SharesRedeemedEvent.save();
  investor.save();
  price_per_share.save();
  historical_factoring_statistics.save();
}

// @notice handler for V1 redeem functions
export function handleSharesRedeemed(event: SharesRedeemed): void {
  const ev = event.params;

  const SharesRedeemedEvent = createSharesRedeemedEventV1(event);

  SharesRedeemedEvent.poolAddress = event.address;
  SharesRedeemedEvent.redeemer = ev.redeemer;
  SharesRedeemedEvent.assets = ev.assets;
  SharesRedeemedEvent.shares = ev.shares;
  const investor = getOrCreateUser(ev.redeemer);
  const price_per_share = getOrCreatePricePerShare(event, "v1");
  const latestPrice = getLatestPrice(event, "v1");
  const historical_factoring_statistics = getOrCreateHistoricalFactoringStatistics(event, "v1");

  SharesRedeemedEvent.eventName = "SharesRedeemed";
  SharesRedeemedEvent.blockNumber = event.block.number;
  SharesRedeemedEvent.transactionHash = event.transaction.hash;
  SharesRedeemedEvent.logIndex = event.logIndex;
  SharesRedeemedEvent.timestamp = event.block.timestamp;
  SharesRedeemedEvent.poolAddress = event.address;
  SharesRedeemedEvent.priceAfterTransaction = latestPrice;

  investor.factoringEvents = investor.factoringEvents ? investor.factoringEvents.concat([SharesRedeemedEvent.id]) : [SharesRedeemedEvent.id];

  SharesRedeemedEvent.save();
  investor.save();
  price_per_share.save();
  historical_factoring_statistics.save();
}

export function handleSharesRedeemedWithAttachmentV1(event: SharesRedeemedWithAttachment): void {
  const ev = event.params;

  const SharesRedeemedEvent = createSharesRedeemedWithAttachmentEventV1(event);

  SharesRedeemedEvent.poolAddress = event.address;
  SharesRedeemedEvent.redeemer = ev.redeemer;
  SharesRedeemedEvent.assets = ev.assets;
  SharesRedeemedEvent.shares = ev.shares;
  SharesRedeemedEvent.ipfsHash = getIPFSHash_redeemWithAttachment(ev.attachment);

  const investor = getOrCreateUser(ev.redeemer);
  const price_per_share = getOrCreatePricePerShare(event, "v1");
  const latestPrice = getLatestPrice(event, "v1");
  const historical_factoring_statistics = getOrCreateHistoricalFactoringStatistics(event, "v1");

  SharesRedeemedEvent.eventName = "SharesRedeemed";
  SharesRedeemedEvent.blockNumber = event.block.number;
  SharesRedeemedEvent.transactionHash = event.transaction.hash;
  SharesRedeemedEvent.logIndex = event.logIndex;
  SharesRedeemedEvent.timestamp = event.block.timestamp;
  SharesRedeemedEvent.poolAddress = event.address;
  SharesRedeemedEvent.priceAfterTransaction = latestPrice;

  investor.factoringEvents = investor.factoringEvents ? investor.factoringEvents.concat([SharesRedeemedEvent.id]) : [SharesRedeemedEvent.id];

  SharesRedeemedEvent.save();
  investor.save();
  price_per_share.save();
  historical_factoring_statistics.save();
}

// @notice WithAttachment events only on V2 are called together with native ERC4626 events, hence we can append the IPFS hash to the existing SharesRedeemedEvent
export function handleSharesRedeemedWithAttachmentV2(event: SharesRedeemedWithAttachment): void {
  const ev = event.params;

  // Fetch the existing sharesRedeemedEvent using the event ID, adjusting the log index
  const sharesRedeemedEventId = getSharesRedeemedEventId(event, event.logIndex.minus(BigInt.fromI32(1)));
  const sharesRedeemedEvent = SharesRedeemedEvent.load(sharesRedeemedEventId) as SharesRedeemedEvent;

  sharesRedeemedEvent.ipfsHash = getIPFSHash_redeemWithAttachment(ev.attachment);

  sharesRedeemedEvent.save();
}

export function handleInvoiceImpaired(event: InvoiceImpaired, version: string): void {
  const ev = event.params;
  const originatingClaimId = ev.invoiceId;

  const underlyingClaim = getClaim(originatingClaimId.toString());

  const InvoiceImpairedEvent = createInvoiceImpairedEvent(originatingClaimId, event);

  InvoiceImpairedEvent.invoiceId = underlyingClaim.id;
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
  InvoiceImpairedEvent.priceAfterTransaction = latestPrice;
  InvoiceImpairedEvent.claim = underlyingClaim.id;
  const lossAccrued = ev.lossAmount
    .minus(underlyingClaim.paidAmount)
    .minus(ev.gainAmount)
    .neg();
  const pool_pnl = getOrCreatePoolProfitAndLoss(event, lossAccrued);

  InvoiceImpairedEvent.save();
  price_per_share.save();
  historical_factoring_statistics.save();
}

export function handleInvoiceImpairedV1(event: InvoiceImpaired): void {
  handleInvoiceImpaired(event, "v1");
}

export function handleInvoiceImpairedV2(event: InvoiceImpaired): void {
  handleInvoiceImpaired(event, "v2");
}

export function handleActivePaidInvoicesReconciled(event: ActivePaidInvoicesReconciled, version: string): void {
  const ev = event.params;

  for (let i = 0; i < ev.paidInvoiceIds.length; i++) {
    const invoiceId = ev.paidInvoiceIds[i];
    const InvoiceReconciled = createInvoiceReconciledEvent(invoiceId, event);

    const originalCreditorAddress = getApprovedInvoiceOriginalCreditor(event.address, version, invoiceId);
    const originalCreditor = getOrCreateUser(originalCreditorAddress);

    InvoiceReconciled.poolAddress = event.address;

    const latestPrice = getLatestPrice(event, version);

    const trueFeesAndTaxes = getTrueFeesAndTaxes(event.address, version, invoiceId);
    const trueInterest = trueFeesAndTaxes[0];
    const trueProtocolFee = trueFeesAndTaxes[1];
    const trueAdminFee = trueFeesAndTaxes[2];
    const trueTax = trueFeesAndTaxes[3];

    InvoiceReconciled.eventName = "InvoiceReconciled";
    InvoiceReconciled.invoiceId = invoiceId.toString();
    InvoiceReconciled.blockNumber = event.block.number;
    InvoiceReconciled.transactionHash = event.transaction.hash;
    InvoiceReconciled.logIndex = event.logIndex;
    InvoiceReconciled.timestamp = event.block.timestamp;
    InvoiceReconciled.poolAddress = event.address;
    InvoiceReconciled.priceAfterTransaction = latestPrice;
    InvoiceReconciled.claim = invoiceId.toString();
    InvoiceReconciled.trueInterest = trueInterest;
    InvoiceReconciled.trueProtocolFee = trueProtocolFee;
    InvoiceReconciled.trueAdminFee = trueAdminFee;
    InvoiceReconciled.trueTax = trueTax;

    originalCreditor.factoringEvents = originalCreditor.factoringEvents ? originalCreditor.factoringEvents.concat([InvoiceReconciled.id]) : [InvoiceReconciled.id];

    InvoiceReconciled.save();
    originalCreditor.save();
  }

  const price_per_share = getOrCreatePricePerShare(event, version);
  const historical_factoring_statistics = getOrCreateHistoricalFactoringStatistics(event, version);

  price_per_share.save();
  historical_factoring_statistics.save();
}

export function handleActivePaidInvoicesReconciledV1(event: ActivePaidInvoicesReconciled): void {
  handleActivePaidInvoicesReconciled(event, "v1");
}

export function handleActivePaidInvoicesReconciledV2(event: ActivePaidInvoicesReconciled): void {
  handleActivePaidInvoicesReconciled(event, "v2");
}
