import axios from "axios";

import config from "../config/config";
import { isErrDef } from "../utils/utils";
import { crReqFailNotif } from "../actions/notificationCreator";

const coreApi = axios.create({
  baseURL: config.backendUrl,
  withCredentials: true,
});

export async function post(dispatch, url, data = {}, cfg = {}) {
  let res = null;
  try {
    console.info(`--->> POST requsest => '${url}'`);
    res = await coreApi.post(url, data, cfg);
    console.info(`<<--- POST request => '${url}', res:`, res);
  } catch (e) {
    const msg = isErrDef(e) ? e.response.data.error.message : e.message;
    dispatch(crReqFailNotif({}, url, msg));
    return null;
  }

  return res;
}

export async function get(dispatch, url, cfg = {}) {
  let res = null;

  try {
    console.info(`--->> GET requsest => '${url}'`);
    res = await coreApi.get(url, cfg);
    console.info(`<<--- GET request => '${url}', res:`, res);
  } catch (e) {
    const msg = isErrDef(e) ? e.response.data.error.message : e.message;
    dispatch(crReqFailNotif({}, url, msg));
    return null;
  }

  return res;
}

export default coreApi;
