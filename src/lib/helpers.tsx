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

export const infuseBoardData = (boardData: KanbanBoard) => {
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

export const convertToMarkdown = (boardData: KanbanBoard) => {
  return boardData.lanes
    .map((lane) => `# ${lane.title}\n${convertCardsToMarkdown(lane.cards)}`)
    .join('\n\n');
};

const convertCardsToMarkdown = (cards: Array<KanbanCard>) => {
  const cardFields = ['description', 'label'];
  return cards
    .map((card) => {
      const fieldData = cardFields
        .map(fieldToMarkdown(card))
        .filter((_) => _)
        .join('\n');
      return `* ${card.title}${fieldData && '\n'}${fieldData}`;
    })
    .join('\n');
};

const fieldToMarkdown = (card) => (fieldName) =>
  card[fieldName] ? `  * ${fieldName}: ${card[fieldName]}` : null;
