import html2canvas from "html2canvas";

// ---

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

export async function takeScreenshotOfElem(elem) {
  const w = 200;
  const h = w * 0.57;

  // Render the contents inside the canvas
  const canvas = await html2canvas(elem, {
    logging: false,
  });

  const resizedCanvas = document.createElement("canvas");
  const resizedContext = resizedCanvas.getContext("2d");
  resizedCanvas.width = w.toString();
  resizedCanvas.height = h.toString();
  resizedContext.drawImage(canvas, 0, 0, w, h);

  const imgData = resizedCanvas.toDataURL("image/jpeg");
  return imgData;
}
