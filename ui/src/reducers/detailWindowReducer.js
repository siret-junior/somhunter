import * as CS from "../constants";

/*
 * interface detailWindowState {
 *    detailWindow: {
 *      show: bool;
 *      pivotFrameId: number;
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
  pivotFrameId: null,
  videoId: null,
  frames: [],
};

function detailWindowReducer(state = defaultState, action) {
  switch (action.type) {
    case CS.SHOW_DETAIL_WINDOW:
      console.debug("=> (REDUCER) detailWindowReducer:", action);
      return {
        show: true,
        pivotFrameId: action.payload.pivotFrameId,
        videoId: action.payload.videoId,
        frames: action.payload.frames,
      };

    case CS.HIDE_DETAIL_WINDOW:
      console.debug("=> (REDUCER) detailWindowReducer:", action);
      return { ...state, show: false };

    default:
      return state;
  }
}

export default detailWindowReducer;
