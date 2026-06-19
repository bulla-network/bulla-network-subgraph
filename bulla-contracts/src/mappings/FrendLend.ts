import { Address, BigInt } from "@graphprotocol/graph-ts";
import { BullaTagUpdated } from "../../generated/BullaBanker/BullaBanker";
import {
  FeeWithdrawn,
  LoanOfferAccepted as LoanOfferAcceptedV2,
  LoanOffered as LoanOfferedV2,
  LoanOfferRejected as LoanOfferRejectedV2,
  LoanPayment,
} from "../../generated/BullaFrendLendV2/BullaFrendLendV2";
import { LoanOfferAccepted, LoanOffered, LoanOfferRejected } from "../../generated/FrendLend/FrendLend";
import { LoanOffer } from "../../generated/schema";
import { getClaim, getOrCreateClaim } from "../functions/BullaClaimERC721";
import {
  BULLA_CLAIM_VERSION_V1,
  BULLA_CLAIM_VERSION_V2,
  CLAIM_FINANCING_KIND_ACCEPTED,
  CLAIM_FINANCING_ORIGINATION_FRENDLEND,
  getIPFSHash_loanOffered,
  getOrCreateClaimFinancing,
  getOrCreateLoanOffer,
  getOrCreateToken,
  getOrCreateUser,
  LOAN_OFFER_STATUS_ACCEPTED,
  LOAN_OFFER_STATUS_OFFERED,
  LOAN_OFFER_STATUS_REJECTED,
} from "../functions/common";
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
  loanOfferedEvent.version = BULLA_CLAIM_VERSION_V1;
  loanOfferedEvent.offeredBy = ev.offeredBy;
  loanOfferedEvent.interestBPS = offer.interestBPS;
  loanOfferedEvent.numberOfPeriodsPerYear = 0; // V1 doesn't have numberOfPeriodsPerYear, default to 0
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

  const loanOffer = getOrCreateLoanOffer(ev.loanId.toString(), "v1", event);
  loanOffer.version = BULLA_CLAIM_VERSION_V1;
  loanOffer.status = LOAN_OFFER_STATUS_OFFERED;
  loanOffer.offeredBy = ev.offeredBy;
  loanOffer.creditor = offer.creditor;
  loanOffer.debtor = offer.debtor;
  loanOffer.loanAmount = offer.loanAmount;
  loanOffer.token = getOrCreateToken(offer.claimToken).id;
  loanOffer.interestBPS = offer.interestBPS;
  loanOffer.termLength = offer.termLength;
  loanOffer.description = offer.description;
  loanOffer.ipfsHash = getIPFSHash_loanOffered(offer.attachment);
  loanOffer.offerDate = event.block.timestamp;
  loanOffer.offerTxHash = event.transaction.hash;
  loanOffer.save();

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
  loanOfferedEvent.version = BULLA_CLAIM_VERSION_V2;
  loanOfferedEvent.offeredBy = ev.offeredBy;
  loanOfferedEvent.interestBPS = offer.interestConfig.interestRateBps;
  loanOfferedEvent.numberOfPeriodsPerYear = offer.interestConfig.numberOfPeriodsPerYear;
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

  const loanOffer = getOrCreateLoanOffer(ev.offerId.toString(), "v2", event);
  loanOffer.version = BULLA_CLAIM_VERSION_V2;
  loanOffer.status = LOAN_OFFER_STATUS_OFFERED;
  loanOffer.offeredBy = ev.offeredBy;
  loanOffer.creditor = offer.creditor;
  loanOffer.debtor = offer.debtor;
  loanOffer.loanAmount = offer.loanAmount;
  loanOffer.token = getOrCreateToken(offer.token).id;
  loanOffer.interestBPS = offer.interestConfig.interestRateBps;
  loanOffer.numberOfPeriodsPerYear = offer.interestConfig.numberOfPeriodsPerYear;
  loanOffer.termLength = offer.termLength;
  loanOffer.description = offer.description;
  loanOffer.attachmentURI = metadata.attachmentURI;
  loanOffer.tokenURI = metadata.tokenURI;
  loanOffer.impairmentGracePeriod = offer.impairmentGracePeriod;
  loanOffer.expiresAt = offer.expiresAt;
  loanOffer.offerDate = event.block.timestamp;
  loanOffer.offerTxHash = event.transaction.hash;
  loanOffer.save();

  loanOfferedEvent.save();
  user_creditor.save();
  user_debtor.save();
}

export function handleLoanOfferAccepted(event: LoanOfferAccepted): void {
  const ev = event.params;
  const loanId = event.params.loanId;

  const loanOfferAcceptedEvent = createLoanOfferAcceptedEvent(event);
  const loanOfferedEvent = getLoanOfferedEvent(getLoanOfferedEventId(loanId, "v1"));

  const user_creditor = getOrCreateUser(Address.fromString(loanOfferedEvent.creditor.toHexString()));
  const user_debtor = getOrCreateUser(Address.fromString(loanOfferedEvent.debtor.toHexString()));

  loanOfferAcceptedEvent.loanId = loanId.toString();
  loanOfferAcceptedEvent.version = BULLA_CLAIM_VERSION_V1;
  loanOfferAcceptedEvent.claimId = ev.claimId.toString() + "-v1";
  loanOfferAcceptedEvent.processingFee = BigInt.fromI32(0); // V1 doesn't have processingFee, default to 0

  loanOfferAcceptedEvent.eventName = "LoanOfferAccepted";
  loanOfferAcceptedEvent.blockNumber = event.block.number;
  loanOfferAcceptedEvent.transactionHash = event.transaction.hash;
  loanOfferAcceptedEvent.logIndex = event.logIndex;
  loanOfferAcceptedEvent.timestamp = event.block.timestamp;

  user_creditor.frendLendEvents = user_creditor.frendLendEvents ? user_creditor.frendLendEvents.concat([loanOfferAcceptedEvent.id]) : [loanOfferAcceptedEvent.id];
  user_debtor.frendLendEvents = user_debtor.frendLendEvents ? user_debtor.frendLendEvents.concat([loanOfferAcceptedEvent.id]) : [loanOfferAcceptedEvent.id];

  // Denormalized financing state on the loan claim created by acceptance.
  // v1 frendlend creates the claim with a 1-wei sentinel baked into amount and
  // paidAmount; surface the net values so consumers don't re-walk logs.
  const claim = getClaim(ev.claimId.toString(), "v1");

  // Flip the denormalized loan-offer lifecycle to Accepted and link the claim.
  const loanOffer = getOrCreateLoanOffer(loanId.toString(), "v1", event);
  loanOffer.status = LOAN_OFFER_STATUS_ACCEPTED;
  loanOffer.claim = claim.id;
  loanOffer.claimId = claim.id;
  loanOffer.tokenId = ev.claimId.toString();
  loanOffer.processingFee = BigInt.fromI32(0); // V1 has no processingFee
  loanOffer.acceptedDate = event.block.timestamp;
  loanOffer.acceptedTxHash = event.transaction.hash;
  loanOffer.save();

  const financing = getOrCreateClaimFinancing(claim.id, event);
  financing.kind = CLAIM_FINANCING_KIND_ACCEPTED;
  financing.origination = CLAIM_FINANCING_ORIGINATION_FRENDLEND;
  financing.interestBps = loanOfferedEvent.interestBPS;
  financing.termLength = loanOfferedEvent.termLength;
  financing.loanAmount = loanOfferedEvent.loanAmount;
  financing.loanOffer = loanOffer.id;
  // Strip the 1-wei acceptance sentinel, clamping at zero so a not-yet-repaid
  // loan reads 0 rather than -1.
  const oneWei = BigInt.fromI32(1);
  financing.netAmount = claim.amount.ge(oneWei) ? claim.amount.minus(oneWei) : claim.amount;
  financing.netPaidAmount = claim.paidAmount.ge(oneWei) ? claim.paidAmount.minus(oneWei) : claim.paidAmount;
  financing.save();
  claim.financing = financing.id;
  claim.save();

  loanOfferAcceptedEvent.save();
  user_creditor.save();
  user_debtor.save();
}

export function handleLoanOfferAcceptedV2(event: LoanOfferAcceptedV2): void {
  const ev = event.params;
  const offerId = event.params.offerId;

  const loanOfferAcceptedEvent = createLoanOfferAcceptedEventV2(event);
  const loanOfferedEvent = getLoanOfferedEvent(getLoanOfferedEventId(offerId, "v2"));

  const user_creditor = getOrCreateUser(Address.fromString(loanOfferedEvent.creditor.toHexString()));
  const user_debtor = getOrCreateUser(Address.fromString(loanOfferedEvent.debtor.toHexString()));

  loanOfferAcceptedEvent.loanId = offerId.toString();
  loanOfferAcceptedEvent.version = BULLA_CLAIM_VERSION_V2;
  loanOfferAcceptedEvent.claimId = ev.claimId.toString() + "-v2";
  loanOfferAcceptedEvent.receiver = ev.receiver;
  loanOfferAcceptedEvent.fee = ev.fee;
  loanOfferAcceptedEvent.processingFee = ev.processingFee;
  loanOfferAcceptedEvent.tokenURI = ev.metadata.tokenURI;
  loanOfferAcceptedEvent.attachmentURI = ev.metadata.attachmentURI;

  loanOfferAcceptedEvent.eventName = "LoanOfferAccepted";
  loanOfferAcceptedEvent.blockNumber = event.block.number;
  loanOfferAcceptedEvent.transactionHash = event.transaction.hash;
  loanOfferAcceptedEvent.logIndex = event.logIndex;
  loanOfferAcceptedEvent.timestamp = event.block.timestamp;

  user_creditor.frendLendEvents = user_creditor.frendLendEvents ? user_creditor.frendLendEvents.concat([loanOfferAcceptedEvent.id]) : [loanOfferAcceptedEvent.id];
  user_debtor.frendLendEvents = user_debtor.frendLendEvents ? user_debtor.frendLendEvents.concat([loanOfferAcceptedEvent.id]) : [loanOfferAcceptedEvent.id];

  // Denormalized financing state on the loan claim created by acceptance.
  const claim = getOrCreateClaim(ev.claimId.toString(), BULLA_CLAIM_VERSION_V2);

  // Flip the denormalized loan-offer lifecycle to Accepted and link the claim.
  const loanOffer = getOrCreateLoanOffer(offerId.toString(), "v2", event);
  loanOffer.status = LOAN_OFFER_STATUS_ACCEPTED;
  loanOffer.claim = claim.id;
  loanOffer.claimId = claim.id;
  loanOffer.tokenId = ev.claimId.toString();
  loanOffer.receiver = ev.receiver;
  loanOffer.processingFee = ev.processingFee;
  loanOffer.acceptedDate = event.block.timestamp;
  loanOffer.acceptedTxHash = event.transaction.hash;
  loanOffer.save();

  const financing = getOrCreateClaimFinancing(claim.id, event);
  financing.kind = CLAIM_FINANCING_KIND_ACCEPTED;
  financing.origination = CLAIM_FINANCING_ORIGINATION_FRENDLEND;
  financing.interestBps = loanOfferedEvent.interestBPS;
  financing.numberOfPeriodsPerYear = loanOfferedEvent.numberOfPeriodsPerYear;
  financing.termLength = loanOfferedEvent.termLength;
  financing.loanAmount = loanOfferedEvent.loanAmount;
  financing.impairmentGracePeriod = loanOfferedEvent.impairmentGracePeriod;
  financing.loanOffer = loanOffer.id;
  financing.save();
  claim.financing = financing.id;
  claim.save();

  loanOfferAcceptedEvent.save();
  user_creditor.save();
  user_debtor.save();
}

export function handleLoanOfferRejected(event: LoanOfferRejected): void {
  const ev = event.params;
  const loanId = event.params.loanId;

  const loanOfferRejectedEvent = createLoanOfferRejectedEvent(event);
  const loanOfferedEvent = getLoanOfferedEvent(getLoanOfferedEventId(loanId, "v1"));

  const user_creditor = getOrCreateUser(Address.fromString(loanOfferedEvent.creditor.toHexString()));
  const user_debtor = getOrCreateUser(Address.fromString(loanOfferedEvent.debtor.toHexString()));

  loanOfferRejectedEvent.loanId = loanId.toString();
  loanOfferRejectedEvent.version = BULLA_CLAIM_VERSION_V1;
  loanOfferRejectedEvent.rejectedBy = ev.rejectedBy;

  loanOfferRejectedEvent.eventName = "LoanOfferRejected";
  loanOfferRejectedEvent.blockNumber = event.block.number;
  loanOfferRejectedEvent.transactionHash = event.transaction.hash;
  loanOfferRejectedEvent.logIndex = event.logIndex;
  loanOfferRejectedEvent.timestamp = event.block.timestamp;

  user_creditor.frendLendEvents = user_creditor.frendLendEvents ? user_creditor.frendLendEvents.concat([loanOfferRejectedEvent.id]) : [loanOfferRejectedEvent.id];
  user_debtor.frendLendEvents = user_debtor.frendLendEvents ? user_debtor.frendLendEvents.concat([loanOfferRejectedEvent.id]) : [loanOfferRejectedEvent.id];

  const loanOffer = getOrCreateLoanOffer(loanId.toString(), "v1", event);
  loanOffer.status = LOAN_OFFER_STATUS_REJECTED;
  loanOffer.rejectedBy = ev.rejectedBy;
  loanOffer.rejectedDate = event.block.timestamp;
  loanOffer.rejectedTxHash = event.transaction.hash;
  loanOffer.save();

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

  // Fold the payment into the denormalized financing aggregates. A LoanPayment
  // is always a frendlend-accepted loan, so set kind/origination defensively in
  // case the accept predates this mapping (backfill) and no financing exists yet.
  const financing = getOrCreateClaimFinancing(claim.id, event);
  financing.kind = CLAIM_FINANCING_KIND_ACCEPTED;
  financing.origination = CLAIM_FINANCING_ORIGINATION_FRENDLEND;
  financing.totalGrossInterestPaid = financing.totalGrossInterestPaid.plus(ev.grossInterestPaid);
  financing.totalPrincipalPaid = financing.totalPrincipalPaid.plus(ev.principalPaid);
  financing.totalProtocolFee = financing.totalProtocolFee.plus(ev.protocolFee);
  financing.paymentCount = financing.paymentCount.plus(BigInt.fromI32(1));
  financing.lastPaymentDate = event.block.timestamp;
  financing.save();
  claim.financing = financing.id;

  // Fold the payment into the originating LoanOffer aggregates. The financing
  // carries the loanOffer link (its id) set at acceptance — null only on
  // pre-mapping backfilled accepts, in which case there is no offer to update.
  const loanOfferId = financing.loanOffer;
  if (loanOfferId !== null) {
    const loanOffer = LoanOffer.load(loanOfferId);
    if (loanOffer !== null) {
      loanOffer.grossInterestPaid = loanOffer.grossInterestPaid.plus(ev.grossInterestPaid);
      loanOffer.principalPaid = loanOffer.principalPaid.plus(ev.principalPaid);
      loanOffer.protocolFee = loanOffer.protocolFee.plus(ev.protocolFee);
      loanOffer.lastPaymentDate = event.block.timestamp;
      loanOffer.lastUpdatedTimestamp = event.block.timestamp;
      loanOffer.lastUpdatedBlock = event.block.number;
      loanOffer.save();
    }
  }

  claim.lastPaymentDate = event.block.timestamp;
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
  const loanOfferedEvent = getLoanOfferedEvent(getLoanOfferedEventId(offerId, "v2"));

  const user_creditor = getOrCreateUser(Address.fromString(loanOfferedEvent.creditor.toHexString()));
  const user_debtor = getOrCreateUser(Address.fromString(loanOfferedEvent.debtor.toHexString()));

  loanOfferRejectedEvent.loanId = offerId.toString();
  loanOfferRejectedEvent.version = BULLA_CLAIM_VERSION_V2;
  loanOfferRejectedEvent.rejectedBy = ev.rejectedBy;

  loanOfferRejectedEvent.eventName = "LoanOfferRejected";
  loanOfferRejectedEvent.blockNumber = event.block.number;
  loanOfferRejectedEvent.transactionHash = event.transaction.hash;
  loanOfferRejectedEvent.logIndex = event.logIndex;
  loanOfferRejectedEvent.timestamp = event.block.timestamp;

  user_creditor.frendLendEvents = user_creditor.frendLendEvents ? user_creditor.frendLendEvents.concat([loanOfferRejectedEvent.id]) : [loanOfferRejectedEvent.id];
  user_debtor.frendLendEvents = user_debtor.frendLendEvents ? user_debtor.frendLendEvents.concat([loanOfferRejectedEvent.id]) : [loanOfferRejectedEvent.id];

  const loanOffer = getOrCreateLoanOffer(offerId.toString(), "v2", event);
  loanOffer.status = LOAN_OFFER_STATUS_REJECTED;
  loanOffer.rejectedBy = ev.rejectedBy;
  loanOffer.rejectedDate = event.block.timestamp;
  loanOffer.rejectedTxHash = event.transaction.hash;
  loanOffer.save();

  loanOfferRejectedEvent.save();
  user_creditor.save();
  user_debtor.save();
}
