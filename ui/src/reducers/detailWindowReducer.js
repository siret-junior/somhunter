import * as CS from "../constants";

/*
 * interface detailWindowState {
 *    detailWindow: {
 *      show: bool;
 *      targetFrameId: number;
 *      videoId: number;
 *      frames: {
 *        liked: bool;
 *        vId: number;
 *        sId: number;
 *        src: string;
 *      }
 *    };
 */

const defaultState = {
  show: false,
  targetFrameId: null,
  videoId: null,
  frames: [],
};

function detailWindowReducer(state = defaultState, action) {
  switch (action.type) {
    case CS.SHOW_DETAIL_WINDOW:
      return {
        show: true,
        targetFrameId: action.payload.targetFrameId,
        videoId: action.payload.videoId,
        frames: action.payload.frames,
      };

    case CS.HIDE_DETAIL_WINDOW:
      return { ...state, show: false };

    default:
      return state;
  }
}

export default detailWindowReducer;
