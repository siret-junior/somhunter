import { Action } from "./index";

import * as CS from "../constants";

/** State type */
export type IndicatorState = {
  loginWarning: boolean;
  notSendingWarning: boolean;
  queryChanged: boolean;
};

const defaultState: IndicatorState = {
  loginWarning: false,
  notSendingWarning: false,
  queryChanged: false,
};

function indicatorReducer(
  state: IndicatorState = defaultState,
  action: Action
) {
  switch (action.type) {
    case CS.SHOW_LOGIN_WARNING:
      return { ...state, loginWarning: action.payload };

    case CS.SHOW_NOT_SENDING_WARNING:
      return { ...state, notSendingWarning: action.payload };

    case CS.SET_QUERY_CHANGED:
      return { ...state, queryChanged: action.payload };

    default:
      break;
  }
  return state;
}

export default indicatorReducer;
