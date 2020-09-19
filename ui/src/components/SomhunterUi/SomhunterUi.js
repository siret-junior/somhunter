import React, { useEffect } from "react";
import { connect, useDispatch } from "react-redux";

import { Alert, Container, Row, Col, Button } from "react-bootstrap";

import config from "../../config/config";
import STRS from "../../config/strings";
import * as CS from "../../constants";

import { useSettings } from "../../hooks/useSettings";

import { crShowDisplay } from "../../actions/mainWindowCreator";
import { createNotif, createDenotif } from "../../actions/notificationCreator";
import { createRescore } from "../../actions/rescoreCreator";
import {
  createFocusTextQuery,
  createSetCoreSettings,
} from "../../actions/settingsCreator";

import MainPanel from "./MainPanel/MainPanel";
import MainWindow from "./MainWindow/MainWindow";
import GlobalNotificationOverlay from "./GlobalNotificationOverlay";
import DebugButtons from "./DebugButtons";

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

/** Initialization of the program. */
function initializeUi(settings, props) {
  console.info("<SomhunterUi>: Initializing the UI...");

  setupGlobalListeners(settings, props);

  props.crShowDisplay(settings, CS.DISP_TYPE_TOP_N, 0, 0);
}

function SomhunterUi(props) {
  const settings = useSettings();

  // Initial setup
  useEffect(() => initializeUi(settings, props), []);

  console.warn("<SomhunterUi>: Rendering...");
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

const stateToProps = (state) => {
  return {};
};

const actionCreators = {
  createNotif,
  createDenotif,
  crShowDisplay,
  createRescore,
  createFocusTextQuery,
  createSetCoreSettings,
};

export default connect(stateToProps, actionCreators)(SomhunterUi);
