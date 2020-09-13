import axios from "axios";

import * as utils from "../utils/utils";
import config from "../config/config";
import * as CS from "../constants";
import { dispNameToAction } from "../constants";
import coreApi from "../apis/coreApi";
import {
  createShowGlobalNotification,
  createHideGlobalNotification,
} from "./notificationCreator";

/* 
Core API docs:
interface Response = { 
    viewData: {
      somhunter: {
        frameContext: {
          frameId: number;
          frames: number[]
        },
        screen: {
          type: string;
          frames: [{
            id: number;
            liked: bool;
            sId: number;
            vId: number;
            src: string;

          }]
        },
        textQueries: {
          q0: { value: string; },
          q1: { value: string; }
        }
      }
    },
    error: {
      message: string;
    }
  } */
function loadMainWindowFrames(type, pageId, frameId) {
  return async (dispatch, getState) => {
    const state = getState();

    //if (state.mainWindow.activeDisplay == type && pageId == 0) return;

    const reqData = {
      pageId: pageId,
      type: type,
      frameId: frameId,
    };

    let response = null;
    try {
      console.debug(
        "=> loadMainWindowFrames: POST request to '/get_top_screen'"
      );
      response = await coreApi.post("/get_top_screen", reqData);
    } catch (e) {
      console.log(e);
      dispatch(
        createShowGlobalNotification(
          CS.GLOB_NOTIF_ERR,
          "Core request to '/get_top_screen' failed!",
          e.message,
          5000
        )
      );
      return;
    }

    console.debug("=> loadMainWindowFrames: Got response:", response);

    // Create the action Object
    const action = {
      type: dispNameToAction(type),
      payload: {
        frames: response.data.viewData.somhunter.screen.frames,
        currentPage: pageId,
      },
    };
    dispatch(action);
  };
}

function loadSomFrames() {
  return async (dispatch, getState) => {
    const state = getState();

    let response = null;

    dispatch(
      createShowGlobalNotification(
        CS.GLOB_NOTIF_WARN,
        "SOM working...",
        "",
        500
      )
    );

    do {
      try {
        console.debug("=> loadSomFrames: GET request to '/get_som_screen'");
        response = await coreApi.get("/get_som_screen");

        console.warn("=> loadSomFrames: Got response:", response);
      } catch (e) {
        console.log(e);
        dispatch(
          createShowGlobalNotification(
            CS.GLOB_NOTIF_ERR,
            "Core request to '/get_som_screen' failed!",
            e.message,
            5000
          )
        );
        return;
      }

      // 222 means that SOM not ready
      if (response.status === 222) {
        await utils.delay(500);
      }
    } while (response.status === 222);

    dispatch(createHideGlobalNotification());

    // Create the action Object
    const action = {
      type: dispNameToAction(CS.DISP_TYPE_SOM),
      payload: {
        frames: response.data.viewData.somhunter.screen.frames,
        currentPage: 0,
      },
    };
    dispatch(action);
    return;
  };
}

export function createShowDisplay(type, pageId, frameId) {
  console.debug(
    `=> createShowDisplay: type=${type}, pageId=${pageId}, frameId=${frameId}`
  );

  switch (type) {
    case CS.DISP_TYPE_SOM:
      return loadSomFrames();

    case CS.DISP_TYPE_TOP_KNN:
    case CS.DISP_TYPE_TOP_N:
    case CS.DISP_TYPE_TOP_N_CONTEXT:
      return loadMainWindowFrames(type, pageId, frameId);
  }
  return null;
}
