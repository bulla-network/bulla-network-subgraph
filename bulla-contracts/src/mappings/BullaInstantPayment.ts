import { InstantPaymentEvent, InstantPaymentTag, InstantPayment as InstantPayment__entity, InstantPaymentTagUpdatedEvent } from "../../generated/schema";
import { InstantPayment, InstantPaymentTagUpdated } from "../../generated/BullaInstantPayment/BullaInstantPayment";
import { getInstantPaymentEventId, getInstantPaymentTagUpdatedId } from "../functions/BullaInstantPayment";
import { getOrCreateToken, getOrCreateUser } from "../functions/common";

export function handleInstantPayment(event: InstantPayment): void {
  const token = getOrCreateToken(event.params.tokenAddress);
  const instantPaymentId = getInstantPaymentEventId(event.transaction.hash, event.logIndex);
  const user_from = getOrCreateUser(event.params.from);
  const user_to = getOrCreateUser(event.params.to);

  const instantPayment = new InstantPayment__entity(instantPaymentId);

  instantPayment.from = user_from.id;
  instantPayment.to = user_to.id;
  instantPayment.amount = event.params.amount;
  instantPayment.token = token.id;
  instantPayment.description = event.params.description;
  instantPayment.ipfsHash = event.params.ipfsHash;
  instantPayment.save();

  const instantPaymentTag = new InstantPaymentTag(instantPaymentId);

  instantPaymentTag.instantPayment = instantPayment.id;
  instantPaymentTag.updatedBy = user_from.id;
  instantPaymentTag.tag = event.params.tag;
  instantPaymentTag.save();

  const instantPaymentEvent = new InstantPaymentEvent(instantPaymentId);

  instantPaymentEvent.instantPayment = instantPaymentId;
  instantPaymentEvent.from = user_from.id;
  instantPaymentEvent.to = user_to.id;
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
  const instantPaymentId = event.params.txAndLogIndexHash.toHexString();
  const instantPaymentEvent = InstantPaymentEvent.load(instantPaymentId);

  // if we find a match in the ID specified, then we create a new entity that is linked to the InstantPayment entity
  if (instantPaymentEvent) {
    const instantPaymentTagId = getInstantPaymentTagUpdatedId(event);
    const instantPaymentTagUpdatedEvent = new InstantPaymentTagUpdatedEvent(instantPaymentTagId);
    const user_updatedBy = getOrCreateUser(event.params.updatedBy);

    instantPaymentTagUpdatedEvent.instantPayment = instantPaymentEvent.id;
    instantPaymentTagUpdatedEvent.updatedBy = user_updatedBy.id;
    instantPaymentTagUpdatedEvent.tag = event.params.tag;
    instantPaymentTagUpdatedEvent.eventName = "InstantPaymentTagUpdated";
    instantPaymentTagUpdatedEvent.blockNumber = event.block.number;
    instantPaymentTagUpdatedEvent.transactionHash = event.transaction.hash;
    instantPaymentTagUpdatedEvent.timestamp = event.block.timestamp;
    instantPaymentTagUpdatedEvent.logIndex = event.logIndex;
    instantPaymentTagUpdatedEvent.save();

    const instantPaymentTag = new InstantPaymentTag(instantPaymentId);

    instantPaymentTag.instantPayment = instantPaymentEvent.id;
    instantPaymentTag.updatedBy = user_updatedBy.id;
    instantPaymentTag.tag = event.params.tag;
    instantPaymentTag.save();
  }
}
