import * as CS from "../constants";

export function createDenotif(settings) {
  return {
    type: CS.HIDE_GLOBAL_NOTIFICATION,
    payload: null,
  };
}

export function createShowLoginWarning(settings) {
  return {
    type: CS.SHOW_LOGIN_WARNING,
    payload: null,
  };
}

export function createShowNotSendingWarning(settings) {
  return {
    type: CS.SHOW_NOT_SENDING_WARNING,
    payload: null,
  };
}

export function createNotif(
  settings,
  type = CS.GLOB_NOTIF_INFO,
  heading,
  text = "",
  duration = 100000
) {
  // We send this function to the thunk MW to dispatch both actions
  return (dispatch, getState) => {
    // Reset previous cancel timer
    const currState = getState();
    if (currState.notifications !== null) {
      const timeoutHandle = currState.notifications.timeoutHandle;
      window.clearTimeout(timeoutHandle);
    }

    // Dispatch cancel action
    const timeoutHandle = setTimeout(() => {
      dispatch(createDenotif());
    }, duration);

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
export function createReqFailNot(settings, ep, msg) {
  return createNotif(
    settings,
    CS.GLOB_NOTIF_ERR,
    `Core request to '${ep}'`,
    msg,
    5000
  );
}
