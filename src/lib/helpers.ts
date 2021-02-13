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

export const convertBoardDataToMarkdown = (boardData: KanbanBoard): string => {
  return boardData.lanes
    .map((lane) => `# ${lane.title}\n${convertCardsToMarkdown(lane.cards)}`)
    .join('\n\n');
};

const convertCardsToMarkdown = (cards: Array<KanbanCard>): string => {
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

const titleCaseWord = (text: string): string =>
  text.replace(/\w/, (firstLetter) => firstLetter.toUpperCase());

const titleCase = (text: string): string =>
  text
    .split(' ')
    .map((word) => titleCaseWord(word.toLowerCase()))
    .join(' ');

const fieldToMarkdown = (card: KanbanCard) => (fieldName: string): string =>
  card[fieldName] ? `  * ${titleCase(fieldName)}: ${card[fieldName]}` : null;

export const convertMarkdownToBoardData = (markdown: string): KanbanBoard => {
  const result: KanbanBoard = { lanes: [] };
  const lines = markdown.split('\n');
  let laneIndex = -1;
  let cardIndex = -1;
  for (let i = 0; i < lines.length; ++i) {
    const line = lines[i];
    const errorData = () =>
      `\nLine ${i}.\nLane Index: ${laneIndex}.\nCard Index: ${cardIndex}.\nLine text: ${line}`;
    if (!line) continue;
    if (line.startsWith('# ')) {
      laneIndex += 1;
      cardIndex = -1;
      const lane = { title: line.slice(2), cards: [] };
      result.lanes.push(lane);
    } else if (line.startsWith('* ')) {
      if (result.lanes.length === 0) {
        throw new Error('Cannot add cards before adding lanes!' + errorData());
      }
      const card: KanbanCard = { title: line.slice(2) };
      cardIndex += 1;
      result.lanes[laneIndex].cards.push(card);
    } else if (line.toLowerCase().startsWith('  * description: ')) {
      if (cardIndex < 0) {
        throw new Error(
          'Cannot add card fields before adding a card!' + errorData()
        );
      }
      result.lanes[laneIndex].cards[cardIndex].description = line.slice(17);
    } else if (line.toLowerCase().startsWith('  * label: ')) {
      if (cardIndex < 0) {
        throw new Error(
          'Cannot add card fields before adding a card!' + errorData()
        );
      }
      result.lanes[laneIndex].cards[cardIndex].label = line.slice(11);
    } else {
      console.log(`Cannot parse line: ${line}${errorData()}`);
    }
  }
  return result;
};
