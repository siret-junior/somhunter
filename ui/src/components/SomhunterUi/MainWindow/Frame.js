import React, { useContext } from "react";
import { connect } from "react-redux";
import _ from "lodash";
import { Container, Button, Row, Col } from "react-bootstrap";

import * as CS from "../../../constants";
import { isErrDef } from "../../../utils/utils";
import coreApi from "../../../apis/coreApi";
import { useSettings } from "../../../hooks/useSettings";

import { createNotif } from "../../../actions/notificationCreator";
import { createShowDisplay } from "../../../actions/mainWindowCreator";
import { createShowDetailWindow } from "../../../actions/detailWindowCreator";
import {
  createShowReplayWindow,
  createScrollReplayWindow,
} from "../../../actions/replaylWindowCreator";

function onLikeHandler(settings, props, e, onLikeHandler) {
  const frameId = Number(e.target.dataset.frameId);

  // Trigger the handler
  onLikeHandler(frameId);
}

async function onSubmitHandler(settings, props) {
  const frameId = props.frame.id;

  // Create ensure popup
  const res = window.confirm(`Really submit the frame with ID '${frameId}'`);

  // Quit if false
  if (!res) {
    return;
  }

  console.warn(`Submitting frame '${frameId}'...`);

  try {
    console.debug("=> onLikeHandler: POST request to '/submit_frame'");

    await coreApi.post("/submit_frame", {
      frameId: frameId,
    });
  } catch (e) {
    const msg = isErrDef(e) ? e.response.data.error.message : e.message;
    props.createNotif(
      settings,
      CS.GLOB_NOTIF_ERR,
      "Core request to '/submit_frame' failed!",
      msg,
      5000
    );
    return;
  }

  // Create success notification
  props.createNotif(
    settings,
    CS.GLOB_NOTIF_SUCC,
    `A frame with the ID '${frameId} was submitted.`,
    "",
    5000
  );
}

function onWheellHandler(settings, props, e) {
  e.stopPropagation();

  const frameId = props.frame.id;

  // If SHIFT key down
  if (e.shiftKey) {
    // If just a scroll
    if (props.replayWindow.pivotFrameId === frameId) {
      const delta = e.deltaY > 0 ? -1 : 1;
      console.log(
        `Showing replay through frame '${frameId}' with delta=${delta}...`
      );
      props.createScrollReplayWindow(settings, delta);
    }
    // Else new frame ID
    else {
      console.log(`Scrolling replay through NEW frame '${frameId}'...`);

      const vpW = window.innerWidth;
      const vpH = window.innerHeight;

      const cursorPos = { x: e.clientX / vpW, y: e.clientY / vpH };
      props.createShowReplayWindow(settings, frameId, cursorPos);
    }
  }
}

const onWheelHandlerThrottled = _.throttle(onWheellHandler, 100);

function Frame(props) {
  const settings = useSettings();

  let classNameStr = "frame p-0";
  if (props.frame.liked) {
    classNameStr += " liked";
  }
  if (props.isPivot) {
    classNameStr += " pivot";
  }

  if (props.frame.src === "")
    return <Col className={classNameStr + " no-frame"} xs={2}></Col>;
  else
    return (
      <Col
        className={classNameStr}
        onClick={(e) => onLikeHandler(settings, props, e, props.onLikeHandler)}
        onWheel={(e) => {
          e.persist();
          onWheelHandlerThrottled(settings, props, e);
        }}
        data-frame-id={props.frame.id}
        xs={2}
        style={{ backgroundImage: `url("${props.frame.src}")` }}
      >
        <span className="video-id-label top left">{props.frame.id}</span>
        <Button
          onClick={(e) => {
            onSubmitHandler(settings, props);
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
            props.createShowDisplay(
              settings,
              CS.DISP_TYPE_TOP_KNN,
              0,
              props.frame.id
            );
            e.stopPropagation();
          }}
          className="bottom left orange"
          variant="secondary"
        >
          KNN
        </Button>
        <Button
          onClick={(e) => {
            props.createShowDetailWindow(settings, props.frame.id);
            e.stopPropagation();
          }}
          className="bottom right blue"
          variant="primary"
        >
          Detail
        </Button>
      </Col>
    );
}

const stateToProps = (state) => {
  return { replayWindow: { pivotFrameId: state.replayWindow.pivotFrameId } };
};

const actionCreators = {
  createShowDisplay,
  createShowDetailWindow,
  createNotif,
  createShowReplayWindow,
  createScrollReplayWindow,
};

export default connect(stateToProps, actionCreators)(Frame);
