import React from "react";
import { connect } from "react-redux";

import { Container, Button, Row, Col, Alert } from "react-bootstrap";

import * as CS from "../../constants";

function typeToVariantString(type) {
  switch (type) {
    case CS.GLOB_NOTIF_ERR:
      return "danger";
    case CS.GLOB_NOTIF_WARN:
      return "warning";
    case CS.GLOB_NOTIF_SUCC:
      return "success";
    default:
      return "info";
  }
}

function GlobalNotificationOverlay(props) {
  return (
    <Container
      className={`global-notification-overlay overlay absolute ${
        props.notifications !== null ? "active" : ""
      }`}
    >
      {props.notifications !== null ? (
        <Alert variant={typeToVariantString(props.notifications.type)}>
          <Alert.Heading>{props.notifications.heading}</Alert.Heading>
          <p>{props.notifications.text}</p>
        </Alert>
      ) : null}
    </Container>
  );
}

const stateToProps = ({ notifications }) => {
  return { notifications };
};

export default connect(stateToProps)(GlobalNotificationOverlay);
