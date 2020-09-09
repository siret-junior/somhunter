import axios from "axios";

import config from "../config/config";
import coreApi from "../apis/coreApi";

import * as CS from "../constants";

function loadMainWindowFrames(pageId, type, frameId) {
  return async (dispatch, getState) => {
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

    // Create the action Object
    const action = {
      type: CS.SHOW_DISPLAY_TOP_N,
      payload: response.data.viewData.somhunter.screen,
    };
    dispatch(action);
  };
}

export function showTopNDisplay() {
  return loadMainWindowFrames(0, CS.DISP_TYPE_TOP_N, 0);
}

export function showGlobalNotification(
  type = CS.GLOB_NOTIF_INFO,
  heading,
  text,
  duration
) {
  console.log("Adding global notification...");

  // We send this function to the thunk MW to dispatch both actions
  return (dispatch, getState) => {
    const currState = getState();

    // Reset previous cancel timer
    if (currState.notifications !== null) {
      const timeoutHandle = currState.notifications.timeoutHandle;
      console.log(`CLEARING TIMEOUT ${timeoutHandle}`);
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
