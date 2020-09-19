import * as CS from "../constants";

/*
 * interface notificationState {
 *    type: string;
 *    heading: string;
 *    text: text;
 *    timeoutHandle: number;
 * }
 */
function notificationReducer(state = null, action) {
  switch (action.type) {
    case CS.SHOW_GLOBAL_NOTIFICATION:
      return {
        type: action.payload.type,
        heading: action.payload.heading,
        text: action.payload.text,
        timeoutHandle: action.payload.timeoutHandle,
      };

    case CS.HIDE_GLOBAL_NOTIFICATION:
      return null;

    default:
      return state;
  }
  return state;
}

export default notificationReducer;
