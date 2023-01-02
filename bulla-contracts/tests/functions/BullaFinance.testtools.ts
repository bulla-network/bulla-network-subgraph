import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";
import { BullaTagUpdated } from "../../generated/BullaBanker/BullaBanker";
import { FinancingAccepted, FinancingOffered } from "../../generated/BullaFinance/BullaFinance";
import { DEFAULT_TIMESTAMP, toUint256 } from "../helpers";
import * as BullaBankerTestTools from "./BullaBanker.testtools";

export const newBullaTagUpdatedEvent = (tokenId: BigInt, updatedBy: Address, _tag: string): BullaTagUpdated => {
  return BullaBankerTestTools.newBullaTagUpdatedEvent(tokenId, updatedBy, _tag);
};

export const newFinancingOfferedEvent = (originatingClaimId: BigInt, minDownPaymentBPS: BigInt, interestBPS: BigInt, termLength: BigInt): FinancingOffered => {
  const event: FinancingOffered = changetype<FinancingOffered>(newMockEvent());

  const originatingClaimIdParam = new ethereum.EventParam("originatingClaimId", toUint256(originatingClaimId));

  const financingTermsArray: Array<ethereum.Value> = [toUint256(minDownPaymentBPS), toUint256(interestBPS), toUint256(termLength)];
  const financingTermsTuple: ethereum.Tuple = changetype<ethereum.Tuple>(financingTermsArray);
  const financingTermsParam = new ethereum.EventParam("terms", ethereum.Value.fromTuple(financingTermsTuple));

  const timestampParam = new ethereum.EventParam("timestamp", toUint256(DEFAULT_TIMESTAMP));

  event.parameters = [originatingClaimIdParam, financingTermsParam, timestampParam];

  return event;
};

export const newFinancingAcceptedEvent = (originatingClaimId: BigInt, financedClaimId: BigInt): FinancingAccepted => {
  const event: FinancingAccepted = changetype<FinancingAccepted>(newMockEvent());

  const originatingClaimIdParam = new ethereum.EventParam("originatingClaimId", toUint256(originatingClaimId));
  const financedClaimIdParam = new ethereum.EventParam("financedClaimId", toUint256(financedClaimId));
  const timestampParam = new ethereum.EventParam("timestamp", toUint256(DEFAULT_TIMESTAMP));

  event.parameters = [originatingClaimIdParam, financedClaimIdParam, timestampParam];

  return event;
};
