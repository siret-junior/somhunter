import React from "react";

import {
  Action,
  SetCoreSettingsAction,
  ScrollReplayAction,
  HideReplayAction,
} from "./index";

import { FrameRef, Vec2, CoreApiSettings } from "../../types/coreApi";

import * as CS from "../constants";

export type SettingsState = {
  textQueryRefs: React.Ref<HTMLInputElement>[];
  coreSettings: CoreApiSettings | undefined | null;
};

const defaultState: SettingsState = {
  textQueryRefs: [],
  coreSettings: undefined,
};

function settingsReducer(state = defaultState, action: Action): SettingsState {
  switch (action.type) {
    case CS.SETTINGS_ADD_QUERY_REF:
      console.debug("=> (REDUCER) settingsReducer:", action);
      return {
        ...state,
        textQueryRefs: [...state.textQueryRefs, action.payload],
      };

    case CS.SETTINGS_SET_CORE:
      console.debug("=> (REDUCER) settingsReducer:", action);
      return {
        ...state,
        coreSettings: action.payload,
      };

    default:
      return state;
  }
}

export default settingsReducer;
