import React from "react";
import { Container, Button, Alert } from "react-bootstrap";

function CriticalErrorWindow(props) {
  return (
    <Container className="overlay critical-error-window window">
      <Alert variant="danger">
        <h1>{props.title}</h1>
        <p>{props.body}</p>
        <Button onClick={props.actionHandler}>{props.action}</Button>
      </Alert>
    </Container>
  );
}

export default CriticalErrorWindow;
