import { BullaBankerCreated, BullaTagUpdated } from "../../generated/BullaBanker/BullaBanker";
import {
  createBullaBankerCreatedEvent,
  getAccountTagId,
  getBullaTagUpdatedEventId,
  getOrCreateAccountTag,
  getOrCreateBullaTagUpdatedEvent
} from "../functions/BullaBanker";
import { getOrCreateClaim } from "../functions/BullaClaimERC721";

export function handleBullaTagUpdated(event: BullaTagUpdated): void {
  const ev = event.params;
  const tag = ev.tag.toString();
  const claimId = ev.tokenId;

  const tagUpdatedEventId = getBullaTagUpdatedEventId(event.params.tokenId, event);
  const tagUpdatedEvent = getOrCreateBullaTagUpdatedEvent(tagUpdatedEventId);

  tagUpdatedEvent.bullaManager = ev.bullaManager;
  tagUpdatedEvent.claim = claimId.toString();
  tagUpdatedEvent.updatedBy = ev.updatedBy;
  tagUpdatedEvent.tag = tag;
  tagUpdatedEvent.eventName = "BullaTagUpdated";
  tagUpdatedEvent.blockNumber = event.block.number;
  tagUpdatedEvent.transactionHash = event.transaction.hash;
  tagUpdatedEvent.logIndex = event.logIndex;
  tagUpdatedEvent.timestamp = event.block.timestamp;
  tagUpdatedEvent.save();

  const accountTagId = getAccountTagId(claimId, ev.updatedBy);
  const accountTag = getOrCreateAccountTag(accountTagId);

  accountTag.claim = claimId.toString();
  accountTag.userAddress = ev.updatedBy;
  accountTag.tag = tag;
  accountTag.save();

  const claim = getOrCreateClaim(claimId.toString());
  claim.lastUpdatedBlockNumber = event.block.number;
  claim.lastUpdatedTimestamp = event.block.timestamp;
  claim.save();
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
  bullaBankerCreatedEvent.logIndex = event.logIndex;
  bullaBankerCreatedEvent.transactionHash = event.transaction.hash;

  bullaBankerCreatedEvent.save();
}
