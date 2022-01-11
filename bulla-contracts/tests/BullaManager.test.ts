import { test, assert } from "matchstick-as/assembly/index";
import {
  newBullaTokenChangedEvent,
  newCollectorChangedEvent,
  newFeeChangedEvent,
  newFeeThresholdChangedEvent,
  newOwnerChangedEvent,
  newReducedFeeChangedEvent
} from "./functions/BullaManager.testtools";
import { afterEach, MOCK_MANAGER_ADDRESS, setupContracts } from "./helpers";
import {
  handleBullaTokenChanged,
  handleCollectorChanged,
  handleFeeChanged,
  handleFeeThresholdChanged,
  handleOwnerChanged,
  handleReducedFeeChanged
} from "../src/mappings/BullaManager";
import { log } from "@graphprotocol/graph-ts";

const managerAddress = MOCK_MANAGER_ADDRESS;

test("it handles FeeChanged events", () => {
  setupContracts();

  const feeChangedEvent = newFeeChangedEvent();
  handleFeeChanged(feeChangedEvent);

  assert.fieldEquals("BullaManager", managerAddress.toHexString(), "feeBasisPoints", feeChangedEvent.params.newFee.toString());
  assert.fieldEquals("BullaManager", managerAddress.toHexString(), "lastUpdatedBlockNumber", feeChangedEvent.block.number.toString());
  assert.fieldEquals("BullaManager", managerAddress.toHexString(), "lastUpdatedTimestamp", feeChangedEvent.block.timestamp.toString());

  log.info("✅ should handle the FeeChanged event and update BullaManager", []);

  afterEach();
});

test("it handles CollectorChanged event", () => {
  setupContracts();

  const collectorChangedEvent = newCollectorChangedEvent();
  handleCollectorChanged(collectorChangedEvent);

  assert.fieldEquals("BullaManager", managerAddress.toHexString(), "feeCollectionAddress", collectorChangedEvent.params.newCollector.toHexString());
  assert.fieldEquals("BullaManager", managerAddress.toHexString(), "lastUpdatedBlockNumber", collectorChangedEvent.block.number.toString());
  assert.fieldEquals("BullaManager", managerAddress.toHexString(), "lastUpdatedTimestamp", collectorChangedEvent.block.timestamp.toString());

  log.info("✅ should handle the CollectorChanged event and update BullaManager", []);

  afterEach();
});

test("it handles OwnerChanged event", () => {
  setupContracts();

  const ownerChangedEvent = newOwnerChangedEvent();
  handleOwnerChanged(ownerChangedEvent);

  assert.fieldEquals("BullaManager", managerAddress.toHexString(), "owner", ownerChangedEvent.params.newOwner.toHexString());
  assert.fieldEquals("BullaManager", managerAddress.toHexString(), "lastUpdatedBlockNumber", ownerChangedEvent.block.number.toString());
  assert.fieldEquals("BullaManager", managerAddress.toHexString(), "lastUpdatedTimestamp", ownerChangedEvent.block.timestamp.toString());

  log.info("✅ should handle the OwnerChanged event and update BullaManager", []);

  afterEach();
});

test("it handles BullaTokenChanged event", () => {
  setupContracts();

  const bullaTokenChangedEvent = newBullaTokenChangedEvent();
  handleBullaTokenChanged(bullaTokenChangedEvent);

  assert.fieldEquals("BullaManager", managerAddress.toHexString(), "bullaTokenAddress", bullaTokenChangedEvent.params.newBullaToken.toHexString());
  assert.fieldEquals("BullaManager", managerAddress.toHexString(), "lastUpdatedBlockNumber", bullaTokenChangedEvent.block.number.toString());
  assert.fieldEquals("BullaManager", managerAddress.toHexString(), "lastUpdatedTimestamp", bullaTokenChangedEvent.block.timestamp.toString());

  log.info("✅ should handle the BullaTokenChanged event and update BullaManager", []);

  afterEach();
});

test("it handles FeeThresholdChanged event", () => {
  setupContracts();

  const feeThresholdChangedEvent = newFeeThresholdChangedEvent();
  handleFeeThresholdChanged(feeThresholdChangedEvent);

  assert.fieldEquals("BullaManager", managerAddress.toHexString(), "bullaTokenThreshold", feeThresholdChangedEvent.params.newFeeThreshold.toString());
  assert.fieldEquals("BullaManager", managerAddress.toHexString(), "lastUpdatedBlockNumber", feeThresholdChangedEvent.block.number.toString());
  assert.fieldEquals("BullaManager", managerAddress.toHexString(), "lastUpdatedTimestamp", feeThresholdChangedEvent.block.timestamp.toString());

  log.info("✅ should handle the FeeThresholdChanged event and update BullaManager", []);

  afterEach();
});

test("it handles ReducedFeeChanged event", () => {
  setupContracts();

  const reducedFeeChangedEvent = newReducedFeeChangedEvent();
  handleReducedFeeChanged(reducedFeeChangedEvent);

  assert.fieldEquals("BullaManager", managerAddress.toHexString(), "reducedFeeBasisPoints", reducedFeeChangedEvent.params.newFee.toString());
  assert.fieldEquals("BullaManager", managerAddress.toHexString(), "lastUpdatedBlockNumber", reducedFeeChangedEvent.block.number.toString());
  assert.fieldEquals("BullaManager", managerAddress.toHexString(), "lastUpdatedTimestamp", reducedFeeChangedEvent.block.timestamp.toString());

  log.info("✅ should handle the ReducedFeeChanged event and update BullaManager", []);

  afterEach();
});

test("it handles initialization and updates to the bullaManager", () => {
  // constructor events
  // up the fee by 2x
  //change the reduced fee by 4x
  // change the collector
  // change the owner
  // change the bullaToken
  // change the feeThreshold
});
