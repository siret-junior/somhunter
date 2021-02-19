import React, { useState, useRef, useEffect } from "react";
import { connect, useDispatch } from "react-redux";

import { Container, Row, Col, Button } from "react-bootstrap";

// *** Config generated by the Core API ***
import config, { strings } from "../../../__config_generated__.json";
// *** Config generated by the Core API ***

import * as CS from "../../../constants";
import { useSettings } from "../../../hooks/useSettings";

import ControlsPanel from "./ControlsPanel";
import TextSearchPanel from "./TextSearchPanel";
import HistoryPanel from "./HistoryPanel";
import NotificationPanel from "./NotificationPanel";
import { crShowDisplay } from "../../../actions/mainWindowCreator";
import {
  createResetSearch,
  createRescore,
} from "../../../actions//rescoreCreator";
import HelpWindow from "./HelpWindow";
import SettingsWindow from "./SettingsWindow";
import { getTextQueryInput } from "../../../utils/utils";
import BookmarksPanel from "./BookmarksPanel";
import LikedPanel from "./LikedPanel";
import FiltersPanel from "./FiltersPanel";

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
  const dispatch = settings.dispatch;

  dispatch(createResetSearch(settings, destDisplay));

  getTextQueryInput(0).value = "";
  getTextQueryInput(1).value = "";
}

function MainPanel(props) {
  const settings = useSettings();

  const refQuery0 = useRef(null);
  const refQuery1 = useRef(null);

  const refCollage0 = useRef(null);
  const refCollage1 = useRef(null);

  const [isAcOpen, setIsAcOpen] = useState(false);

  useEffect(() => {}, []);

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
                config.ui.frameGrid.defaultRescoreDisplay,
                isAcOpen
              )
            }
          >
            New search
          </Button>
        </Col>
      </ControlsPanel>

      <FiltersPanel />

      <TextSearchPanel
        setIsAcOpen={setIsAcOpen}
        isAcOpen={isAcOpen}
        refQuery0={refQuery0}
        refQuery1={refQuery1}
        triggerRescore={() =>
          onTriggerRescoretHandler(
            settings,
            config.ui.frameGrid.defaultRescoreDisplay,
            isAcOpen
          )
        }
      />

      <LikedPanel />

      <ControlsPanel>
        <Col xs={6} className="cont-btn">
          <Button
            variant="primary"
            className="enlarge"
            onClick={() =>
              onTriggerRescoretHandler(
                settings,
                config.ui.frameGrid.defaultRescoreDisplay,
                isAcOpen
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
                isAcOpen
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
            SOM Display
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
            Top Scored
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
            Top Scored Context
          </Button>
        </Col>
      </ControlsPanel>

      <HistoryPanel />

      <BookmarksPanel />

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
};

export default connect(stateToProps, actionCreators)(MainPanel);
