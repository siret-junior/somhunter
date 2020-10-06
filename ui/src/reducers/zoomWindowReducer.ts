import { Action, ShowZoomAction } from "./index";
import * as CS from "../constants";

export type ZoomWindowState = {
  show: boolean;
  pivotFrameId: number | null;
  src: string;
};

const defaultState: ZoomWindowState = {
  show: false,
  pivotFrameId: null,
  src: "",
};

function zoomWindowReducer(
  state = defaultState,
  action: Action
): ZoomWindowState {
  // Payload temp
  let pl = undefined;

  switch (action.type) {
    case CS.SHOW_ZOOM_WINDOW:
      //console.log("reducer: SHOW_ZOOM_WINDOW", action.payload);
      // Assert type
      pl = (action as ShowZoomAction).payload;

      return pl;

    case CS.HIDE_ZOOM_WINDOW:
      //console.log("reducer: HIDE_ZOOM_WINDOW");
      return {
        ...state,
        show: false,
      };

    default:
      break;
  }
  return state;
}

export default zoomWindowReducer;
