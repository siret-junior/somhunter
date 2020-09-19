import * as CS from "../constants";

/*
 * interface replayWindowState {
 *      show: bool;
 *      pivotFrameId: number;
 *      deltaX: number;
 *      frames: {
 *        liked: bool;
 *        vId: number;
 *        sId: number;
 *        src: string;
 *      }[]
 *  };
 */
const defaultState = {
  show: false,
  pivotFrameId: null,
  videoId: null,
  frames: [],
};

function replayWindowReducer(state = defaultState, action) {
  switch (action.type) {
    case CS.SHOW_REPLAY_WINDOW:
      return {
        show: true,
        pivotFrameId: action.payload.pivotFrameId,
        deltaX: 0,
        frames: action.payload.frames,
        cursorPos: action.payload.cursorPos,
      };

    case CS.SCROLL_REPLAY_WINDOW:
      return { ...state, deltaX: state.deltaX + action.payload.deltaX };

    case CS.HIDE_REPLAY_WINDOW:
      return { ...state, show: false };

    default:
      return state;
  }
}

export default replayWindowReducer;
