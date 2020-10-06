import React from "react";
import { connect } from "react-redux";
import { Container, Row, Col, Button } from "react-bootstrap";

// ---

// *** Config generated by the Core API ***
import config from "../../../__config_generated__.json";
// *** Config generated by the Core API ***
import { useSettings } from "../../../hooks/useSettings";
import { createFetchAndAddBookmarked } from "../../../actions/userCreator";
import Frame from "../MainWindow/Frame";

function frameCloseBtnClickHandler(s, props, frame) {
  s.dispatch(createFetchAndAddBookmarked(s, frame));
}

function getBookmarkedFrames(s, props) {
  const data = props.user.bookmarkedFrames;

  const jsx = data.map((x, i) => {
    const scrFilepath = x.src;

    return (
      <li className={`liked-item bookmark-item`} key={`bookmark${i}`}>
        <Button
          variant="secondary"
          className="remove-btn"
          onClick={(e) => frameCloseBtnClickHandler(s, props, x)}
        >
          x
        </Button>

        <Frame frame={x} />
      </li>
    );
  });

  return <>{jsx}</>;
}

function BookmarksPanel(props) {
  const s = useSettings();

  console.debug("<BookmarksPanel>: Rendering...");
  return (
    <Container
      fluid
      className="frame-list-panel bookmarked-panel bookmarks-panel panel"
    >
      <Row>
        <Col xs={12}>
          <h5 className="small-title">Bookmarks:</h5>
          <ul className="col-12 liked-list bookmarked-list">
            {getBookmarkedFrames(s, props)}
          </ul>
        </Col>
      </Row>
    </Container>
  );
}

const stateToProps = ({ user }) => {
  return { history: user.history, user: user };
};

export default connect(stateToProps)(BookmarksPanel);
