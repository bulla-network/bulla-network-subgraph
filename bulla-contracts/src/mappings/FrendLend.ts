import { Address } from "@graphprotocol/graph-ts";
import { BullaTagUpdated } from "../../generated/BullaBanker/BullaBanker";
import {
  FeeWithdrawn,
  LoanOfferAccepted as LoanOfferAcceptedV2,
  LoanOffered as LoanOfferedV2,
  LoanOfferRejected as LoanOfferRejectedV2,
  LoanPayment,
} from "../../generated/BullaFrendLend/BullaFrendLend";
import { LoanOfferAccepted, LoanOffered, LoanOfferRejected } from "../../generated/FrendLend/FrendLend";
import { getOrCreateClaim } from "../functions/BullaClaimERC721";
import { BULLA_CLAIM_VERSION_V2, getIPFSHash_loanOffered, getOrCreateToken, getOrCreateUser } from "../functions/common";
import {
  createFeeWithdrawnEvent,
  createLoanOfferAcceptedEvent,
  createLoanOfferAcceptedEventV2,
  createLoanOfferedEvent,
  createLoanOfferedEventV2,
  createLoanOfferRejectedEvent,
  createLoanOfferRejectedEventV2,
  createLoanPaymentEvent,
  getLoanOfferedEvent,
  getLoanOfferedEventId,
} from "../functions/FrendLend";
import * as BullaBanker from "./BullaBanker";

// this contract also emits BullaTagUpdatedEvents
export function handleBullaTagUpdated(event: BullaTagUpdated): void {
  BullaBanker.handleBullaTagUpdated(event);
}

export function handleLoanOffered(event: LoanOffered): void {
  const ev = event.params;
  const offer = event.params.loanOffer;

  const loanOfferedEvent = createLoanOfferedEvent(event);

  const user_creditor = getOrCreateUser(offer.creditor);
  const user_debtor = getOrCreateUser(offer.debtor);

  loanOfferedEvent.loanId = ev.loanId.toString();
  loanOfferedEvent.offeredBy = ev.offeredBy;
  loanOfferedEvent.interestBPS = offer.interestBPS;
  loanOfferedEvent.termLength = offer.termLength;
  loanOfferedEvent.loanAmount = offer.loanAmount;
  loanOfferedEvent.creditor = offer.creditor;
  loanOfferedEvent.debtor = offer.debtor;
  loanOfferedEvent.description = offer.description;
  loanOfferedEvent.claimToken = getOrCreateToken(offer.claimToken).id;
  loanOfferedEvent.ipfsHash = getIPFSHash_loanOffered(offer.attachment);

  loanOfferedEvent.eventName = "LoanOffered";
  loanOfferedEvent.blockNumber = event.block.number;
  loanOfferedEvent.transactionHash = event.transaction.hash;
  loanOfferedEvent.logIndex = event.logIndex;
  loanOfferedEvent.timestamp = event.block.timestamp;

  user_creditor.frendLendEvents = user_creditor.frendLendEvents ? user_creditor.frendLendEvents.concat([loanOfferedEvent.id]) : [loanOfferedEvent.id];
  user_debtor.frendLendEvents = user_debtor.frendLendEvents ? user_debtor.frendLendEvents.concat([loanOfferedEvent.id]) : [loanOfferedEvent.id];

  loanOfferedEvent.save();
  user_creditor.save();
  user_debtor.save();
}

export function handleLoanOfferedV2(event: LoanOfferedV2): void {
  const ev = event.params;
  const offer = event.params.loanOffer;
  const metadata = event.params.metadata;

  const loanOfferedEvent = createLoanOfferedEventV2(event);

  const user_creditor = getOrCreateUser(offer.creditor);
  const user_debtor = getOrCreateUser(offer.debtor);

  loanOfferedEvent.loanId = ev.offerId.toString();
  loanOfferedEvent.offeredBy = ev.offeredBy;
  loanOfferedEvent.interestBPS = offer.interestConfig.interestRateBps;
  loanOfferedEvent.termLength = offer.termLength;
  loanOfferedEvent.loanAmount = offer.loanAmount;
  loanOfferedEvent.creditor = offer.creditor;
  loanOfferedEvent.debtor = offer.debtor;
  loanOfferedEvent.description = offer.description;
  loanOfferedEvent.claimToken = getOrCreateToken(offer.token).id;
  loanOfferedEvent.tokenURI = metadata.tokenURI; // V2 has metadata instead of IPFS attachment
  loanOfferedEvent.attachmentURI = metadata.attachmentURI; // V2 has metadata instead of IPFS attachment
  loanOfferedEvent.impairmentGracePeriod = offer.impairmentGracePeriod;
  loanOfferedEvent.expiresAt = offer.expiresAt;

  loanOfferedEvent.eventName = "LoanOffered";
  loanOfferedEvent.blockNumber = event.block.number;
  loanOfferedEvent.transactionHash = event.transaction.hash;
  loanOfferedEvent.logIndex = event.logIndex;
  loanOfferedEvent.timestamp = event.block.timestamp;

  user_creditor.frendLendEvents = user_creditor.frendLendEvents ? user_creditor.frendLendEvents.concat([loanOfferedEvent.id]) : [loanOfferedEvent.id];
  user_debtor.frendLendEvents = user_debtor.frendLendEvents ? user_debtor.frendLendEvents.concat([loanOfferedEvent.id]) : [loanOfferedEvent.id];

  loanOfferedEvent.save();
  user_creditor.save();
  user_debtor.save();
}

export function handleLoanOfferAccepted(event: LoanOfferAccepted): void {
  const ev = event.params;
  const loanId = event.params.loanId;

  const loanOfferAcceptedEvent = createLoanOfferAcceptedEvent(event);
  const loanOfferedEvent = getLoanOfferedEvent(getLoanOfferedEventId(loanId));

  const user_creditor = getOrCreateUser(Address.fromString(loanOfferedEvent.creditor.toHexString()));
  const user_debtor = getOrCreateUser(Address.fromString(loanOfferedEvent.debtor.toHexString()));

  loanOfferAcceptedEvent.loanId = loanId.toString();
  loanOfferAcceptedEvent.claimId = ev.claimId.toString();

  loanOfferAcceptedEvent.eventName = "LoanOfferAccepted";
  loanOfferAcceptedEvent.blockNumber = event.block.number;
  loanOfferAcceptedEvent.transactionHash = event.transaction.hash;
  loanOfferAcceptedEvent.logIndex = event.logIndex;
  loanOfferAcceptedEvent.timestamp = event.block.timestamp;

  user_creditor.frendLendEvents = user_creditor.frendLendEvents ? user_creditor.frendLendEvents.concat([loanOfferAcceptedEvent.id]) : [loanOfferAcceptedEvent.id];
  user_debtor.frendLendEvents = user_debtor.frendLendEvents ? user_debtor.frendLendEvents.concat([loanOfferAcceptedEvent.id]) : [loanOfferAcceptedEvent.id];

  loanOfferAcceptedEvent.save();
  user_creditor.save();
  user_debtor.save();
}

export function handleLoanOfferAcceptedV2(event: LoanOfferAcceptedV2): void {
  const ev = event.params;
  const offerId = event.params.offerId;

  const loanOfferAcceptedEvent = createLoanOfferAcceptedEventV2(event);
  const loanOfferedEvent = getLoanOfferedEvent(getLoanOfferedEventId(offerId));

  const user_creditor = getOrCreateUser(Address.fromString(loanOfferedEvent.creditor.toHexString()));
  const user_debtor = getOrCreateUser(Address.fromString(loanOfferedEvent.debtor.toHexString()));

  loanOfferAcceptedEvent.loanId = offerId.toString();
  loanOfferAcceptedEvent.claimId = ev.claimId.toString();
  loanOfferAcceptedEvent.fee = ev.fee;
  loanOfferAcceptedEvent.tokenURI = ev.metadata.tokenURI;
  loanOfferAcceptedEvent.attachmentURI = ev.metadata.attachmentURI;

  loanOfferAcceptedEvent.eventName = "LoanOfferAccepted";
  loanOfferAcceptedEvent.blockNumber = event.block.number;
  loanOfferAcceptedEvent.transactionHash = event.transaction.hash;
  loanOfferAcceptedEvent.logIndex = event.logIndex;
  loanOfferAcceptedEvent.timestamp = event.block.timestamp;

  user_creditor.frendLendEvents = user_creditor.frendLendEvents ? user_creditor.frendLendEvents.concat([loanOfferAcceptedEvent.id]) : [loanOfferAcceptedEvent.id];
  user_debtor.frendLendEvents = user_debtor.frendLendEvents ? user_debtor.frendLendEvents.concat([loanOfferAcceptedEvent.id]) : [loanOfferAcceptedEvent.id];

  loanOfferAcceptedEvent.save();
  user_creditor.save();
  user_debtor.save();
}

export function handleLoanOfferRejected(event: LoanOfferRejected): void {
  const ev = event.params;
  const loanId = event.params.loanId;

  const loanOfferRejectedEvent = createLoanOfferRejectedEvent(event);
  const loanOfferedEvent = getLoanOfferedEvent(getLoanOfferedEventId(loanId));

  const user_creditor = getOrCreateUser(Address.fromString(loanOfferedEvent.creditor.toHexString()));
  const user_debtor = getOrCreateUser(Address.fromString(loanOfferedEvent.debtor.toHexString()));

  loanOfferRejectedEvent.loanId = loanId.toString();
  loanOfferRejectedEvent.rejectedBy = ev.rejectedBy;

  loanOfferRejectedEvent.eventName = "LoanOfferRejected";
  loanOfferRejectedEvent.blockNumber = event.block.number;
  loanOfferRejectedEvent.transactionHash = event.transaction.hash;
  loanOfferRejectedEvent.logIndex = event.logIndex;
  loanOfferRejectedEvent.timestamp = event.block.timestamp;

  user_creditor.frendLendEvents = user_creditor.frendLendEvents ? user_creditor.frendLendEvents.concat([loanOfferRejectedEvent.id]) : [loanOfferRejectedEvent.id];
  user_debtor.frendLendEvents = user_debtor.frendLendEvents ? user_debtor.frendLendEvents.concat([loanOfferRejectedEvent.id]) : [loanOfferRejectedEvent.id];

  loanOfferRejectedEvent.save();
  user_creditor.save();
  user_debtor.save();
}

export function handleFeeWithdrawn(event: FeeWithdrawn): void {
  const ev = event.params;

  const feeWithdrawnEvent = createFeeWithdrawnEvent(event);
  const user_admin = getOrCreateUser(ev.admin);

  feeWithdrawnEvent.admin = ev.admin;
  feeWithdrawnEvent.token = getOrCreateToken(ev.token).id;
  feeWithdrawnEvent.amount = ev.amount;

  feeWithdrawnEvent.eventName = "FeeWithdrawn";
  feeWithdrawnEvent.blockNumber = event.block.number;
  feeWithdrawnEvent.transactionHash = event.transaction.hash;
  feeWithdrawnEvent.logIndex = event.logIndex;
  feeWithdrawnEvent.timestamp = event.block.timestamp;

  user_admin.frendLendEvents = user_admin.frendLendEvents ? user_admin.frendLendEvents.concat([feeWithdrawnEvent.id]) : [feeWithdrawnEvent.id];

  feeWithdrawnEvent.save();
  user_admin.save();
}

export function handleLoanPayment(event: LoanPayment): void {
  const ev = event.params;

  const loanPaymentEvent = createLoanPaymentEvent(event);
  // Update the underlying claim that was created when the loan was accepted
  const claim = getOrCreateClaim(ev.claimId.toString(), BULLA_CLAIM_VERSION_V2);

  loanPaymentEvent.claim = claim.id;
  loanPaymentEvent.grossInterestPaid = ev.grossInterestPaid;
  loanPaymentEvent.principalPaid = ev.principalPaid;
  loanPaymentEvent.protocolFee = ev.protocolFee;

  loanPaymentEvent.eventName = "LoanPayment";
  loanPaymentEvent.blockNumber = event.block.number;
  loanPaymentEvent.transactionHash = event.transaction.hash;
  loanPaymentEvent.logIndex = event.logIndex;
  loanPaymentEvent.timestamp = event.block.timestamp;

  loanPaymentEvent.save();

  claim.lastUpdatedBlockNumber = event.block.number;
  claim.lastUpdatedTimestamp = event.block.timestamp;
  claim.save();

  // Add the loan payment event to creditor and debtor's frendLendEvents
  const user_creditor = getOrCreateUser(Address.fromString(claim.creditor));
  const user_debtor = getOrCreateUser(Address.fromString(claim.debtor));

  user_creditor.frendLendEvents = user_creditor.frendLendEvents ? user_creditor.frendLendEvents.concat([loanPaymentEvent.id]) : [loanPaymentEvent.id];
  user_debtor.frendLendEvents = user_debtor.frendLendEvents ? user_debtor.frendLendEvents.concat([loanPaymentEvent.id]) : [loanPaymentEvent.id];

  user_creditor.save();
  user_debtor.save();
}

export function handleLoanOfferRejectedV2(event: LoanOfferRejectedV2): void {
  const ev = event.params;
  const offerId = event.params.offerId;

  const loanOfferRejectedEvent = createLoanOfferRejectedEventV2(event);
  const loanOfferedEvent = getLoanOfferedEvent(getLoanOfferedEventId(offerId));

  const user_creditor = getOrCreateUser(Address.fromString(loanOfferedEvent.creditor.toHexString()));
  const user_debtor = getOrCreateUser(Address.fromString(loanOfferedEvent.debtor.toHexString()));

  loanOfferRejectedEvent.loanId = offerId.toString();
  loanOfferRejectedEvent.rejectedBy = ev.rejectedBy;

  loanOfferRejectedEvent.eventName = "LoanOfferRejected";
  loanOfferRejectedEvent.blockNumber = event.block.number;
  loanOfferRejectedEvent.transactionHash = event.transaction.hash;
  loanOfferRejectedEvent.logIndex = event.logIndex;
  loanOfferRejectedEvent.timestamp = event.block.timestamp;

  user_creditor.frendLendEvents = user_creditor.frendLendEvents ? user_creditor.frendLendEvents.concat([loanOfferRejectedEvent.id]) : [loanOfferRejectedEvent.id];
  user_debtor.frendLendEvents = user_debtor.frendLendEvents ? user_debtor.frendLendEvents.concat([loanOfferRejectedEvent.id]) : [loanOfferRejectedEvent.id];

  loanOfferRejectedEvent.save();
  user_creditor.save();
  user_debtor.save();
}
