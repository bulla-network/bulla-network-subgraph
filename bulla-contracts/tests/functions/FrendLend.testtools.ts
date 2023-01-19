import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";
import { BullaTagUpdated } from "../../generated/BullaBanker/BullaBanker";
import { LoanOffered, LoanOfferAccepted, LoanOfferRejected } from "../../generated/FrendLend/FrendLend";
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
  claimToken: Address
): LoanOffered => {
  const event: LoanOffered = changetype<LoanOffered>(newMockEvent());

  const hash: Bytes = changetype<Bytes>(Bytes.fromHexString(MULTIHASH_BYTES));
  const multihashArray: Array<ethereum.Value> = [
    ethereum.Value.fromBytes(hash), // hash
    toUint256(BigInt.fromU32(MULTIHASH_FUNCTION)), // hashFunction
    toUint256(BigInt.fromU32(MULTIHASH_SIZE)) // size
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
    ethereum.Value.fromTuple(multihashTuple)
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
