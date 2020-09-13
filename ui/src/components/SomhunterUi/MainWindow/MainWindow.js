import React from "react";
import { connect } from "react-redux";

import { Container, Row, Col } from "react-bootstrap";

import {
  createHideDetailWindow,
  createShowDetailWindow,
} from "../../../actions/detailWindowCreator";
import { createShowGlobalNotification } from "../../../actions/notificationCreator";
import { createShowDisplay } from "../../../actions/mainWindowCreator";

import FrameGrid from "./FrameGrid";
import DetailWindow from "./DetailWindow";

function MainWindow(props, parProps) {
  return (
    <Container fluid className="main-window window p-0">
      <FrameGrid mainWindow={props.mainWindow} />

      <DetailWindow
        show={props.detailWindow.show}
        onHide={() => props.createHideDetailWindow()}
      >
        <FrameGrid mainWindow={props.detailWindow} />
      </DetailWindow>
    </Container>
  );
}

const stateToProps = (state) => {
  return {
    detailWindow: state.detailWindow,
    replayWindow: state.replaylWindow,
    mainWindow: state.mainWindow,
  };
};

const actionCreators = {
  createHideDetailWindow,
  createShowDetailWindow,
  createShowDisplay,
  createShowGlobalNotification,
};

export default connect(stateToProps, actionCreators)(MainWindow);
