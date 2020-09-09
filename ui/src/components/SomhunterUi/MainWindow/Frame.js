import React from "react";
import { connect } from "react-redux";

import { Container, Button, Row, Col } from "react-bootstrap";

function Frame(props) {
  return (
    <Col
      className="frame p-0"
      data-frame-id={props.frame.id}
      xs={2}
      style={{ backgroundImage: `url("${props.frame.src}")` }}
    >
      <span className="video-id-label top left">{props.id}</span>
      <Button className="top right green" variant="success">
        ✓
      </Button>
      <Button className="bottom left orange" variant="secondary">
        KNN
      </Button>
      <Button className="bottom right blue" variant="primary">
        Detail
      </Button>
    </Col>
  );
}

const stateToProps = (state) => {
  return {};
};

export default connect(stateToProps)(Frame);
