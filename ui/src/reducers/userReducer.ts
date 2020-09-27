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
      const a0 = action as SetUserHistoryAction;
      const s0 = state as UserState;

      const histNew = a0.payload.history;
      const currCtxId = a0.payload.currCtxId;

      const newSc = { ...s0.search };
      newSc.id = currCtxId;

      console.info("SET_USER_HISTORY", a0);
      return { history: histNew, search: newSc };

    // SET_USER_STATE
    case CS.SET_USER_STATE:
      const a1 = action as SetUserStateAction;
      console.info("SET_USER_STATE", a1);

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
