export const delay = (ms) => new Promise((res) => setTimeout(res, ms));

/** Checks it HTTP response code is OK. */
export function isOk(code) {
  console.log(Math.floor(code / 100));
  return Math.floor(code / 100) === 2;
}
