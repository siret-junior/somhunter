import React from "react";
import { Container, Button, Alert } from "react-bootstrap";

function LoadingWindow(props) {
  return (
    <Container className="overlay critical-error-window window">
      <Alert variant="warning">
        <h1>{props.title}</h1>
        <p>{props.body}</p>
      </Alert>
    </Container>
  );
}

export default LoadingWindow;
