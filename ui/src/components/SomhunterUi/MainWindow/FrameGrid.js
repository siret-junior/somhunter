import React, { useState } from "react";
import { connect } from "react-redux";

import { Container, Row, Col } from "react-bootstrap";

import config from "../../../config/config";
import Frame from "./Frame";

import { showDisplay } from "../../../actions";
import * as CS from "../../../constants";

function getFrames({ mainWindow }) {
  return mainWindow.frames.map((frame, i) => (
    <Frame key={frame.id + i * Math.pow(2, 32)} frame={frame} />
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
        props.showDisplay(CS.DISP_TYPE_TOP_N, mainWindow.currentPage + 1, 0);
      }
    }
  }
}

function FrameGrid(props) {
  const [prevFetch, setPrevFetch] = useState(new Date().getTime() - 100000);

  const rowClass =
    props.mainWindow.activeDisplay === CS.DISP_TYPE_SOM ? "som" : "";

  return (
    <Container fluid className="p-0">
      <Row
        className={`frame-grid ${rowClass}`}
        noGutters
        onScroll={(e) => {
          handleOnScroll(e, props, prevFetch, setPrevFetch);
        }}
      >
        {getFrames(props)}
      </Row>
    </Container>
  );
}

const stateToProps = ({ mainWindow }) => {
  return { mainWindow };
};

const actionCreators = {
  showDisplay,
};

export default connect(stateToProps, actionCreators)(FrameGrid);
