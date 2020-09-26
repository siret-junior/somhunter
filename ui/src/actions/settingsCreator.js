import * as CS from "../constants";

export function createSetCoreSettings(coreSettings) {
  return {
    type: CS.SETTINGS_SET_CORE,
    payload: coreSettings,
  };
}
