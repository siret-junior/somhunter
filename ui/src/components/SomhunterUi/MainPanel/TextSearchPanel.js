import _ from "lodash";
import React from "react";
import { connect } from "react-redux";

import config from "../../../config/config";
import { Container, Row, Col, Form } from "react-bootstrap";
import Autocomplete from "../Autocomplete";
import { get, post } from "../../../apis/coreApi";
import { useSettings } from "../../../hooks/useSettings";
import SubFrameTextQuery from "./SubFrameTextQuery";

function TextSearchPanel(props) {
  const s = useSettings();

  const triggerLogTextChange = () => {
    const dispatch = s.dispatch;
    const url = s.coreSettings.api.endpoints.logTextChange.url;

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
      <Row>
        <Col xs={12}>
          <h1 className="panel-title"> Text query</h1>
          <Form className="panel-content text-search-form">
            <Form.Group>
              <div className="text-query">
                <Autocomplete
                  idx="0"
                  isAcOpen={props.isAcOpen}
                  setIsAcOpen={props.setIsAcOpen}
                  inputRef={props.refQuery0}
                  triggerLogTextChange={triggerLogTextChangeThrottled}
                />
                <SubFrameTextQuery  />
              </div>
              <span className="query-joiner"> ... and then ...</span>
              <div className="indented">
                <div className="text-query">
                  <Autocomplete
                    idx="1"
                    isAcOpen={props.isAcOpen}
                    setIsAcOpen={props.setIsAcOpen}
                    inputRef={props.refQuery1}
                    triggerLogTextChange={triggerLogTextChangeThrottled}
                  />
                  <SubFrameTextQuery />
                </div>
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

const actionCreators = {};

export default connect(stateToProps, actionCreators)(TextSearchPanel);
