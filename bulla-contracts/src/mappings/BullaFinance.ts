import { Address } from "@graphprotocol/graph-ts";
import { BullaTagUpdated } from "../../generated/BullaBanker/BullaBanker";
import { FinancingAccepted, FinancingOffered } from "../../generated/BullaFinance/BullaFinance";
import { getClaim } from "../functions/BullaClaimERC721";
import { createFinancingAcceptedEvent, createFinancingOfferedEvent } from "../functions/BullaFinance";
import { getOrCreateUser } from "../functions/common";
import * as BullaBanker from "./BullaBanker";

// this contract also emits BullaTagUpdatedEvents
export function handleBullaTagUpdated(event: BullaTagUpdated): void {
  BullaBanker.handleBullaTagUpdated(event);
}

export function handleFinancingOffered(event: FinancingOffered): void {
  const ev = event.params;
  const originatingClaimId = ev.originatingClaimId;

  const underlyingClaim = getClaim(originatingClaimId.toString(), "v1");
  const financingOfferedEvent = createFinancingOfferedEvent(originatingClaimId, event);

  const user_creditor = getOrCreateUser(Address.fromString(underlyingClaim.creditor));
  const user_debtor = getOrCreateUser(Address.fromString(underlyingClaim.debtor));

  financingOfferedEvent.originatingClaimId = underlyingClaim.id;
  financingOfferedEvent.minDownPaymentBPS = ev.terms.minDownPaymentBPS;
  financingOfferedEvent.interestBPS = ev.terms.interestBPS;
  financingOfferedEvent.termLength = ev.terms.termLength;

  financingOfferedEvent.eventName = "FinancingOffered";
  financingOfferedEvent.blockNumber = event.block.number;
  financingOfferedEvent.transactionHash = event.transaction.hash;
  financingOfferedEvent.logIndex = event.logIndex;
  financingOfferedEvent.timestamp = event.block.timestamp;

  underlyingClaim.lastUpdatedBlockNumber = event.block.number;
  underlyingClaim.lastUpdatedTimestamp = event.block.timestamp;

  user_creditor.financeEvents = user_creditor.financeEvents ? user_creditor.financeEvents.concat([financingOfferedEvent.id]) : [financingOfferedEvent.id];
  user_debtor.financeEvents = user_debtor.financeEvents ? user_debtor.financeEvents.concat([financingOfferedEvent.id]) : [financingOfferedEvent.id];

  financingOfferedEvent.save();
  underlyingClaim.save();
  user_creditor.save();
  user_debtor.save();
}

export function handleFinancingAccepted(event: FinancingAccepted): void {
  const ev = event.params;
  const originatingClaimId = ev.originatingClaimId;
  const financedClaimId = ev.financedClaimId;

  const financingAcceptedEvent = createFinancingAcceptedEvent(originatingClaimId, financedClaimId, event);
  const originatingClaim = getClaim(originatingClaimId.toString(), "v1");
  const financedClaim = getClaim(financedClaimId.toString(), "v1");

  const user_creditor = getOrCreateUser(Address.fromString(originatingClaim.creditor));
  const user_debtor = getOrCreateUser(Address.fromString(originatingClaim.debtor));

  financingAcceptedEvent.originatingClaimId = originatingClaim.id;
  financingAcceptedEvent.financedClaimId = financedClaim.id;

  financingAcceptedEvent.eventName = "FinancingAccepted";
  financingAcceptedEvent.blockNumber = event.block.number;
  financingAcceptedEvent.transactionHash = event.transaction.hash;
  financingAcceptedEvent.logIndex = event.logIndex;
  financingAcceptedEvent.timestamp = event.block.timestamp;

  originatingClaim.lastUpdatedBlockNumber = event.block.number;
  originatingClaim.lastUpdatedTimestamp = event.block.timestamp;

  financedClaim.lastUpdatedBlockNumber = event.block.number;
  financedClaim.lastUpdatedTimestamp = event.block.timestamp;

  user_creditor.financeEvents = user_creditor.financeEvents ? user_creditor.financeEvents.concat([financingAcceptedEvent.id]) : [financingAcceptedEvent.id];
  user_debtor.financeEvents = user_debtor.financeEvents ? user_debtor.financeEvents.concat([financingAcceptedEvent.id]) : [financingAcceptedEvent.id];

  financingAcceptedEvent.save();
  originatingClaim.save();
  financedClaim.save();
  user_creditor.save();
  user_debtor.save();
}
