import axios from "axios";

import config from "../config/config";
import { dispNameToAction } from "../constants";
import coreApi from "../apis/coreApi";

import * as CS from "../constants";

function loadMainWindowFrames(type, pageId, frameId) {
  return async (dispatch, getState) => {
    const state = getState();

    if (state.mainWindow.activeDisplay == type && pageId == 0) return;

    const reqData = {
      pageId: pageId,
      type: type,
      frameId: frameId,
    };

    /*response: { 
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
              q0: {value: string;},
              q1: {value: string;}
            }
          }
        }
        error: {
          message: string;
        }
      } */
    let response = null;

    try {
      console.debug(
        "=> loadMainWindowFrames: POST request to '/get_top_screen'"
      );
      response = await coreApi.post("/get_top_screen", reqData);
    } catch (e) {
      console.log(e);
      dispatch(
        showGlobalNotification(
          CS.GLOB_NOTIF_ERR,
          "Core request failed!",
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

    /*response: { 
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
              q0: {value: string;},
              q1: {value: string;}
            }
          }
        }
        error: {
          message: string;
        }
      } */
    let response = null;

    try {
      console.debug("=> loadSomFrames: GET request to '/get_som_screen'");
      response = await coreApi.get("/get_som_screen");
    } catch (e) {
      console.log(e);
      dispatch(
        showGlobalNotification(
          CS.GLOB_NOTIF_ERR,
          "Core request failed!",
          e.message,
          5000
        )
      );
      return;
    }

    console.debug("=> loadSomFrames: Got response:", response);

    // Create the action Object
    const action = {
      type: dispNameToAction(CS.DISP_TYPE_SOM),
      payload: {
        frames: response.data.viewData.somhunter.screen.frames,
        currentPage: 0,
      },
    };
    dispatch(action);
  };
}

export function showDisplay(type, pageId, frameId) {
  console.debug(
    `=> showDisplay: type=${type}, pageId=${pageId}, frameId=${frameId}`
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

export function showGlobalNotification(
  type = CS.GLOB_NOTIF_INFO,
  heading,
  text,
  duration
) {
  console.debug("=> showGlobalNotification: Adding global notification...");

  // We send this function to the thunk MW to dispatch both actions
  return (dispatch, getState) => {
    const currState = getState();

    // Reset previous cancel timer
    if (currState.notifications !== null) {
      const timeoutHandle = currState.notifications.timeoutHandle;
      console.debug(
        `=> showGlobalNotification: Clearing timeout '${timeoutHandle}'`
      );
      window.clearTimeout(timeoutHandle);
    }

    // Dispatch cancel action
    const timeoutHandle = setTimeout(() => {
      dispatch({
        type: CS.HIDE_GLOBAL_NOTIFICATION,
        payload: null,
      });
    }, duration);

    // Dispatch show action
    dispatch({
      type: CS.SHOW_GLOBAL_NOTIFICATION,
      payload: {
        type: type,
        heading: heading,
        text: text,
        timeoutHandle: timeoutHandle,
      },
    });
  };
}

/**
 * Example fetch action creator that uses redux-thunk middleware.
 */
export function fetchPosts() {
  // Return function to be invoded my the thunk MW
  return async function (dispatch) {
    const response = await coreApi.get("/posts");
    dispatch({ type: "FETCH_POSTS", payload: response.data });
  };
}

/**
 * Example fetch action creator that uses redux-thunk middleware.
 *
 * Arrow function (closure) variant.
 */
export const fetchUser = (id) => async (dispatch) => {
  const response = await coreApi.get(`/users/${id}`);

  dispatch({ type: "FETCH_USER", payload: response.data });
};
