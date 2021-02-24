import React from "react";

import { Modal, Button, Container } from "react-bootstrap";
import FrameGridVirtualized from "./FrameGridVirtualized";

const columns = 6;

function DetailWindow(props) {
  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      className="detail-window off-canvas-window window"
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Video detail
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <FrameGridVirtualized {...props} columns={columns} />
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default DetailWindow;
