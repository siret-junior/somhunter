import axios from "axios";

import config from "../config/config";
import * as CS from "../constants";
import { dispNameToAction } from "../constants";
import coreApi from "../apis/coreApi";
import {
  createShowGlobalNotification,
  createHideGlobalNotification,
} from "./notificationCreator";
import { createShowDisplay } from "./mainWindowCreator";

export function createRescore(destDisplay, query0, query1) {
  return async (dispatch, getState) => {
    console.debug("=> createRescore: Running rescore...");
    // Show working notification
    dispatch(
      createShowGlobalNotification(
        CS.GLOB_NOTIF_INFO,
        "Working...",
        "",
        1000000
      )
    );

    const reqData = {
      q0: query0,
      q1: query1,
    };

    let response = null;
    try {
      console.debug("=> doRequestRescore: POST request to '/rescore'");
      response = await coreApi.post("/rescore", reqData);
    } catch (e) {
      console.log(e);
      dispatch(
        createShowGlobalNotification(
          CS.GLOB_NOTIF_ERR,
          "Core request to '/rescore' failed!",
          e.message,
          5000
        )
      );
      return;
    }

    console.debug("=> doRequestRescore: Got response:", response);

    // Dispatch hide notification
    dispatch(createHideGlobalNotification());

    // Dispatch switch to target
    dispatch(createShowDisplay(destDisplay, 0, 0));
  };
}

export function createResetSearch(destDisplay) {
  return async (dispatch, getState) => {
    console.debug("=> createResetSearch: Running reset...");

    // Show working notification
    dispatch(
      createShowGlobalNotification(
        CS.GLOB_NOTIF_INFO,
        "Working...",
        "",
        1000000
      )
    );

    let response = null;
    try {
      console.debug(
        "=> doRequestRescore: POST request to '/reset_search_session'"
      );
      response = await coreApi.post("/reset_search_session", {});
    } catch (e) {
      console.log(e);
      dispatch(
        createShowGlobalNotification(
          CS.GLOB_NOTIF_ERR,
          "Core request to '/reset_search_session' failed!",
          e.message,
          5000
        )
      );
      return;
    }

    console.debug("=> createResetSearch: Got response:", response);

    // Dispatch success notification
    dispatch(
      createShowGlobalNotification(
        CS.GLOB_NOTIF_SUCC,
        "Search reset.",
        "",
        2000
      )
    );

    // Dispatch switch to target
    dispatch(createShowDisplay(destDisplay, 0, 0));
  };
}
