import { useContext } from "react";
import SettingsContext from "../contexts/settingsContext";

export function useSettings() {
  return useContext(SettingsContext);
}
