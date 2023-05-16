import { BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { BullaBankerCreated } from "../../generated/BullaBanker/BullaBanker";
import { AccountTag, BullaBankerCreatedEvent, BullaTagUpdatedEvent } from "../../generated/schema";

export const getBullaTagUpdatedEventId = (tokenId: BigInt, event: ethereum.Event): string =>
  "BullaTagUpdated-" + tokenId.toString() + "-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString();

export const getAccountTagId = (tokenId: BigInt, userAddress: Bytes): string => tokenId.toString() + "-" + userAddress.toHexString();

export const getBullaBankerCreatedId = (event: ethereum.Event): string => "BullaBankerCreated-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString();

export const getOrCreateBullaTagUpdatedEvent = (bullaTagUpdatedId: string): BullaTagUpdatedEvent => {
  let bullaTagUpdatedEvent = BullaTagUpdatedEvent.load(bullaTagUpdatedId);
  if (!bullaTagUpdatedEvent) bullaTagUpdatedEvent = new BullaTagUpdatedEvent(bullaTagUpdatedId);

  return bullaTagUpdatedEvent;
};

export const getOrCreateAccountTag = (accountTagId: string): AccountTag => {
  let accountTag = AccountTag.load(accountTagId);
  if (!accountTag) accountTag = new AccountTag(accountTagId);

  return accountTag;
};

export const createBullaBankerCreatedEvent = (event: BullaBankerCreated): BullaBankerCreatedEvent => new BullaBankerCreatedEvent(getBullaBankerCreatedId(event));
