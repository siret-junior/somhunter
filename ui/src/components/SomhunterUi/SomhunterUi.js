import React from "react";
import { connect } from "react-redux";

import { Container, Row, Col, Button } from "react-bootstrap";

import * as CS from "../../constants";
import { showGlobalNotification } from "../../actions";

import MainPanel from "./MainPanel/MainPanel";
import MainWindow from "./MainWindow/MainWindow";
import GlobalNotificationOverlay from "./GlobalNotificationOverlay";
import DebugButtons from "./DebugButtons";

function SomhunterUi(props) {
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
};

export default connect(stateToProps, actionCreators)(SomhunterUi);
