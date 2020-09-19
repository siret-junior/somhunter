export const delay = (ms) => new Promise((res) => setTimeout(res, ms));

/** Checks if a custom response error defined. */
export function isErrDef(e) {
  if (typeof e.response !== "undefined")
    if (typeof e.response.data !== "undefined")
      if (typeof e.response.data.error !== "undefined") return true;

  return false;
}

export function resetMainGridScroll() {
  document.getElementById("mainGrid").scrollTop = 0;
}
