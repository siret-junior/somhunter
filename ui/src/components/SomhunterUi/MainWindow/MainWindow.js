import React, { useRef, useState } from "react";
import { connect } from "react-redux";

import { Container, Row, Col } from "react-bootstrap";

import {
  createHideDetailWindow,
  createShowDetailWindow,
} from "../../../actions/detailWindowCreator";
import { createShowGlobalNotification } from "../../../actions/notificationCreator";
import { createHideReplayWindow } from "../../../actions/replaylWindowCreator";
import { createShowDisplay } from "../../../actions/mainWindowCreator";

import FrameGrid from "./FrameGrid";
import DetailWindow from "./DetailWindow";
import ReplayWindow from "./ReplayWindow";

function scrollToPivot(gridElRef, pivotFrameId) {
  console.debug(
    `=> scrollToPivot: Scrolling to the pivot frame ID '${pivotFrameId}'...`
  );

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

function scrollReplayWindow(setReplayLeft, gridElRef, pivotFrameId, deltaX = 0) {
  console.debug(
    `=> scrollReplayWindow: Scrolling to the pivot frame ID '${pivotFrameId}'...`
  );

  const gridEl = gridElRef.current;

  // Find children elements by data value
  const targetEl = gridEl.querySelector(`[data-frame-id='${pivotFrameId}']`);

  const viewportWidth = window.innerWidth;

  const offsetToParent = targetEl.offsetLeft;
  console.info(`offsetToParent = ${offsetToParent}`);
  console.info(`deltaX = ${deltaX}`);
  const unitWidth = targetEl.clientWidth;
  const leftOffset = -offsetToParent + (viewportWidth / 2) + (deltaX * unitWidth);
  console.info(`leftOffset = ${leftOffset}`);
  setReplayLeft(leftOffset);
}

function MainWindow(props) {
  // Pointer to the detail frame grid
  const detailGridElRef = useRef();
  const replayGridElRef = useRef();

  // Pointer to the main screen frame grid
  const mainGridElRef = useRef();

  const [replayLeft, setReplayLeft] = useState(0);

  return (
    <Container fluid className="main-window window p-0">
      <FrameGrid
        gridRef={mainGridElRef}
        createShowDisplay={props.createShowDisplay}
        mainWindow={props.mainWindow}
      />

      <DetailWindow
        show={props.detailWindow.show}
        onShow={() =>
          scrollToPivot(detailGridElRef, props.detailWindow.pivotFrameId)
        }
        onHide={() => props.createHideDetailWindow()}
      >
        <FrameGrid gridRef={replayGridElRef} mainWindow={props.detailWindow} />
      </DetailWindow>

      <ReplayWindow
        show={props.replayWindow.show}
        onShow={() => scrollReplayWindow(setReplayLeft, replayGridElRef, props.replayWindow.pivotFrameId, 0) }
        onHide={() => props.createHideReplayWindow()}
      >
        <FrameGrid leftOffset={replayLeft} gridRef={replayGridElRef} mainWindow={props.replayWindow} />
      </ReplayWindow>
    </Container>
  );
}

const stateToProps = (state) => {
  return {
    detailWindow: state.detailWindow,
    replayWindow: state.replayWindow,
    mainWindow: state.mainWindow,
  };
};

const actionCreators = {
  createHideDetailWindow,
  createShowDetailWindow,
  createShowDisplay,
  createShowGlobalNotification,
  createHideReplayWindow,
};

export default connect(stateToProps, actionCreators)(MainWindow);
