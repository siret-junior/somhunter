import axios from "axios";

import config from "../config/config";
import { dispNameToAction } from "../constants";
import coreApi from "../apis/coreApi";

import * as CS from "../constants";

import { isErrDef } from "../utils/utils";
import { createShowGlobalNotification } from "./notificationCreator";

export function createHideReplayWindow() {
  console.debug("=> createHideReplayWindow: Hiding replay window...");

  return {
    type: CS.HIDE_REPLAY_WINDOW,
    payload: null,
  };
}

export function createScrollReplayWindow(deltaX) {
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

export function createShowReplayWindow(frameId) {
  return async (dispatch, _) => {
    console.debug(
      `=> createShowReplayWindow: Showing the detail for frame '${frameId}' ...`
    );

    const params = {
      frameId: frameId,
      logIt: false, // This is just exploitation of the detail fetch, don't log it!
    };

    let response = null;
    try {
      console.info(
        "=> createShowReplayWindow: GET request to '/get_frame_detail_data'"
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
      type: CS.SHOW_REPLAY_WINDOW,
      payload: {
        pivotFrameId: frameId,
        frames: response.data.frames,
      },
    };

    dispatch(action);

    console.debug("=> createShowReplayWindow: Got response:", response);
  };
}
