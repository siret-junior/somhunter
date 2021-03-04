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

const _ = require("lodash");
const fs = require("fs");
const path = require("path");

// Get serverConfig file
const serverConfig = require("./serverConfig.json");
const uiConfig = require("./uiConfig.json");
const apiConfig = require("./apiConfig.json");

/* !!! THIS MUST MATCH WITH `core/src/common.h` FILE !!! */
const strings = require("./strings.json");

exports.initConfig = function () {
  const env = process.env.NODE_ENV || "development";

  /*
   * Server config
   */
  // Default things are in development
  const defaultConfig = serverConfig.development;

  // Create enviroment serverConfig
  const envConfig = serverConfig[env];

  // Merge to the final serverConfig
  const finalServerConfig = _.merge(defaultConfig, envConfig);
  const cred = require("./apiUserConfig.json");

  // Login & auth credentials
  finalServerConfig.apiPassword = cred.apiUsername;
  finalServerConfig.apiUsername = cred.apiPassword;

  /*
   * UI config
   */
  const defaultUiConfig = uiConfig.development;
  const envUiConfig = uiConfig[env];
  const finalUiConfig = _.merge(defaultUiConfig, envUiConfig);

  /*
   * API config
   */
  const defaultApiConfig = apiConfig.development;
  const envApiConfig = apiConfig[env];
  const finalApiConfig = _.merge(defaultApiConfig, envApiConfig);

  const base_URL = defaultConfig.useHttp2 ? "https://localhost:" : "http://localhost:";
  finalApiConfig.url = `${base_URL}${finalServerConfig.port}`;

  /*
   * Core config
   */
  const finalCoreConfig = require(path.join(global.rootDir, finalServerConfig.coreConfigFilepath));

  /* ****************************************
   * Global store
   * **************************************** */
  // Store final serverConfig in globals
  global.uiCfg = finalUiConfig;
  global.apiCfg = finalApiConfig;
  global.serverCfg = finalServerConfig;
  global.coreCfg = finalCoreConfig;
  global.strs = strings;

  /* ****************************************
   * Generate the config JSON for the UI
   * **************************************** */
  const uiConfigGenerated = {
    generated: new Date().toString(),
    strings: global.strs,
    core: global.coreCfg,
    server: global.serverCfg,
    ui: global.uiCfg,
    api: global.apiCfg,
  };
  global.uiConfigGenerated = uiConfigGenerated
  fs.writeFile(global.serverCfg.uiConfigFilepath, JSON.stringify(uiConfigGenerated, null, 4), (e) => {
    console.error(e);
  });
};
