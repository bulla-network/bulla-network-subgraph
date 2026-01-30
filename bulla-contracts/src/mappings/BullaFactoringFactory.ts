import { PoolCreated } from "../../generated/BullaFactoringFactoryV2_1/BullaFactoringFactoryV2_1";
import { BullaFactoringV2_1Pool } from "../../generated/templates";
import { PoolCreatedEvent, FactoringPool } from "../../generated/schema";
import { getOrCreateUser } from "../functions/common";

export function handlePoolCreated(event: PoolCreated): void {
  const ev = event.params;

  // Create the dynamic data source for the new pool
  BullaFactoringV2_1Pool.create(ev.pool);

  // Create the FactoringPool entity
  const pool = new FactoringPool(ev.pool.toHexString());
  pool.poolAddress = ev.pool;
  pool.owner = ev.owner;
  pool.asset = ev.asset;
  pool.poolName = ev.poolName;
  pool.tokenName = ev.tokenName;
  pool.tokenSymbol = ev.tokenSymbol;
  pool.depositPermissions = ev.depositPermissions;
  pool.redeemPermissions = ev.redeemPermissions;
  pool.factoringPermissions = ev.factoringPermissions;
  pool.factory = event.address;
  pool.createdAtBlock = event.block.number;
  pool.createdAtTimestamp = event.block.timestamp;
  pool.createdAtTransaction = event.transaction.hash;
  pool.factoringEvents = [];
  pool.save();

  // Create the PoolCreatedEvent entity
  const poolCreatedEvent = new PoolCreatedEvent(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  poolCreatedEvent.eventName = "PoolCreated";
  poolCreatedEvent.blockNumber = event.block.number;
  poolCreatedEvent.transactionHash = event.transaction.hash;
  poolCreatedEvent.logIndex = event.logIndex;
  poolCreatedEvent.timestamp = event.block.timestamp;
  poolCreatedEvent.factory = event.address;
  poolCreatedEvent.pool = ev.pool;
  poolCreatedEvent.owner = ev.owner;
  poolCreatedEvent.asset = ev.asset;
  poolCreatedEvent.poolName = ev.poolName;
  poolCreatedEvent.tokenName = ev.tokenName;
  poolCreatedEvent.tokenSymbol = ev.tokenSymbol;
  poolCreatedEvent.depositPermissions = ev.depositPermissions;
  poolCreatedEvent.redeemPermissions = ev.redeemPermissions;
  poolCreatedEvent.factoringPermissions = ev.factoringPermissions;
  poolCreatedEvent.save();

  // Update the pool user entity
  const poolUser = getOrCreateUser(ev.pool);
  poolUser.save();

  // Update the owner user entity
  const ownerUser = getOrCreateUser(ev.owner);
  ownerUser.save();
}
