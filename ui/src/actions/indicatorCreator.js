import * as CS from "../constants";

export function createShowLoginWarning(settings, value) {
  return {
    type: CS.SHOW_LOGIN_WARNING,
    payload: value,
  };
}

export function createShowNotSendingWarning(settings, value) {
  return {
    type: CS.SHOW_NOT_SENDING_WARNING,
    payload: value,
  };
}

export function crSetQueryChanged(settings, value) {
  return {
    type: CS.SET_QUERY_CHANGED,
    payload: value,
  };
}
