export const delay = (ms) => new Promise((res) => setTimeout(res, ms));

/** Checks if a custom response error defined. */
export function isErrDef(e) {
  if (typeof e.response !== "undefined")
    if (typeof e.response.data !== "undefined")
      if (typeof e.response.data.error !== "undefined") return true;

  return false;
}

export function resetMainGridScroll() {
  const el = document.getElementById("mainGrid");
  if (el) el.scrollTop = 0;
}

export function getTextQueryInput(idx) {
  return document.getElementById(`textQuery${idx}`).childNodes[0];
}

export function hideAllSubQueries() {
  document
    .querySelectorAll(".sub-query-tile")
    .forEach((x) => x.classList.remove("active"));
}
