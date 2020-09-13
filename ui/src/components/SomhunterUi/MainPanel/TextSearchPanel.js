import React from "react";
import { connect } from "react-redux";

import config from "../../../config/config";
import { Container, Row, Col, Form } from "react-bootstrap";
import Autocomplete from "../Autocomplete";

import { createRescore } from "../../../actions/rescoreCreator";

function TextSearchPanel(props) {
  return (
    <Container fluid className="text-search panel">
      <Row>
        <Col xs={12}>
          <h1 className="panel-title"> Text query</h1>
          <Form className="panel-content text-search-form">
            <Form.Group>
              <Autocomplete
                triggerRescore={props.triggerRescore}
                setIsAcOpen={props.setIsAcOpen}
                inputRef={props.refQuery0}
              />
              <span className="query-joiner"> ... and then ...</span>
              <div className="indented">
                <Autocomplete
                  triggerRescore={props.triggerRescore}
                  setIsAcOpen={props.setIsAcOpen}
                  inputRef={props.refQuery1}
                />
              </div>
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

const actionCreators = {
  createRescore,
};

export default connect(stateToProps, actionCreators)(TextSearchPanel);
