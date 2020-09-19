import axios from "axios";

import config from "../config/config";
import { isErrDef } from "../utils/utils";

const coreApi = axios.create({
  baseURL: config.backendUrl,
  withCredentials: true,
});

console.info = () => null;

export function post(dispatch, url, data = {}, cfg = {}) {
  let res = null;
  try {
    console.info(`<<--->> POST requsest => '${url}'`);
    res = coreApi.post(url, data, cfg);
    console.info("<<--->> POST request res:", res);
  } catch (e) {
    const msg = isErrDef(e) ? e.response.data.error.message : e.message;
    dispatch(createReqFailNot(settings, requestSettings.endpoint, msg));
    return null;
  }

  return res;
}

export function get(dispatch, url, cfg = {}) {
  let res = null;

  try {
    console.info(`<<--->> GET requsest => '${url}'`);
    res = coreApi.get(url, cfg);
    console.info("<<--->> GET request res:", res);
  } catch (e) {
    const msg = isErrDef(e) ? e.response.data.error.message : e.message;
    dispatch(createReqFailNot(settings, requestSettings.endpoint, msg));
    return null;
  }

  return res;
}

export default coreApi;
