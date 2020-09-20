import _ from "lodash";
import React from "react";
import { connect } from "react-redux";
import { Button, Row, Col } from "react-bootstrap";

import * as CS from "../../../constants";
import { get, post } from "../../../apis/coreApi";
import { useSettings } from "../../../hooks/useSettings";

import { crSuccNotif } from "../../../actions/notificationCreator";
import { crShowDisplay } from "../../../actions/mainWindowCreator";
import { createShowDetailWindow } from "../../../actions/detailWindowCreator";
import {
  createShowReplayWindow,
  createScrollReplayWindow,
} from "../../../actions/replaylWindowCreator";

function onLikeHandler(s, props, e, onLikeHandlerExt) {
  const frameId = Number(e.currentTarget.dataset.frameId);

  console.info(`Liking a frame '${frameId}'`);

  // Trigger the handler
  onLikeHandlerExt(frameId);
}

async function onSubmitHandler(s, props) {
  const dispatch = s.dispatch;
  const frameId = props.frame.id;

  // Create ensure popup
  const res = window.confirm(`Really submit the frame with ID '${frameId}'`);
  if (!res) {
    return;
  }

  console.info(`Submitting frame '${frameId}'...`);

  const url = s.coreSettings.api.endpoints.serverSubmitFrame.url;
  const reqData = {
    frameId,
  };

  // << Core API >>
  await post(dispatch, url, reqData);
  // << Core API >>

  // Create success notification
  dispatch(crSuccNotif(s, `A frame '${frameId} has been submitted.`, "", 5000));
}

const triggerLogs = (s, props, e, frameId, delta) => {
  const dispatch = s.dispatch;
  const url = s.coreSettings.api.endpoints.logBrowsingScroll.url;

  let params = {
    scrollArea: CS.DISP_TYPE_REPLAY,
    frameId: frameId,
    delta: -delta, // + means forward in time so we invert
  };

  // << Core API >>
  get(dispatch, url, { params });
  // << Core API >>
};

function onWheellHandler(settings, props, e) {
  e.stopPropagation();

  const frameId = props.frame.id;

  // If SHIFT key down
  if (e.shiftKey) {
    // If just a scroll
    if (props.replayWindow.pivotFrameId === frameId) {
      const triggerLogsThrottled = _.throttle(
        triggerLogs,
        settings.coreSettings.core.submitter_config.log_action_timeout
      );

      const delta = e.deltaY > 0 ? -1 : 1;

      triggerLogsThrottled(settings, props, e, frameId, delta);

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
            props.crShowDisplay(
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
  crShowDisplay,
  createShowDetailWindow,
  createShowReplayWindow,
  createScrollReplayWindow,
};

export default connect(stateToProps, actionCreators)(Frame);
