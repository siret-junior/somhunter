import { Action, ShowGlobNotAction, HideGlobNotAction } from "./index";

import * as CS from "../constants";

/** State type */
export type NotificationState = {
  type: string;
  heading: string;
  text: string;
  timeoutHandle: number;
} | null;

const defState: NotificationState = null;

function notificationReducer(
  state: NotificationState = defState,
  action: Action
): NotificationState {
  let pl = undefined;

  switch (action.type) {
    case CS.SHOW_GLOBAL_NOTIFICATION:
      console.debug("=> (REDUCER) notificationReducer:", action);

      pl = (<ShowGlobNotAction>action).payload;
      return {
        type: pl.type,
        heading: pl.heading,
        text: pl.text,
        timeoutHandle: pl.timeoutHandle,
      };

    case CS.HIDE_GLOBAL_NOTIFICATION:
      console.debug("=> (REDUCER) notificationReducer:", action);
      pl = (<HideGlobNotAction>action).payload;
      return defState;

    default:
      break;
  }
  return state;
}

export default notificationReducer;
