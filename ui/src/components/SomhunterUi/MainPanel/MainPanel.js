import React, { useState, useRef, useEffect } from "react";
import { connect, useDispatch } from "react-redux";

import { Container, Row, Col, Button } from "react-bootstrap";

import config from "../../../config/config";
import * as CS from "../../../constants";
import { useSettings } from "../../../hooks/useSettings";

import ControlsPanel from "./ControlsPanel";
import TextSearchPanel from "./TextSearchPanel";
import HistoryPanel from "./HistoryPanel";
import NotificationPanel from "./NotificationPanel";
import { createShowDisplay } from "../../../actions/mainWindowCreator";
import { createAddQueryRef } from "../../../actions/settingsCreator";
import {
  createResetSearch,
  createRescore,
} from "../../../actions//rescoreCreator";
import HelpWindow from "./HelpWindow";
import SettingsWindow from "./SettingsWindow";

function onTriggerRescoretHandler(settings, destDisplay, isAcOpen) {
  const dispatch = settings.dispatch;

  // Make sure that autocomplete popup is not shown
  if (!isAcOpen) {
    dispatch(createRescore(settings, destDisplay));
  }
}

function onTriggerResetHandler(
  settings,
  destDisplay,
  isAcOpen,
  refQuery0,
  refQuery1
) {
  console.debug("=> onTriggerResetHandler: Reseting the search with params:");

  const dispatch = settings.dispatch;

  dispatch(createResetSearch(settings, destDisplay));

  refQuery0.current.value = "";
  refQuery1.current.value = "";
}

function MainPanel(props) {
  const settings = useSettings();

  const refQuery0 = useRef(null);
  const refQuery1 = useRef(null);

  const [isAcOpen, setIsAcOpen] = useState(false);

  useEffect(() => {
    props.createAddQueryRef(settings, refQuery0);
    props.createAddQueryRef(settings, refQuery1);
  }, []);

  return (
    <Container fluid className="panel main p-0">
      <ControlsPanel>
        <HelpWindow />
        <Button
          onClick={() =>
            onTriggerResetHandler(
              settings,
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
        isAcOpen={isAcOpen}
        refQuery0={refQuery0}
        refQuery1={refQuery1}
        triggerRescore={() =>
          onTriggerRescoretHandler(
            settings,
            config.frameGrid.defaultRescoreDisplay,
            isAcOpen
          )
        }
      />

      <ControlsPanel>
        <Button
          onClick={() =>
            onTriggerRescoretHandler(
              settings,
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
              settings,
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
        <Button
          onClick={() =>
            props.createShowDisplay(settings, CS.DISP_TYPE_SOM, 0, 0)
          }
        >
          SOM Screen
        </Button>
        <Button
          onClick={() =>
            props.createShowDisplay(settings, CS.DISP_TYPE_TOP_N, 0, 0)
          }
        >
          Top N
        </Button>
        <Button
          onClick={() =>
            props.createShowDisplay(settings, CS.DISP_TYPE_TOP_N_CONTEXT, 0, 0)
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
