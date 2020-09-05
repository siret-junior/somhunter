import React from "react";
import { connect } from "react-redux";

import { Container, Row, Col } from "react-bootstrap";

import Frame from "./Frame";

function getFrames(props) {
  // \todo PH
  return Array(6 * 6)
    .fill(null)
    .map((_, i) => (
      <Col key={i} xs={2}>
        <Frame id={i} />
      </Col>
    ));
}

function FrameGrid(props) {
  return (
    <Container className="frame-grid">
      <Row>{getFrames(props)}</Row>
    </Container>
  );
}

const stateToProps = (state) => {
  return {};
};

export default connect(stateToProps)(FrameGrid);
