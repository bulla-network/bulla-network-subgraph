import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { BullaBankerCreated } from "../../generated/BullaBanker/BullaBanker";
import { AccountTag, BullaBankerCreatedEvent, BullaTagUpdatedEvent } from "../../generated/schema";

export const getBullaTagUpdatedEventId = (tokenId: BigInt, txHash: Bytes): string => "BullaTagUpdated-" + tokenId.toString() + "-" + txHash.toHexString();

export const getAccountTagId = (tokenId: BigInt, userAddress: Bytes): string => tokenId.toString() + "-" + userAddress.toHexString();

export const getBullaBankerCreatedId = (txHash: Bytes): string => "BullaBankerCreated-" + txHash.toHexString();

export const getOrCreateBullaTagUpdatedEvent = (bullaTagUpdatedId: string): BullaTagUpdatedEvent => {
  let bullaTagUpdatedEvent = BullaTagUpdatedEvent.load(bullaTagUpdatedId);
  if (!bullaTagUpdatedEvent) bullaTagUpdatedEvent = new BullaTagUpdatedEvent(bullaTagUpdatedId);

  return bullaTagUpdatedEvent!;
};

export const getOrCreateAccountTag = (accountTagId: string): AccountTag => {
  let accountTag = AccountTag.load(accountTagId);
  if (!accountTag) accountTag = new AccountTag(accountTagId);

  return accountTag!;
};

export const createBullaBankerCreatedEvent = (event: BullaBankerCreated): BullaBankerCreatedEvent =>
  new BullaBankerCreatedEvent(getBullaBankerCreatedId(event.transaction.hash));
