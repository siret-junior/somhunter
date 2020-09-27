import { Action, SetUserHistoryAction, SetUserStateAction } from "./index";

import * as CS from "../constants";

export type SearchState = {
  textQueries: string[];
  id: number;
  displayType: string;
  screenshotFilepath: string;
};

export type SearchStateEx = SearchState | {} | null;

export type HistoryPoint = {
  id: number;
  screenshotFilepath: string;
};

export type UserState = {
  history: HistoryPoint[];
  search: SearchStateEx;
};

export type UserStateEx = UserState | {} | null;

const defaultState: UserStateEx = {};

function userReducer(state = defaultState, action: Action): UserStateEx {
  switch (action.type) {
    // SET_USER_HISTORY
    case CS.SET_USER_HISTORY:
      return action.payload;

    // SET_USER_STATE
    case CS.SET_USER_STATE:
      const a1 = action as SetUserStateAction;

      // If fetch failed
      if (a1.payload === null) {
        return null;
      }
      // Else fetch successfull
      else {
        const pl = action.payload as UserState;
        return { history: pl.history, search: pl.search };
      }

    default:
      return state;
  }
}

export default userReducer;
