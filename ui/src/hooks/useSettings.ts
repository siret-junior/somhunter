import { useContext } from "react";
import SettingsContext from "../contexts/settingsContext";
import { SettingsState } from "../reducers/settingsReducer";

export function useSettings(): SettingsState {
  return useContext(SettingsContext);
}
