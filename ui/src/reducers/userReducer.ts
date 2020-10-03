import {
  Action,
  SetUserHistoryAction,
  SetUserStateAction,
  AddBookmarkedFrameAction,
  AddLikedFrameAction,
} from "./index";
import { FrameRef, Vec2 } from "../../types/coreApi";

import * as CS from "../constants";

export type SearchFiltersState = {
  weekdays: boolean[];
  hourFrom: number;
  hourTo: number;
}

export type SearchState = {
  textQueries: string[];
  id: number;
  displayType: string;
  screenshotFilepath: string;
  bookmarkedFrames: FrameRef[];
  likedFrames: FrameRef[];
  filters: SearchFiltersState;
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

    case CS.ADD_LIKED_FRAME:
      console.warn("ADD_LIKED_FRAME", action);
      const a = action as AddLikedFrameAction;
      const s = (state as UserState).search as SearchState;

      return {
        ...state,
        search: {
          ...s,
          likedFrames: [...s.likedFrames, a.payload],
        },
      };

    case CS.REMOVE_LIKED_FRAME:
      console.warn("REMOVE_LIKED_FRAME", action);
      const id = action as AddLikedFrameAction;
      const s00 = (state as UserState).search as SearchState;

      let aaa = [];
      for (let i = 0; i < s00.likedFrames.length; ++i) {
        if (s00.likedFrames[i].id !== action.payload) {
          aaa.push(s00.likedFrames[i]);
        }
      }

      return {
        ...state,
        search: {
          ...s00,
          likedFrames: aaa,
        },
      };

    case CS.RESET_LIKED_FRAMES:
      const s4 = (state as UserState).search as SearchState;
      return {
        ...state,
        search: {
          ...s4,
          likedFrames: [],
        },
      };
      break;

    case CS.ADD_BOOKMARKED_FRAME:
      console.warn("ADD_BOOKMARKED_FRAME", action);
      const a0 = action as AddBookmarkedFrameAction;
      const s0 = (state as UserState).search as SearchState;

      const sr1 = {
        ...s0,
        bookmarkedFrames: [...s0.bookmarkedFrames, a0.payload],
      };

      return {
        ...state,
        search: sr1,
      };

    case CS.REMOVE_BOOKMARKED_FRAME:
      console.warn("REMOVE_BOOKMARKED_FRAME", action);
      const id1 = action as AddLikedFrameAction;
      const s01 = (state as UserState).search as SearchState;

      let aaa0 = [];
      for (let i = 0; i < s01.bookmarkedFrames.length; ++i) {
        if (s01.bookmarkedFrames[i].id !== action.payload)
          aaa0.push(s01.bookmarkedFrames[i]);
      }

      return {
        ...state,
        search: {
          ...s01,
          bookmarkedFrames: aaa0,
        },
      };

    case CS.RESET_BOOKMARKED_FRAMES:
      const s3 = (state as UserState).search as SearchState;
      return {
        ...state,
        search: {
          ...s3,
          bookmarkedFrames: [],
        },
      };
      break;

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
