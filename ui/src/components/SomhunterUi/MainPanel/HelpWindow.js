import React, { useState } from "react";

import { Modal, Button, Col } from "react-bootstrap";

import { BiHelpCircle } from "react-icons/bi";

function SettingsWindow(props) {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <Col xs={6} className="cont-btn">
        <Button variant="secondary" onClick={handleShow}>
          <BiHelpCircle />
          Help
        </Button>
      </Col>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Help</Modal.Title>
        </Modal.Header>
        <Modal.Body>...</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default SettingsWindow;
