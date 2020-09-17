import { combineReducers } from "redux";

// Current app settings
import settingsReducer from "./settingsReducer";

// Main window state (frames, search queries, replay frames, etc.)
import mainWindowReducer from "./mainWindowReducer";

// Notifications state (alerts, errors, etc.)
import notificationReducer from "./notificationReducer";

// Detail window
import detailWindowReducer from "./detailWindowReducer";

// Replay window
import replayWindowReducer from "./replayWindowReducer";

// Combine all the reducers
export default combineReducers({
  mainWindow: mainWindowReducer,
  notifications: notificationReducer,
  detailWindow: detailWindowReducer,
  replayWindow: replayWindowReducer,
  settings: settingsReducer,
});

/********************
 * TYPES:
 ********************

interface state {
  mainWindow: mainWindowState;
  notifications: notificationState;
  detailWindow: detailWindowState;
  replayWindow: mainWindowState;
}

interface mainWindowState {
  activeDisplay: string;
  frames: {
    id: number;
    videoId: number;
    src: string;
  }[];
}

interface notificationState {
  type: string;
  heading: string;
  text: string;
  timeoutHandle: number;
}

interface detailWindowState {
  show: boolean;
  pivotFrameId: number;
  videoId: number;
  frames: {
    liked: boolean;
    vId: number;
    sId: number;
    src: string;
  };
}

interface replayWindowState {
  show: boolean;
  pivotFrameId: number;
  deltaX: number;
  frames: {
    liked: boolean;
    vId: number;
    sId: number;
    src: string;
  }[];
}
*/
