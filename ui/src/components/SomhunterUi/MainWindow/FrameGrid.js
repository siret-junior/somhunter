import React, { useState, useRef } from "react";
import { connect } from "react-redux";

import { Container, Row, Col } from "react-bootstrap";

import config from "../../../config/config";
import * as CS from "../../../constants";
import { isOk } from "../../../utils/utils";

import coreApi from "../../../apis/coreApi";
import { createShowGlobalNotification } from "../../../actions/notificationCreator";
import { createShowDisplay } from "../../../actions/mainWindowCreator";

import Frame from "./Frame";

async function onLikeHandler(props, gridElRef, frameId) {
  let response = null;
  try {
    console.debug("=> onLikeHandler: POST request to '/like_frame'");

    response = await coreApi.post("/like_frame", {
      frameId: frameId,
    });

    // Check the response code
    if (!isOk(response.status)) {
      throw Error(
        `=> onLikeHandler: POST request to '/like_frame' succeeded, but returned unexpected code ${response.status}!`
      );
    }
  } catch (e) {
    console.log(e);
    props.createShowGlobalNotification(
      CS.GLOB_NOTIF_ERR,
      "Core request to '/like_frame' failed!",
      e.message,
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
      onLikeHandler={(frameId) => onLikeHandler(props, gridEl, frameId)}
      key={frame.id + i * Math.pow(2, 32)}
      frame={frame}
    />
  ));
}

function handleOnScroll(e, props, prevFetch, setPrevFetch) {
  const tarEl = e.target;
  const diff = tarEl.scrollHeight - tarEl.scrollTop - tarEl.clientHeight;
  const mainWindow = props.mainWindow;
  if (
    mainWindow.activeDisplay === CS.DISP_TYPE_TOP_N ||
    mainWindow.activeDisplay === CS.DISP_TYPE_TOP_N_CONTEXT
  ) {
    const t = new Date().getTime();
    if (prevFetch + config.frameGrid.infiniteScrollTimeout < t) {
      setPrevFetch(t);

      if (diff < config.frameGrid.infiniteScrollThreshold) {
        console.debug(`handleOnScroll: DIFF = ${diff} => Loading next page`);
        props.createShowDisplay(
          CS.DISP_TYPE_TOP_N,
          mainWindow.currentPage + 1,
          0
        );
      }
    }
  }
}

function FrameGrid(props) {
  const [prevFetch, setPrevFetch] = useState(new Date().getTime() - 100000);
  const grid = useRef();

  const rowClass =
    props.mainWindow.activeDisplay === CS.DISP_TYPE_SOM ? "som" : "";

  return (
    <Container fluid className="p-0">
      <Row
        ref={grid}
        className={`frame-grid ${rowClass}`}
        noGutters
        onScroll={(e) => {
          handleOnScroll(e, props, prevFetch, setPrevFetch);
        }}
      >
        {getFrames(props, grid)}
      </Row>
    </Container>
  );
}

const stateToProps = ({ mainWindow }) => {
  return { mainWindow };
};

const actionCreators = {
  createShowDisplay,
  createShowGlobalNotification,
};

export default connect(stateToProps, actionCreators)(FrameGrid);
