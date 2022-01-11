import { FeeChanged, CollectorChanged, OwnerChanged, BullaTokenChanged, FeeThresholdChanged, ReducedFeeChanged } from "../../generated/BullaManager/BullaManager";
import { getOrCreateBullaManager } from "../functions/common";

export const handleFeeChanged = (event: FeeChanged): void => {
  const ev = event.params;
  const bullaManager = getOrCreateBullaManager(event);
  bullaManager.feeBasisPoints = ev.newFee.toI32();
  bullaManager.lastUpdatedBlockNumber = event.block.number;
  bullaManager.lastUpdatedTimestamp = event.block.timestamp;

  bullaManager.save();
};

export const handleCollectorChanged = (event: CollectorChanged): void => {
  const ev = event.params;
  const bullaManager = getOrCreateBullaManager(event);

  bullaManager.feeCollectionAddress = ev.newCollector;
  bullaManager.lastUpdatedBlockNumber = event.block.number;
  bullaManager.lastUpdatedTimestamp = event.block.timestamp;

  bullaManager.save();
};

export const handleOwnerChanged = (event: OwnerChanged): void => {
  const ev = event.params;
  const bullaManager = getOrCreateBullaManager(event);

  bullaManager.owner = ev.newOwner;
  bullaManager.lastUpdatedBlockNumber = event.block.number;
  bullaManager.lastUpdatedTimestamp = event.block.timestamp;

  bullaManager.save();
};

export const handleBullaTokenChanged = (event: BullaTokenChanged): void => {
  const ev = event.params;
  const bullaManager = getOrCreateBullaManager(event);

  bullaManager.bullaTokenAddress = ev.newBullaToken;
  bullaManager.lastUpdatedBlockNumber = event.block.number;
  bullaManager.lastUpdatedTimestamp = event.block.timestamp;

  bullaManager.save();
};

export const handleFeeThresholdChanged = (event: FeeThresholdChanged): void => {
  const ev = event.params;
  const bullaManager = getOrCreateBullaManager(event);

  bullaManager.bullaTokenThreshold = ev.newFeeThreshold.toU32();
  bullaManager.lastUpdatedBlockNumber = event.block.number;
  bullaManager.lastUpdatedTimestamp = event.block.timestamp;

  bullaManager.save();
};

export const handleReducedFeeChanged = (event: ReducedFeeChanged): void => {
  const ev = event.params;
  const bullaManager = getOrCreateBullaManager(event);

  bullaManager.reducedFeeBasisPoints = ev.newFee.toU32();
  bullaManager.lastUpdatedBlockNumber = event.block.number;
  bullaManager.lastUpdatedTimestamp = event.block.timestamp;

  bullaManager.save();
}
