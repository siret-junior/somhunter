import React from "react";

import { Action } from "./index";

import { CoreApiSettings } from "../../types/coreApi";

import * as CS from "../constants";

export type SettingsState = {
  /* Static settings from the core
   * undefined => fetching
   * null => fetch failed
   */
  coreSettings: CoreApiSettings | undefined | null;
};

const defaultState: SettingsState = {
  coreSettings: undefined,
};

function settingsReducer(state = defaultState, action: Action): SettingsState {
  switch (action.type) {
    case CS.SETTINGS_SET_CORE:
      return {
        ...state,
        coreSettings: action.payload,
      };

    default:
      return state;
  }
}

export default settingsReducer;
