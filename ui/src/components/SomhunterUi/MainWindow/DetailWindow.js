import React from "react";
import { connect } from "react-redux";

import { Container, Row, Col } from "react-bootstrap";

function DetailWindow(props) {
  return (
    <section
      className="section somhunter-ui"
      style={{ backgroundColor: "magenta" }}
    >
      <h3>DetailWindow</h3>
    </section>
  );
}

const stateToProps = (state) => {
  return {};
};

export default connect(stateToProps)(DetailWindow);
