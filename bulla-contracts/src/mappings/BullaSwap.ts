import { OrderCreated, OrderDeleted, OrderExecuted } from "../../generated/BullaSwap/BullaSwap";
import { OrderERC20 } from "../../generated/schema";
import { createOrderCreatedEvent, createOrderDeletedEvent, createOrderExecutedEvent } from "../functions/BullaSwap";
import { getOrCreateToken, getOrCreateUser } from "../functions/common";

export function handleOrderCreated(event: OrderCreated): void {
  const ev = event.params;
  const orderId = ev.orderId;

  // Create the order entity
  const order = new OrderERC20(orderId.toString());
  order.orderId = orderId;
  order.expiry = ev.order.expiry;
  order.signerWallet = ev.order.signerWallet;
  order.signerToken = getOrCreateToken(ev.order.signerToken).id;
  order.signerAmount = ev.order.signerAmount;
  order.senderWallet = ev.order.senderWallet;
  order.senderToken = getOrCreateToken(ev.order.senderToken).id;
  order.senderAmount = ev.order.senderAmount;
  order.save();

  // Create the event entity
  const orderCreatedEvent = createOrderCreatedEvent(orderId, event);
  orderCreatedEvent.order = order.id;
  orderCreatedEvent.sender = ev.sender;
  orderCreatedEvent.signerWallet = ev.order.signerWallet;
  orderCreatedEvent.eventName = "OrderCreated";
  orderCreatedEvent.blockNumber = event.block.number;
  orderCreatedEvent.transactionHash = event.transaction.hash;
  orderCreatedEvent.logIndex = event.logIndex;
  orderCreatedEvent.timestamp = event.block.timestamp;

  // Update user entities
  const sender = getOrCreateUser(ev.sender);
  sender.swapEvents = sender.swapEvents ? sender.swapEvents.concat([orderCreatedEvent.id]) : [orderCreatedEvent.id];
  sender.save();

  const signer = getOrCreateUser(ev.signerWallet);
  signer.swapEvents = signer.swapEvents ? signer.swapEvents.concat([orderCreatedEvent.id]) : [orderCreatedEvent.id];
  signer.save();

  orderCreatedEvent.save();
}

export function handleOrderExecuted(event: OrderExecuted): void {
  const ev = event.params;
  const orderId = ev.orderId;

  // Create the order entity
  const order = new OrderERC20(orderId.toString());
  order.orderId = orderId;
  order.expiry = ev.order.expiry;
  order.signerWallet = ev.order.signerWallet;
  order.signerToken = getOrCreateToken(ev.order.signerToken).id;
  order.signerAmount = ev.order.signerAmount;
  order.senderWallet = ev.order.senderWallet;
  order.senderToken = getOrCreateToken(ev.order.senderToken).id;
  order.senderAmount = ev.order.senderAmount;
  order.save();

  // Create the event entity
  const orderExecutedEvent = createOrderExecutedEvent(orderId, event);
  orderExecutedEvent.order = order.id;
  orderExecutedEvent.sender = ev.sender;
  orderExecutedEvent.signerWallet = ev.order.signerWallet;
  orderExecutedEvent.eventName = "OrderExecuted";
  orderExecutedEvent.blockNumber = event.block.number;
  orderExecutedEvent.transactionHash = event.transaction.hash;
  orderExecutedEvent.logIndex = event.logIndex;
  orderExecutedEvent.timestamp = event.block.timestamp;

  // Update user entities
  const sender = getOrCreateUser(ev.sender);
  sender.swapEvents = sender.swapEvents ? sender.swapEvents.concat([orderExecutedEvent.id]) : [orderExecutedEvent.id];
  sender.save();

  const recipient = getOrCreateUser(ev.recipient);
  recipient.swapEvents = recipient.swapEvents ? recipient.swapEvents.concat([orderExecutedEvent.id]) : [orderExecutedEvent.id];
  recipient.save();

  orderExecutedEvent.save();
}

export function handleOrderDeleted(event: OrderDeleted): void {
  const ev = event.params;
  const orderId = ev.orderId;

  // Create the order entity
  const order = new OrderERC20(orderId.toString());
  order.orderId = orderId;
  order.expiry = ev.order.expiry;
  order.signerWallet = ev.order.signerWallet;
  order.signerToken = getOrCreateToken(ev.order.signerToken).id;
  order.signerAmount = ev.order.signerAmount;
  order.senderWallet = ev.order.senderWallet;
  order.senderToken = getOrCreateToken(ev.order.senderToken).id;
  order.senderAmount = ev.order.senderAmount;
  order.save();

  // Create the event entity
  const orderDeletedEvent = createOrderDeletedEvent(orderId, event);
  orderDeletedEvent.order = order.id;
  orderDeletedEvent.signerWallet = ev.signerWallet;
  orderDeletedEvent.eventName = "OrderDeleted";
  orderDeletedEvent.blockNumber = event.block.number;
  orderDeletedEvent.transactionHash = event.transaction.hash;
  orderDeletedEvent.logIndex = event.logIndex;
  orderDeletedEvent.timestamp = event.block.timestamp;

  // Update user entities
  const signer = getOrCreateUser(ev.order.signerWallet);
  signer.swapEvents = signer.swapEvents ? signer.swapEvents.concat([orderDeletedEvent.id]) : [orderDeletedEvent.id];
  signer.save();

  const sender = getOrCreateUser(ev.order.senderWallet);
  sender.swapEvents = sender.swapEvents ? sender.swapEvents.concat([orderDeletedEvent.id]) : [orderDeletedEvent.id];
  sender.save();

  orderDeletedEvent.save();
}
