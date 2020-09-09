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
export const SHOW_DISPLAY_DETAIL = "SHOW_DISPLAY_DETAIL";
export const SHOW_DISPLAY_REPLAY = "SHOW_DISPLAY_REPLAY";

/**
 * Main screen types.
 * This must match the ones defined in the core in `/config/strings.json`
 */
export const DISP_TYPE_NULL = "DISP_TYPE_NULL";
export const DISP_TYPE_TOP_N = "topn_display";
export const DISP_TYPE_TOP_N_CONTEXT = "topn_context_display";
export const DISP_TYPE_TOP_KNN = "topknn_display";
