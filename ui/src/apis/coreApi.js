import axios from "axios";

import config from "../config/config";

export default axios.create({
  baseURL: config.backendUrl,
  auth: {
    username: config.coreUsername,
    password: config.corePassword,
  },
});
