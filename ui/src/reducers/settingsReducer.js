import * as CS from "../constants";

/*
 * interface configState {
 *      textQueryRefs: React.Ref[];
 *  };
 */
const defaultState = {
  textQueryRefs: [],
};

function settingsReducer(state = defaultState, action) {
  switch (action.type) {
    case CS.SETTINGS_ADD_QUERY_REF:
      return {
        ...state,
        textQueryRefs: [...state.textQueryRefs, action.payload],
      };

    default:
      return state;
  }
}

export default settingsReducer;
