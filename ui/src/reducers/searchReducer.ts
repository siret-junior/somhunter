import { Action } from "./index";

import * as CS from "../constants";

export type SearchState = {} | undefined | null;

const defaultState: SearchState = {};

function searchReducer(state = defaultState, action: Action): SearchState {
  switch (action.type) {
    case CS.SET_SEARCH_STATE:
      console.debug("=> (REDUCER) searchReducer:", action);
      return action.payload;

    default:
      return state;
  }
}

export default searchReducer;
