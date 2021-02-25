import _ from "lodash";
import React, { useState, useRef } from "react";
import { connect } from "react-redux";

// *** Config generated by the Core API ***
import config from "../../../__config_generated__.json";
// *** Config generated by the Core API ***

import { crSetCollageChanged } from "../../../actions/indicatorCreator";

import { Container, Row, Col, Form } from "react-bootstrap";
import { get, post } from "../../../apis/coreApi";
import { useSettings } from "../../../hooks/useSettings";
import TextSearchInput from "./TextSearchInput";

function onClickCanvasHandler(el, canv0, canv1) {
  canv0.current.classList.remove("paste-active");
  canv1.current.classList.remove("paste-active");
  el.classList.add("paste-active");
}

function CollageSearchPanel(props) {
  const s = useSettings();

  const collagePanel = useRef();
  const collageCanvas0Ref = useRef();
  const collageCanvas1Ref = useRef();

  return (
    <div className="collage-search small-12 cell"
    style={{display: props.visible ? "block" : "none" }}>
      <div id="collageTemporalQueries" ref={collagePanel}>
        <div className="canvas-wrapper">
          <div
            id="collageQuery0"
            onClick={(e) =>
              onClickCanvasHandler(
                e.currentTarget,
                collageCanvas0Ref,
                collageCanvas1Ref
              )
            }
            className="collage-canvas paste-active"
            ref={collageCanvas0Ref}
          >
            {" "}
          </div>
        </div>
        <p className="inter-query-text"> ... and then ...</p>
        <div className="canvas-wrapper">
          <div
            id="collageQuery1"
            onClick={(e) =>
              onClickCanvasHandler(
                e.currentTarget,
                collageCanvas0Ref,
                collageCanvas1Ref
              )
            }
            className="collage-canvas"
            ref={collageCanvas1Ref}
          >
            {" "}
          </div>
        </div>
      </div>
    </div>
  );
}

const stateToProps = (state) => {
  return {};
};

const actionCreators = {};

export default connect(stateToProps, actionCreators)(CollageSearchPanel);