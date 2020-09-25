import _ from "lodash";
import React, { useState, useRef } from "react";
import { connect } from "react-redux";

import config from "../../../config/config";
import { Container, Row, Col, Form } from "react-bootstrap";
import Autocomplete from "../Autocomplete";
import { get, post } from "../../../apis/coreApi";
import { useSettings } from "../../../hooks/useSettings";
import TextSearchInput from "./TextSearchInput";

function TextSearchPanel(props) {
  const s = useSettings();

  const subInputsRef = useRef();

  /** Lets the Core know about text query change. */
  const triggerLogTextChange = () => {
    const dispatch = s.dispatch;
    const url = s.coreSettings.api.endpoints.logTextChange.get.url;

    let query = `${props.refQuery0.current.value} >> ${props.refQuery1.current.value}`;

    const params = {
      query: query,
    };

    get(dispatch, url, { params });
  };

  // Trigger logging mechanisms
  const triggerLogTextChangeThrottled = _.throttle(
    triggerLogTextChange,
    s.coreSettings.core.submitter_config.log_action_timeout
  );

  return (
    <Container fluid className="text-search panel">
      <Form className="panel-content text-search-form">
        <Row>
          <Col xs={6} className="text-search-cont pr-0">
            <TextSearchInput
              index={0}
              inputRef={props.refQuery0}
              subInputsRef={subInputsRef}
              setIsAcOpen={props.setIsAcOpen}
              triggerLogTextChange={triggerLogTextChangeThrottled}
            />
          </Col>
          <Col xs={6} className="text-search-cont smaller pr-0">
            <span className="temp-connector"> ...then...</span>
            <TextSearchInput
              index={1}
              inputRef={props.refQuery1}
              subInputsRef={subInputsRef}
              setIsAcOpen={props.setIsAcOpen}
              triggerLogTextChange={triggerLogTextChangeThrottled}
            />
          </Col>
        </Row>
      </Form>
    </Container>
  );
}

const stateToProps = (state) => {
  return {};
};

const actionCreators = {};

export default connect(stateToProps, actionCreators)(TextSearchPanel);
