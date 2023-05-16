import { BullaBankerModuleDeploy } from "../../generated/BullaBankerModule/BullaBankerModule";
import { BullaBankerGnosisModuleConfig } from "../../generated/schema";

export const getGnosisModuleConfigId = (deployEvent: BullaBankerModuleDeploy): string => "GnosisSafe:" + deployEvent.params.safe.toHexString() + "-ModuleConfig";

export const getOrCreateBullaGnosisModuleConfig = (event: BullaBankerModuleDeploy): BullaBankerGnosisModuleConfig => {
  const bullaGnosisModuleConfigId = getGnosisModuleConfigId(event);
  let bullaGnosisModuleConfig = BullaBankerGnosisModuleConfig.load(bullaGnosisModuleConfigId);

  if (bullaGnosisModuleConfig === null) {
    bullaGnosisModuleConfig = new BullaBankerGnosisModuleConfig(bullaGnosisModuleConfigId);
  }

  return bullaGnosisModuleConfig;
};
