import { BigInt, ethereum } from "@graphprotocol/graph-ts";
import { FinancingOffered, FinancingAccepted } from "../../generated/BullaFinance/BullaFinance";
import { FinancingOfferedEvent, FinancingAcceptedEvent } from "../../generated/schema";

export const getFinancingOfferedEventId = (underlyingClaimId: BigInt, event: ethereum.Event): string =>
  "FinancingOffered-" + underlyingClaimId.toString() + "-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString();

export const getFinancingAcceptedEventId = (underlyingTokenId: BigInt, financedTokenId: BigInt, event: ethereum.Event): string =>
  "FinancingAccepted-" + underlyingTokenId.toString() + "-" + financedTokenId.toString() + "-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString();

export const createFinancingOfferedEvent = (underlyingTokenId: BigInt, event: FinancingOffered): FinancingOfferedEvent =>
  new FinancingOfferedEvent(getFinancingOfferedEventId(underlyingTokenId, event));

export const createFinancingAcceptedEvent = (underlyingTokenId: BigInt, financedTokenId: BigInt, event: FinancingAccepted): FinancingAcceptedEvent =>
  new FinancingAcceptedEvent(getFinancingAcceptedEventId(underlyingTokenId, financedTokenId, event));
