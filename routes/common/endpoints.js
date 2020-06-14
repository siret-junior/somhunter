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

  const frameId = Number(req.query.frameId);

  let frameData = {};
  // -------------------------------
  // Call the core
  frameData = global.core.get_display(global.cfg.framesPathPrefix, "som", frameId, 0);
  // -------------------------------

  res.status(200).jsonp(frameData);
};

exports.getTopnScreen = function (req, res) {
  const sess = req.session;

  let frames = [];
  // -------------------------------
  // Call the core
  const displayFrames = global.core.getDisplay(global.cfg.framesPathPrefix, "topn", 0);
  frames = displayFrames.frames;
  // -------------------------------

  SessionState.switchScreenTo(sess.state, "topn", frames);

  let viewData = {};
  viewData.somhunter = SessionState.getSomhunterUiState(sess.state);

  res.status(200).jsonp({ viewData: viewData });
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
  const pass = req.body.pass;

  res.redirect(301, "/");
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
