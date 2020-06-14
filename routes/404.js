"use strict";

const express = require("express");
// eslint-disable-next-line new-cap
const router = express.Router();

const SessionState = require("./common/SessionState");
const stateCheck = require("./common/state_checkers");

/** Specific route settings. */
const routeSettings = {
  slug: "404",
};

function preProcessReq(req, viewData) {
  stateCheck.genericPreProcessReq(req, viewData, routeSettings);
}

function processReq(req, viewData) {
  stateCheck.genericProcessReq(req, viewData, routeSettings);
}

function postProcessReq(req, viewData) {
  stateCheck.genericPostProcessReq(req, viewData, routeSettings);
}

/**
 * GET request handler
 */
router.get("/", function (req, res, next) {
  const viewData = stateCheck.initRequest(req);

  global.logger.log("debug", "Route: " + routeSettings.slug);

  // Main request cycle
  preProcessReq(req, viewData);
  processReq(req, viewData);
  postProcessReq(req, viewData);

  console.log("");
  console.log(JSON.stringify(viewData));

  // Resolve and render dedicated template
  res.render(routeSettings.slug, viewData);
});

module.exports = router;
