import * as CS from "../constants";

export function createSetSearchState(data) {
  return {
    type: CS.SET_SEARCH_STATE,
    payload: data,
  };
}
