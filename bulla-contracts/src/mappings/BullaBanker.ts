import { BullaTagUpdated } from "../../generated/BullaBanker/BullaBanker";
import { getBullaTagUpdatedEventId, getOrCreateBullaTagUpdatedEvent } from "../functions/BullaBanker";

export function handleBullaTagUpdated(event: BullaTagUpdated): void {
  const ev = event.params;
  const tag = ev.tag.toString();
  const claimId = ev.tokenId.toString();

  const tagUpdatedEventId = getBullaTagUpdatedEventId(event);
  const tagUpdatedEvent = getOrCreateBullaTagUpdatedEvent(tagUpdatedEventId);

  tagUpdatedEvent.managerAddress = ev.bullaManager;
  tagUpdatedEvent.tokenId = claimId;
  tagUpdatedEvent.updatedBy = ev.updatedBy;
  tagUpdatedEvent.tag = tag;
  tagUpdatedEvent.eventName = "BullaTagUpdated";
  tagUpdatedEvent.blockNumber = event.block.number;
  tagUpdatedEvent.transactionHash = event.transaction.hash;
  tagUpdatedEvent.timestamp = event.block.timestamp;
  tagUpdatedEvent.save();
}


