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
      console.log(e.message);
      return;
    }

    console.log(response);
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
