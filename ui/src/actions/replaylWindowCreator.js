import { get } from "../apis/coreApi";
import * as CS from "../constants";

export function createHideReplayWindow() {
  console.debug("=> createHideReplayWindow: Hiding replay window...");

  return {
    type: CS.HIDE_REPLAY_WINDOW,
    payload: null,
  };
}

export function createScrollReplayWindow(settings, deltaX) {
  console.debug(
    `=> createScrollReplayWindow: Scrolling replay window by '${deltaX}'...`
  );

  return {
    type: CS.SCROLL_REPLAY_WINDOW,
    payload: {
      deltaX: deltaX,
    },
  };
}

export function createShowReplayWindow(settings, frameId, curPos) {
  return async (dispatch, _) => {
    console.debug(
      `=> createShowReplayWindow: Showing the detail for frame '${frameId}...`
    );

    // GET params
    const params = {
      frameId: frameId,
      logIt: false, // This is just exploitation of the detail fetch, don't log it!
    };

    const requestSettings = settings.coreSettings.api.endpoints.frameDetail;
    // << Core API >>
    const response = await get(dispatch, requestSettings.get.url, { params });
    // << Core API >>

    // If empty array returned
    if (response.data.frames.length === 0) return;

    dispatch({
      type: CS.SHOW_REPLAY_WINDOW,
      payload: {
        pivotFrameId: frameId,
        frames: response.data.frames,
        cursorPos: curPos,
      },
    });
  };
}
