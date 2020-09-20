import * as utils from "../utils/utils";
import * as CS from "../constants";
import { dispNameToAction } from "../constants";
import { post } from "../apis/coreApi";
import { crNotif, crHideNotif } from "./notificationCreator";
import { resetMainGridScroll } from "../utils/utils";

/* 
Core API docs:
interface Response = { 
    viewData: {
      somhunter: {
        frameContext: {
          frameId: number;
          frames: number[]
        },
        screen: {
          type: string;
          frames: [{
            id: number;
            liked: bool;
            sId: number;
            vId: number;
            src: string;

          }]
        },
        textQueries: {
          q0: { value: string; },
          q1: { value: string; }
        }
      }
    },
    error: {
      message: string;
    }
  } */
function loadMainWindowFrames(settings, type, pageId, frameId) {
  return async (dispatch, _) => {
    const reqData = {
      pageId: pageId,
      type: type,
      frameId: frameId,
    };

    const requestSettings = settings.coreSettings.api.endpoints.screenTop;
    // << Core API >>
    const response = await post(dispatch, requestSettings.url, reqData);
    // << Core API >>

    if (pageId === 0) resetMainGridScroll();

    dispatch({
      type: dispNameToAction(type),
      payload: {
        frames: response.data.viewData.somhunter.screen.frames,
        currentPage: pageId,
      },
    });
  };
}

function loadSomFrames(settings) {
  return async (dispatch, _) => {
    dispatch(
      crNotif(settings, CS.GLOB_NOTIF_WARN, "SOM working...", "", 500)
    );

    const requestSettings = settings.coreSettings.api.endpoints.screenSom;
    let response = null;
    do {
      // << Core API >>
      response = await post(dispatch, requestSettings.url);
      // << Core API >>

      // 222 means that SOM not ready
      if (response.status === 222) {
        await utils.delay(500);
      }
    } while (response.status === 222);

    dispatch(crHideNotif(settings));

    dispatch({
      type: dispNameToAction(CS.DISP_TYPE_SOM),
      payload: {
        frames: response.data.viewData.somhunter.screen.frames,
        currentPage: 0,
      },
    });
  };
}

export function crShowDisplay(settings, type, pageId = 0, frameId = 0) {
  console.debug(
    `=> crShowDisplay: type=${type}, pageId=${pageId}, frameId=${frameId}`
  );

  switch (type) {
    case CS.DISP_TYPE_SOM:
      return loadSomFrames(settings);

    case CS.DISP_TYPE_TOP_KNN:
    case CS.DISP_TYPE_TOP_N:
    case CS.DISP_TYPE_TOP_N_CONTEXT:
      return loadMainWindowFrames(settings, type, pageId, frameId);
    default:
      return null;
  }
}
