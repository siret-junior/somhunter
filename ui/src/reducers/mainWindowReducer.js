import * as CS from "../constants";
import { actionToDispName } from "../constants";

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
    case CS.SHOW_DISPLAY_TOP_N_CONTEXT:
    case CS.SHOW_DISPLAY_TOP_KNN:
      console.debug("=> (REDUCER) mainWindowReducer:", action);
      if (action.payload.frames.length === 0) break;

      // If screen switch
      if (action.payload.currentPage === 0) {
        return {
          ...state,
          activeDisplay: actionToDispName(action.type),
          currentPage: action.payload.currentPage,
          frames: [...action.payload.frames],
        };
      }

      console.warn(action.payload.frames[action.payload.frames.length - 1].id);

      if (
        state.frames.length === 0 ||
        state.frames[state.frames.length - 1].id !==
          action.payload.frames[action.payload.frames.length - 1].id ||
        action.payload.frames[action.payload.frames.length - 1].id === null
      ) {
        return {
          ...state,
          activeDisplay: actionToDispName(action.type),
          currentPage: action.payload.currentPage,
          frames: [...state.frames, ...action.payload.frames],
        };
      }
      break;

    case CS.SHOW_DISPLAY_SOM:
      console.debug("=> (REDUCER) mainWindowReducer:", action);
      if (action.payload.frames.length === 0) break;

      return {
        ...state,
        activeDisplay: actionToDispName(action.type),
        currentPage: action.payload.currentPage,
        frames: [...action.payload.frames],
      };

    default:
      return state;
  }
  return state;
}

export default mainWindowReducer;
