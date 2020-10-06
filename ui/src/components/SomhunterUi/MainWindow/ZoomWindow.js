import React from "react";

import { Modal, Button, Container } from "react-bootstrap";

function ReplayWindow(props) {
  return (
    <Modal
      {...props}
      backdrop={false}
      enforceFocus={false}
      keyboard={false}
      autoFocus={false}
      animation={false}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      className="zoom-window off-canvas-window window"
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">Zoom</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <img src={props.frame.src} alt={props.frame.id} />
      </Modal.Body>
    </Modal>
  );
}

export default ReplayWindow;
