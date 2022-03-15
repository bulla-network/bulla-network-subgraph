import { InstantPaymentEvent } from "../../generated/schema";
import { InstantPayment } from "../../generated/BullaInstantPayment/BullaInstaPay";
import { getInstantPaymentEventId } from "../functions/BullaInstaPay";
import { getOrCreateToken } from "../functions/common";

export function handleInstantPayment(event: InstantPayment): void {
  const instantPaymentId = getInstantPaymentEventId(event);
  const instantPaymentEvent = new InstantPaymentEvent(instantPaymentId);
  const token = getOrCreateToken(event.params.tokenAddress);

  instantPaymentEvent.from = event.params.from;
  instantPaymentEvent.to = event.params.to;
  instantPaymentEvent.amount = event.params.amount;
  instantPaymentEvent.token = token.id;
  instantPaymentEvent.description = event.params.description;
  instantPaymentEvent.tags = event.params.tags;
  instantPaymentEvent.ipfsHash = event.params.ipfsHash;
  instantPaymentEvent.eventName = "InstantPayment";
  instantPaymentEvent.blockNumber = event.block.number;
  instantPaymentEvent.transactionHash = event.transaction.hash;
  instantPaymentEvent.logIndex = event.logIndex;
  instantPaymentEvent.timestamp = event.block.timestamp;

  instantPaymentEvent.save();
}
