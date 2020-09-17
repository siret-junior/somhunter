import React, { useEffect } from "react";
import { connect, useStore } from "react-redux";

import { Container, Row, Col, Button } from "react-bootstrap";

import config from "../../config/config";
import * as CS from "../../constants";
import { createShowDisplay } from "../../actions/mainWindowCreator";
import { createShowGlobalNotification } from "../../actions/notificationCreator";
import { createRescore } from "../../actions/rescoreCreator";
import { createFocusTextQuery } from "../../actions/settingsCreator";

import MainPanel from "./MainPanel/MainPanel";
import MainWindow from "./MainWindow/MainWindow";
import GlobalNotificationOverlay from "./GlobalNotificationOverlay";
import DebugButtons from "./DebugButtons";

function handleGlobalKeyDown(e, props) {
  const activeElement = document.activeElement;

  switch (e.keyCode) {
    case CS.KEY_CODE_TAB:
      props.createFocusTextQuery();
      e.preventDefault();
      e.stopPropagation();
      break;

    case CS.KEY_CODE_ENTER:
      // If NOT in a text input
      if (activeElement.tagName !== "INPUT") {
        if (e.shiftKey) {
          props.createRescore(config.frameGrid.defaultSecondaryRescoreDisplay);
        } else {
          props.createRescore(config.frameGrid.defaultRescoreDisplay);
        }
      }
      break;

    case CS.KEY_CODE_T:
      // If NOT in a text input
      if (activeElement.tagName !== "INPUT") {
        if (e.shiftKey) {
          props.createShowDisplay(CS.DISP_TYPE_TOP_N_CONTEXT);
        } else {
          props.createShowDisplay(CS.DISP_TYPE_TOP_N);
        }
      }
      break;

    case CS.KEY_CODE_S:
      // If NOT in a text input
      if (activeElement.tagName !== "INPUT") {
        props.createShowDisplay(CS.DISP_TYPE_SOM);
      }
      break;

    case CS.KEY_CODE_ESC:
      // Loose any focus
      document.activeElement.blur();
      break;

    default:
      break;
  }
}

function setupGlobalListeners(props) {
  document.addEventListener("keydown", (e) => handleGlobalKeyDown(e, props));
}

function SomhunterUi(props) {
  // Initial setup
  useEffect(() => {
    console.debug("<SomhunterUi>: Running initial load...");

    // Setup global keydown listeners
    setupGlobalListeners(props);

    // Show the first display
    props.createShowDisplay(CS.DISP_TYPE_TOP_N, 0, 0);
  }, []);

  return (
    <Container fluid className="section somhunter-ui p-0">
      <GlobalNotificationOverlay />

      <DebugButtons />

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
  console.warn(state.settings.textQueryRefs);
  return { textQueryRefs: state.settings.textQueryRefs };
};

const actionCreators = {
  createShowGlobalNotification,
  createShowDisplay,
  createRescore,
  createFocusTextQuery,
};

export default connect(stateToProps, actionCreators)(SomhunterUi);
