import { BullaTagUpdated } from "../../generated/BullaBanker/BullaBanker";
import { BullaTagUpdatedEvent } from "../../generated/schema";

export const getBullaTagUpdatedEventId = (event: BullaTagUpdated): string =>
  `BullaTagUpdated-${event.params.tokenId.toString()}-${event.transaction.hash.toHexString()}`;

export const getOrCreateBullaTagUpdatedEvent = (
  bullaTagUpdatedId: string
): BullaTagUpdatedEvent => {
  let bullaTagUpdatedEvent = BullaTagUpdatedEvent.load(bullaTagUpdatedId);
  if (!bullaTagUpdatedEvent)
    bullaTagUpdatedEvent = new BullaTagUpdatedEvent(bullaTagUpdatedId);

  return bullaTagUpdatedEvent;
};
