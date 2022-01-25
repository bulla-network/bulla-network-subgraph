import { BullaBankerModuleDeploy } from "../../generated/BullaBankerModule/BullaBankerModule";
import { BullaBankerGnosisModuleConfig } from "../../generated/schema";
import { getGnosisModuleConfigId } from "../functions/BullaBankerModule";
import { getOrCreateUser } from "../functions/common";

export function handleBullaBankerModuleDeploy(event: BullaBankerModuleDeploy): void {
  const ev = event.params;
  const safeUser = getOrCreateUser(ev.safe);

  const bullaGnosisModuleConfigId = getGnosisModuleConfigId(event);
  let gnosisModuleConfig = BullaBankerGnosisModuleConfig.load(bullaGnosisModuleConfigId);

  // if the module config exists, set the previous address for the frontend to include it as a disableModule tx
  if (gnosisModuleConfig) {
    gnosisModuleConfig.prevModuleAddress = gnosisModuleConfig.moduleAddress;
  }

  if (gnosisModuleConfig === null) {
    gnosisModuleConfig = new BullaBankerGnosisModuleConfig(bullaGnosisModuleConfigId);
  }

  gnosisModuleConfig.moduleAddress = ev.moduleAddress;
  gnosisModuleConfig.safeAddress = ev.safe;
  gnosisModuleConfig.safe = safeUser.id;
  gnosisModuleConfig.version = ev.version;
  gnosisModuleConfig.installationTimestamp = event.block.timestamp;
  gnosisModuleConfig.save();
}
