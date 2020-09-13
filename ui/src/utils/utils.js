export const delay = (ms) => new Promise((res) => setTimeout(res, ms));

/** Checks it HTTP response code is OK. */
export function isOk(code) {
  return Math.floor(code / 100) === 2;
}
