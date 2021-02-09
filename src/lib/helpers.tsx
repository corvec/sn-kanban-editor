import { v4 as uuid } from 'uuid';

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

const cleanupBoardObj = (obj) =>
  removeFromObject('currentPage')(
    removeFromObject('laneId')(removeFromObject('id')(obj))
  );
export const cleanupBoardData = (boardData) => ({
  ...cleanupBoardObj(boardData),
  lanes: boardData.lanes.map((lane) => ({
    ...cleanupBoardObj(lane),
    cards: lane.cards.map((card) => cleanupBoardObj(card)),
  })),
});

export const infuseBoardData = (boardData) => {
  return {
    ...boardData,
    lanes: boardData.lanes.map((lane) => {
      const laneId = uuid();
      return {
        ...lane,
        id: laneId,
        cards: lane.cards.map((card) => ({
          ...card,
          laneId,
          id: uuid(),
        })),
      };
    }),
  };
};
