import * as CS from "../constants";

export function crHideNotif(settings) {
  return {
    type: CS.HIDE_GLOBAL_NOTIFICATION,
    payload: null,
  };
}

export function crNotif(
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
      dispatch(crHideNotif());
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
export function crReqFailNotif(settings, ep, msg) {
  return crNotif(
    settings,
    CS.GLOB_NOTIF_ERR,
    `Core request to '${ep}'`,
    msg,
    5000
  );
}

export function crErrNotif(settings, heading, text = "", duration = 100000) {
  return crNotif(settings, CS.GLOB_NOTIF_ERR, heading, text, duration);
}

export function crWarnNotif(settings, heading, text = "", duration = 100000) {
  return crNotif(settings, CS.GLOB_NOTIF_WARN, heading, text, duration);
}

export function crInfoNotif(settings, heading, text = "", duration = 100000) {
  return crNotif(settings, CS.GLOB_NOTIF_INFO, heading, text, duration);
}

export function crSuccNotif(settings, heading, text = "", duration = 100000) {
  return crNotif(settings, CS.GLOB_NOTIF_SUCC, heading, text, duration);
}
