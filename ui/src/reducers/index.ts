import { combineReducers } from "redux";

import { FrameRef, Vec2 } from "../../types/coreApi";

// Current app settings
import settingsReducer, { SettingsState } from "./settingsReducer";

// Main window state (frames, search queries, replay frames, etc.)
import mainWindowReducer, { MainWindowState } from "./mainWindowReducer";

// Notifications state (alerts, errors, etc.)
import notificationReducer, { NotificationState } from "./notificationReducer";

// Detail window
import detailWindowReducer, { DetailWindowState } from "./detailWindowReducer";

// Replay window
import replayWindowReducer, { ReplayWindowState } from "./replayWindowReducer";

// Indicators (not logged in, not sending, etc)
import indicatorReducer, { IndicatorState } from "./indicatorReducer";

// Search state (e.g. queries' values, liked frames, ...)
import searchReducer, { SearchState } from "./searchReducer";

/** State type */
export type StoreState = {
  mainWindow: MainWindowState;
  notifications: NotificationState;
  detailWindow: DetailWindowState;
  replayWindow: ReplayWindowState;
  settings: SettingsState;
  indicators: IndicatorState;
  search: SearchState;
};

/*
 * Action types
 */
export type ShowTopNDisplay = {
  type: string;
  payload: {
    currentPage: number;
    activeDisplay: string;
    frames: FrameRef[];
  };
};

export type ShowSomDisplay = {
  type: string;
  payload: {
    currentPage: number;
    activeDisplay: string;
    frames: FrameRef[];
  };
};

export type ShowDetailAction = {
  type: string;
  payload: {
    pivotFrameId: number;
    videoId: number;
    frames: FrameRef[];
  };
};

export type HideDetailAction = {
  type: string;
  payload: null;
};

export type ShowGlobNotAction = {
  type: string;
  payload: {
    type: string;
    heading: string;
    text: string;
    timeoutHandle: number;
  };
};

export type HideGlobNotAction = {
  type: string;
  payload: null;
};

export type ShowReplayAction = {
  type: string;
  payload: {
    pivotFrameId: number;
    frames: FrameRef[];
    cursorPos: Vec2;
  };
};
export type ScrollReplayAction = {
  type: string;
  payload: {
    deltaX: number;
  };
};

export type HideReplayAction = {
  type: string;
  payload: null;
};

export type SetCoreSettingsAction = {
  type: string;
  payload: React.Ref<any>;
};

export type SetSearchStateAction = {
  type: string;
  payload: {
    ID: number;
    displayType: string;
    screenshotFilepath: string;
    textQueries: string[];
  };
};

export type Action =
  | ShowTopNDisplay
  | ShowSomDisplay
  | ShowDetailAction
  | HideDetailAction
  | ShowGlobNotAction
  | HideGlobNotAction
  | ShowReplayAction
  | ScrollReplayAction
  | HideReplayAction
  | SetCoreSettingsAction
  | SetSearchStateAction;

// Combine all the reducers
export default combineReducers({
  mainWindow: mainWindowReducer,
  notifications: notificationReducer,
  detailWindow: detailWindowReducer,
  replayWindow: replayWindowReducer,
  settings: settingsReducer,
  indicators: indicatorReducer,
  search: searchReducer,
});
