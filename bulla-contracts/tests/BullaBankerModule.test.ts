import { BigInt } from "@graphprotocol/graph-ts";
import { assert, log, test } from "matchstick-as";
import { getGnosisModuleConfigId } from "../src/functions/BullaBankerModule";
import { handleBullaBankerModuleDeploy } from "../src/mappings/BullaBankerModule";
import { newBullaBankerModuleDeployEvent } from "./functions/BullaBankerModule.testtools";
import { afterEach, MOCK_SAFE_ADDRESS, setupContracts } from "./helpers";

test("it handles BullaBankerModuleDeploy events", () => {
  setupContracts();

  const safeAddress = MOCK_SAFE_ADDRESS;
  const version = "0.1";
  const bullaBankerModuleDeployedEvent = newBullaBankerModuleDeployEvent(version, safeAddress);
  const bullaGnosisModuleConfigId = getGnosisModuleConfigId(bullaBankerModuleDeployedEvent);
  handleBullaBankerModuleDeploy(bullaBankerModuleDeployedEvent);

  assert.fieldEquals("BullaBankerGnosisModuleConfig", bullaGnosisModuleConfigId, "moduleAddress", bullaBankerModuleDeployedEvent.params.moduleAddress.toHexString());
  assert.fieldEquals("BullaBankerGnosisModuleConfig", bullaGnosisModuleConfigId, "safeAddress", safeAddress.toHexString());
  assert.fieldEquals("BullaBankerGnosisModuleConfig", bullaGnosisModuleConfigId, "version", version);
  assert.fieldEquals("BullaBankerGnosisModuleConfig", bullaGnosisModuleConfigId, "installationTimestamp", bullaBankerModuleDeployedEvent.block.timestamp.toString());

  log.info("✅ should handle the BullaBankerModuleDeploy event and create a BullaBankerGnosisModuleConfig", []);

  //** simulate an update to the module (redeploy) */
  const newVersion = "0.2";
  const currentUnixTimestamp = BigInt.fromU32(1000);
  const bullaBankerModuleUpdateEvent = newBullaBankerModuleDeployEvent(newVersion);
  bullaBankerModuleUpdateEvent.block.timestamp = currentUnixTimestamp;

  handleBullaBankerModuleDeploy(bullaBankerModuleUpdateEvent);

  assert.fieldEquals("BullaBankerGnosisModuleConfig", bullaGnosisModuleConfigId, "moduleAddress", bullaBankerModuleUpdateEvent.params.moduleAddress.toHexString());
  assert.fieldEquals("BullaBankerGnosisModuleConfig", bullaGnosisModuleConfigId, "safeAddress", safeAddress.toHexString());
  assert.fieldEquals("BullaBankerGnosisModuleConfig", bullaGnosisModuleConfigId, "version", newVersion);
  assert.fieldEquals("BullaBankerGnosisModuleConfig", bullaGnosisModuleConfigId, "installationTimestamp", currentUnixTimestamp.toString());

  log.info("✅ should handle the BullaBankerModuleDeploy event and update the existing BullaBankerGnosisModuleConfig", []);

  afterEach();
});
