import { combineReducers } from "redux";

// Main window state
import mainWindowReducer from "./mainWindowReducer";

// Combine all the reducers
export default combineReducers({
  mainWindow: mainWindowReducer,
});
