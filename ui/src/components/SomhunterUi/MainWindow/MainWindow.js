import React, { useRef, useState } from "react";
import { connect } from "react-redux";

import { Container, Row, Col } from "react-bootstrap";

import {
  createHideDetailWindow,
  createShowDetailWindow,
} from "../../../actions/detailWindowCreator";
import { crNotif } from "../../../actions/notificationCreator";
import { createHideReplayWindow } from "../../../actions/replaylWindowCreator";
import { createHideZoomWindow } from "../../../actions/zoomWindowCreator";

import { crShowDisplay } from "../../../actions/mainWindowCreator";

import FrameGrid from "./FrameGrid";
import DetailWindow from "./DetailWindow";
import ReplayWindow from "./ReplayWindow";
import ZoomWindow from "./ZoomWindow";

function scrollToPivot(gridElRef, pivotFrameId) {
  const gridEl = gridElRef.current;

  // Find children elements by data value
  const targetEl = gridEl.querySelector(`[data-frame-id='${pivotFrameId}']`);

  // Get scroll of element relative to the parent
  const offsetToParent =
    targetEl.getBoundingClientRect().top -
    targetEl.offsetParent.getBoundingClientRect().top;

  // Scroll to element in the div
  gridEl.scroll({
    top: offsetToParent,
    left: 0,
    behavior: "smooth",
  });
}

function MainWindow(props) {
  // Pointer to the detail frame grid
  const detailGridElRef = useRef();
  const replayGridElRef = useRef();

  // Pointer to the main screen frame grid
  const mainGridElRef = useRef();

  let replayWindowStyles = { top: "0", bottom: "initial" };
  if (
    typeof props.replayWindow.cursorPos !== "undefined" &&
    props.replayWindow.cursorPos !== null &&
    props.replayWindow.cursorPos.y < 0.5
  ) {
    replayWindowStyles = { top: "initial", bottom: "0" };
  }

  return (
    <Container fluid className="main-window window p-0">
      <FrameGrid
        id="mainGrid"
        gridRef={mainGridElRef}
        crShowDisplay={props.crShowDisplay}
        mainWindow={props.mainWindow}
        replayGridRef={replayGridElRef}
      />

      <DetailWindow
        show={props.detailWindow.show}
        onShow={() =>
          scrollToPivot(detailGridElRef, props.detailWindow.pivotFrameId)
        }
        onHide={() => props.createHideDetailWindow()}
      >
        <FrameGrid
          id="detailGrid"
          gridRef={detailGridElRef}
          mainWindow={props.detailWindow}
          replayGridRef={replayGridElRef}
        />
      </DetailWindow>

      <ReplayWindow
        show={props.replayWindow.show}
        styles={replayWindowStyles}
        onShow={() => null}
        onHide={() => props.createHideReplayWindow()}
      >
        <FrameGrid
          id="replayGrid"
          gridRef={replayGridElRef}
          mainWindow={props.replayWindow}
          replayGridRef={replayGridElRef}
        />
      </ReplayWindow>

      <ZoomWindow
        show={props.zoomWindow.show}
        onShow={() => null}
        onHide={() => props.createHideZoomWindow()}
        src={props.zoomWindow.src}
        id={props.zoomWindow.id}
      />
    </Container>
  );
}

const stateToProps = (state) => {
  return {
    detailWindow: state.detailWindow,
    replayWindow: state.replayWindow,
    mainWindow: state.mainWindow,
    zoomWindow: state.zoomWindow,
  };
};

const actionCreators = {
  createHideDetailWindow,
  createShowDetailWindow,
  crShowDisplay,
  crNotif,
  createHideReplayWindow,
  createHideZoomWindow,
};

export default connect(stateToProps, actionCreators)(MainWindow);
