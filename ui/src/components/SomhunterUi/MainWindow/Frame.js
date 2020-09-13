import React from "react";
import { connect } from "react-redux";
import { Container, Button, Row, Col } from "react-bootstrap";

import { isOk } from "../../../utils/utils";
import * as CS from "../../../constants";
import coreApi from "../../../apis/coreApi";

import { createShowDisplay } from "../../../actions/mainWindowCreator";

function onLikeHandler(e, onLikeHandler) {
  const frameId = Number(e.target.dataset.frameId);

  // Trigger the handler
  onLikeHandler(frameId);
}

async function onSubmitHandler(props) {
  const frameId = props.id;

  // Create ensure popup
  const res = confirm(`Really submit the frame with ID '${frameId}'`);

  // Quit if false
  if (!res) {
    return;
  }

  console.warn(`Submitting frame '${frameId}'...`);

  let response = null;
  try {
    console.debug("=> onLikeHandler: POST request to '/submit_frame'");

    response = await coreApi.post("/submit_frame", {
      frameId: frameId,
    });

    // Check the response code
    if (!isOk(response.status)) {
      throw Error(
        `=> onLikeHandler: POST request to '/submit_frame' succeeded, but returned unexpected code ${response.status}!`
      );
    }
  } catch (e) {
    console.log(e);
    props.createShowGlobalNotification(
      CS.GLOB_NOTIF_ERR,
      "Core request to '/submit_frame' failed!",
      e.message,
      5000
    );
    return;
  }
}

function Frame(props) {
  let classNameStr = "frame p-0";
  if (props.frame.liked) {
    classNameStr += " liked";
  }

  return (
    <Col
      className={classNameStr}
      onClick={(e) => onLikeHandler(e, props.onLikeHandler)}
      data-frame-id={props.frame.id}
      xs={2}
      style={{ backgroundImage: `url("${props.frame.src}")` }}
    >
      <span className="video-id-label top left">{props.id}</span>
      <Button
        onClick={(e) => {
          onSubmitHandler(this.props);
          e.stopPropagation();
          return;
        }}
        className="top right green"
        variant="success"
      >
        ✓
      </Button>
      <Button
        onClick={(e) => {
          props.createShowDisplay(CS.DISP_TYPE_TOP_KNN, 0, props.frame.id);
          e.stopPropagation();
        }}
        className="bottom left orange"
        variant="secondary"
      >
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

const actionCreators = {
  createShowDisplay,
};

export default connect(stateToProps, actionCreators)(Frame);
