"use strict";

const sessState = require("./SessionState");

exports.initRequest = function (req, viewData, routeSettings) {
  // \todo Remove this, it's just for the dev. xoxo
  //req.session.state = null;

  return {};
};

exports.genericPreProcessReq = function (req, viewData, routeSettings) {
  this.checkGlobalSessionState(req, viewData);

  // Get current page slug
  viewData.currentPage = routeSettings.slug;
};

exports.genericProcessReq = function (req, viewData, routeSettings) {};

exports.genericPostProcessReq = function (req, viewData, routeSettings) {
  this.checkGlobalViewState(req, viewData);
};

exports.checkGlobalSessionState = function (req, viewData) {
  const sess = req.session;

  if (typeof sess.state === "undefined" || sess.state == null) {
    // xoxo
    // Construct the session state here
    sess.state = sessState.Construct();
  }
  // At this point sess.state should be always populated with correct values
};

exports.checkGlobalViewState = function (req, viewData) {
  const sess = req.session;

  // Initialize viewData
  viewData.somhunter = {};
};
