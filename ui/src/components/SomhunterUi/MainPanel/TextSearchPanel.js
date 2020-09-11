import React, { useState, useRef } from "react";
import { connect } from "react-redux";

import config from "../../../config/config";
import { Container, Row, Col, Form } from "react-bootstrap";
import Autocomplete from "../Autocomplete";

function onTriggerRescoretHandler(destDisplay, isAcOpen, refQuery0, refQuery1) {
  
  // Make sure that autocomplete popup is not shown
  if (!isAcOpen) {
    const query0 = refQuery0.current.value;
    const query1 = refQuery1.current.value;

    console.debug("=> onSubmitHandler: Rescoring with params:", {
      destDisplay,
      query0,
      query1,
    });
  }
}

function TextSearchPanel(props) {
  const refQuery0 = useRef(null);
  const refQuery1 = useRef(null);

  const [isAcOpen, setIsAcOpen] = useState(false);

  return (
    <Container fluid className="text-search panel">
      <Row>
        <Col xs={12}>
          <h1 className="panel-title"> Text query</h1>
          <Form className="panel-content text-search-form">
            <Form.Group>
              <Autocomplete
                triggerRescore={() =>
                  onTriggerRescoretHandler(
                    config.frameGrid.defaultRescoreDisplay,
                    isAcOpen,
                    refQuery0,
                    refQuery1
                  )
                }
                setIsAcOpen={setIsAcOpen}
                inputRef={refQuery0}
              />
              <span className="query-joiner"> ... and then ...</span>
              <div className="indented">
                <Autocomplete
                  triggerRescore={() =>
                    onTriggerRescoretHandler(
                      config.frameGrid.defaultRescoreDisplay,
                      isAcOpen,
                      refQuery0,
                      refQuery1
                    )
                  }
                  setIsAcOpen={setIsAcOpen}
                  inputRef={refQuery1}
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

export default connect(stateToProps)(TextSearchPanel);
