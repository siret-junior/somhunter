import * as CS from "../constants";
import { post } from "../apis/coreApi";
import { crNotif, crHideNotif } from "./notificationCreator";
import { crShowDisplay } from "./mainWindowCreator";

export function createRescore(settings, destDisplay) {
  return async (dispatch, getState) => {
    console.debug("=> createRescore: Running rescore...");

    const state = getState();

    dispatch(crNotif(settings, CS.GLOB_NOTIF_INFO, "Working..."));

    console.debug(settings);

    const queryRefs = state.settings.textQueryRefs;
    if (queryRefs.length < 2) {
      throw Error("Not enough `queryRefs` in the state.");
    }

    // Current text queries
    const query0 = state.settings.textQueryRefs[0].current.value;
    const query1 = state.settings.textQueryRefs[1].current.value;

    // POST data
    const reqData = {
      q0: query0,
      q1: query1,
    };

    const requestSettings = settings.coreSettings.api.endpoints.searchRescore;
    // << Core API >>
    await post(dispatch, requestSettings.post.url, reqData);
    // << Core API >>

    dispatch(crHideNotif(settings));
    dispatch(crShowDisplay(settings, destDisplay, 0, 0));
  };
}

export function createResetSearch(settings, destDisplay) {
  return async (dispatch, _) => {
    console.debug("=> createResetSearch: Running reset...");

    dispatch(crNotif(settings, CS.GLOB_NOTIF_INFO, "Working..."));

    const requestSettings = settings.coreSettings.api.endpoints.searchReset;
    // << Core API >>
    await post(dispatch, requestSettings.post.url);
    // << Core API >>

    dispatch(crNotif(settings, CS.GLOB_NOTIF_SUCC, "Search reset.", "", 2000));

    dispatch(crShowDisplay(settings, destDisplay, 0, 0));
  };
}
