import coreApi from "../apis/coreApi";

// Action creator
export const selectSong = (song) => {
  // Return an action
  return {
    type: "SONG_SELECTED",
    payload: song,
  };
};

/**
 * Example fetch action creator that uses redux-thunk middleware.
 */
export function fetchPosts() {
  // Return function to be invoded my the thunk MW
  return async function (dispatch) {
    const response = await coreApi.get("/posts");
    dispatch({ type: "FETCH_POSTS", payload: response.data });
  };
}

/**
 * Example fetch action creator that uses redux-thunk middleware.
 *
 * Arrow function (closure) variant.
 */
export const fetchUser = (id) => async (dispatch) => {
  const response = await coreApi.get(`/users/${id}`);

  dispatch({ type: "FETCH_USER", payload: response.data });
};
