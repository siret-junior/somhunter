import * as CS from "../constants";

/*
 * interface mainWindowState {
 *    activeDisplay: string;
 *    frames: [{
 *      id: number;
 *      videoId: number;
 *      src: string;
 *    }];
 * }
 */
function mainWindowReducer(
  state = {
    activeDisplay: CS.DISP_TYPE_NULL,
    frames: [],
  },
  action
) {
  switch (action.type) {
    case CS.SHOW_DISPLAY_TOP_N:
      if (state.activeDisplay === CS.DISP_TYPE_TOP_N) return state;
      return {
        ...state,
        activeDisplay: CS.DISP_TYPE_TOP_N,
        frames: [...state.frames, ...action.payload.frames],
      };
  }
  return state;
}

export default mainWindowReducer;
