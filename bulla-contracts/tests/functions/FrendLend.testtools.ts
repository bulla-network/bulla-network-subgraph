import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";
import { BullaTagUpdated } from "../../generated/BullaBanker/BullaBanker";
import {
  FeeWithdrawn,
  LoanOfferAccepted as LoanOfferAcceptedV2,
  LoanOffered as LoanOfferedV2,
  LoanOfferRejected as LoanOfferRejectedV2,
  LoanPayment,
} from "../../generated/BullaFrendLend/BullaFrendLend";
import { LoanOfferAccepted, LoanOffered, LoanOfferRejected } from "../../generated/FrendLend/FrendLend";
import { DEFAULT_TIMESTAMP, MULTIHASH_BYTES, MULTIHASH_FUNCTION, MULTIHASH_SIZE, toEthAddress, toEthString, toUint256 } from "../helpers";
import * as BullaBankerTestTools from "./BullaBanker.testtools";

export const newBullaTagUpdatedEvent = (tokenId: BigInt, updatedBy: Address, _tag: string): BullaTagUpdated => {
  return BullaBankerTestTools.newBullaTagUpdatedEvent(tokenId, updatedBy, _tag);
};

export const newLoanOfferedEvent = (
  loanId: BigInt,
  interestBPS: BigInt,
  termLength: BigInt,
  loanAmount: BigInt,
  creditor: Address,
  debtor: Address,
  description: string,
  claimToken: Address,
): LoanOffered => {
  const event: LoanOffered = changetype<LoanOffered>(newMockEvent());

  const hash: Bytes = changetype<Bytes>(Bytes.fromHexString(MULTIHASH_BYTES));
  const multihashArray: Array<ethereum.Value> = [
    ethereum.Value.fromBytes(hash), // hash
    toUint256(BigInt.fromU32(MULTIHASH_FUNCTION)), // hashFunction
    toUint256(BigInt.fromU32(MULTIHASH_SIZE)), // size
  ];
  const multihashTuple: ethereum.Tuple = changetype<ethereum.Tuple>(multihashArray);

  const loanOfferArray: Array<ethereum.Value> = [
    toUint256(interestBPS),
    toUint256(termLength),
    toUint256(loanAmount),
    toEthAddress(creditor),
    toEthAddress(debtor),
    toEthString(description),
    toEthAddress(claimToken),
    ethereum.Value.fromTuple(multihashTuple),
  ];
  const loanOfferTuple: ethereum.Tuple = changetype<ethereum.Tuple>(loanOfferArray);

  const loanIdParam = new ethereum.EventParam("loanId", toUint256(loanId));
  const offeredByParam = new ethereum.EventParam("offeredBy", toEthAddress(creditor));
  const loanOfferParam = new ethereum.EventParam("terms", ethereum.Value.fromTuple(loanOfferTuple));
  const blocktimeParam = new ethereum.EventParam("blocktime", toUint256(DEFAULT_TIMESTAMP));

  event.parameters = [loanIdParam, offeredByParam, loanOfferParam, blocktimeParam];
  return event;
};

export const newLoanOfferAcceptedEvent = (loanId: BigInt, claimId: BigInt): LoanOfferAccepted => {
  const event: LoanOfferAccepted = changetype<LoanOfferAccepted>(newMockEvent());

  const loanIdParam = new ethereum.EventParam("loanId", toUint256(loanId));
  const claimIdParam = new ethereum.EventParam("claimId", toUint256(claimId));
  const blocktimeParam = new ethereum.EventParam("blocktime", toUint256(DEFAULT_TIMESTAMP));

  event.parameters = [loanIdParam, claimIdParam, blocktimeParam];
  return event;
};

export const newLoanOfferRejectedEvent = (loanId: BigInt, rejectedBy: Address): LoanOfferRejected => {
  const event: LoanOfferRejected = changetype<LoanOfferRejected>(newMockEvent());

  const loanIdParam = new ethereum.EventParam("loanId", toUint256(loanId));
  const rejectedByParam = new ethereum.EventParam("rejectedBy", toEthAddress(rejectedBy));
  const blocktimeParam = new ethereum.EventParam("blocktime", toUint256(DEFAULT_TIMESTAMP));

  event.parameters = [loanIdParam, rejectedByParam, blocktimeParam];
  return event;
};

export const newLoanOfferedEventV2 = (
  loanId: BigInt,
  interestRateBps: BigInt,
  termLength: BigInt,
  loanAmount: BigInt,
  creditor: Address,
  debtor: Address,
  description: string,
  token: Address,
  impairmentGracePeriod: BigInt,
  expiresAt: BigInt,
): LoanOfferedV2 => {
  const event: LoanOfferedV2 = changetype<LoanOfferedV2>(newMockEvent());

  // Create InterestConfig tuple
  const interestConfigArray: Array<ethereum.Value> = [
    toUint256(interestRateBps), // interestRateBps
    toUint256(BigInt.fromI32(12)), // numberOfPeriodsPerYear (default to 12 monthly periods)
  ];
  const interestConfigTuple: ethereum.Tuple = changetype<ethereum.Tuple>(interestConfigArray);

  // Create LoanRequestParams tuple
  const loanOfferArray: Array<ethereum.Value> = [
    toUint256(termLength),
    ethereum.Value.fromTuple(interestConfigTuple),
    toUint256(loanAmount),
    toEthAddress(creditor),
    toEthAddress(debtor),
    toEthString(description),
    toEthAddress(token),
    toUint256(impairmentGracePeriod),
    toUint256(expiresAt),
    toEthAddress(Address.zero()), // callbackContract
    ethereum.Value.fromBytes(Bytes.fromHexString("0x00000000")), // callbackSelector
  ];
  const loanOfferTuple: ethereum.Tuple = changetype<ethereum.Tuple>(loanOfferArray);

  // Create ClaimMetadata tuple
  const metadataArray: Array<ethereum.Value> = [
    toEthString("https://example.com/token.json"), // tokenURI
    toEthString("https://example.com/attachment.pdf"), // attachmentURI
  ];
  const metadataTuple: ethereum.Tuple = changetype<ethereum.Tuple>(metadataArray);

  const offerIdParam = new ethereum.EventParam("offerId", toUint256(loanId));
  const offeredByParam = new ethereum.EventParam("offeredBy", toEthAddress(creditor));
  const loanOfferParam = new ethereum.EventParam("loanOffer", ethereum.Value.fromTuple(loanOfferTuple));
  const metadataParam = new ethereum.EventParam("metadata", ethereum.Value.fromTuple(metadataTuple));

  event.parameters = [offerIdParam, offeredByParam, loanOfferParam, metadataParam];
  return event;
};

export const newLoanOfferAcceptedEventV2 = (offerId: BigInt, claimId: BigInt, fee: BigInt): LoanOfferAcceptedV2 => {
  const event: LoanOfferAcceptedV2 = changetype<LoanOfferAcceptedV2>(newMockEvent());

  // Create ClaimMetadata tuple
  const metadataArray: Array<ethereum.Value> = [
    toEthString("https://example.com/token-accepted.json"), // tokenURI
    toEthString("https://example.com/attachment-accepted.pdf"), // attachmentURI
  ];
  const metadataTuple: ethereum.Tuple = changetype<ethereum.Tuple>(metadataArray);

  const offerIdParam = new ethereum.EventParam("offerId", toUint256(offerId));
  const claimIdParam = new ethereum.EventParam("claimId", toUint256(claimId));
  const feeParam = new ethereum.EventParam("fee", toUint256(fee));
  const metadataParam = new ethereum.EventParam("metadata", ethereum.Value.fromTuple(metadataTuple));

  event.parameters = [offerIdParam, claimIdParam, feeParam, metadataParam];
  return event;
};

export const newLoanOfferRejectedEventV2 = (offerId: BigInt, rejectedBy: Address): LoanOfferRejectedV2 => {
  const event: LoanOfferRejectedV2 = changetype<LoanOfferRejectedV2>(newMockEvent());

  const offerIdParam = new ethereum.EventParam("offerId", toUint256(offerId));
  const rejectedByParam = new ethereum.EventParam("rejectedBy", toEthAddress(rejectedBy));

  event.parameters = [offerIdParam, rejectedByParam];
  return event;
};

export const newLoanPaymentEvent = (claimId: BigInt, grossInterestPaid: BigInt, principalPaid: BigInt, protocolFee: BigInt): LoanPayment => {
  const event: LoanPayment = changetype<LoanPayment>(newMockEvent());

  const claimIdParam = new ethereum.EventParam("claimId", toUint256(claimId));
  const grossInterestPaidParam = new ethereum.EventParam("grossInterestPaid", toUint256(grossInterestPaid));
  const principalPaidParam = new ethereum.EventParam("principalPaid", toUint256(principalPaid));
  const protocolFeeParam = new ethereum.EventParam("protocolFee", toUint256(protocolFee));

  event.parameters = [claimIdParam, grossInterestPaidParam, principalPaidParam, protocolFeeParam];
  return event;
};

export const newFeeWithdrawnEvent = (admin: Address, token: Address, amount: BigInt): FeeWithdrawn => {
  const event: FeeWithdrawn = changetype<FeeWithdrawn>(newMockEvent());

  const adminParam = new ethereum.EventParam("admin", toEthAddress(admin));
  const tokenParam = new ethereum.EventParam("token", toEthAddress(token));
  const amountParam = new ethereum.EventParam("amount", toUint256(amount));

  event.parameters = [adminParam, tokenParam, amountParam];
  return event;
};
