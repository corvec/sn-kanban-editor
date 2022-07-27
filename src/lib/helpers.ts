import { v4 as uuid } from 'uuid';
import { KanbanBoard, KanbanCard, KanbanLane } from '../../types/react-trello';

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

const cleanupBoardObj = <T extends object>(obj: T): T =>
  removeFromObject('currentPage')(
    removeFromObject('laneId')(removeFromObject('id')(obj))
  ) as T;

export const cleanupBoardData = (boardData: KanbanBoard): KanbanBoard => ({
  ...cleanupBoardObj(boardData),
  lanes: boardData.lanes.map((lane) => ({
    ...cleanupBoardObj(lane),
    cards: lane.cards.map((card) => cleanupBoardObj(card)),
  })),
});

export const infuseBoardData = (boardData: KanbanBoard): KanbanBoard => {
  return {
    ...boardData,
    lanes: boardData.lanes.map((lane: KanbanLane) => {
      const laneId = uuid();
      return {
        ...lane,
        id: laneId,
        cards: lane.cards.map((card: KanbanCard) => ({
          ...card,
          laneId,
          id: uuid(),
        })),
      };
    }),
  };
};

const titleCaseWord = (text: string): string =>
  text.replace(/\w/, (firstLetter) => firstLetter.toUpperCase());

export const titleCase = (text: string): string =>
  text
    .split(' ')
    .map((word) => titleCaseWord(word.toLowerCase()))
    .join(' ');
