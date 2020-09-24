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
import { crShowDisplay } from "../../../actions/mainWindowCreator";
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

  const activeDisplay = props.activeDisplay;

  return (
    <Container fluid className="panel main p-0">
      <ControlsPanel>
        <HelpWindow />
        <Col xs={6} className="cont-btn">
          <Button
            variant="secondary"
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
        </Col>
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
        <Col xs={6} className="cont-btn">
          <Button
            variant="primary"
            className="enlarge"
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
        </Col>
        <Col xs={6} className="cont-btn">
          <Button
            className="enlarge"
            variant="primary"
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
        </Col>
      </ControlsPanel>

      <ControlsPanel>
        <Col xs={12} className="cont-btn">
          <Button
            variant="secondary"
            className={activeDisplay === CS.DISP_TYPE_SOM ? "active" : ""}
            onClick={() =>
              props.crShowDisplay(settings, CS.DISP_TYPE_SOM, 0, 0)
            }
          >
            SOM Screen
          </Button>
        </Col>
        <Col xs={6} className="cont-btn">
          <Button
            variant="secondary"
            className={activeDisplay === CS.DISP_TYPE_TOP_N ? "active" : ""}
            onClick={() =>
              props.crShowDisplay(settings, CS.DISP_TYPE_TOP_N, 0, 0)
            }
          >
            Top N
          </Button>
        </Col>
        <Col xs={6} className="cont-btn">
          <Button
            variant="secondary"
            className={
              activeDisplay === CS.DISP_TYPE_TOP_N_CONTEXT ? "active" : ""
            }
            onClick={() =>
              props.crShowDisplay(settings, CS.DISP_TYPE_TOP_N_CONTEXT, 0, 0)
            }
          >
            Top N Context
          </Button>
        </Col>
      </ControlsPanel>

      <HistoryPanel />

      <NotificationPanel />

      <ControlsPanel className="bottom">
        <SettingsWindow />
      </ControlsPanel>
    </Container>
  );
}

const stateToProps = ({ mainWindow }) => {
  return { activeDisplay: mainWindow.activeDisplay };
};

const actionCreators = {
  crShowDisplay,
  createResetSearch,
  createRescore,
  createAddQueryRef,
};

export default connect(stateToProps, actionCreators)(MainPanel);
