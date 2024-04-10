import {
  DepositMade,
  DepositMadeWithAttachment,
  InvoiceFunded,
  InvoiceKickbackAmountSent,
  InvoiceUnfactored,
  SharesRedeemed,
  SharesRedeemedWithAttachment
} from "../../generated/BullaFactoring/BullaFactoring";
import { getClaim } from "../functions/BullaClaimERC721";
import {
  createDepositMadeEvent,
  createDepositMadeWithAttachmentEvent,
  createInvoiceFundedEvent,
  createInvoiceKickbackAmountSentEvent,
  createInvoiceUnfactoredEvent,
  createSharesRedeemedEvent,
  createSharesRedeemedWithAttachmentEvent
} from "../functions/BullaFactoring";
import { getIPFSHash_depositWithAttachment, getIPFSHash_redeemWithAttachment } from "../functions/common";

export function handleInvoiceFunded(event: InvoiceFunded): void {
  const ev = event.params;
  const originatingClaimId = ev.invoiceId;

  const underlyingClaim = getClaim(originatingClaimId.toString());
  const InvoiceFundedEvent = createInvoiceFundedEvent(originatingClaimId, event);

  InvoiceFundedEvent.invoiceId = underlyingClaim.id;
  InvoiceFundedEvent.fundedAmount = ev.fundedAmount;
  InvoiceFundedEvent.originalCreditor = ev.originalCreditor;

  InvoiceFundedEvent.eventName = "InvoiceFunded";
  InvoiceFundedEvent.blockNumber = event.block.number;
  InvoiceFundedEvent.transactionHash = event.transaction.hash;
  InvoiceFundedEvent.logIndex = event.logIndex;
  InvoiceFundedEvent.timestamp = event.block.timestamp;

  InvoiceFundedEvent.save();
}

export function handleInvoiceKickbackAmountSent(event: InvoiceKickbackAmountSent): void {
  const ev = event.params;
  const originatingClaimId = ev.invoiceId;

  const underlyingClaim = getClaim(originatingClaimId.toString());
  const InvoiceKickbackAmountSentEvent = createInvoiceKickbackAmountSentEvent(originatingClaimId, event);

  InvoiceKickbackAmountSentEvent.invoiceId = underlyingClaim.id;
  InvoiceKickbackAmountSentEvent.kickbackAmount = ev.kickbackAmount;
  InvoiceKickbackAmountSentEvent.originalCreditor = ev.originalCreditor;

  InvoiceKickbackAmountSentEvent.eventName = "InvoiceKickbackAmountSent";
  InvoiceKickbackAmountSentEvent.blockNumber = event.block.number;
  InvoiceKickbackAmountSentEvent.transactionHash = event.transaction.hash;
  InvoiceKickbackAmountSentEvent.logIndex = event.logIndex;
  InvoiceKickbackAmountSentEvent.timestamp = event.block.timestamp;

  InvoiceKickbackAmountSentEvent.save();
}

export function handleInvoiceUnfactored(event: InvoiceUnfactored): void {
  const ev = event.params;
  const originatingClaimId = ev.invoiceId;

  const underlyingClaim = getClaim(originatingClaimId.toString());
  const InvoiceUnfactoredEvent = createInvoiceUnfactoredEvent(originatingClaimId, event);

  InvoiceUnfactoredEvent.invoiceId = underlyingClaim.id;
  InvoiceUnfactoredEvent.originalCreditor = ev.originalCreditor;

  InvoiceUnfactoredEvent.eventName = "InvoiceUnfactored";
  InvoiceUnfactoredEvent.blockNumber = event.block.number;
  InvoiceUnfactoredEvent.transactionHash = event.transaction.hash;
  InvoiceUnfactoredEvent.logIndex = event.logIndex;
  InvoiceUnfactoredEvent.timestamp = event.block.timestamp;

  InvoiceUnfactoredEvent.save();
}

export function handleDepositMade(event: DepositMade): void {
  const ev = event.params;

  const DepositMadeEvent = createDepositMadeEvent(event);

  DepositMadeEvent.poolAddress = event.address;
  DepositMadeEvent.depositor = ev.depositor;
  DepositMadeEvent.assets = ev.assets;
  DepositMadeEvent.sharesIssued = ev.sharesIssued;

  DepositMadeEvent.eventName = "DepositMade";
  DepositMadeEvent.blockNumber = event.block.number;
  DepositMadeEvent.transactionHash = event.transaction.hash;
  DepositMadeEvent.logIndex = event.logIndex;
  DepositMadeEvent.timestamp = event.block.timestamp;

  DepositMadeEvent.save();
}

export function handleDepositMadeWithAttachment(event: DepositMadeWithAttachment): void {
  const ev = event.params;

  const DepositMadeWithAttachmentEvent = createDepositMadeWithAttachmentEvent(event);

  DepositMadeWithAttachmentEvent.poolAddress = event.address;
  DepositMadeWithAttachmentEvent.depositor = ev.depositor;
  DepositMadeWithAttachmentEvent.assets = ev.assets;
  DepositMadeWithAttachmentEvent.sharesIssued = ev.shares;
  DepositMadeWithAttachmentEvent.ipfsHash = getIPFSHash_depositWithAttachment(ev.attachment);

  DepositMadeWithAttachmentEvent.eventName = "DepositMadeWithAttachment";
  DepositMadeWithAttachmentEvent.blockNumber = event.block.number;
  DepositMadeWithAttachmentEvent.transactionHash = event.transaction.hash;
  DepositMadeWithAttachmentEvent.logIndex = event.logIndex;
  DepositMadeWithAttachmentEvent.timestamp = event.block.timestamp;

  DepositMadeWithAttachmentEvent.save();
}

export function handleSharesRedeemed(event: SharesRedeemed): void {
  const ev = event.params;

  const SharesRedeemedEvent = createSharesRedeemedEvent(event);

  SharesRedeemedEvent.poolAddress = event.address;
  SharesRedeemedEvent.redeemer = ev.redeemer;
  SharesRedeemedEvent.assets = ev.assets;
  SharesRedeemedEvent.shares = ev.shares;

  SharesRedeemedEvent.eventName = "SharesRedeemed";
  SharesRedeemedEvent.blockNumber = event.block.number;
  SharesRedeemedEvent.transactionHash = event.transaction.hash;
  SharesRedeemedEvent.logIndex = event.logIndex;
  SharesRedeemedEvent.timestamp = event.block.timestamp;

  SharesRedeemedEvent.save();
}

export function handleSharesRedeemedWithAttachment(event: SharesRedeemedWithAttachment): void {
  const ev = event.params;

  const SharesRedeemedWithAttachmentEvent = createSharesRedeemedWithAttachmentEvent(event);

  SharesRedeemedWithAttachmentEvent.poolAddress = event.address;
  SharesRedeemedWithAttachmentEvent.redeemer = ev.redeemer;
  SharesRedeemedWithAttachmentEvent.assets = ev.assets;
  SharesRedeemedWithAttachmentEvent.shares = ev.shares;
  SharesRedeemedWithAttachmentEvent.ipfsHash = getIPFSHash_redeemWithAttachment(ev.attachment);

  SharesRedeemedWithAttachmentEvent.eventName = "SharesRedeemedWithAttachment";
  SharesRedeemedWithAttachmentEvent.blockNumber = event.block.number;
  SharesRedeemedWithAttachmentEvent.transactionHash = event.transaction.hash;
  SharesRedeemedWithAttachmentEvent.logIndex = event.logIndex;
  SharesRedeemedWithAttachmentEvent.timestamp = event.block.timestamp;

  SharesRedeemedWithAttachmentEvent.save();
}
