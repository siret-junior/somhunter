import React from "react";
import { connect } from "react-redux";

import { Container, Row, Col } from "react-bootstrap";

function NotificationPanel(props) {
  return (
    <Container fluid className="controls notification">
      <Row>
        <Col xs={12}>NotificationPanel...</Col>
      </Row>
    </Container>
  );
}

const stateToProps = (state) => {
  return {};
};

export default connect(stateToProps)(NotificationPanel);
