import { Address } from "@graphprotocol/graph-ts";
import { BullaTagUpdated } from "../../generated/BullaBanker/BullaBanker";
import { LoanOfferAccepted, LoanOffered, LoanOfferRejected } from "../../generated/FrendLend/FrendLend";
import { getIPFSHash_loanOffered, getOrCreateToken, getOrCreateUser } from "../functions/common";
import { createLoanOfferAcceptedEvent, createLoanOfferedEvent, createLoanOfferRejectedEvent, getLoanOfferedEvent, getLoanOfferedEventId } from "../functions/FrendLend";
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
