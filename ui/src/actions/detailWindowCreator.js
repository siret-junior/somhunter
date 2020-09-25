import * as CS from "../constants";
import { get } from "../apis/coreApi";

export function createHideDetailWindow() {
  return {
    type: CS.HIDE_DETAIL_WINDOW,
    payload: null,
  };
}

export function createShowDetailWindow(settings, frameId) {
  return async (dispatch, _) => {
    console.debug(
      `=> createShowDetailWindow: Showing the detail for frame '${frameId}' ...`
    );

    // GET params
    const params = {
      frameId: frameId,
      logIt: true,
    };

    const requestSettings = settings.coreSettings.api.endpoints.frameDetail;
    // << Core API >>
    const response = await get(dispatch, requestSettings.get.url, { params });
    // << Core API >>

    // If empty array returned
    if (response.data.frames.length === 0) return;

    dispatch({
      type: CS.SHOW_DETAIL_WINDOW,
      payload: {
        pivotFrameId: frameId,
        videoId: null, // \todo Not send from the core
        frames: response.data.frames,
      },
    });
  };
}
