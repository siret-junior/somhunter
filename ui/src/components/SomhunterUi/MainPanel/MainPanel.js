import React, { useState, useRef, useEffect } from "react";
import { connect, useDispatch } from "react-redux";

import { Container, Row, Col, Button } from "react-bootstrap";

import * as CS from "../../../constants";

import ControlsPanel from "./ControlsPanel";
import TextSearchPanel from "./TextSearchPanel";
import HistoryPanel from "./HistoryPanel";
import NotificationPanel from "./NotificationPanel";
import config from "../../../config/config";
import { createShowDisplay } from "../../../actions/mainWindowCreator";
import { createAddQueryRef } from "../../../actions/settingsCreator";
import {
  createResetSearch,
  createRescore,
} from "../../../actions//rescoreCreator";
import HelpWindow from "./HelpWindow";
import SettingsWindow from "./SettingsWindow";

function onTriggerRescoretHandler(dispatch, destDisplay, isAcOpen) {
  // Make sure that autocomplete popup is not shown
  if (!isAcOpen) {
    dispatch(createRescore(destDisplay));
  }
}

function onTriggerResetHandler(
  dispatch,
  destDisplay,
  isAcOpen,
  refQuery0,
  refQuery1
) {
  console.debug("=> onTriggerResetHandler: Reseting the search with params:");

  dispatch(createResetSearch(destDisplay));

  refQuery0.current.value = "";
  refQuery1.current.value = "";
}

function MainPanel(props) {
  const refQuery0 = useRef(null);
  const refQuery1 = useRef(null);

  const [isAcOpen, setIsAcOpen] = useState(false);

  useEffect(() => {
    props.createAddQueryRef(refQuery0);
    props.createAddQueryRef(refQuery1);
  }, []);

  const dispatch = useDispatch();

  return (
    <Container fluid className="panel main p-0">
      <ControlsPanel>
        <HelpWindow />
        <Button
          onClick={() =>
            onTriggerResetHandler(
              dispatch,
              config.frameGrid.defaultRescoreDisplay,
              isAcOpen,
              refQuery0,
              refQuery1
            )
          }
        >
          New search
        </Button>
      </ControlsPanel>

      <TextSearchPanel
        setIsAcOpen={setIsAcOpen}
        refQuery0={refQuery0}
        refQuery1={refQuery1}
        triggerRescore={() =>
          onTriggerRescoretHandler(
            dispatch,
            config.frameGrid.defaultRescoreDisplay,
            isAcOpen
          )
        }
      />

      <ControlsPanel>
        <Button
          onClick={() =>
            onTriggerRescoretHandler(
              dispatch,
              config.frameGrid.defaultRescoreDisplay,
              isAcOpen,
              refQuery0,
              refQuery1
            )
          }
        >
          Rescore to Top N
        </Button>
        <Button
          onClick={() =>
            onTriggerRescoretHandler(
              dispatch,
              CS.DISP_TYPE_SOM,
              isAcOpen,
              refQuery0,
              refQuery1
            )
          }
        >
          Rescore to SOM
        </Button>
      </ControlsPanel>

      <ControlsPanel>
        <Button onClick={() => props.createShowDisplay(CS.DISP_TYPE_SOM, 0, 0)}>
          SOM Screen
        </Button>
        <Button
          onClick={() => props.createShowDisplay(CS.DISP_TYPE_TOP_N, 0, 0)}
        >
          Top N
        </Button>
        <Button
          onClick={() =>
            props.createShowDisplay(CS.DISP_TYPE_TOP_N_CONTEXT, 0, 0)
          }
        >
          Top N Context
        </Button>
      </ControlsPanel>

      <HistoryPanel />

      <NotificationPanel />

      <ControlsPanel>
        <SettingsWindow />
      </ControlsPanel>
    </Container>
  );
}

const stateToProps = (state) => {
  return {};
};

const actionCreators = {
  createShowDisplay,
  createResetSearch,
  createRescore,
  createAddQueryRef,
};

export default connect(stateToProps, actionCreators)(MainPanel);
