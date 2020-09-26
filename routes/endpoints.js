/* This file is part of SOMHunter.
 *
 * Copyright (C) 2020 František Mejzlík <frankmejzlik@gmail.com>
 *                    Mirek Kratochvil <exa.exa@gmail.com>
 *                    Patrik Veselý <prtrikvesely@gmail.com>
 *
 * SOMHunter is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free
 * Software Foundation, either version 2 of the License, or (at your option)
 * any later version.
 *
 * SOMHunter is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more
 * details.
 *
 * You should have received a copy of the GNU General Public License along with
 * SOMHunter. If not, see <https://www.gnu.org/licenses/>.
 */
"use strict";

const fs = require("fs");
const path = require("path");

const SessionState = require("./common/SessionState");
const stateCheck = require("./common/state_checkers");

exports.getSomScreen = function (req, res) {
  const sess = req.session;

  // Make sure that this session is initialized
  const viewDataOld = stateCheck.initRequest(req);
  stateCheck.checkGlobalSessionState(req, viewDataOld);

  if (!global.core.isSomReady()) {
    res.status(222).jsonp({ viewData: null, error: { message: "SOM not yet ready." } });
    return;
  }

  // -------------------------------
  // Call the core
  const frameData = global.core.getDisplay(global.cfg.framesPathPrefix, global.strs.displayTypes.som);
  // -------------------------------

  SessionState.switchScreenTo(sess.state, global.strs.displayTypes.som, frameData.frames, 0);

  let viewData = {};
  viewData.somhunter = SessionState.getSomhunterUiState(sess.state);

  res.status(200).jsonp({ viewData: viewData });
};

exports.getTopScreen = function (req, res) {
  const sess = req.session;

  // Make sure that this session is initialized
  const viewDataOld = stateCheck.initRequest(req);
  stateCheck.checkGlobalSessionState(req, viewDataOld);

  let type = global.strs.displayTypes.topn;

  if (req.body && req.body.type) type = req.body.type;

  let pageId = 0;
  if (req.body && req.body.pageId) pageId = Number(req.body.pageId);

  let frameId = 0;
  if (req.body && req.body.frameId) frameId = Number(req.body.frameId);

  let frames = [];
  // -------------------------------
  // Call the core
  const displayFrames = global.core.getDisplay(global.cfg.framesPathPrefix, type, pageId, frameId);
  frames = displayFrames.frames;
  // -------------------------------

  SessionState.switchScreenTo(sess.state, type, frames, frameId);

  let viewData = {};
  viewData.somhunter = SessionState.getSomhunterUiState(sess.state);

  res.status(200).jsonp({ viewData: viewData });
};

exports.rescore = function (req, res) {
  const sess = req.session;

  // Make sure that this session is initialized
  const viewDataOld = stateCheck.initRequest(req);
  stateCheck.checkGlobalSessionState(req, viewDataOld);

  const body = req.body;
  const q0 = body.q0;
  const q1 = body.q1;

  let textQuery = q0;

  // Append temporal query
  if (q1 != "") {
    textQuery += " >> ";
    textQuery += q1;
  }

  SessionState.setTextQueries(sess.state, q0, q1);

  // \todo Temporal...
  const user_token = global.coreCfg.user_token;

  // << Core NAPI >>
  const history = global.core.rescore(user_token, textQuery);
  // << Core NAPI >>

  res.status(200).jsonp({ history });
};

exports.submitFrame = function (req, res) {
  const sess = req.session;

  const body = req.body;
  const submittedFrameId = body.frameId;

  // -------------------------------
  // Call the core
  global.core.submitToServer(submittedFrameId);
  // -------------------------------

  res.status(200).jsonp({});
};

exports.getAutocompleteResults = function (req, res) {
  const sess = req.session;

  // Make sure that this session is initialized
  const viewDataOld = stateCheck.initRequest(req);
  stateCheck.checkGlobalSessionState(req, viewDataOld);

  const prefix = req.query.queryValue;

  // -------------------------------
  // Call the core
  const acKeywords = global.core.autocompleteKeywords(
    global.cfg.framesPathPrefix,
    prefix,
    global.cfg.autocompleteResCount,
    global.cfg.autocompleteExampleFramesCount
  );

  // Send response
  res.status(200).jsonp(acKeywords);
};

exports.resetSearchSession = function (req, res) {
  const sess = req.session;

  // Make sure that this session is initialized
  const viewDataOld = stateCheck.initRequest(req);
  stateCheck.checkGlobalSessionState(req, viewDataOld);

  // -------------------------------
  // Call the core
  global.core.resetAll();
  // -------------------------------

  SessionState.resetSearchSession(sess.state);

  let viewData = {};
  viewData.somhunter = SessionState.getSomhunterUiState(sess.state);

  res.status(200).jsonp({ viewData: viewData });
};

exports.likeFrame = function (req, res) {
  const sess = req.session;

  // Make sure that this session is initialized
  const viewDataOld = stateCheck.initRequest(req);
  stateCheck.checkGlobalSessionState(req, viewDataOld);

  const frameId = req.body.frameId;
  const likes = [frameId];

  // -------------------------------
  // Call the core
  const res_flags = global.core.likeFrames(likes);
  // -------------------------------

  res.status(200).jsonp({ frameId: frameId, isLiked: res_flags[0] });
};

exports.loginToDres = function (req, res) {
  const sess = req.session;

  // Make sure that this session is initialized
  const viewDataOld = stateCheck.initRequest(req);
  stateCheck.checkGlobalSessionState(req, viewDataOld);

  // -------------------------------
  // Call the core
  const result = global.core.loginToDres();
  // -------------------------------

  if (global.coreCfg.submitter_config.submit_server == "dres") {
    global.coreCfg.submitter_config.server_config.dres.loggedIn = result;
  }

  res.status(200).jsonp({ result: result });
};

exports.logScroll = function (req, res) {
  const sess = req.session;

  // Make sure that this session is initialized
  const viewDataOld = stateCheck.initRequest(req);
  stateCheck.checkGlobalSessionState(req, viewDataOld);

  const scrollArea = req.query.scrollArea;
  const delta = req.query.delta < 0 ? -1.0 : 1.0;
  const frameId = Number(req.query.frameId);

  // If replay
  if (frameId) {
    // -------------------------------
    // Call the core
    global.core.logVideoReplay(frameId, delta);
    // -------------------------------
  }
  // Else rest of the displays
  else {
    // -------------------------------
    // Call the core
    global.core.logScroll(scrollArea, delta);
    // -------------------------------
  }

  res.status(200).jsonp({});
};

exports.logTextQueryChange = function (req, res) {
  const sess = req.session;

  // Make sure that this session is initialized
  const viewDataOld = stateCheck.initRequest(req);
  stateCheck.checkGlobalSessionState(req, viewDataOld);

  const query = req.query.query;

  // -------------------------------
  // Call the core
  global.core.logTextQueryChange(query);
  // -------------------------------

  res.status(200).jsonp({});
};

/**
 * Returns the current general program settings.
 *
 * RESPONSES:
 *    200 - OK
 */
exports.settingsGet = function (req, res) {
  const sess = req.session;

  // \todo Do we need to send all that?
  const cfgData = {
    strings: global.strs,
    core: global.coreCfg,
    server: global.cfg,
    ui: global.uiCfg,
    api: global.apiCfg,
  };

  res.status(200).jsonp(cfgData);
};

/**
 * Returns the current search context of the given user.
 *
 * RESPONSES:
 *    200 - OK
 */
exports.searchContextGet = function (req, res) {
  const sess = req.session;

  // << Core NAPI >>
  const searchContext = global.core.getSearchContext(global.coreCfg.user_token);
  // << Core NAPI >>

  // If core does not specify, use UI config
  if (searchContext.displayType == ""){
    searchContext.displayType = global.uiCfg.defaultMainDisplay;
  }

  res.status(200).jsonp(searchContext);
};

/**
 * Switches the search context to the provided ID for the given user.
 *
 * RESPONSES:
 *    200 - OK
 *    400 - Ivalid parameters.
 */
exports.searchContextPost = function (req, res) {
  const sess = req.session;

  const ctx_ID = req.body.ID;

  // Check argument validity
  if (typeof ctx_ID === "udnefined" || !ctx_ID) {
    res.status(400).jsonp({ error: { message: "Invalid `ID` parameter." } });
    return;
  }

  // << Core NAPI >>
  const searchContext = global.core.switchSearchContext(global.cfg.user_token, ctx_ID);
  // << Core NAPI >>

  res.status(200).jsonp(searchContext);
};

/**
 * Returns data about the specified frame.
 *
 * RESPONSES:
 *    200 - OK
 *    400 - Ivalid parameters.
 */
exports.getFrameDetailData = function (req, res) {
  const sess = req.session;

  const frameId = Number(req.query.frameId);
  const logIt = req.query.logIt === "true" ? true : false;

  // Check arguments
  if (!frameId) {
    res.status(400).jsonp({ error: { message: "Invalid `frameId` parameter." } });
    return;
  }

  // -------------------------------
  // Call the core
  const frameData = global.core.getDisplay(
    global.cfg.framesPathPrefix,
    global.strs.displayTypes.detail,
    null,
    frameId,
    logIt
  );
  // -------------------------------

  res.status(200).jsonp(frameData);
};
