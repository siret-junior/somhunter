import React from "react";
import { connect } from "react-redux";

import { Container, Button, Row, Col } from "react-bootstrap";

function Frame(props) {
  return (
    <Container className="frame-grid">
      <span className="video-id-label top left">{props.id}</span>
      <Button className="top right green">✓</Button>
      <Button className="bottom left orange">KNN</Button>
      <Button className="bottom right blue">Detail</Button>
    </Container>
  );
}

const stateToProps = (state) => {
  return {};
};

export default connect(stateToProps)(Frame);
