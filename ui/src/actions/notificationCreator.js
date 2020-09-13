import axios from "axios";

import config from "../config/config";
import { dispNameToAction } from "../constants";
import coreApi from "../apis/coreApi";

import * as CS from "../constants";

export function createHideGlobalNotification() {
  console.debug("=> hideGlobalNotification: Hiding global notification...");

  return {
    type: CS.HIDE_GLOBAL_NOTIFICATION,
    payload: null,
  };
}

export function createShowGlobalNotification(
  type = CS.GLOB_NOTIF_INFO,
  heading,
  text,
  duration
) {
  console.debug(
    "=> createShowGlobalNotification: Adding global notification..."
  );

  // We send this function to the thunk MW to dispatch both actions
  return (dispatch, getState) => {
    const currState = getState();

    // Reset previous cancel timer
    if (currState.notifications !== null) {
      const timeoutHandle = currState.notifications.timeoutHandle;
      console.debug(
        `=> createShowGlobalNotification: Clearing timeout '${timeoutHandle}'`
      );
      window.clearTimeout(timeoutHandle);
    }

    // Dispatch cancel action
    const timeoutHandle = setTimeout(() => {
      dispatch(createHideGlobalNotification());
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
