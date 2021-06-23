/**
 *
 * @param {Number} month 1 (Jan) to 12 (Dec)
 * @returns {boolean}
 */
export const isMonth = (month: number): boolean =>
  (new Date().getMonth() + 1) === month
