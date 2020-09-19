import React, { useState, useRef, useEffect } from "react";
import _ from "lodash";

import { Container, Row, Col } from "react-bootstrap";

import config from "../../../config/config";
import * as CS from "../../../constants";
import { isErrDef } from "../../../utils/utils";
import { dispNameToAction } from "../../../constants";
import { useSettings } from "../../../hooks/useSettings";
import coreApi from "../../../apis/coreApi";

import Frame from "./Frame";

async function onLikeHandler(props, gridElRef, frameId) {
  let response = null;
  try {
    console.debug("=> onLikeHandler: POST request to '/like_frame'");

    response = await coreApi.post("/like_frame", {
      frameId: frameId,
    });
  } catch (e) {
    const msg = isErrDef(e) ? e.response.data.error.message : e.message;

    props.createNotif(
      CS.GLOB_NOTIF_ERR,
      "Core request to '/like_frame' failed!",
      msg,
      5000
    );
    return;
  }

  console.warn(`isLiked = ${response.data.isLiked}`);

  const grid = gridElRef.current;
  if (response.data.isLiked)
    grid
      .querySelectorAll(`[data-frame-id="${frameId}"]`)
      .forEach((x) => x.classList.add("liked"));
  else
    grid
      .querySelectorAll(`[data-frame-id="${frameId}"]`)
      .forEach((x) => x.classList.remove("liked"));

  console.debug("=> onLikeHandler: Got response:", response);
}

function getFrames(props, gridEl) {
  return props.mainWindow.frames.map((frame, i) => (
    <Frame
      isPivot={frame.id === props.mainWindow.pivotFrameId}
      onLikeHandler={(frameId) => onLikeHandler(props, gridEl, frameId)}
      key={frame.id + i * Math.pow(2, 32)}
      frame={frame}
    />
  ));
}

function handleOnScroll(settings, e, props, prevFetch, setPrevFetch) {
  const tarEl = e.target;
  const diff = tarEl.scrollHeight - tarEl.scrollTop - tarEl.clientHeight;

  if (diff < config.frameGrid.infiniteScrollThreshold) {
    const mainWindow = props.mainWindow;
    if (
      mainWindow.activeDisplay === CS.DISP_TYPE_TOP_N ||
      mainWindow.activeDisplay === CS.DISP_TYPE_TOP_N_CONTEXT ||
      mainWindow.activeDisplay === CS.DISP_TYPE_TOP_KNN
    ) {
      const t = new Date().getTime();
      if (prevFetch + config.frameGrid.infiniteScrollTimeout < t) {
        setPrevFetch(t);

        console.debug(`handleOnScroll: DIFF = ${diff} => Loading next page`);
        props.createShowDisplay(
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
  console.debug(
    `=> scrollReplayWindow: Scrolling to the pivot frame ID '${pivotFrameId}'...`
  );

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
  console.info(`offsetToParent = ${offsetToParent}`);
  console.info(`deltaX = ${deltaX}`);
  const unitWidth = targetEl.clientWidth;
  const leftOffset = -offsetToParent + viewportWidth / 2 + deltaX * unitWidth;

  console.info(`leftOffset = ${leftOffset}`);
  return leftOffset;
}

function FrameGrid(props) {
  const [prevFetch, setPrevFetch] = useState(new Date().getTime() - 100000);

  const settings = useSettings();

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

  let onScrollFnThrottled = _.throttle(_onScrollFn, 500);

  if (typeof props.mainWindow.activeDisplay === "undefined") {
    rowClass = "detail";
    onScrollFnThrottled = null;
  }

  return (
    <Container fluid className="p-0">
      <Row
        ref={props.gridRef}
        className={`frame-grid ${rowClass}`}
        onScroll={(e) => {
          e.persist();
          onScrollFnThrottled(e);
        }}
        noGutters
      >
        {getFrames(props, props.gridRef)}
      </Row>
    </Container>
  );
}

export default FrameGrid;
