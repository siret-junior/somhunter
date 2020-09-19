import React from "react";
import { connect } from "react-redux";

import { Container, Row, Col } from "react-bootstrap";

function ControlsPanel(props) {
  return (
    <Container fluid className={`controls-panel panel ${props.className}`}>
      <Row>{props.children}</Row>
    </Container>
  );
}

const stateToProps = (state) => {
  return {};
};

export default connect(stateToProps)(ControlsPanel);
