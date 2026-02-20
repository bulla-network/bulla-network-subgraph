import { log } from "@graphprotocol/graph-ts";
import { BullaBankerCreated, BullaTagUpdated } from "../../generated/BullaBanker/BullaBanker";
import {
  createBullaBankerCreatedEvent,
  getAccountTagId,
  getBullaTagUpdatedEventId,
  getOrCreateAccountTag,
  getOrCreateBullaTagUpdatedEvent,
} from "../functions/BullaBanker";
import { isClaimIncompleteV1, tryGetClaim } from "../functions/BullaClaimERC721";
import { BULLA_CLAIM_VERSION_V1 } from "../functions/common";

export function handleBullaTagUpdated(event: BullaTagUpdated): void {
  const ev = event.params;
  const tag = ev.tag.toString();
  const tokenId = ev.tokenId.toString();
  const claim = tryGetClaim(tokenId, BULLA_CLAIM_VERSION_V1);
  if (claim === null) {
    log.warning("[safe-skip] handler={} version=v1 tokenId={} reason={} block={} tx={} logIndex={}", [
      "handleBullaTagUpdated",
      tokenId,
      "claim_missing",
      event.block.number.toString(),
      event.transaction.hash.toHexString(),
      event.logIndex.toString(),
    ]);
    return;
  }
  if (isClaimIncompleteV1(claim)) {
    log.warning("[safe-skip] handler={} version=v1 tokenId={} reason={} block={} tx={} logIndex={}", [
      "handleBullaTagUpdated",
      tokenId,
      "claim_incomplete",
      event.block.number.toString(),
      event.transaction.hash.toHexString(),
      event.logIndex.toString(),
    ]);
    return;
  }
  const claimId = claim.id;

  const tagUpdatedEventId = getBullaTagUpdatedEventId(event.params.tokenId, event);
  const tagUpdatedEvent = getOrCreateBullaTagUpdatedEvent(tagUpdatedEventId);

  tagUpdatedEvent.bullaManager = ev.bullaManager;
  tagUpdatedEvent.claim = claimId;
  tagUpdatedEvent.updatedBy = ev.updatedBy;
  tagUpdatedEvent.tag = tag;
  tagUpdatedEvent.eventName = "BullaTagUpdated";
  tagUpdatedEvent.blockNumber = event.block.number;
  tagUpdatedEvent.transactionHash = event.transaction.hash;
  tagUpdatedEvent.logIndex = event.logIndex;
  tagUpdatedEvent.timestamp = event.block.timestamp;
  tagUpdatedEvent.save();

  // this can stay as is since no account tags in V2
  const accountTagId = getAccountTagId(ev.tokenId, ev.updatedBy);
  const accountTag = getOrCreateAccountTag(accountTagId);

  accountTag.claim = claimId;
  accountTag.userAddress = ev.updatedBy;
  accountTag.tag = tag;
  accountTag.save();

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
