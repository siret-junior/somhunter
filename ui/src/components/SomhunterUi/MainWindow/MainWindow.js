import React from "react";
import { connect } from "react-redux";

import { Container, Row, Col } from "react-bootstrap";
import FrameGrid from "./FrameGrid";

function MainWindow(props) {
  return (
    <Container fluid className="main-window window p-0">
      <FrameGrid />
    </Container>
  );
}

const stateToProps = (state) => {
  return {};
};

export default connect(stateToProps)(MainWindow);
