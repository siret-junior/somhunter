import config from "../config/config";
import * as CS from "../constants";

export function createAddQueryRef(queryRef) {
  return {
    type: CS.SETTINGS_ADD_QUERY_REF,
    payload: queryRef,
  };
}

export function createFocusTextQuery(queryRef) {
  return (_, getState) => {
    const state = getState();
    const textQueryRefs = state.settings.textQueryRefs;

    if (textQueryRefs.length !== 0) {
      console.info(
        "=> createFocusTextQuery: Focusing element:",
        textQueryRefs[0].current
      );
      textQueryRefs[0].current.focus();
    }
  };
}
