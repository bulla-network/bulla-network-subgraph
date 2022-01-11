import { BigInt, ethereum } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";
import { BullaTokenChanged, CollectorChanged, FeeChanged, FeeThresholdChanged, OwnerChanged, ReducedFeeChanged } from "../../generated/BullaManager/BullaManager";
import { ADDRESS_1, ADDRESS_2, ADDRESS_ZERO, DEFAULT_TIMESTAMP, FEE_BPS, MOCK_MANAGER_ADDRESS, toEthAddress, toUint256 } from "../helpers";

export const newFeeChangedEvent = (): FeeChanged => {
  //@ts-ignore
  const event: FeeChanged = changetype<FeeChanged>(newMockEvent());
  event.address = MOCK_MANAGER_ADDRESS;

  const bullaManagerParam = new ethereum.EventParam("bullaManager", toEthAddress(MOCK_MANAGER_ADDRESS));
  const prevFeeParam = new ethereum.EventParam("prevFee", toUint256(FEE_BPS));
  const newFeeParam = new ethereum.EventParam("newFee", toUint256(FEE_BPS.plus(BigInt.fromI32(10))));
  const blocktimeParam = new ethereum.EventParam("blocktime", toUint256(DEFAULT_TIMESTAMP));

  event.parameters = [bullaManagerParam, prevFeeParam, newFeeParam, blocktimeParam];

  return event;
};

export const newCollectorChangedEvent = (): CollectorChanged => {
  //@ts-ignore
  const event: CollectorChanged = changetype<CollectorChanged>(newMockEvent());
  event.address = MOCK_MANAGER_ADDRESS;

  const bullaManagerParam = new ethereum.EventParam("bullaManager", toEthAddress(MOCK_MANAGER_ADDRESS));
  const prevCollectorParam = new ethereum.EventParam("prevCollector", toEthAddress(ADDRESS_ZERO));
  const newCollectorParam = new ethereum.EventParam("newCollector", toEthAddress(ADDRESS_1));
  const blocktimeParam = new ethereum.EventParam("blocktime", toUint256(DEFAULT_TIMESTAMP.plus(BigInt.fromI32(10))));

  event.parameters = [bullaManagerParam, prevCollectorParam, newCollectorParam, blocktimeParam];

  return event;
};

export const newOwnerChangedEvent = (): OwnerChanged => {
  //@ts-ignore
  const event: OwnerChanged = changetype<OwnerChanged>(newMockEvent());
  event.address = MOCK_MANAGER_ADDRESS;

  const bullaManagerParam = new ethereum.EventParam("bullaManager", toEthAddress(MOCK_MANAGER_ADDRESS));
  const preOwnerParam = new ethereum.EventParam("prevOwner", toEthAddress(ADDRESS_1));
  const newOwnerParam = new ethereum.EventParam("newOwner", toEthAddress(ADDRESS_2));
  const blocktimeParam = new ethereum.EventParam("blocktime", toUint256(DEFAULT_TIMESTAMP.plus(BigInt.fromI32(11))));

  event.parameters = [bullaManagerParam, preOwnerParam, newOwnerParam, blocktimeParam];

  return event;
};

export const newBullaTokenChangedEvent = (): BullaTokenChanged => {
  //@ts-ignore
  const event: BullaTokenChanged = changetype<BullaTokenChanged>(newMockEvent());
  event.address = MOCK_MANAGER_ADDRESS;

  const bullaManagerParam = new ethereum.EventParam("bullaManager", toEthAddress(MOCK_MANAGER_ADDRESS));
  const prevBullaTokenParam = new ethereum.EventParam("prevBullaToken", toEthAddress(ADDRESS_1));
  const newBullaTokenParam = new ethereum.EventParam("newBullaToken", toEthAddress(ADDRESS_2));
  const blocktimeParam = new ethereum.EventParam("blocktime", toUint256(DEFAULT_TIMESTAMP.plus(BigInt.fromI32(11))));

  event.parameters = [bullaManagerParam, prevBullaTokenParam, newBullaTokenParam, blocktimeParam];

  return event;
};

export const newFeeThresholdChangedEvent = (): FeeThresholdChanged => {
  //@ts-ignore
  const event: FeeThresholdChanged = changetype<FeeThresholdChanged>(newMockEvent());
  event.address = MOCK_MANAGER_ADDRESS;

  const bullaManagerParam = new ethereum.EventParam("bullaManager", toEthAddress(MOCK_MANAGER_ADDRESS));
  const prevBullaTokenParam = new ethereum.EventParam("prevFeeThreshold", toUint256(BigInt.fromU32(2)));
  const newBullaTokenParam = new ethereum.EventParam("newFeeThreshold", toUint256(BigInt.fromU32(4)));
  const blocktimeParam = new ethereum.EventParam("blocktime", toUint256(DEFAULT_TIMESTAMP.plus(BigInt.fromI32(11))));

  event.parameters = [bullaManagerParam, prevBullaTokenParam, newBullaTokenParam, blocktimeParam];

  return event;
};

export const newReducedFeeChangedEvent = (): ReducedFeeChanged => {
  //@ts-ignore
  const event: ReducedFeeChanged = changetype<ReducedFeeChanged>(newMockEvent());
  event.address = MOCK_MANAGER_ADDRESS;

  const bullaManagerParam = new ethereum.EventParam("bullaManager", toEthAddress(MOCK_MANAGER_ADDRESS));
  const prevBullaTokenParam = new ethereum.EventParam("prevFee", toUint256(BigInt.fromU32(10)));
  const newBullaTokenParam = new ethereum.EventParam("newFee", toUint256(BigInt.fromU32(5)));
  const blocktimeParam = new ethereum.EventParam("blocktime", toUint256(DEFAULT_TIMESTAMP.plus(BigInt.fromI32(11))));

  event.parameters = [bullaManagerParam, prevBullaTokenParam, newBullaTokenParam, blocktimeParam];

  return event;
};
