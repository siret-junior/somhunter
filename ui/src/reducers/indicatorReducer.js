import * as CS from "../constants";

/*
 * interface indicatorState {
 *    loginWarning: boolean;
 *    notSendingWarning: boolean;
 * }
 */

const defaultState = {
  loginWarning: false,
  notSendingWarning: false,
};

function indicatorReducer(state = defaultState, action) {
  switch (action.type) {
    case CS.SHOW_LOGIN_WARNING:
      console.debug("=> (REDUCER) indicatorReducer:", action);
      return { ...state, loginWarning: action.payload };

    case CS.SHOW_NOT_SENDING_WARNING:
      return { ...state, notSendingWarning: action.payload };

    default:
      break;
  }
  return state;
}

export default indicatorReducer;
