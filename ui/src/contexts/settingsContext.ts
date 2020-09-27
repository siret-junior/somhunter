import React from "react";
import { SettingsState } from "../reducers/settingsReducer";

const SettingsContext = React.createContext({ coreSettings: null });

export const SettingsProvider = SettingsContext.Provider;

export default SettingsContext;
