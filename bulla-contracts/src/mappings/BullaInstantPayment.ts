import { InstantPaymentEvent, InstantPaymentTag, InstantPayment as InstantPayment__entity, InstantPaymentTagUpdatedEvent } from "../../generated/schema";
import { InstantPayment, InstantPaymentTagUpdated } from "../../generated/BullaInstantPayment/BullaInstantPayment";
import { getInstantPaymentEventId, getInstantPaymentTagUpdatedId } from "../functions/BullaInstantPayment";
import { getOrCreateToken } from "../functions/common";
import { log } from "@graphprotocol/graph-ts";

export function handleInstantPayment(event: InstantPayment): void {
  const token = getOrCreateToken(event.params.tokenAddress);
  const instantPaymentId = getInstantPaymentEventId(event.transaction.hash, event.logIndex);

  const instantPayment = new InstantPayment__entity(instantPaymentId);

  instantPayment.from = event.params.from;
  instantPayment.to = event.params.to;
  instantPayment.amount = event.params.amount;
  instantPayment.token = token.id;
  instantPayment.description = event.params.description;
  instantPayment.ipfsHash = event.params.ipfsHash;
  instantPayment.save();

  const instantPaymentTag = new InstantPaymentTag(instantPaymentId);

  instantPaymentTag.instantPayment = instantPayment.id;
  instantPaymentTag.updatedBy = event.params.from;
  instantPaymentTag.tag = event.params.tag;
  instantPaymentTag.save();

  const instantPaymentEvent = new InstantPaymentEvent(instantPaymentId);

  instantPaymentEvent.instantPayment = instantPaymentId;
  instantPaymentEvent.from = event.params.from;
  instantPaymentEvent.to = event.params.to;
  instantPaymentEvent.amount = event.params.amount;
  instantPaymentEvent.token = token.id;
  instantPaymentEvent.description = event.params.description;
  instantPaymentEvent.tag = event.params.tag;
  instantPaymentEvent.ipfsHash = event.params.ipfsHash;
  instantPaymentEvent.eventName = "InstantPayment";
  instantPaymentEvent.blockNumber = event.block.number;
  instantPaymentEvent.transactionHash = event.transaction.hash;
  instantPaymentEvent.timestamp = event.block.timestamp;
  instantPaymentEvent.logIndex = event.logIndex;
  instantPaymentEvent.save();
}

export function handleInstantPaymentTagUpdated(event: InstantPaymentTagUpdated): void {
  const instantPaymentId = event.params.txAndLogIndexHash.toHexString()
  const instantPaymentEvent = InstantPaymentEvent.load(instantPaymentId);

  // if we find a match in the ID specified, then we create a new entity that is linked to the InstantPayment entity
  if (instantPaymentEvent) {
    const instantPaymentTagId = getInstantPaymentTagUpdatedId(event);
    const instantPaymentTagUpdatedEvent = new InstantPaymentTagUpdatedEvent(instantPaymentTagId);
    
    instantPaymentTagUpdatedEvent.instantPayment = instantPaymentEvent.id;
    instantPaymentTagUpdatedEvent.updatedBy = event.params.updatedBy;
    instantPaymentTagUpdatedEvent.tag = event.params.tag;
    instantPaymentTagUpdatedEvent.eventName = "InstantPaymentTagUpdated";
    instantPaymentTagUpdatedEvent.blockNumber = event.block.number;
    instantPaymentTagUpdatedEvent.transactionHash = event.transaction.hash;
    instantPaymentTagUpdatedEvent.timestamp = event.block.timestamp;
    instantPaymentTagUpdatedEvent.logIndex = event.logIndex;
    instantPaymentTagUpdatedEvent.save();
    log.info("✅ event.hash {}", [instantPaymentTagId]);

    const instantPaymentTag = new InstantPaymentTag(instantPaymentId);

    instantPaymentTag.instantPayment = instantPaymentEvent.id;
    instantPaymentTag.updatedBy = event.params.updatedBy;
    instantPaymentTag.tag = event.params.tag;
    instantPaymentTag.save();
  }
}
