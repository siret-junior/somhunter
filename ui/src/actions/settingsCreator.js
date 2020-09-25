import * as CS from "../constants";

export function createAddQueryRef(settings, queryRef) {
  return {
    type: CS.SETTINGS_ADD_QUERY_REF,
    payload: queryRef,
  };
}

export function createFocusTextQuery(settings, queryRef) {
  return (_, getState) => {
    const state = getState();
    const textQueryRefs = state.settings.textQueryRefs;

    if (textQueryRefs.length !== 0) {
      textQueryRefs[0].current.focus();
    }
  };
}

export function createSetCoreSettings(coreSettings) {
  return {
    type: CS.SETTINGS_SET_CORE,
    payload: coreSettings,
  };
}

export function createSetSearchState(data) {
  return {
    type: CS.SET_SEARCH_STATE,
    payload: data,
  };
}
