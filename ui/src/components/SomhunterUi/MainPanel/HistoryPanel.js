import React from "react";

import { useSettings } from "../../../hooks/useSettings";
import { Container, Row, Col } from "react-bootstrap";

function getHistoryItems(s) {
  // \todo Replace with the real data
  const data = [
    { src: "https://via.placeholder.com/150", title: "State0" },
    { src: "https://via.placeholder.com/150", title: "State1" },
    { src: "https://via.placeholder.com/150", title: "State2" },
    { src: "https://via.placeholder.com/150", title: "State3" },
    { src: "https://via.placeholder.com/150", title: "State4" },
    { src: "https://via.placeholder.com/150", title: "State5" },
    { src: "https://via.placeholder.com/150", title: "State6" },
  ];

  const jsx = data.map((x, i) => (
    <li className="history-item" key={`history${i}`}>
      <img src={x.src} alt={x.title} />
      <span className="title">{x.title}</span>
    </li>
  ));

  return <>{jsx}</>;
}

function HistoryPanel(props) {
  const s = useSettings();

  return (
    <Container fluid className="history-panel panel">
      <Row>
        <Col xs={12}>
          <h1 className="panel-title"> History</h1>
          <ul className="history-list">{getHistoryItems(s)}</ul>
        </Col>
      </Row>
    </Container>
  );
}

export default HistoryPanel;
