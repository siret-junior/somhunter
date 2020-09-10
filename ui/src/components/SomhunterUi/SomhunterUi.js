import React, { useEffect } from "react";
import { connect } from "react-redux";

import { Container, Row, Col, Button } from "react-bootstrap";

import * as CS from "../../constants";
import { showGlobalNotification, showDisplay } from "../../actions";

import MainPanel from "./MainPanel/MainPanel";
import MainWindow from "./MainWindow/MainWindow";
import GlobalNotificationOverlay from "./GlobalNotificationOverlay";
import DebugButtons from "./DebugButtons";

//console.debug = () => {};

function SomhunterUi(props) {
  // Initial setup
  useEffect(() => {
    console.debug("<SomhunterUi>: Running initial load...");
    props.showDisplay(CS.DISP_TYPE_TOP_N, 0, 0);
  });

  return (
    <Container
      fluid
      className="section somhunter-ui p-0"
      style={{ backgroundColor: "#aaa" }}
    >
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
  return {};
};

const actionCreators = {
  showGlobalNotification,
  showDisplay,
};

export default connect(stateToProps, actionCreators)(SomhunterUi);
