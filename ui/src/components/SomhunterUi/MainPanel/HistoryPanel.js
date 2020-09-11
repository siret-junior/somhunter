import React from "react";
import { connect } from "react-redux";

import { Container, Row, Col } from "react-bootstrap";

function HistoryPanel(props) {
  return (
    <Container fluid className="history panel">
      <Row>
        <Col xs={12}>History panel...</Col>
      </Row>
    </Container>
  );
}

const stateToProps = (state) => {
  return {};
};

export default connect(stateToProps)(HistoryPanel);
