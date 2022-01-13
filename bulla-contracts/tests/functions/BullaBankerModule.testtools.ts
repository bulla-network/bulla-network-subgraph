import { Address, ethereum } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";
import { BullaBankerModuleDeploy } from "../../generated/BullaBankerModule/BullaBankerModule";
import { ADDRESS_1, MOCK_SAFE_ADDRESS, MOCK_SAFE_MODULE_ADDRESS, toEthAddress, toEthString } from "../helpers";

export const newBullaBankerModuleDeployEvent = (version: string = "0.1", safeAddress: Address = MOCK_SAFE_ADDRESS): BullaBankerModuleDeploy => {
  const event: BullaBankerModuleDeploy = changetype<BullaBankerModuleDeploy>(newMockEvent());
  const versionParam = new ethereum.EventParam("version", toEthString(version));
  const safeParam = new ethereum.EventParam("safe", toEthAddress(safeAddress));
  const moduleAddressParam = new ethereum.EventParam("moduleAddress", toEthAddress(MOCK_SAFE_MODULE_ADDRESS));
  const initiatorParam = new ethereum.EventParam("initiator", toEthAddress(ADDRESS_1));
  event.parameters = [versionParam, safeParam, moduleAddressParam, initiatorParam];

  return event;
};
