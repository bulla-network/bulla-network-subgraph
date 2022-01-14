import { FeeChanged, CollectorChanged, OwnerChanged, BullaTokenChanged, FeeThresholdChanged, ReducedFeeChanged } from "../../generated/BullaManager/BullaManager";
import { getOrCreateBullaManager, getOrCreateToken, getOrCreateUser } from "../functions/common";

export function handleFeeChanged(event: FeeChanged): void {
  const ev = event.params;
  const bullaManager = getOrCreateBullaManager(event);
  bullaManager.feeBasisPoints = ev.newFee.toI32();
  bullaManager.lastUpdatedBlockNumber = event.block.number;
  bullaManager.lastUpdatedTimestamp = event.block.timestamp;

  bullaManager.save();
}

export function handleCollectorChanged(event: CollectorChanged): void {
  const ev = event.params;
  const bullaManager = getOrCreateBullaManager(event);
  const user = getOrCreateUser(ev.newCollector);

  bullaManager.feeCollectionAddress = user.id;
  bullaManager.lastUpdatedBlockNumber = event.block.number;
  bullaManager.lastUpdatedTimestamp = event.block.timestamp;

  bullaManager.save();
}

export function handleOwnerChanged(event: OwnerChanged): void {
  const ev = event.params;
  const bullaManager = getOrCreateBullaManager(event);

  bullaManager.owner = ev.newOwner;
  bullaManager.lastUpdatedBlockNumber = event.block.number;
  bullaManager.lastUpdatedTimestamp = event.block.timestamp;

  bullaManager.save();
}

export function handleBullaTokenChanged(event: BullaTokenChanged): void {
  const ev = event.params;
  const token = getOrCreateToken(ev.newBullaToken);
  const bullaManager = getOrCreateBullaManager(event);

  bullaManager.bullaToken = token.id;
  bullaManager.lastUpdatedBlockNumber = event.block.number;
  bullaManager.lastUpdatedTimestamp = event.block.timestamp;

  bullaManager.save();
}

export function handleFeeThresholdChanged(event: FeeThresholdChanged): void {
  const ev = event.params;
  const bullaManager = getOrCreateBullaManager(event);

  bullaManager.bullaTokenThreshold = ev.newFeeThreshold.toI32();
  bullaManager.lastUpdatedBlockNumber = event.block.number;
  bullaManager.lastUpdatedTimestamp = event.block.timestamp;

  bullaManager.save();
}

export function handleReducedFeeChanged(event: ReducedFeeChanged): void {
  const ev = event.params;
  const bullaManager = getOrCreateBullaManager(event);

  bullaManager.reducedFeeBasisPoints = ev.newFee.toI32();
  bullaManager.lastUpdatedBlockNumber = event.block.number;
  bullaManager.lastUpdatedTimestamp = event.block.timestamp;

  bullaManager.save();
}
