import { BigInt, ethereum } from "@graphprotocol/graph-ts";
import {
  FeeWithdrawn,
  LoanOfferAccepted as LoanOfferAcceptedV2,
  LoanOffered as LoanOfferedV2,
  LoanOfferRejected as LoanOfferRejectedV2,
  LoanPayment,
} from "../../generated/BullaFrendLend/BullaFrendLend";
import { LoanOfferAccepted, LoanOffered, LoanOfferRejected } from "../../generated/FrendLend/FrendLend";
import { FeeWithdrawnEvent, LoanOfferAcceptedEvent, LoanOfferedEvent, LoanOfferRejectedEvent, LoanPaymentEvent } from "../../generated/schema";

export const getLoanOfferedEventId = (loanId: BigInt): string => "LoanOffer-" + loanId.toString();

export const getLoanOfferAcceptedEventId = (loanId: BigInt, claimId: BigInt, event: ethereum.Event): string =>
  "LoanOfferAccepted-" + loanId.toString() + "-" + claimId.toString() + "-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString();

export const getLoanOfferRejectedEventId = (loanId: BigInt, event: ethereum.Event): string =>
  "LoanOfferRejected-" + loanId.toString() + "-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString();

export const getLoanPaymentEventId = (claimId: BigInt, event: ethereum.Event): string =>
  "LoanPayment-" + claimId.toString() + "-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString();

export const getFeeWithdrawnEventId = (event: ethereum.Event): string => "FeeWithdrawn-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString();

export const loadLoanOfferedEvent = (loanId: string, createOnNull: boolean): LoanOfferedEvent => {
  let loanEvent = LoanOfferedEvent.load(loanId);
  if (!loanEvent) {
    if (createOnNull) loanEvent = new LoanOfferedEvent(loanId);
    else throw new Error("Loan Offer Event not found");
  }

  return loanEvent;
};

export const createLoanOfferedEvent = (event: LoanOffered): LoanOfferedEvent => loadLoanOfferedEvent(getLoanOfferedEventId(event.params.loanId), true);

export const createLoanOfferedEventV2 = (event: LoanOfferedV2): LoanOfferedEvent => loadLoanOfferedEvent(getLoanOfferedEventId(event.params.offerId), true);

export const getLoanOfferedEvent = (loanId: string): LoanOfferedEvent => loadLoanOfferedEvent(loanId, false);

export const createLoanOfferAcceptedEvent = (event: LoanOfferAccepted): LoanOfferAcceptedEvent =>
  new LoanOfferAcceptedEvent(getLoanOfferAcceptedEventId(event.params.loanId, event.params.claimId, event));

export const createLoanOfferRejectedEvent = (event: LoanOfferRejected): LoanOfferRejectedEvent =>
  new LoanOfferRejectedEvent(getLoanOfferRejectedEventId(event.params.loanId, event));

export const createLoanOfferAcceptedEventV2 = (event: LoanOfferAcceptedV2): LoanOfferAcceptedEvent =>
  new LoanOfferAcceptedEvent(getLoanOfferAcceptedEventId(event.params.offerId, event.params.claimId, event));

export const createLoanOfferRejectedEventV2 = (event: LoanOfferRejectedV2): LoanOfferRejectedEvent =>
  new LoanOfferRejectedEvent(getLoanOfferRejectedEventId(event.params.offerId, event));

export const createLoanPaymentEvent = (event: LoanPayment): LoanPaymentEvent => new LoanPaymentEvent(getLoanPaymentEventId(event.params.claimId, event));

export const createFeeWithdrawnEvent = (event: FeeWithdrawn): FeeWithdrawnEvent => new FeeWithdrawnEvent(getFeeWithdrawnEventId(event));
