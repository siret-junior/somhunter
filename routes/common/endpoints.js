"use strict";

const fs = require("fs");
const path = require("path");

const SessionState = require("./SessionState");

exports.getFrameDetailData = function (req, res) {
  const sess = req.session;

  const frameId = Number(req.query.frameId);

  let frameData = {};
  // -------------------------------
  // Call the core
  frameData = global.core.get_display(global.cfg.framesPathPrefix, "detail", frameId, 0);
  // -------------------------------

  res.status(200).jsonp(frameData);
};

exports.getSomScreen = function (req, res) {
  const sess = req.session;

  let frameData = {};

  if (!global.core.isSomReady())
  {
    res.status(200).jsonp({ viewData: null, error: {message:"SOM not yet ready."} });
    return;
  }

  // -------------------------------
  // Call the core
  frameData = global.core.getDisplay(global.cfg.framesPathPrefix, "som");
  // -------------------------------

  SessionState.switchScreenTo(sess.state, "som", frameData.frames);

  let viewData = {};
  viewData.somhunter = SessionState.getSomhunterUiState(sess.state);

  res.status(200).jsonp({ viewData: viewData });
};

exports.getTopnScreen = function (req, res) {
  const sess = req.session;

  global.logger.log("info", "TOPN " + JSON.stringify(req.query));
  let pageId = 0;
  if (req.query && req.query.pageId)
  {
    global.logger.log("info", "TOPN " + JSON.stringify(req.query.pageId));
    global.logger.log("info", "TOPN " + Number(req.query.pageId));
    pageId = Number(req.query.pageId);
  }

  global.logger.log("info", "TOPN calling core with " + pageId);
  let frames = [];
  // -------------------------------
  // Call the core
  const displayFrames = global.core.getDisplay(global.cfg.framesPathPrefix, "topn", pageId);
  frames = displayFrames.frames;
  // -------------------------------

  SessionState.switchScreenTo(sess.state, "topn", frames);

  let viewData = {};
  viewData.somhunter = SessionState.getSomhunterUiState(sess.state);

  res.status(200).jsonp({ viewData: viewData });
};

exports.rescore = function (req, res) {
  const sess = req.session;

  const body = req.body;
  const q0 = body.q0;
  const q1 = body.q1;

  const textQuery = q0;

  // Append temporal query
  if (q1 != "")
  {
    textQuery += " >> ";
    textQuery += q1;
  }

  const likes = SessionState.getLikes(sess.state);
  const unlikes = SessionState.getUnlikes(sess.state);

  // -------------------------------
  // Call the core
  global.core.add_likes(likes);
  global.core.remove_likes(unlikes);
  global.core.rescore(textQuery);
  // -------------------------------

  res.status(200).jsonp({});
};

exports.submitFrame = function (req, res) {
  const sess = req.session;

  const body = req.body;
  const submittedFrameId = body.frameId;

  // -------------------------------
  // Call the core
  global.core.submit_to_server(submittedFrameId);
  // -------------------------------

  res.status(200).jsonp({});
};

exports.getAutocompleteResults = function (req, res) {
  const sess = req.session;

  const prefix = req.query.queryValue;

  // -------------------------------
  // Call the core
  const acKeywords = global.core.autocompleteKeywords(
    global.cfg.framesPathPrefix,
    prefix,
    global.cfg.autocompleteResCount
  );

  // Send response
  res.status(200).jsonp(acKeywords);
};

exports.resetSearchSession = function (req, res) {
  const sess = req.session;

  // -------------------------------
  // Call the core
  global.core.resetAll();
  // -------------------------------

  viewData.somhunter = SessionState.resetSearchSession(sess.state);

  let viewData = {};
  viewData.somhunter = SessionState.getSomhunterUiState(sess.state);

  res.status(200).jsonp({ viewData: viewData });
};

exports.likeFrame = function (req, res) {
  const sess = req.session;

  const body = req.body;
  const frameId = body.frameId;

  // Handle and check the validity
  const succ = SessionState.likeFrame(sess.state, frameId);

  res.status(200).jsonp({ isLiked: succ });
};

exports.unlikeFrame = function (req, res) {
  const sess = req.session;

  const body = req.body;
  const frameId = body.frameId;

  // Handle and check the validity
  const succ = SessionState.unlikeFrame(sess.state, frameId);

  res.status(200).jsonp({ isLiked: false });
};
