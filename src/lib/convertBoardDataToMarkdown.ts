import { KanbanBoard, KanbanCard } from '../../types/react-trello';
import { titleCase } from './helpers';

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

const fieldToMarkdown = (card: KanbanCard) => (fieldName: string): string =>
  card[fieldName] ? `  * ${titleCase(fieldName)}: ${card[fieldName]}` : null;
