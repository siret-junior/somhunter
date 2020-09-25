import React from "react";

import {
  Action,
  SetCoreSettingsAction,
  ScrollReplayAction,
  HideReplayAction,
} from "./index";

import {
  FrameRef,
  Vec2,
  CoreApiSettings,
  CoreSearchState,
} from "../../types/coreApi";

import * as CS from "../constants";

export type SettingsState = {
  textQueryRefs: React.Ref<HTMLInputElement>[];

  /* Static settings from the core
   * undefined => fetching
   * null => fetch failed
   */
  coreSettings: CoreApiSettings | undefined | null;

  // If state of the current search session has been fetched
  searchState: CoreSearchState | undefined | null;
};

const defaultState: SettingsState = {
  textQueryRefs: [],
  coreSettings: undefined,
  searchState: undefined,
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

    case CS.SET_SEARCH_STATE:
      console.debug("=> (REDUCER) settingsReducer:", action);
      return {
        ...state,
        searchState: action.payload,
      };

    default:
      return state;
  }
}

export default settingsReducer;
