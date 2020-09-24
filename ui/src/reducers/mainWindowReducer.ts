import { Action, ShowTopNDisplay, ShowSomDisplay } from "./index";
import { FrameRef } from "../../types/coreApi";

import * as CS from "../constants";
import { actionToDispName } from "../constants";

/** State type */
export type MainWindowState = {
  activeDisplay: string;
  currentPage: number | null;
  frames: FrameRef[];
};

const defState: MainWindowState = {
  activeDisplay: CS.DISP_TYPE_NULL,
  currentPage: null,
  frames: [],
};

function mainWindowReducer(
  state: MainWindowState = defState,
  action: Action
): MainWindowState {
  let pl = undefined;

  switch (action.type) {
    case CS.SHOW_DISPLAY_TOP_N:
    case CS.SHOW_DISPLAY_TOP_N_CONTEXT:
    case CS.SHOW_DISPLAY_TOP_KNN:
      console.debug("=> (REDUCER) mainWindowReducer:", action);

      // Assert type
      pl = (<ShowTopNDisplay>action).payload;

      if (pl.frames.length === 0) break;

      // If screen switch
      if (pl.currentPage === 0) {
        return {
          ...state,
          activeDisplay: actionToDispName(action.type),
          currentPage: pl.currentPage,
          frames: [...pl.frames],
        };
      }

      if (
        state.frames.length === 0 ||
        state.frames[state.frames.length - 1].id !==
          pl.frames[pl.frames.length - 1].id ||
        pl.frames[pl.frames.length - 1].id === null
      ) {
        return {
          ...state,
          activeDisplay: actionToDispName(action.type),
          currentPage: pl.currentPage,
          frames: [...state.frames, ...pl.frames],
        };
      }
      break;

    case CS.SHOW_DISPLAY_SOM:
      console.debug("=> (REDUCER) mainWindowReducer:", action);

      // Assert type
      pl = (<ShowSomDisplay>action).payload;

      if (pl.frames.length === 0) break;

      return {
        ...state,
        activeDisplay: actionToDispName(action.type),
        currentPage: pl.currentPage,
        frames: [...pl.frames],
      };

    default:
      return state;
  }
  return state;
}

export default mainWindowReducer;
