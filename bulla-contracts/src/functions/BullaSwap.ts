import { BigInt, ethereum } from "@graphprotocol/graph-ts";
import { OrderCreated, OrderDeleted, OrderExecuted } from "../../generated/BullaSwap/BullaSwap";
import { OrderCreatedEvent, OrderDeletedEvent, OrderExecutedEvent } from "../../generated/schema";

export const getOrderCreatedEventId = (orderId: BigInt, event: ethereum.Event): string =>
  "OrderCreated-" + orderId.toString() + "-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString();

export const createOrderCreatedEvent = (orderId: BigInt, event: OrderCreated): OrderCreatedEvent => {
  return new OrderCreatedEvent(getOrderCreatedEventId(orderId, event));
};

export const getOrderExecutedEventId = (orderId: BigInt, event: ethereum.Event): string =>
  "OrderExecuted-" + orderId.toString() + "-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString();

export const createOrderExecutedEvent = (orderId: BigInt, event: OrderExecuted): OrderExecutedEvent => {
  return new OrderExecutedEvent(getOrderExecutedEventId(orderId, event));
};

export const getOrderDeletedEventId = (orderId: BigInt, event: ethereum.Event): string =>
  "OrderDeleted-" + orderId.toString() + "-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString();

export const createOrderDeletedEvent = (orderId: BigInt, event: OrderDeleted): OrderDeletedEvent => {
  return new OrderDeletedEvent(getOrderDeletedEventId(orderId, event));
};
