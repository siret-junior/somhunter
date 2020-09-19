import * as CS from "../constants";

/*
 * interface configState {
 *      textQueryRefs: React.Ref[];
 *      coreSettings: {
 *          strings: 
            core: 
            server:
            ui;
            api;
 *      }
 *  };
 */
const defaultState = {
  textQueryRefs: [],
  coreSettings: undefined,
};

function settingsReducer(state = defaultState, action) {
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
