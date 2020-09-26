import {
  Action,
  ShowReplayAction,
  ScrollReplayAction,
  HideReplayAction,
} from "./index";
import { FrameRef, Vec2 } from "../../types/coreApi";

import * as CS from "../constants";

export type ReplayWindowState = {
  show: boolean;
  pivotFrameId: number | null;
  deltaX: number | null;
  frames: FrameRef[] | null;
  cursorPos: Vec2 | null;
};

const defaultState = {
  show: false,
  pivotFrameId: null,
  deltaX: null,
  videoId: null,
  frames: null,
  cursorPos: null,
};

function replayWindowReducer(
  state = defaultState,
  action: Action
): ReplayWindowState {
  // Payload temp
  let pl = undefined;

  switch (action.type) {
    case CS.SHOW_REPLAY_WINDOW:
      // Assert type
      pl = (action as ShowReplayAction).payload;

      return {
        show: true,
        pivotFrameId: pl.pivotFrameId,
        deltaX: 0,
        frames: pl.frames,
        cursorPos: pl.cursorPos,
      };

    case CS.SCROLL_REPLAY_WINDOW:
      if (state === null) break;

      // Assert type
      pl = (action as ScrollReplayAction).payload;

      return { ...state, deltaX: state.deltaX! + pl.deltaX };

    case CS.HIDE_REPLAY_WINDOW:
      // Assert type
      pl = (<HideReplayAction>action).payload;

      return { ...state, show: false };

    default:
      break;
  }
  return state;
}

export default replayWindowReducer;
