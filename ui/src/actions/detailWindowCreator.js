import axios from "axios";

import config from "../config/config";
import { dispNameToAction } from "../constants";
import coreApi from "../apis/coreApi";

import * as CS from "../constants";

import { isErrDef } from "../utils/utils";
import { createShowGlobalNotification } from "./notificationCreator";

export function createHideDetailWindow() {
  console.debug("=> createHideDetailWindow: Hiding global notification...");

  return {
    type: CS.HIDE_DETAIL_WINDOW,
    payload: null,
  };
}

export function createShowDetailWindow(frameId) {
  return async (dispatch, _) => {
    console.debug(
      `=> createShowDetailWindow: Showing the detail for frame '${frameId}' ...`
    );

    const params = {
      frameId: frameId,
      logIt: true,
    };

    let response = null;
    try {
      console.info(
        "=> createShowDetailWindow: GET request to '/get_frame_detail_data'"
      );
      response = await coreApi.get("/get_frame_detail_data", { params });
    } catch (e) {
      const msg = isErrDef(e) ? e.response.data.error.message : e.message;

      dispatch(
        createShowGlobalNotification(
          CS.GLOB_NOTIF_ERR,
          "Core request to '/get_frame_detail_data' failed!",
          msg,
          5000
        )
      );
      return;
    }

    // If empty array returned
    if (response.data.frames.length == 0) return;

    // Create the action
    const action = {
      type: CS.SHOW_DETAIL_WINDOW,
      payload: {
        targetFrameId: frameId,
        videoId: null, // \todo Not send from the core
        frames: response.data.frames,
      },
    };

    dispatch(action);

    console.debug("=> createShowDetailWindow: Got response:", response);
  };
}
