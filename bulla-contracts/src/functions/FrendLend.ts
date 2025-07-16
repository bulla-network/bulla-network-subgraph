import { BigInt, ethereum } from "@graphprotocol/graph-ts";
import { LoanOfferAccepted, LoanOffered, LoanOfferRejected } from "../../generated/FrendLend/FrendLend";
import { LoanOffered as LoanOfferedV2 } from "../../generated/FrendLendV2/FrendLendV2";
import { LoanOfferAcceptedEvent, LoanOfferedEvent, LoanOfferRejectedEvent } from "../../generated/schema";

export const getLoanOfferedEventId = (loanId: BigInt): string => "LoanOffer-" + loanId.toString();

export const getLoanOfferAcceptedEventId = (loanId: BigInt, claimId: BigInt, event: ethereum.Event): string =>
  "LoanOfferAccepted-" + loanId.toString() + "-" + claimId.toString() + "-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString();

export const getLoanOfferRejectedEventId = (loanId: BigInt, event: ethereum.Event): string =>
  "LoanOfferRejected-" + loanId.toString() + "-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString();

export const loadLoanOfferedEvent = (loanId: string, createOnNull: boolean): LoanOfferedEvent => {
  let loanEvent = LoanOfferedEvent.load(loanId);
  if (!loanEvent) {
    if (createOnNull) loanEvent = new LoanOfferedEvent(loanId);
    else throw new Error("Loan Offer Event not found");
  }

  return loanEvent;
};

export const createLoanOfferedEvent = (event: LoanOffered): LoanOfferedEvent => loadLoanOfferedEvent(getLoanOfferedEventId(event.params.loanId), true);

export const createLoanOfferedEventV2 = (event: LoanOfferedV2): LoanOfferedEvent => loadLoanOfferedEvent(getLoanOfferedEventId(event.params.loanId), true);

export const getLoanOfferedEvent = (loanId: string): LoanOfferedEvent => loadLoanOfferedEvent(loanId, false);

export const createLoanOfferAcceptedEvent = (event: LoanOfferAccepted): LoanOfferAcceptedEvent =>
  new LoanOfferAcceptedEvent(getLoanOfferAcceptedEventId(event.params.loanId, event.params.claimId, event));

export const createLoanOfferRejectedEvent = (event: LoanOfferRejected): LoanOfferRejectedEvent =>
  new LoanOfferRejectedEvent(getLoanOfferRejectedEventId(event.params.loanId, event));
