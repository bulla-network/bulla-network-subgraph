import { ethereum } from "@graphprotocol/graph-ts";

export const getInstantPaymentEventId = (event: ethereum.Event): string =>
  "InstantPaymentEvent-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
