import React from "react";
import { connect } from "react-redux";

import { Container, Row, Col } from "react-bootstrap";

import Frame from "./Frame";

function getFrames({ mainWindow }) {
  return mainWindow.frames.map((frame) => (
    <Frame key={frame.id} frame={frame} />
  ));
}

function FrameGrid(props) {
  return (
    <Container fluid className="frame-grid p-0">
      <Row noGutters>{getFrames(props)}</Row>
    </Container>
  );
}

const stateToProps = ({ mainWindow }) => {
  return { mainWindow };
};

export default connect(stateToProps)(FrameGrid);
