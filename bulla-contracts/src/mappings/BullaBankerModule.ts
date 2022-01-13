import { BullaBankerModuleDeploy } from "../../generated/BullaBankerModule/BullaBankerModule";
import { getOrCreateBullaGnosisModuleConfig } from "../functions/BullaBankerModule";

export const handleBullaBankerModuleDeploy = (event: BullaBankerModuleDeploy): void => {
  const ev = event.params;
  const gnosisModuleConfig = getOrCreateBullaGnosisModuleConfig(event);
  gnosisModuleConfig.moduleAddress = ev.moduleAddress;
  gnosisModuleConfig.safeAddress = ev.safe;
  gnosisModuleConfig.version = ev.version;
  gnosisModuleConfig.installationTimestamp = event.block.timestamp;
  gnosisModuleConfig.save();
};
