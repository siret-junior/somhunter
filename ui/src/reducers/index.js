import { combineReducers } from "redux";

// Main window state (frames, search queries, replay frames, etc.)
import mainWindowReducer from "./mainWindowReducer";

// Notifications state (alerts, errors, etc.)
import notificationReducer from "./notificationReducer";

// Combine all the reducers
export default combineReducers({
  mainWindow: mainWindowReducer,
  notifications: notificationReducer,
});
