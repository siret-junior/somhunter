import React from "react";
import { connect } from "react-redux";

import { Container, Row, Col, Alert } from "react-bootstrap";

function ServerLoginIndicator(props) {
  if (props.show) {
    return <Alert variant="danger">Logged out from the DRES server!</Alert>;
  } else {
    return null;
  }
}

function NotSendingIndicator(props) {
  if (props.show) {
    return <Alert variant="warning">Not sending data to the server.</Alert>;
  } else {
    return null;
  }
}

function NotificationPanel(props) {
  const indicators = props.indicators;

  return (
    <Container fluid className="notifications-panel panel">
      <Row>
        <Col xs={12}>
          <h1 className="panel-title"> Indicators</h1>
        </Col>
        <Col xs={12}>
          <ServerLoginIndicator show={indicators.loginWarning} />
        </Col>
        <Col xs={12}>
          <NotSendingIndicator show={indicators.notSendingWarning} />
        </Col>
      </Row>
    </Container>
  );
}

const stateToProps = ({ indicators }) => {
  return { indicators };
};

export default connect(stateToProps)(NotificationPanel);
