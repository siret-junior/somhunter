import React from "react";
import { connect } from "react-redux";

import { Container, Row, Col, Form } from "react-bootstrap";

function TextSearchPanel(props) {
  return (
    <Container fluid className="text-search panel p-0">
      <Row>
        <Col xs={12}>
          <Form>
            <Form.Group>
              <Form.Control
                name="textSearchQuery0"
                key="textSearchQuery0"
                type="text"
              />
              <Form.Control
                name="textSearchQuery1"
                key="textSearchQuery1"
                type="text"
              />
            </Form.Group>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

const stateToProps = (state) => {
  return {};
};

export default connect(stateToProps)(TextSearchPanel);
