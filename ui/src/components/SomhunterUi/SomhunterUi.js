import React from "react";
import { connect } from "react-redux";

import { Container, Row, Col } from "react-bootstrap";

import MainPanel from "./MainPanel/MainPanel";
import MainWindow from "./MainWindow/MainWindow";

function SomhunterUi(props) {
  return (
    <Container
      fluid
      className="section somhunter-ui p-0"
      style={{ backgroundColor: "#aaa" }}
    >
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

export default connect(stateToProps)(SomhunterUi);
