import React, { useState, useRef } from "react";
import { connect, useDispatch } from "react-redux";

import { Container, Row, Col, Button } from "react-bootstrap";
import { FaCog } from "react-icons/fa";

import * as CS from "../../../constants";

import ControlsPanel from "./ControlsPanel";
import TextSearchPanel from "./TextSearchPanel";
import HistoryPanel from "./HistoryPanel";
import NotificationPanel from "./NotificationPanel";
import config from "../../../config/config";
import { createShowDisplay } from "../../../actions/mainWindowCreator";
import {
  createResetSearch,
  createRescore,
} from "../../../actions//rescoreCreator";

function onTriggerRescoretHandler(
  dispatch,
  destDisplay,
  isAcOpen,
  refQuery0,
  refQuery1
) {
  // Make sure that autocomplete popup is not shown
  if (!isAcOpen) {
    const query0 = refQuery0.current.value;
    const query1 = refQuery1.current.value;

    console.debug("=> onSubmitHandler: Rescoring with params:", {
      destDisplay,
      query0,
      query1,
    });

    dispatch(createRescore(destDisplay, query0, query1));
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

  const dispatch = useDispatch();

  return (
    <Container fluid className="panel main p-0">
      <ControlsPanel>
        <Button>Help</Button>
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
            isAcOpen,
            refQuery0,
            refQuery1
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
        <Button>
          <FaCog />
        </Button>
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
};

export default connect(stateToProps, actionCreators)(MainPanel);
