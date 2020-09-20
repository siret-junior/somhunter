import React, { useEffect } from "react";
import { connect, useDispatch } from "react-redux";

import config from "../../config/config";
import coreApi from "../../apis/coreApi";
import STRS from "../../config/strings";
import * as CS from "../../constants";

import { createSetCoreSettings } from "../../actions/settingsCreator";

import { SettingsProvider } from "../../contexts/settingsContext";

import CriticalErrorWindow from "./CriticalErrorWindow";
import SomhunterUi from "./SomhunterUi";
import LoadingWindow from "./LoadingWindow";

/** JSX informing the user about critical error. */
function getErrorWindowJsx() {
  return (
    <CriticalErrorWindow
      title={STRS.UNABLE_TO_FETCH_CORE_SETTINGS_HEADING}
      body={`${STRS.UNABLE_TO_FETCH_CORE_SETTINGS_DESC} '${config.coreSettingsUrl}'`}
      action={STRS.error.noCoreSettingsAction}
      actionHandler={() => window.location.reload()}
    />
  );
}

/** JSX informing the user about ongoing initial load. */
function getLoadingJsx() {
  return (
    <LoadingWindow
      title={STRS.LOADING_CORE_SETTINGS_HEADING}
      body={STRS.LOADING_CORE_SETTINGS_DESC}
    />
  );
}

/** Fetches the settings from the Core API. */
async function fetchSettings(dispatch, succ = (_) => null, fail = () => null) {
  const url = config.coreSettingsUrl;
  let response = null;

  try {
    // << Core API >>
    response = await coreApi.get(url);
    // << Core API >>
  } catch (e) {
    console.error(e);

    // Set failed state
    dispatch(createSetCoreSettings(null));

    // Run fail callback
    fail();

    return;
  }

  dispatch(createSetCoreSettings(response.data));

  // Run success callback
  succ(response.data);

  return response.data;
}

/** Initialization of the program. */
function initialize(dispatch) {
  console.debug("=> initialize: Loading Core API settings...");

  // Successfull callback
  const succ = (coreSettings) => {
    //
    document.title = `${coreSettings.server.appName} | ${coreSettings.server.appSubname}`;
    console.debug(
      "=> fetchSettings CB: The Core API settings loaded successfully."
    );
  };

  // Fail callback
  const fail = () =>
    console.error("=> fetchSettings CB: Loading the Core API settings failed!");

  // Fetch the back-end settings
  fetchSettings(dispatch, succ, fail);
}

function ContextWrapper({ settings }) {
  const dispatch = useDispatch();

  // Initialize the program
  useEffect(() => initialize(dispatch), []);

  // If initialize FAILED
  if (settings.coreSettings === null) {
    console.info("<ContextWrapper>: Rendering... (ERROR LOADING)");
    return getErrorWindowJsx();
  }
  // If still LOADING
  else if (typeof settings.coreSettings === "undefined") {
    console.info("<ContextWrapper>: Rendering... (LOADING)");
    return getLoadingJsx();
  }
  // Already LOADED
  else {
    console.info("<ContextWrapper>: Rendering... (LOADED)");
    return (
      <SettingsProvider value={{ ...settings, dispatch }}>
        <SomhunterUi />
      </SettingsProvider>
    );
  }
}

const stateToProps = ({ settings }) => {
  return { settings };
};

export default connect(stateToProps)(ContextWrapper);
