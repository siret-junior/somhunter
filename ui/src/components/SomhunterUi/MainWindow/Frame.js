import _ from "lodash";
import React from "react";
import { connect } from "react-redux";
import { Button, Row, Col } from "react-bootstrap";
import { AiFillStar } from "react-icons/ai";
import { GiMagnifyingGlass } from "react-icons/gi";

// *** Config generated by the Core API ***
import config from "../../../__config_generated__.json";
// *** Config generated by the Core API ***

import * as CS from "../../../constants";
import { get, post } from "../../../apis/coreApi";
import { useSettings } from "../../../hooks/useSettings";

import { crSuccNotif } from "../../../actions/notificationCreator";
import { crShowDisplay } from "../../../actions/mainWindowCreator";
import { createShowDetailWindow } from "../../../actions/detailWindowCreator";

import { createShowZoomWindow } from "../../../actions/zoomWindowCreator";
import {
  createShowReplayWindow,
  createScrollReplayWindow,
} from "../../../actions/replaylWindowCreator";

import { createFetchAndAddBookmarked } from "../../../actions/userCreator";

function onLikeHandler(s, props, e, onLikeHandlerExt) {
  if (typeof onLikeHandlerExt === "undefined") return;

  const frameId = Number(e.currentTarget.dataset.frameId);

  // Trigger the handler
  onLikeHandlerExt(frameId);
}

async function onSubmitHandler(s, props) {
  const dispatch = s.dispatch;
  const frameId = props.frame.id;

  // Create ensure popup
  const r = window.confirm(`Really submit the frame with ID '${frameId}'`);
  if (!r) {
    return;
  }

  const url = config.api.endpoints.serverSubmitFrame.post.url;
  const reqData = {
    frameId,
  };

  // << Core API >>
  const res = await post(dispatch, url, reqData);
  // << Core API >>

  if (res === null) return;

  // Create success notification
  dispatch(crSuccNotif(s, `A frame '${frameId} has been submitted.`, "", 5000));
}

const triggerLogs = (s, props, e, frameId, delta) => {
  const dispatch = s.dispatch;
  const url = config.api.endpoints.logBrowsingScroll.get.url;

  let params = {
    scrollArea: CS.DISP_TYPE_REPLAY,
    frameId: frameId,
    delta: -delta, // + means forward in time so we invert
  };

  // << Core API >>
  get(dispatch, url, { params });
  // << Core API >>
};

const triggerLogsThrottled = _.throttle(
  triggerLogs,
  config.core.submitter_config.log_action_timeout
);

function calcReplayLeftOffset(gridEl, pivotFrameId, deltaX = 0) {
  if (typeof gridEl === "undefined") {
    return 0;
  }

  const currOffset = parseInt(gridEl.state.scrollLeft);
  const unitWidth = 200;
  const leftOffset = currOffset + deltaX * unitWidth;

  return leftOffset;
}

function onWheellHandler(settings, props, e) {
  const frameId = props.frame.id;

  // If SHIFT key down
  if (e.shiftKey) {
    // If just a scroll
    if (props.replayWindow.pivotFrameId === frameId) {
      const delta = e.deltaY > 0 ? -1 : 1;

      triggerLogsThrottled(settings, props, e, frameId, delta);

      const gridEl = props.replayGridRef.current;
      if (gridEl != null) {
        const left = Math.min(
          Math.floor(gridEl.props.columnCount * gridEl.props.columnWidth - gridEl.props.width),
          calcReplayLeftOffset(gridEl, frameId, delta)
        );
        //gridEl.state.scrollLeft = left;
        gridEl.scrollToPosition({ scrollLeft: left, scrollTop: gridEl.state.scrollTop });
      } else {
        console.error("gridEl is null => no scrolling in replay window!");
      }

      // \todo This seems too slow
      //props.createScrollReplayWindow(settings, delta);
    }
    // Else new frame ID
    else {
      const vpW = window.innerWidth;
      const vpH = window.innerHeight;

      const cursorPos = { x: e.clientX / vpW, y: e.clientY / vpH };
      props.createShowReplayWindow(settings, frameId, cursorPos);
    }
  }
}

const weedaysString = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function Frame(props) {
  const settings = useSettings();

  let classNameStr = "frame p-0";
  if (props.frame.liked) {
    classNameStr += " liked";
  }
  if (props.isPivot) {
    classNameStr += " pivot";
  }

  let style = {
    backgroundImage: `url("${config.ui.media.thumbsPathPrefix}${props.frame.src}")`,
  };
  if (props.style != undefined)
    style = {
      ...props.style,
      backgroundImage: `url("${config.ui.media.thumbsPathPrefix}${props.frame.src}")`,
    };

  if (props.frame.src === "")
    return <Col className={classNameStr + " no-frame"} xs={2}></Col>;
  else
    return (
      <Col
        className={classNameStr}
        onClick={(e) => onLikeHandler(settings, props, e, props.onLikeHandler)}
        onWheel={(e) => {
          e.persist();
          onWheellHandler(settings, props, e);
        }}
        data-frame-id={props.frame.id}
        xs={2}
        style={style}
      >
        <div className="frame-debug-hover">
          <p>
            <span>ID:</span> {props.frame.id}
          </p>
          <p>
            <span>Video ID:</span> {props.frame.vId}
          </p>
          <p>
            <span>Shot ID</span>: {props.frame.sId}
          </p>
          <p>
            <span>Hour:</span> {props.frame.hour}
          </p>
          <p>
            <span>Weekday:</span> {weedaysString[props.frame.weekday]}
          </p>
        </div>

        <span className="video-id-label top left">{props.frame.vId}</span>
        <Button
          onClick={(e) => {
            props.createFetchAndAddBookmarked(settings, props.frame);
            e.stopPropagation();
            return;
          }}
          className="bookmark top left"
        >
          <AiFillStar />
        </Button>

        <Button
          onClick={(e) => {
            settings.dispatch(createShowZoomWindow(settings, props.frame));
            e.stopPropagation();
            return;
          }}
          className="zoom-btn top y-n1 left"
        >
          <GiMagnifyingGlass />
        </Button>

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
  createFetchAndAddBookmarked,
  createShowZoomWindow,
};

export default connect(stateToProps, actionCreators)(Frame);
