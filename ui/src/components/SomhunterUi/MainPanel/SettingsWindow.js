import React, { useState, useEffect } from "react";
import { Modal, Button, Col } from "react-bootstrap";

import { FaCog } from "react-icons/fa";

import { useSettings } from "../../../hooks/useSettings";
import coreApi from "../../../apis/coreApi";

import {
  createShowLoginWarning,
  createShowNotSendingWarning,
} from "../../../actions/indicatorCreator";

async function loginToDres(settings, onSucc = () => null, onFail = () => null) {
  const dispatch = settings.dispatch;
  const submitterConfig = settings.coreSettings.core.submitter_config;
  const coreEndpoints = settings.coreSettings.api.endpoints;

  const url = coreEndpoints.serverLogin.post.url;
  const isServerDres = submitterConfig.submit_server === "dres" ? true : false;
  const shouldSend = submitterConfig.submit_to_VBS;

  // If the server does not require logging or sending is off
  if (!isServerDres || !shouldSend) {
    onSucc();
    return;
  }

  let response = null;

  try {
    // << Core API >>
    response = await coreApi.post(url);
    // << Core API >>

    if (!response.data.result) {
      throw Error("Unable to login");
    }
  } catch (e) {
    onFail();
    dispatch(createShowLoginWarning(settings, true));
    return;
  }

  onSucc();
  dispatch(createShowLoginWarning(settings, false));
}

function initialize(s) {
  const dispatch = s.dispatch;
  const shouldSend = s.coreSettings.core.submitter_config.submit_to_VBS;

  if (shouldSend) {
    dispatch(createShowNotSendingWarning(s, false));
  } else {
    dispatch(createShowNotSendingWarning(s, true));
  }

  // Make sure we're logged in to the server
  loginToDres(s);
}

function onRequestLoginHandler(s) {
  const onSucc = () => {
    window.alert("Login to the DRES server OK.");
  };
  const onFail = () => {
    window.alert("Login to the DRES server failed!");
  };

  loginToDres(s, onSucc, onFail);
}

function getCommonBodyJsx(s) {
  const cfg = s.coreSettings.core.submitter_config;
  return (
    <>
      <p>
        <strong>Submit To The Server: </strong>
        {cfg.submit_to_VBS ? "true" : "false"}
      </p>
      <p>
        <strong>Team ID: </strong>
        {cfg.team_ID}
      </p>
      <p>
        <strong>Member ID: </strong>
        {cfg.member_ID}
      </p>
      <p>
        <strong>Logs Directory: </strong>
        {cfg.VBS_submit_archive_dir}
      </p>
      <p>
        <strong>Apply Action Trottle in Core: </strong>
        {cfg.apply_log_action_timeout_in_core ? "true" : "false"}
      </p>
      <p>
        <strong>Action Log Timeout: </strong>
        {cfg.log_action_timeout}
      </p>
    </>
  );
}

function getDresBodyJsx(s) {
  const cfg = s.coreSettings.core.submitter_config.server_config.dres;

  return (
    <>
      <h4>DRES Server Info:</h4>
      <p>
        <strong>Log Actions Endpoint: </strong>
        {cfg.submit_interaction_URL}
      </p>
      <p>
        <strong>Log Reranks Endpoint: </strong>
        {cfg.submit_rerank_URL}
      </p>
      <p>
        <strong>Submit Endpoint: </strong>
        {cfg.submit_URL}
      </p>
      <p>
        <strong>Cookie File: </strong>
        {cfg.cookie_file}
      </p>
      <hr />
      <p>
        <strong>Login URL: </strong>
        {cfg.login_URL}
      </p>
      <p>
        <strong>Username: </strong>
        {cfg.username}
      </p>
      <p>
        <strong>Password: </strong>
        {cfg.password}
      </p>
      <Button onClick={(_) => onRequestLoginHandler(s)} variant="primary">
        Login to the DRES
      </Button>
    </>
  );
}

function getVbsBodyJsx(s) {
  const cfg = s.coreSettings.core.submitter_config.server_config.vbs;
  return (
    <>
      <h4>VBS Server Info:</h4>
      <p>
        <strong>Log Actions Endpoint: </strong>
        {cfg.submit_interaction_URL}
      </p>
      <p>
        <strong>Log Reranks Endpoint: </strong>
        {cfg.submit_rerank_URL}
      </p>
      <p>
        <strong>Submit Endpoint: </strong>
        {cfg.submit_URL}
      </p>
    </>
  );
}

/** Settings component
 *
 * Responsible for showing all the configuration we can make in the UI.
 * Also shows the current settings and config and allows us to re-login
 * to the submit server.
 */
function SettingsWindow(props) {
  const settings = useSettings();

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  useEffect(() => {
    initialize(settings);
  }, []);

  const serverCfg = settings.coreSettings.core.submitter_config;
  const coreEndpoints = settings.coreSettings.api.endpoints;

  const isServerDres = serverCfg.submit_server === "dres" ? true : false;
  const shouldSend = serverCfg.submit_to_VBS;

  return (
    <>
      <Col xs={12}>
        <Button variant="primary" onClick={handleShow}>
          <FaCog />
        </Button>
      </Col>

      <Modal className="settings-modal" show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Settings</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {getCommonBodyJsx(settings)}
          {isServerDres ? getDresBodyJsx(settings) : getVbsBodyJsx(settings)}
        </Modal.Body>
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
