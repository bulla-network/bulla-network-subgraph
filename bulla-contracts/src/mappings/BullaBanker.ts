import { BullaTagUpdated } from "../../generated/BullaBanker/BullaBanker";
import {
  getAccountTagId,
  getBullaTagUpdatedEventId,
  getOrCreateAccountTag,
  getOrCreateBullaTagUpdatedEvent,
} from "../functions/BullaBanker";

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

  const accountTagId = getAccountTagId(claimId, ev.updatedBy);
  const accountTag = getOrCreateAccountTag(accountTagId);

  accountTag.tokenId = claimId;
  accountTag.userAddress = ev.updatedBy;
  accountTag.tag = tag;
  accountTag.save();
}
