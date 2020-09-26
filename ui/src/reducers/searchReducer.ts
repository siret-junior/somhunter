import { Action, SetSearchStateAction } from "./index";

import * as CS from "../constants";

export type SearchState =
  | {
      reset: boolean;
      ID: number;
      displayType: string;
      screenshotFilepath: string;
      textQueries: string[];
    }
  | {}
  | null;

const defaultState: SearchState = {};

function searchReducer(state = defaultState, action: Action): SearchState {
  switch (action.type) {
    case CS.SET_SEARCH_STATE:
      const a = action as SetSearchStateAction;
      return { ...action.payload};

    default:
      return state;
  }
}

export default searchReducer;
