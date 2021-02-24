// *** Config generated by the Core API ***
import config from "../__config_generated__.json";
// *** Config generated by the Core API ***

import * as CS from "../constants";
import { post } from "../apis/coreApi";
import { crNotif, crHideNotif } from "./notificationCreator";
import { crShowDisplay } from "./mainWindowCreator";
import { crSetQueryChanged } from "./indicatorCreator";
import {
  createSetUserHistory,
  createFetchAndSetUserState,
  createResetLiked,
} from "./userCreator";
import {
  getTextQueryInput,
  takeScreenshotOfElem,
  getFiltersInput,
  getCollageInputs,
} from "../utils/utils";

export function createRescore(s, destDisplay) {
  return async (dispatch, getState) => {
    const state = getState();

    // If no need for the rescore
    // \todo This state is reset on refresh! If need to handle this,
    //      store this dirty flag in the core/local storage
    if (!state.indicators.queryChanged && false) {
      // Just because collage
      return;
    }

    const srcSearchCtxId = state.user.search.id;

    dispatch(crNotif(s, CS.GLOB_NOTIF_INFO, "Working..."));

    // Take a screenshot
    let screenData = "";
    // Does this screen still lack the screenshot
    if (state.user.search.screenshotFilepath === "") {
      const frs = state.mainWindow.frames;
      screenData = await takeScreenshotOfElem(
        document.getElementById("mainGrid"),
        frs
      );
    }

    let query0 = "";
    let query1 = "";
    let filters = null;
    let collagesData = null;

    
    // Current text queries
    // \todo Do it propperly!
    query0 = getTextQueryInput(0).value;
    query1 = getTextQueryInput(1).value;
    
    
    collagesData = getCollageInputs();
        
    filters = getFiltersInput();
    
    // POST data
    const reqData = {
      srcSearchCtxId: srcSearchCtxId,
      screenshotData: screenData,
      q0: query0,
      q1: query1,
      filters,
      collages: collagesData,
    };

    const requestSettings = config.api.endpoints.searchRescore;
    // << Core API >>
    const res = await post(dispatch, requestSettings.post.url, reqData);
    // << Core API >>

    // If failed
    if (!res) return;

    const currCtxId = res.data.currId;
    dispatch(createSetUserHistory(s, res.data.history, currCtxId));
    dispatch(createResetLiked(s));

    // Load the reset state
    dispatch(crHideNotif(s));

    // Reset query changed flag
    dispatch(crSetQueryChanged(s, false));

    // Jump to the display
    dispatch(crShowDisplay(s, destDisplay, 0, 0));
  };
}

export function createResetSearch(s, destDisplay) {
  return async (dispatch, _) => {
    dispatch(crNotif(scrollBy, CS.GLOB_NOTIF_INFO, "Working..."));

    const requestSettings = config.api.endpoints.searchReset;
    // << Core API >>
    await post(dispatch, requestSettings.post.url);
    // << Core API >>

    // Load the reset state
    dispatch(createFetchAndSetUserState(s));
    dispatch(crNotif(s, CS.GLOB_NOTIF_SUCC, "Search reset.", "", 2000));
    dispatch(crShowDisplay(s, destDisplay, 0, 0));
  };
}
