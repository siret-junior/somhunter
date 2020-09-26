/*
 * Core API types
 *
 * This is shared file with the SOMHunter Core API.
 */

export type FrameRef = {
  id: number;
  src: string;
  liked: boolean;
  vId: number;
  sId: number;
};

export type Vec2 = { x: number; y: number };

export type CoreSearchState = any;
export type CoreApiSettings = any;

export type CoreApiEndpoint = {
  get?: { url: string };
  post?: { url: string };
};

/** Type returned by the Core API `/settings/info` endpoint. */
export type CoreApiConfig = {
  generated: string;
  api: {
    endpoints: {
      config: CoreApiEndpoint;
      frameDetail: CoreApiEndpoint;
      textSearchSuggestions: CoreApiEndpoint;
      screenTop: CoreApiEndpoint;
      screenSom: CoreApiEndpoint;
      logBrowsingScroll: CoreApiEndpoint;
      logTextChange: CoreApiEndpoint;
      serverSubmitFrame: CoreApiEndpoint;
      serverLogin: CoreApiEndpoint;
      searchReset: CoreApiEndpoint;
      searchRescore: CoreApiEndpoint;
      searchLike: CoreApiEndpoint;
      searchInfo: CoreApiEndpoint;
    };
  };
  core: {
    display_page_size: number;
    features_dim: number;
    features_file: string;
    features_file_data_off: number;
    filename_offsets: {
      fr_filename_frame_num_len: number;
      fr_filename_frame_num_off: number;
      fr_filename_off: number;
      fr_filename_shot_ID_len: number;
      fr_filename_shot_ID_off: number;
      fr_filename_vid_ID_len: number;
      fr_filename_vid_ID_off: number;
    };
    frames_list_file: string;
    frames_path_prefix: string;
    kw_PCA_mat_dim: number;
    kw_PCA_mat_file: string;
    kw_PCA_mean_vec_file: string;
    kw_bias_vec_file: string;
    kw_scores_mat_file: string;
    kws_file: string;
    max_frame_filename_len: number;
    pre_PCA_features_dim: number;
    submitter_config: {
      VBS_submit_archive_dir: string;
      VBS_submit_archive_log_suffix: string;
      apply_log_action_timeout_in_core: boolean;
      extra_verbose_log: boolean;
      log_action_timeout: number;
      member_ID: number;
      send_logs_to_server_period: number;
      server_config: {
        dres: {
          cookie_file: string;
          loggedIn: boolean;
          login_URL: string;
          password: string;
          submit_URL: string;
          submit_interaction_URL: string;
          submit_rerank_URL: string;
          username: string;
        };
        vbs: {
          submit_URL: string;
          submit_interaction_URL: string;
          submit_rerank_URL: string;
        };
      };
      submit_server: string;
      submit_to_VBS: boolean;
      team_ID: number;
    };
    topn_frames_per_shot: number;
    topn_frames_per_video: number;
  };
  server: {
    appName: string;
    appSubname: string;
    authName: string;
    authPassword: string;
    coreConfigFilepath: string;
    logsDir: string;
    port: number;
  };
  strings: any;
  ui: {
    media: {
      framesPathPrefix: string;
    };
    autocomplete: {
      numExampleFrames: number;
      numSuggestions: number;
    };
    frameGrid: {
      infiniteScrollThreshold: number;
      infiniteScrollTimeout: number;
      defaultRescoreDisplay: string;
      defaultSecondaryRescoreDisplay: string;
    };
    textSearch: {
      autocompleteDelay: number;
    };
  };
};
