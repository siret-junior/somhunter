import { Action, ShowDetailAction } from "./index";
import { FrameRef } from "../../types/coreApi";

import * as CS from "../constants";

/** State type */
export type DetailWindowState = {
  show: boolean;
  pivotFrameId: number;
  videoId: number;
  frames: FrameRef[];
};

const defaultState = {
  show: false,
  pivotFrameId: null,
  videoId: null,
  frames: [],
};

function detailWindowReducer(state = defaultState, action: Action) {
  let pl = undefined;

  switch (action.type) {
    case CS.SHOW_DETAIL_WINDOW:
      console.debug("=> (REDUCER) detailWindowReducer:", action);

      pl = (<ShowDetailAction>action).payload;

      return {
        show: true,
        pivotFrameId: pl.pivotFrameId,
        videoId: pl.videoId,
        frames: pl.frames,
      };

    case CS.HIDE_DETAIL_WINDOW:
      console.debug("=> (REDUCER) detailWindowReducer:", action);
      return { ...state, show: false };

    default:
      return state;
  }
}

export default detailWindowReducer;
