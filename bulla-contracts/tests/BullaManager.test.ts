import { BigInt, log } from "@graphprotocol/graph-ts";
import { assert, test } from "matchstick-as/assembly/index";
import {
  handleBullaTokenChanged,
  handleCollectorChanged,
  handleFeeChanged,
  handleFeeThresholdChanged,
  handleOwnerChanged,
  handleReducedFeeChanged
} from "../src/mappings/BullaManager";
import {
  newBullaTokenChangedEvent,
  newCollectorChangedEvent,
  newFeeChangedEvent,
  newFeeThresholdChangedEvent,
  newOwnerChangedEvent,
  newReducedFeeChangedEvent
} from "./functions/BullaManager.testtools";
import { ADDRESS_1, ADDRESS_2, afterEach, DESCRIPTION_BYTES, MOCK_BULLA_TOKEN_ADDRESS, MOCK_MANAGER_ADDRESS, MOCK_WETH_ADDRESS, setupContracts } from "./helpers";

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

  assert.fieldEquals("BullaManager", managerAddress.toHexString(), "bullaToken", bullaTokenChangedEvent.params.newBullaToken.toHexString());
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

test("it handles initialization and updates to the BullaManager", () => {
  setupContracts();

  const tokenThreshold = 2; // msg.sender needs 2 tokens to unlock a reduced fee
  const feeBPS = 10;
  const reducedFeeBPS = 5;
  const collectionAddress = ADDRESS_1;
  const owner = ADDRESS_1;

  /** simulation of constructor events and a setup of the bulla token */
  const feeChangedEvent = newFeeChangedEvent(feeBPS);
  const collectorChangedEvent = newCollectorChangedEvent(collectionAddress);
  const ownerChangedEvent = newOwnerChangedEvent(owner);

  handleFeeChanged(feeChangedEvent);
  handleCollectorChanged(collectorChangedEvent);
  handleOwnerChanged(ownerChangedEvent);

  /** simulate setting up the BullaManager configuration */
  const bullaTokenChangedEvent = newBullaTokenChangedEvent();
  const reduceFeeEvent = newReducedFeeChangedEvent(reducedFeeBPS);
  const reducedFeeTokenThresholdEvent = newFeeThresholdChangedEvent(tokenThreshold);

  handleBullaTokenChanged(bullaTokenChangedEvent);
  handleReducedFeeChanged(reduceFeeEvent);
  handleFeeThresholdChanged(reducedFeeTokenThresholdEvent);

  assert.fieldEquals("BullaManager", managerAddress.toHexString(), "address", managerAddress.toHexString());
  assert.fieldEquals("BullaManager", managerAddress.toHexString(), "owner", owner.toHexString());
  assert.fieldEquals("BullaManager", managerAddress.toHexString(), "description", DESCRIPTION_BYTES.toString());
  assert.fieldEquals("BullaManager", managerAddress.toHexString(), "bullaToken", MOCK_BULLA_TOKEN_ADDRESS.toHexString());
  assert.fieldEquals("BullaManager", managerAddress.toHexString(), "feeCollectionAddress", collectionAddress.toHexString());
  assert.fieldEquals("BullaManager", managerAddress.toHexString(), "feeBasisPoints", feeBPS.toString());
  assert.fieldEquals("BullaManager", managerAddress.toHexString(), "reducedFeeBasisPoints", reducedFeeBPS.toString());
  assert.fieldEquals("BullaManager", managerAddress.toHexString(), "bullaTokenThreshold", tokenThreshold.toString());
  log.info("✅ should handle the complete setup of the BullaManager entity", []);

  // completely update the BullaManager properties
  const new_owner = ADDRESS_2;
  const new_bullaTokenAddress = MOCK_WETH_ADDRESS;
  const new_collectionAddress = ADDRESS_2;
  const new_feeBPS = 15;
  const new_reducedFeeBPS = 2;
  const new_tokenThreshold = 10;

  // simulation of the constructor event and a setup of the bulla token
  const new_ownerChangedEvent = newOwnerChangedEvent(new_owner);
  const new_bullaTokenChangedEvent = newBullaTokenChangedEvent(new_bullaTokenAddress);
  const new_collectorChangedEvent = newCollectorChangedEvent(new_collectionAddress);
  const new_feeChangedEvent = newFeeChangedEvent(new_feeBPS);
  // change the discount token to WETH
  const new_reduceFeeEvent = newReducedFeeChangedEvent(new_reducedFeeBPS);
  const new_reducedFeeTokenThresholdEvent = newFeeThresholdChangedEvent(new_tokenThreshold);

  const expectedTimestamp = new_reducedFeeTokenThresholdEvent.block.timestamp.plus(BigInt.fromU32(10000));
  const expectedBlockNumber = new_reducedFeeTokenThresholdEvent.block.number.plus(BigInt.fromU32(20));

  new_reducedFeeTokenThresholdEvent.block.timestamp = expectedTimestamp;
  new_reducedFeeTokenThresholdEvent.block.number = expectedBlockNumber;

  handleOwnerChanged(new_ownerChangedEvent);
  handleBullaTokenChanged(new_bullaTokenChangedEvent);
  handleCollectorChanged(new_collectorChangedEvent);
  handleFeeChanged(new_feeChangedEvent);
  handleReducedFeeChanged(new_reduceFeeEvent);
  handleFeeThresholdChanged(new_reducedFeeTokenThresholdEvent);

  assert.fieldEquals("BullaManager", managerAddress.toHexString(), "address", managerAddress.toHexString());
  assert.fieldEquals("BullaManager", managerAddress.toHexString(), "owner", new_owner.toHexString());
  assert.fieldEquals("BullaManager", managerAddress.toHexString(), "description", DESCRIPTION_BYTES.toString());
  assert.fieldEquals("BullaManager", managerAddress.toHexString(), "bullaToken", new_bullaTokenAddress.toHexString());
  assert.fieldEquals("BullaManager", managerAddress.toHexString(), "feeCollectionAddress", new_collectionAddress.toHexString());
  assert.fieldEquals("BullaManager", managerAddress.toHexString(), "feeBasisPoints", new_feeBPS.toString());
  assert.fieldEquals("BullaManager", managerAddress.toHexString(), "reducedFeeBasisPoints", new_reducedFeeBPS.toString());
  assert.fieldEquals("BullaManager", managerAddress.toHexString(), "bullaTokenThreshold", new_tokenThreshold.toString());
  log.info("✅ should handle a complete update to all mutable BullaManager options", []);

  afterEach();
});

export { handleBullaTokenChanged, handleCollectorChanged, handleFeeChanged, handleFeeThresholdChanged, handleOwnerChanged, handleReducedFeeChanged };
