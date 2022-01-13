import { BullaBankerCreated, BullaTagUpdated } from "../../generated/BullaBanker/BullaBanker";
import {
  createBullaBankerCreatedEvent,
  getAccountTagId,
  getBullaTagUpdatedEventId,
  getOrCreateAccountTag,
  getOrCreateBullaTagUpdatedEvent
} from "../functions/BullaBanker";

export function handleBullaTagUpdated(event: BullaTagUpdated): void {
  const ev = event.params;
  const tag = ev.tag.toString();
  const claimId = ev.tokenId;

  const tagUpdatedEventId = getBullaTagUpdatedEventId(event.params.tokenId, event.transaction.hash);
  const tagUpdatedEvent = getOrCreateBullaTagUpdatedEvent(tagUpdatedEventId);

  tagUpdatedEvent.bullaManager = ev.bullaManager;
  tagUpdatedEvent.tokenId = claimId.toString();
  tagUpdatedEvent.updatedBy = ev.updatedBy;
  tagUpdatedEvent.tag = tag;
  tagUpdatedEvent.eventName = "BullaTagUpdated";
  tagUpdatedEvent.blockNumber = event.block.number;
  tagUpdatedEvent.transactionHash = event.transaction.hash;
  tagUpdatedEvent.timestamp = event.block.timestamp;
  tagUpdatedEvent.save();

  const accountTagId = getAccountTagId(claimId, ev.updatedBy);
  const accountTag = getOrCreateAccountTag(accountTagId);

  accountTag.tokenId = claimId.toString();
  accountTag.userAddress = ev.updatedBy;
  accountTag.tag = tag;
  accountTag.save();
}

export function handleBullaBankerCreated(event: BullaBankerCreated): void {
  const ev = event.params;
  const bullaBankerCreatedEvent = createBullaBankerCreatedEvent(event);

  bullaBankerCreatedEvent.bullaManager = ev.bullaManager;
  bullaBankerCreatedEvent.bullaClaimERC721 = ev.bullaClaimERC721;
  bullaBankerCreatedEvent.bullaBanker = ev.bullaBanker;

  bullaBankerCreatedEvent.timestamp = event.block.timestamp;
  bullaBankerCreatedEvent.eventName = "BullaBankerCreated";
  bullaBankerCreatedEvent.blockNumber = event.block.number;
  bullaBankerCreatedEvent.transactionHash = event.transaction.hash;

  bullaBankerCreatedEvent.save();
}
