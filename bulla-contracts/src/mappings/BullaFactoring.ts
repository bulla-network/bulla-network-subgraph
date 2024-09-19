import { log } from "matchstick-as";
import {
  Deposit,
  DepositMadeWithAttachment,
  InvoiceFunded,
  InvoiceKickbackAmountSent,
  InvoicePaid,
  InvoicePaid__Params,
  InvoiceUnfactored,
  SharesRedeemedWithAttachment,
  Withdraw
} from "../../generated/BullaFactoring/BullaFactoring";
import { getClaim } from "../functions/BullaClaimERC721";
import {
  createDepositMadeEvent,
  createDepositMadeWithAttachmentEvent,
  createInvoiceFundedEvent,
  createInvoiceKickbackAmountSentEvent,
  createInvoicePaidEvent,
  createInvoiceUnfactoredEvent,
  createSharesRedeemedEvent,
  createSharesRedeemedWithAttachmentEvent
} from "../functions/BullaFactoring";
import {
  getIPFSHash_depositWithAttachment,
  getIPFSHash_redeemWithAttachment,
  getLatestPrice,
  getOrCreateHistoricalFactoringStatistics,
  getOrCreatePricePerShare,
  getOrCreateUser
} from "../functions/common";

export function handleInvoiceFunded(event: InvoiceFunded): void {
  const ev = event.params;
  const originatingClaimId = ev.invoiceId;

  const underlyingClaim = getClaim(originatingClaimId.toString());
  const InvoiceFundedEvent = createInvoiceFundedEvent(originatingClaimId, event);

  InvoiceFundedEvent.invoiceId = underlyingClaim.id;
  InvoiceFundedEvent.fundedAmount = ev.fundedAmount;
  InvoiceFundedEvent.originalCreditor = ev.originalCreditor;
  const original_creditor = getOrCreateUser(ev.originalCreditor);
  // Update the price history
  const price_per_share = getOrCreatePricePerShare(event);

  // Get the latest price for the event
  const latestPrice = getLatestPrice(event);

  // Get the historical factoring statistics
  const historical_factoring_statistics = getOrCreateHistoricalFactoringStatistics(event);

  InvoiceFundedEvent.eventName = "InvoiceFunded";
  InvoiceFundedEvent.blockNumber = event.block.number;
  InvoiceFundedEvent.transactionHash = event.transaction.hash;
  InvoiceFundedEvent.logIndex = event.logIndex;
  InvoiceFundedEvent.timestamp = event.block.timestamp;
  InvoiceFundedEvent.poolAddress = event.address;
  InvoiceFundedEvent.priceAfterTransaction = latestPrice;
  InvoiceFundedEvent.claim = underlyingClaim.id;

  original_creditor.factoringEvents = original_creditor.factoringEvents ? original_creditor.factoringEvents.concat([InvoiceFundedEvent.id]) : [InvoiceFundedEvent.id];

  InvoiceFundedEvent.save();
  original_creditor.save();
  price_per_share.save();
  historical_factoring_statistics.save();
}

export function handleInvoiceKickbackAmountSent(event: InvoiceKickbackAmountSent): void {
  const ev = event.params;
  const originatingClaimId = ev.invoiceId;

  const underlyingClaim = getClaim(originatingClaimId.toString());
  const InvoiceKickbackAmountSentEvent = createInvoiceKickbackAmountSentEvent(originatingClaimId, event);

  InvoiceKickbackAmountSentEvent.invoiceId = underlyingClaim.id;
  InvoiceKickbackAmountSentEvent.kickbackAmount = ev.kickbackAmount;
  InvoiceKickbackAmountSentEvent.originalCreditor = ev.originalCreditor;
  const original_creditor = getOrCreateUser(ev.originalCreditor);
  const price_per_share = getOrCreatePricePerShare(event);
  const latestPrice = getLatestPrice(event);
  const historical_factoring_statistics = getOrCreateHistoricalFactoringStatistics(event);

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

export function handleInvoicePaid(event: InvoicePaid): void {
  const ev: InvoicePaid__Params = event.params;
  const originatingClaimId = ev.invoiceId;

  log.info("in handleInvoicePaid", []);
  const underlyingClaim = getClaim(originatingClaimId.toString());
  const InvoicePaidEvent = createInvoicePaidEvent(originatingClaimId, event);

  InvoicePaidEvent.invoiceId = underlyingClaim.id;
  InvoicePaidEvent.fundedAmount = ev.fundedAmountNet;
  InvoicePaidEvent.kickbackAmount = ev.kickbackAmount;
  InvoicePaidEvent.trueAdminFee = ev.adminFee;
  InvoicePaidEvent.trueInterest = ev.trueInterest;
  InvoicePaidEvent.trueProtocolFee = ev.trueProtocolFee;
  InvoicePaidEvent.originalCreditor = ev.originalCreditor;
  const original_creditor = getOrCreateUser(ev.originalCreditor);
  const price_per_share = getOrCreatePricePerShare(event);
  const latestPrice = getLatestPrice(event);
  const historical_factoring_statistics = getOrCreateHistoricalFactoringStatistics(event);

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
}

export function handleInvoiceUnfactored(event: InvoiceUnfactored): void {
  const ev = event.params;
  const originatingClaimId = ev.invoiceId;

  const underlyingClaim = getClaim(originatingClaimId.toString());
  const InvoiceUnfactoredEvent = createInvoiceUnfactoredEvent(originatingClaimId, event);

  InvoiceUnfactoredEvent.invoiceId = underlyingClaim.id;
  InvoiceUnfactoredEvent.originalCreditor = ev.originalCreditor;
  const original_creditor = getOrCreateUser(ev.originalCreditor);
  const price_per_share = getOrCreatePricePerShare(event);
  const latestPrice = getLatestPrice(event);
  const historical_factoring_statistics = getOrCreateHistoricalFactoringStatistics(event);

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

export function handleDepositMade(event: Deposit): void {
  const ev = event.params;

  const DepositMadeEvent = createDepositMadeEvent(event);

  DepositMadeEvent.poolAddress = event.address;
  DepositMadeEvent.depositor = ev.sender;
  DepositMadeEvent.assets = ev.assets;
  DepositMadeEvent.sharesIssued = ev.shares;
  const investor = getOrCreateUser(ev.sender);
  const price_per_share = getOrCreatePricePerShare(event);
  const latestPrice = getLatestPrice(event);
  const historical_factoring_statistics = getOrCreateHistoricalFactoringStatistics(event);

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

export function handleDepositMadeWithAttachment(event: DepositMadeWithAttachment): void {
  const ev = event.params;

  const DepositMadeWithAttachmentEvent = createDepositMadeWithAttachmentEvent(event);

  DepositMadeWithAttachmentEvent.poolAddress = event.address;
  DepositMadeWithAttachmentEvent.depositor = ev.depositor;
  DepositMadeWithAttachmentEvent.assets = ev.assets;
  DepositMadeWithAttachmentEvent.sharesIssued = ev.shares;
  DepositMadeWithAttachmentEvent.ipfsHash = getIPFSHash_depositWithAttachment(ev.attachment);
  const investor = getOrCreateUser(ev.depositor);
  const price_per_share = getOrCreatePricePerShare(event);
  const latestPrice = getLatestPrice(event);
  const historical_factoring_statistics = getOrCreateHistoricalFactoringStatistics(event);

  DepositMadeWithAttachmentEvent.eventName = "DepositMadeWithAttachment";
  DepositMadeWithAttachmentEvent.blockNumber = event.block.number;
  DepositMadeWithAttachmentEvent.transactionHash = event.transaction.hash;
  DepositMadeWithAttachmentEvent.logIndex = event.logIndex;
  DepositMadeWithAttachmentEvent.timestamp = event.block.timestamp;
  DepositMadeWithAttachmentEvent.poolAddress = event.address;
  DepositMadeWithAttachmentEvent.priceAfterTransaction = latestPrice;

  investor.factoringEvents = investor.factoringEvents ? investor.factoringEvents.concat([DepositMadeWithAttachmentEvent.id]) : [DepositMadeWithAttachmentEvent.id];

  DepositMadeWithAttachmentEvent.save();
  investor.save();
  price_per_share.save();
  historical_factoring_statistics.save();
}

export function handleSharesRedeemed(event: Withdraw): void {
  const ev = event.params;

  const SharesRedeemedEvent = createSharesRedeemedEvent(event);

  SharesRedeemedEvent.poolAddress = event.address;
  SharesRedeemedEvent.redeemer = ev.receiver;
  SharesRedeemedEvent.assets = ev.assets;
  SharesRedeemedEvent.shares = ev.shares;
  const investor = getOrCreateUser(ev.receiver);
  const price_per_share = getOrCreatePricePerShare(event);
  const latestPrice = getLatestPrice(event);
  const historical_factoring_statistics = getOrCreateHistoricalFactoringStatistics(event);

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

export function handleSharesRedeemedWithAttachment(event: SharesRedeemedWithAttachment): void {
  const ev = event.params;

  const SharesRedeemedWithAttachmentEvent = createSharesRedeemedWithAttachmentEvent(event);

  SharesRedeemedWithAttachmentEvent.poolAddress = event.address;
  SharesRedeemedWithAttachmentEvent.redeemer = ev.redeemer;
  SharesRedeemedWithAttachmentEvent.assets = ev.assets;
  SharesRedeemedWithAttachmentEvent.shares = ev.shares;
  SharesRedeemedWithAttachmentEvent.ipfsHash = getIPFSHash_redeemWithAttachment(ev.attachment);
  const investor = getOrCreateUser(ev.redeemer);
  const price_per_share = getOrCreatePricePerShare(event);
  const latestPrice = getLatestPrice(event);
  const historical_factoring_statistics = getOrCreateHistoricalFactoringStatistics(event);

  SharesRedeemedWithAttachmentEvent.eventName = "SharesRedeemedWithAttachment";
  SharesRedeemedWithAttachmentEvent.blockNumber = event.block.number;
  SharesRedeemedWithAttachmentEvent.transactionHash = event.transaction.hash;
  SharesRedeemedWithAttachmentEvent.logIndex = event.logIndex;
  SharesRedeemedWithAttachmentEvent.timestamp = event.block.timestamp;
  SharesRedeemedWithAttachmentEvent.poolAddress = event.address;
  SharesRedeemedWithAttachmentEvent.priceAfterTransaction = latestPrice;

  investor.factoringEvents = investor.factoringEvents ? investor.factoringEvents.concat([SharesRedeemedWithAttachmentEvent.id]) : [SharesRedeemedWithAttachmentEvent.id];

  SharesRedeemedWithAttachmentEvent.save();
  investor.save();
  price_per_share.save();
  historical_factoring_statistics.save();
}
