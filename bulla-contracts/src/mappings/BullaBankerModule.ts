import { BullaBankerModuleDeploy } from "../../generated/BullaBankerModule/BullaBankerModule";
import { getOrCreateBullaGnosisModuleConfig } from "../functions/BullaBankerModule";
import { getOrCreateUser } from "../functions/common";

export function handleBullaBankerModuleDeploy(event: BullaBankerModuleDeploy): void {
  const ev = event.params;
  const gnosisModuleConfig = getOrCreateBullaGnosisModuleConfig(event);
  const safeUser = getOrCreateUser(ev.safe);
  gnosisModuleConfig.moduleAddress = ev.moduleAddress;
  gnosisModuleConfig.safeAddress = safeUser.id;
  gnosisModuleConfig.version = ev.version;
  gnosisModuleConfig.installationTimestamp = event.block.timestamp;
  gnosisModuleConfig.save();
}
