import { Bytes } from "@graphprotocol/graph-ts";
import { BullaTagUpdated } from "../../generated/BullaBanker/BullaBanker";
import { AccountTag, BullaTagUpdatedEvent } from "../../generated/schema";

export const getBullaTagUpdatedEventId = (event: BullaTagUpdated): string =>
  `BullaTagUpdated-${event.params.tokenId.toString()}-${event.transaction.hash.toHexString()}`;

export const getAccountTagId = (tokenId: string, userAddress: Bytes): string =>
  `${tokenId}-${userAddress.toHexString()}`;

export const getOrCreateBullaTagUpdatedEvent = (
  bullaTagUpdatedId: string
): BullaTagUpdatedEvent => {
  let bullaTagUpdatedEvent = BullaTagUpdatedEvent.load(bullaTagUpdatedId);
  if (!bullaTagUpdatedEvent)
    bullaTagUpdatedEvent = new BullaTagUpdatedEvent(bullaTagUpdatedId);

  return bullaTagUpdatedEvent;
};

export const getOrCreateAccountTag = (accountTagId: string): AccountTag => {
  let accountTag = AccountTag.load(accountTagId);
  if (!accountTag) accountTag = new AccountTag(accountTagId);

  return accountTag;
}