import React from "react";
import { connect } from "react-redux";
import { Container, Button, Row, Col, Alert } from "react-bootstrap";

import * as CS from "../../constants";
import { crNotif } from "../../actions/notificationCreator";
import { useSettings } from "../../hooks/useSettings";
function DebugButtons(props) {
  const settings = useSettings();

  return (
    <Container className="overlay debug-buttons">
      <Button
        variant="danger"
        onClick={() => {
          props.crNotif(
            settings,
            CS.GLOB_NOTIF_ERR,
            "It's an error",
            "yeah yeah",
            5000
          );
        }}
      >
        TEST 1
      </Button>

      <Button
        variant="danger"
        onClick={() => {
          props.crNotif(
            settings,
            CS.GLOB_NOTIF_WARN,
            "It's an 222 error",
            "yeah yeah 222",
            3000
          );
        }}
      >
        TEST 2
      </Button>

      <Button
        variant="danger"
        onClick={() => {
          props.crNotif(
            settings,
            CS.GLOB_NOTIF_INFO,
            "It's an 222 error",
            "yeah yeah 222",
            3000
          );
        }}
      >
        TEST 3
      </Button>

      <Button
        variant="danger"
        onClick={() => {
          props.crNotif(
            settings,
            CS.GLOB_NOTIF_SUCC,
            "It's an 222 error",
            "yeah yeah 222",
            3000
          );
        }}
      >
        TEST 4
      </Button>
    </Container>
  );
}

const stateToProps = ({ notifications }) => {
  return { notifications };
};

const actionCreators = {
  crNotif,
};

export default connect(stateToProps, actionCreators)(DebugButtons);
