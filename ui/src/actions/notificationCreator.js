import axios from "axios";

import config from "../config/config";
import { dispNameToAction } from "../constants";
import coreApi from "../apis/coreApi";

import * as CS from "../constants";

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
