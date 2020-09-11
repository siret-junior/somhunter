import React from "react";
import { connect } from "react-redux";

import { Container, Row, Col, Button } from "react-bootstrap";
import { FaCog } from "react-icons/fa";

import * as CS from "../../../constants";

import ControlsPanel from "./ControlsPanel";
import TextSearchPanel from "./TextSearchPanel";
import HistoryPanel from "./HistoryPanel";
import NotificationPanel from "./NotificationPanel";

import { showDisplay } from "../../../actions/mainWindowCreator";

function MainPanel(props) {
  return (
    <Container fluid className="panel main p-0">
      <ControlsPanel>
        <Button>Help</Button>
        <Button>New search</Button>
      </ControlsPanel>

      <TextSearchPanel />

      <ControlsPanel>
        <Button>Rescore to Top N</Button>
        <Button>Rescore to SOM</Button>
      </ControlsPanel>

      <ControlsPanel>
        <Button onClick={() => props.showDisplay(CS.DISP_TYPE_SOM, 0, 0)}>
          SOM Screen
        </Button>
        <Button onClick={() => props.showDisplay(CS.DISP_TYPE_TOP_N, 0, 0)}>
          Top N
        </Button>
        <Button
          onClick={() => props.showDisplay(CS.DISP_TYPE_TOP_N_CONTEXT, 0, 0)}
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
  showDisplay,
};

export default connect(stateToProps, actionCreators)(MainPanel);
