export const actionToDispName = (showType) => {
  switch (showType) {
    case SHOW_DISPLAY_TOP_N:
      return DISP_TYPE_TOP_N;
    case SHOW_DISPLAY_TOP_KNN:
      return DISP_TYPE_TOP_KNN;
    case SHOW_DISPLAY_TOP_N_CONTEXT:
      return DISP_TYPE_TOP_N_CONTEXT;
    case SHOW_DISPLAY_SOM:
      return DISP_TYPE_SOM;
    case SHOW_DETAIL_WINDOW:
      return DISP_TYPE_DETAIL;
    case SHOW_REPLAY_WINDOW:
      return DISP_TYPE_REPLAY;
    default:
      throw Error("Invalid type.");
  }
};

export const dispNameToAction = (showType) => {
  switch (showType) {
    case DISP_TYPE_TOP_N:
      return SHOW_DISPLAY_TOP_N;
    case DISP_TYPE_TOP_KNN:
      return SHOW_DISPLAY_TOP_KNN;
    case DISP_TYPE_TOP_N_CONTEXT:
      return SHOW_DISPLAY_TOP_N_CONTEXT;
    case DISP_TYPE_SOM:
      return SHOW_DISPLAY_SOM;
    case DISP_TYPE_DETAIL:
      return SHOW_DETAIL_WINDOW;
    case DISP_TYPE_REPLAY:
      return SHOW_REPLAY_WINDOW;
    default:
      throw Error("Invalid type.");
  }
};

/**
 * Notification action types.
 */
export const SHOW_GLOBAL_NOTIFICATION = "SHOW_GLOBAL_NOTIFICATION";
export const HIDE_GLOBAL_NOTIFICATION = "HIDE_GLOBAL_NOTIFICATION";

export const GLOB_NOTIF_ERR = "GLOB_NOTIF_ERR";
export const GLOB_NOTIF_WARN = "GLOB_NOTIF_WARN";
export const GLOB_NOTIF_INFO = "GLOB_NOTIF_INFO";
export const GLOB_NOTIF_SUCC = "GLOB_NOTIF_SUCC";

/**
 * Main window action types.
 */
export const SHOW_DISPLAY_TOP_N = "SHOW_DISPLAY_TOP_N";
export const SHOW_DISPLAY_TOP_KNN = "SHOW_DISPLAY_TOP_KNN";
export const SHOW_DISPLAY_TOP_N_CONTEXT = "SHOW_DISPLAY_TOP_N_CONTEXT";
export const SHOW_DISPLAY_SOM = "SHOW_DISPLAY_SOM";

/**
 * Main screen types.
 * This must match the ones defined in the core in `/config/strings.json`
 */
export const DISP_TYPE_NULL = "DISP_TYPE_NULL";
export const DISP_TYPE_TOP_N = "topn_display";
export const DISP_TYPE_TOP_N_CONTEXT = "topn_context_display";
export const DISP_TYPE_TOP_KNN = "topknn_display";
export const DISP_TYPE_SOM = "SOM_display";

/**
 * Off-canvas windows action types.
 */
export const SHOW_DETAIL_WINDOW = "SHOW_DETAIL_WINDOW";
export const HIDE_DETAIL_WINDOW = "HIDE_DETAIL_WINDOW";

export const SHOW_REPLAY_WINDOW = "SHOW_REPLAY_WINDOW";
export const HIDE_REPLAY_WINDOW = "HIDE_REPLAY_WINDOW";
export const SCROLL_REPLAY_WINDOW = "SCROLL_REPLAY_WINDOW";

export const DISP_TYPE_DETAIL = "video_detail";
export const DISP_TYPE_REPLAY = "video_replay";

/**
 * Off-canvas windows action types.
 */
export const KEY_CODE_TAB = 9;
export const KEY_CODE_ENTER = 13;
export const KEY_CODE_ESC = 27;
export const KEY_CODE_T = 84;
export const KEY_CODE_S = 83;

export const SETTINGS_ADD_QUERY_REF = "SETTINGS_ADD_QUERY_REF";
export const SETTINGS_SET_CORE = "SETTINGS_SET_CORE";
