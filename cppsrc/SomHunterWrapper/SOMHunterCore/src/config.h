
#ifndef config_h
#define config_h

#include "common.h"

/*
 * Text query settings
 */

#define MAX_NUM_TEMP_QUERIES 2
#define KW_TEMPORAL_SPAN 5 // frames

/*
 * Scoring/SOM stuff
 */
/*
#define TOPN_PER_VIDEO_NUM_FRAMES_LIMIT 3
#define TOPKNN_PER_VIDEO_NUM_FRAMES_LIMIT 3
#define PER_VIDEO_NUM_FROM_SHOT_LIMIT 1
*/
#define TOPN_LIMIT 10000
constexpr size_t DISP_TOPN_CTX_RESULT_LIMIT = 10000;
#define TOPKNN_LIMIT 10000
#define SOM_ITERS 100000

/*
 * Misc
 */

/** What display we'll jump to after a rescore. */
constexpr DisplayType POST_RESCORE_DISPLAY = DisplayType::DTopNContext;

#define DEFAULT_RESCORE 0 // 0=bayes, 1=LD

#define FADE_ON_HOVER 0
#define DRAW_FRAME_INFO 0
#define DRAW_FRAME_SCORES 0

#define ALLOW_DEBUG_WINDOW 1
/*
 * Logging
 */

#define LOGLEVEL 3 // 3 = debug, 2 = info, 1 = warnings, 0 = none

#define LD_LOG_DIR "./logs/"
#define LD_LOG_FILENAME "ld"
#define FIRST_SHOWN_LOG_FILENAME "first_shown"

#define GLOBAL_LOG_FILE "somhunter.log"

/** Pop-up window image grid width */
#define DISPLAY_GRID_WIDTH 6

/** Pop-up window image grid height */
#define DISPLAY_GRID_HEIGHT 6

constexpr int TOP_N_SELECTED_FRAME_POSITION = 2;
constexpr float RANDOM_DISPLAY_WEIGHT = 3.0f;

/** SOM window image grid width */
#define SOM_DISPLAY_GRID_WIDTH 8

/** SOM window image grid height */
#define SOM_DISPLAY_GRID_HEIGHT 8

#endif
