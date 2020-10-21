import html2canvas from "html2canvas";

// ---

// *** Config generated by the Core API ***
import config from "../__config_generated__.json";
// *** Config generated by the Core API ***

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

export function getFiltersInput() {
  const filtersContEl = document.getElementById("queryFilters");

  const weekdaysEl = document.getElementById("queryFiltersWeekdays");

  let weekdays = [];
  weekdaysEl.childNodes.forEach((x) => {
    const v = x.querySelector(".form-check-input");

    if (v) weekdays.push(v.checked);
  });

  const hoursFrom = Number(
    document.getElementById(config.ui.htmlElIds.queryFiltersHourFrom).value
  );
  const hoursTo = Number(
    document.getElementById(config.ui.htmlElIds.queryFiltersHourTo).value
  );

  return {
    weekdays,
    hoursFrom,
    hoursTo,
  };
}

export function hideAllSubQueries() {
  document
    .querySelectorAll(".sub-query-tile")
    .forEach((x) => x.classList.remove("active"));
}

export async function takeScreenshotOfElem(elem, frames) {
  /* ***
   * Get the helper values
   */
  const numX = config.ui.history.screenshotNumX;
  const numY = config.ui.history.screenshotNumY;

  const w = 200;
  const h = w * 0.57;

  const wi = w / numX;
  const hi = h / numY;

  /* ***
   * Draw the frames into the canvas
   */
  const resizedCanvas = document.createElement("canvas");
  const resizedContext = resizedCanvas.getContext("2d");
  resizedCanvas.width = w.toString();
  resizedCanvas.height = h.toString();

  let frame_idx = 0;
  for (let i = 0; i < numY; ++i) {
    for (let j = 0; j < numX; ++j) {
      const dx = wi * j;
      const dy = hi * i;

      if (frame_idx >= frames.length){
        break;
      }
      const img = new Image(wi, hi);
      img.src = config.ui.media.thumbsPathPrefix + frames[frame_idx].src;

      resizedContext.drawImage(img, dx, dy, wi, hi);
      ++frame_idx;
    }
  }

  const imgData = resizedCanvas.toDataURL("image/jpeg");
  return imgData;
}
