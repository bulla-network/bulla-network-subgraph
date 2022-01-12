import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";
import { BullaTokenChanged, CollectorChanged, FeeChanged, FeeThresholdChanged, OwnerChanged, ReducedFeeChanged } from "../../generated/BullaManager/BullaManager";
import { ADDRESS_1, ADDRESS_2, ADDRESS_ZERO, DEFAULT_TIMESTAMP, FEE_BPS, MOCK_BULLA_TOKEN_ADDRESS, MOCK_MANAGER_ADDRESS, toEthAddress, toUint256 } from "../helpers";

export const newFeeChangedEvent = (newFee: i32 = 10): FeeChanged => {
  const event: FeeChanged = changetype<FeeChanged>(newMockEvent());
  event.address = MOCK_MANAGER_ADDRESS;

  const bullaManagerParam = new ethereum.EventParam("bullaManager", toEthAddress(MOCK_MANAGER_ADDRESS));
  const prevFeeParam = new ethereum.EventParam("prevFee", toUint256(FEE_BPS));
  const newFeeParam = new ethereum.EventParam("newFee", toUint256(BigInt.fromU32(newFee)));
  const blocktimeParam = new ethereum.EventParam("blocktime", toUint256(DEFAULT_TIMESTAMP));

  event.parameters = [bullaManagerParam, prevFeeParam, newFeeParam, blocktimeParam];

  return event;
};

export const newCollectorChangedEvent = (newCollector: Address = ADDRESS_1): CollectorChanged => {
  const event: CollectorChanged = changetype<CollectorChanged>(newMockEvent());
  event.address = MOCK_MANAGER_ADDRESS;

  const bullaManagerParam = new ethereum.EventParam("bullaManager", toEthAddress(MOCK_MANAGER_ADDRESS));
  const prevCollectorParam = new ethereum.EventParam("prevCollector", toEthAddress(ADDRESS_ZERO));
  const newCollectorParam = new ethereum.EventParam("newCollector", toEthAddress(newCollector));
  const blocktimeParam = new ethereum.EventParam("blocktime", toUint256(DEFAULT_TIMESTAMP.plus(BigInt.fromI32(10))));

  event.parameters = [bullaManagerParam, prevCollectorParam, newCollectorParam, blocktimeParam];

  return event;
};

export const newOwnerChangedEvent = (newOwner: Address = ADDRESS_1): OwnerChanged => {
  const event: OwnerChanged = changetype<OwnerChanged>(newMockEvent());
  event.address = MOCK_MANAGER_ADDRESS;

  const bullaManagerParam = new ethereum.EventParam("bullaManager", toEthAddress(MOCK_MANAGER_ADDRESS));
  const preOwnerParam = new ethereum.EventParam("prevOwner", toEthAddress(ADDRESS_ZERO));
  const newOwnerParam = new ethereum.EventParam("newOwner", toEthAddress(newOwner));
  const blocktimeParam = new ethereum.EventParam("blocktime", toUint256(DEFAULT_TIMESTAMP.plus(BigInt.fromI32(11))));

  event.parameters = [bullaManagerParam, preOwnerParam, newOwnerParam, blocktimeParam];

  return event;
};

export const newBullaTokenChangedEvent = (newBullaToken: Address = MOCK_BULLA_TOKEN_ADDRESS): BullaTokenChanged => {
  const event: BullaTokenChanged = changetype<BullaTokenChanged>(newMockEvent());
  event.address = MOCK_MANAGER_ADDRESS;

  const bullaManagerParam = new ethereum.EventParam("bullaManager", toEthAddress(MOCK_MANAGER_ADDRESS));
  const prevBullaTokenParam = new ethereum.EventParam("prevBullaToken", toEthAddress(ADDRESS_ZERO));
  const newBullaTokenParam = new ethereum.EventParam("newBullaToken", toEthAddress(newBullaToken));
  const blocktimeParam = new ethereum.EventParam("blocktime", toUint256(DEFAULT_TIMESTAMP.plus(BigInt.fromI32(11))));

  event.parameters = [bullaManagerParam, prevBullaTokenParam, newBullaTokenParam, blocktimeParam];

  return event;
};

export const newFeeThresholdChangedEvent = (newFeeThreshold: u32 = 4): FeeThresholdChanged => {
  const event: FeeThresholdChanged = changetype<FeeThresholdChanged>(newMockEvent());
  event.address = MOCK_MANAGER_ADDRESS;

  const bullaManagerParam = new ethereum.EventParam("bullaManager", toEthAddress(MOCK_MANAGER_ADDRESS));
  const prevBullaTokenParam = new ethereum.EventParam("prevFeeThreshold", toUint256(BigInt.fromU32(2)));
  const newBullaTokenParam = new ethereum.EventParam("newFeeThreshold", toUint256(BigInt.fromU32(newFeeThreshold)));
  const blocktimeParam = new ethereum.EventParam("blocktime", toUint256(DEFAULT_TIMESTAMP.plus(BigInt.fromI32(11))));

  event.parameters = [bullaManagerParam, prevBullaTokenParam, newBullaTokenParam, blocktimeParam];

  return event;
};

export const newReducedFeeChangedEvent = (newFee: u32 = 5): ReducedFeeChanged => {
  const event: ReducedFeeChanged = changetype<ReducedFeeChanged>(newMockEvent());
  event.address = MOCK_MANAGER_ADDRESS;

  const bullaManagerParam = new ethereum.EventParam("bullaManager", toEthAddress(MOCK_MANAGER_ADDRESS));
  const prevFeeParam = new ethereum.EventParam("prevFee", toUint256(BigInt.fromU32(10)));
  const newFeeParam = new ethereum.EventParam("newFee", toUint256(BigInt.fromU32(newFee)));
  const blocktimeParam = new ethereum.EventParam("blocktime", toUint256(DEFAULT_TIMESTAMP.plus(BigInt.fromI32(100))));

  event.parameters = [bullaManagerParam, prevFeeParam, newFeeParam, blocktimeParam];

  return event;
};
