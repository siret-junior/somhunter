import React, { useEffect } from "react";
import { connect, useDispatch } from "react-redux";

import { Alert, Container, Row, Col, Button } from "react-bootstrap";

import config from "../../config/config";
import STRS from "../../config/strings";
import coreApi from "../../apis/coreApi";
import * as CS from "../../constants";
import { hideAllSubQueries } from "../../utils/utils";

import { useSettings } from "../../hooks/useSettings";

import { crShowDisplay } from "../../actions/mainWindowCreator";
import { crNotif, crHideNotif } from "../../actions/notificationCreator";
import { createRescore } from "../../actions/rescoreCreator";
import {
  createFocusTextQuery,
  createSetCoreSettings,
  createSetSearchState,
} from "../../actions/settingsCreator";

import CriticalErrorWindow from "./CriticalErrorWindow";
import LoadingWindow from "./LoadingWindow";
import MainPanel from "./MainPanel/MainPanel";
import MainWindow from "./MainWindow/MainWindow";
import GlobalNotificationOverlay from "./GlobalNotificationOverlay";

/** JSX informing the user about critical error. */
function getErrorWindowJsx() {
  return (
    <CriticalErrorWindow
      title={STRS.UNABLE_TO_FETCH_SEARCH_STATE_HEADING}
      body={`${STRS.UNABLE_TO_FETCH_SEARCH_STATE_DESC} '${config.coreSearchStateUrl}'`}
      action={STRS.UNABLE_TO_FETCH_SEARCH_STATE_ACTION}
      actionHandler={() => window.location.reload()}
    />
  );
}

/** JSX informing the user about ongoing initial load. */
function getLoadingJsx() {
  return (
    <LoadingWindow
      title={STRS.LOADING_SEARCH_STATE_HEADING}
      body={STRS.LOADING_SEARCH_STATE_DESC}
    />
  );
}

function handleGlobalKeyDown(settings, props, e) {
  const activeElement = document.activeElement;

  switch (e.keyCode) {
    case CS.KEY_CODE_TAB:
      props.createFocusTextQuery(settings);
      e.preventDefault();
      e.stopPropagation();
      break;

    case CS.KEY_CODE_ENTER:
      // If NOT in a text input
      if (activeElement.tagName !== "INPUT") {
        if (e.shiftKey) {
          props.createRescore(
            settings,
            config.frameGrid.defaultSecondaryRescoreDisplay
          );
        } else {
          props.createRescore(settings, config.frameGrid.defaultRescoreDisplay);
        }
      }
      break;

    case CS.KEY_CODE_T:
      // If NOT in a text input
      if (activeElement.tagName !== "INPUT") {
        if (e.shiftKey) {
          props.crShowDisplay(settings, CS.DISP_TYPE_TOP_N_CONTEXT);
        } else {
          props.crShowDisplay(settings, CS.DISP_TYPE_TOP_N);
        }
      }
      break;

    case CS.KEY_CODE_S:
      // If NOT in a text input
      if (activeElement.tagName !== "INPUT") {
        props.crShowDisplay(settings, CS.DISP_TYPE_SOM);
      }
      break;

    case CS.KEY_CODE_ESC:
      // Loose any focus
      document.activeElement.blur();

      // Close autocomplete
      hideAllSubQueries();

      break;

    default:
      break;
  }
}

function setupGlobalListeners(settings, props) {
  document.addEventListener("keydown", (e) =>
    handleGlobalKeyDown(settings, props, e)
  );
}

/** Fetches the search state from the Core API. */
async function fetchSearchState(
  dispatch,
  succ = (_) => null,
  fail = () => null
) {
  const url = config.coreSettingsUrl;
  let response = null;

  try {
    // << Core API >>
    response = await coreApi.get(url);
    // << Core API >>
  } catch (e) {
    console.error(e);

    // Set failed state
    dispatch(createSetSearchState(null));

    // Run fail callback
    fail();

    return;
  }

  dispatch(createSetSearchState(response.data));

  // Run success callback
  succ();
}

/** Initialization of the program. */
function initializeUi(s, props) {
  console.debug("=> initializeUi: Initializing the UI...");

  // Successfull callback
  const succ = () => {
    console.debug(
      "=> initializeUi CB: Loading the search session state succeeded."
    );

    setupGlobalListeners(s, props);
    props.crShowDisplay(s, CS.DISP_TYPE_TOP_N, 0, 0);
  };

  // Fail callback
  const fail = () =>
    console.error(
      "=> initializeUi CB: Loading the search session state failed!"
    );

  // Fetch the back-end settings
  fetchSearchState(s.dispatch, succ, fail);
}

function SomhunterUi(props) {
  const settings = useSettings();
  const searchState = props.searchState;

  // Initial setup
  useEffect(() => initializeUi(settings, props), []);

  // If initialize FAILED
  if (searchState === null) {
    console.info("<SomhunterUi>: Rendering... (ERROR LOADING SEARCH STATE)");
    return getErrorWindowJsx();
  }
  // If still LOADING
  else if (typeof searchState === "undefined") {
    console.info("<SomhunterUi>: Rendering... (LOADING)");
    return getLoadingJsx();
  }
  // Already LOADED
  else {
    console.info("<SomhunterUi>: Rendering... (LOADED SEARCH STATE)");
    return (
      <Container fluid className="section somhunter-ui p-0">
        <GlobalNotificationOverlay />

        {/* <DebugButtons /> */}

        <Row noGutters>
          <Col xs={3}>
            <MainPanel />
          </Col>
          <Col xs={9}>
            <MainWindow />
          </Col>
        </Row>
      </Container>
    );
  }
}

const stateToProps = ({ settings }) => {
  return { searchState: settings.searchState };
};

const actionCreators = {
  crNotif,
  crHideNotif,
  crShowDisplay,
  createRescore,
  createFocusTextQuery,
  createSetCoreSettings,
};

export default connect(stateToProps, actionCreators)(SomhunterUi);
