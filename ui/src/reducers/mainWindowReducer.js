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
  console.debug("=> mainWindowReducer: Got action: ", action);

  switch (action.type) {
    case CS.SHOW_DISPLAY_TOP_N:
    case CS.SHOW_DISPLAY_TOP_N_CONTEXT:
    case CS.SHOW_DISPLAY_TOP_KNN:
      if (action.payload.frames.length === 0) break;

      // If screen switch
      if (action.payload.currentPage === 0) {
        console.debug("=> mainWindowReducer: Reset `frames`");
        return {
          ...state,
          activeDisplay: actionToDispName(action.type),
          currentPage: action.payload.currentPage,
          frames: [...action.payload.frames],
        };
      }

      if (
        state.frames.length === 0 ||
        state.frames[state.frames.length - 1].id !==
          action.payload.frames[action.payload.frames.length - 1].id
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
}

export default mainWindowReducer;
