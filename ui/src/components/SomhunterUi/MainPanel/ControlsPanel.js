import React from "react";
import { connect } from "react-redux";

import { Container, Row, Col } from "react-bootstrap";

function ControlsPanel(props) {
  return (
    <Container fluid className="controls panel p-0">
      <Row>
        <Col xs={12}>{props.children}</Col>
      </Row>
    </Container>
  );
}

const stateToProps = (state) => {
  return {};
};

export default connect(stateToProps)(ControlsPanel);
