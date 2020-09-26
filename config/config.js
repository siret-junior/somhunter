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

// Require Lodash module
const moduleLodaSh = require("lodash");

// Get serverConfig file
const serverConfig = require("./serverConfig.json");
const uiConfig = require("./uiConfig.json");
const apiConfig = require("./apiConfig.json");

/* !!! THIS MUST MATCH WITH `core/src/common.h` FILE !!! */
const strings = require("./strings.json");

exports.initConfig = function () {
  // Get current env setup
  const environment = process.env.NODE_ENV || "development";

  /*
   * Server config
   */
  // Default things are in development
  const defaultConfig = serverConfig.development;

  // Create enviroment serverConfig
  const environmentConfig = serverConfig[environment];

  // Merge to the final serverConfig
  const finalConfig = moduleLodaSh.merge(defaultConfig, environmentConfig);
  const cred = require("./user.json");

  // Login & auth credentials
  finalConfig.authPassword = cred.authPassword;
  finalConfig.authName = cred.authName;

  /*
   * UI config
   */
  const defaultUiConfig = uiConfig.development;
  const environmentUiConfig = uiConfig[environment];
  const finalUiConfig = moduleLodaSh.merge(defaultUiConfig, environmentUiConfig);

  /*
   * API config
   */
  const defaultApiConfig = apiConfig.development;
  const environmentApiConfig = apiConfig[environment];
  const finalApiConfig = moduleLodaSh.merge(defaultApiConfig, environmentApiConfig);

  /*
   * Global store
   */
  // Store final serverConfig in globals
  global.cfg = finalConfig;
  global.strs = strings;
  global.uiCfg = finalUiConfig;
  global.apiCfg = finalApiConfig;
};
