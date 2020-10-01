import _ from "lodash";
import React, { useState, useRef, useEffect } from "react";
import { Container, Row } from "react-bootstrap";

// *** Config generated by the Core API ***
import config, { strings } from "../../../__config_generated__.json";
// *** Config generated by the Core API ***

import * as CS from "../../../constants";
import { useSettings } from "../../../hooks/useSettings";
import { get, post } from "../../../apis/coreApi";
import {
  createAddLiked,
  createAddBookmarked,
  createRemoveLiked,
} from "../../../actions/userCreator";
import { crSetQueryChanged } from "../../../actions/indicatorCreator";

import Frame from "./Frame";

async function onLikeHandler(s, props, gridElRef, frameId) {
  const dispatch = s.dispatch;
  const url = config.api.endpoints.searchLike.post.url;

  const reqData = {
    frameId: frameId,
  };

  const response = await post(dispatch, url, reqData);

  // Set query changed flag
  dispatch(crSetQueryChanged(s, true));

  // {
  //   id: number;
  //   liked: bool;
  //   sId: number;
  //   vId: number;
  //   src: string;

  // }

  // Flag ALL the frames accrodingly
  const grid = gridElRef.current;
  if (response.data.isLiked) {
    const fs = grid.querySelectorAll(`[data-frame-id="${frameId}"]`);

    fs.forEach((x) => x.classList.add("liked"));

    dispatch(
      createAddLiked(s, {
        id: frameId,
        liked: true,
        sId: null,
        vId: null,
        src: fs[0].src,
      })
    );
  } else {
    const fs = grid.querySelectorAll(`[data-frame-id="${frameId}"]`);

    fs.forEach((x) => x.classList.remove("liked"));

    dispatch(createRemoveLiked(s, frameId));
  }
}

function getFrames(s, props, gridEl) {
  return props.mainWindow.frames.map((frame, i) => (
    <Frame
      isPivot={frame.id === props.mainWindow.pivotFrameId}
      onLikeHandler={(frameId) => onLikeHandler(s, props, gridEl, frameId)}
      key={frame.id + i * Math.pow(2, 32)}
      frame={frame}
      replayGridRef={props.replayGridRef}
    />
  ));
}

function handleOnScroll(settings, e, props, prevFetch, setPrevFetch) {
  const tarEl = e.target;
  const diff = tarEl.scrollHeight - tarEl.scrollTop - tarEl.clientHeight;

  if (diff < config.ui.frameGrid.infiniteScrollThreshold) {
    const mainWindow = props.mainWindow;
    if (
      mainWindow.activeDisplay === CS.DISP_TYPE_TOP_N ||
      mainWindow.activeDisplay === CS.DISP_TYPE_TOP_N_CONTEXT ||
      mainWindow.activeDisplay === CS.DISP_TYPE_TOP_KNN
    ) {
      const t = new Date().getTime();
      if (prevFetch + config.ui.frameGrid.infiniteScrollTimeout < t) {
        setPrevFetch(t);
        props.crShowDisplay(
          settings,
          mainWindow.activeDisplay,
          mainWindow.currentPage + 1,
          0
        );
      }
    }
  }
}

function calcReplayLeftOffset(gridElRef, pivotFrameId, deltaX = 0) {
  const gridEl = gridElRef.current;
  if (typeof gridEl === "undefined") {
    return 0;
  }

  // Find children elements by data value
  const targetEl = gridEl.querySelector(`[data-frame-id='${pivotFrameId}']`);
  if (!targetEl) {
    return 0;
  }

  const viewportWidth = window.innerWidth;

  const offsetToParent = targetEl.offsetLeft;
  const unitWidth = targetEl.clientWidth;
  const leftOffset = -offsetToParent + viewportWidth / 2 + deltaX * unitWidth;

  return leftOffset;
}

function FrameGrid(props) {
  const [prevFetch, setPrevFetch] = useState(new Date().getTime() - 100000);
  const scrollYRef = useRef(0);

  const settings = useSettings();
  const coreEndpoints = config.api.endpoints;

  // Recalculate offset of the grid after each re-render
  useEffect(() => {
    if (typeof props.mainWindow.deltaX !== "undefined") {
      const left = calcReplayLeftOffset(
        props.gridRef,
        props.mainWindow.pivotFrameId,
        props.mainWindow.deltaX
      );

      props.gridRef.current.style.left = `${left}px`;
    }
  });

  let rowClass =
    props.mainWindow.activeDisplay === CS.DISP_TYPE_SOM ? "som" : "";

  const _onScrollFn = (e) => {
    handleOnScroll(settings, e, props, prevFetch, setPrevFetch);
  };

  const triggerLogs = (s, props, e, prevScrollY) => {
    const dispatch = s.dispatch;

    const scrollY = e.target.scrollTop;
    const delta = prevScrollY.current + scrollY;

    prevScrollY.current = scrollY;

    let params = {
      scrollArea: props.mainWindow.activeDisplay,
      frameId: props.mainWindow.pivotFrameId,
      delta: delta,
    };

    if (typeof props.mainWindow.activeDisplay === "undefined") {
      params.scrollArea = CS.DISP_TYPE_DETAIL;
    }

    get(dispatch, coreEndpoints.logBrowsingScroll.get.url, { params });
  };

  let onScrollFnThrottled = _.throttle(_onScrollFn, 1000);
  let onScrollTriggerLogsThrottled = _.throttle(
    triggerLogs,
    config.core.submitter_config.log_action_timeout
  );

  if (typeof props.mainWindow.activeDisplay === "undefined") {
    rowClass = "detail";
    onScrollFnThrottled = (e) => null;
  }

  return (
    <Container fluid className="p-0">
      <Row
        id={props.id}
        ref={props.gridRef}
        className={`frame-grid ${rowClass}`}
        onScroll={(e) => {
          e.persist();
          onScrollFnThrottled(e);
          onScrollTriggerLogsThrottled(settings, props, e, scrollYRef);
        }}
        noGutters
      >
        {getFrames(settings, props, props.gridRef)}
      </Row>
    </Container>
  );
}

export default FrameGrid;
