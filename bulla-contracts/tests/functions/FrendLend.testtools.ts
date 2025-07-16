import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";
import { BullaTagUpdated } from "../../generated/BullaBanker/BullaBanker";
import { LoanOffered, LoanOfferAccepted, LoanOfferRejected } from "../../generated/FrendLend/FrendLend";
import { LoanOffered as LoanOfferedV2 } from "../../generated/FrendLendV2/FrendLendV2";
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

  const loanIdParam = new ethereum.EventParam("loanId", toUint256(loanId));
  const offeredByParam = new ethereum.EventParam("offeredBy", toEthAddress(creditor));
  const loanOfferParam = new ethereum.EventParam("loanOffer", ethereum.Value.fromTuple(loanOfferTuple));
  const metadataParam = new ethereum.EventParam("metadata", ethereum.Value.fromTuple(metadataTuple));

  event.parameters = [loanIdParam, offeredByParam, loanOfferParam, metadataParam];
  return event;
};
