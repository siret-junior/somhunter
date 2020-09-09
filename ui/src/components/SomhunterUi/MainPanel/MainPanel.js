import React from "react";
import { connect } from "react-redux";

import { Container, Row, Col, Button } from "react-bootstrap";
import { FaCog } from "react-icons/fa";

import ControlsPanel from "./ControlsPanel";
import TextSearchPanel from "./TextSearchPanel";
import HistoryPanel from "./HistoryPanel";
import NotificationPanel from "./NotificationPanel";

import { showTopNDisplay } from "../../../actions";

function MainPanel(props) {
  return (
    <Container
      fluid
      className="panel main p-0"
      style={{ backgroundColor: "cyan" }}
    >
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
        <Button>SOM Screen</Button>
        <Button onClick={props.showTopNDisplay}>Top N</Button>
        <Button>Top N Context</Button>
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
  showTopNDisplay,
};

export default connect(stateToProps, actionCreators)(MainPanel);
