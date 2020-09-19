import * as CS from "../constants";
import { post } from "../apis/coreApi";
import { createNotif, createDenotif } from "./notificationCreator";
import { createShowDisplay } from "./mainWindowCreator";

export function createRescore(settings, destDisplay) {
  return async (dispatch, _) => {
    console.debug("=> createRescore: Running rescore...");

    dispatch(createNotif(settings, CS.GLOB_NOTIF_INFO, "Working..."));

    const queryRefs = settings.textQueryRefs;
    if (queryRefs.length < 2) {
      throw Error("Not enough `queryRefs` in the state.");
    }

    // Current text queries
    const query0 = settings.textQueryRefs[0].current.value;
    const query1 = settings.textQueryRefs[1].current.value;

    // POST data
    const reqData = {
      q0: query0,
      q1: query1,
    };

    const requestSettings = settings.coreSettings.api.endpoints.searchRescore;
    // << Core API >>
    await post(dispatch, requestSettings.url, reqData);
    // << Core API >>

    dispatch(createDenotif(settings));
    dispatch(createShowDisplay(settings, destDisplay, 0, 0));
  };
}

export function createResetSearch(settings, destDisplay) {
  return async (dispatch, _) => {
    console.debug("=> createResetSearch: Running reset...");

    dispatch(createNotif(settings, CS.GLOB_NOTIF_INFO, "Working..."));

    const requestSettings = settings.coreSettings.api.endpoints.searchReset;
    // << Core API >>
    await post(dispatch, requestSettings.url);
    // << Core API >>

    dispatch(
      createNotif(settings, CS.GLOB_NOTIF_SUCC, "Search reset.", "", 2000)
    );

    dispatch(createShowDisplay(settings, destDisplay, 0, 0));
  };
}
