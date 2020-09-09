import React from "react";
import { connect } from "react-redux";

import { Container, Row, Col } from "react-bootstrap";

import Frame from "./Frame";

function getFrames({ mainWindow }) {
  console.log(mainWindow);
  // \todo PH
  return mainWindow.frames.map((frame) => (
    <Col
      className="frame"
      key={frame.id}
      data-frame-id={frame.id}
      xs={2}
      style={{ backgroundImage: `url("${frame.src}")` }}
    >
      <Frame id={frame.id} />
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

const stateToProps = ({ mainWindow }) => {
  return { mainWindow };
};

export default connect(stateToProps)(FrameGrid);
