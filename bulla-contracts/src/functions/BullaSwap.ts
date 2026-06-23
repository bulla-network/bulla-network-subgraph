import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { OrderCreated, OrderDeleted, OrderExecuted } from "../../generated/BullaSwap/BullaSwap";
import { OrderCreatedEvent, OrderDeletedEvent, OrderERC20, OrderExecutedEvent } from "../../generated/schema";
import { getOrCreateToken } from "./common";

export const SWAP_ORDER_STATUS_PENDING = "Pending";
export const SWAP_ORDER_STATUS_EXECUTED = "Executed";
export const SWAP_ORDER_STATUS_CANCELED = "Canceled";

// Load the lifecycle order (or create it, defaulting to Pending), then refresh
// its terms and the latest-touched transaction metadata. createdAt is only set
// when the entity is first materialized. Terms are passed as scalars because
// AssemblyScript has no union type to accept the three distinct *OrderStruct
// classes the three swap events generate.
export const getOrCreateOrder = (
  orderId: BigInt,
  expiry: BigInt,
  signerWallet: Address,
  signerToken: Address,
  signerAmount: BigInt,
  senderWallet: Address,
  senderToken: Address,
  senderAmount: BigInt,
  event: ethereum.Event,
): OrderERC20 => {
  const id = orderId.toString();
  let order = OrderERC20.load(id);
  if (order == null) {
    order = new OrderERC20(id);
    order.orderId = orderId;
    order.status = SWAP_ORDER_STATUS_PENDING;
    order.createdAt = event.block.timestamp;
    order.createdTxHash = event.transaction.hash;
  }
  order.expiry = expiry;
  order.signerWallet = signerWallet;
  order.signerToken = getOrCreateToken(signerToken).id;
  order.signerAmount = signerAmount;
  order.senderWallet = senderWallet;
  order.senderToken = getOrCreateToken(senderToken).id;
  order.senderAmount = senderAmount;
  order.transactionHash = event.transaction.hash;
  order.lastUpdatedBlock = event.block.number;
  order.lastUpdatedTimestamp = event.block.timestamp;
  return order;
};

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
