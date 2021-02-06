/**
 * Immutably removes a key from an object
 * @example
 * // returns { a: 1 }
 * removeFromObject('b')({ a: 1, b: 2 })
 *
 * @param {string} key The key to remove
 * @param {object} obj The object to update
 * @returns {object} A copy of obj, with the named key removed
 */
export const removeFromObject = (key) => ({ [key]: _, ...otherEntities }) => ({
  ...otherEntities,
});
