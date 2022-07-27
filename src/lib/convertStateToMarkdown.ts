import { KanbanBoard, KanbanCard } from '../../types/react-trello';
import { titleCase } from './helpers';
import { EditorConfig, EditorInterface } from '../../types/editor';

export const convertStateToMarkdown = (state: EditorInterface): string => {
  const { boardData, editorConfig, parsingErrors } = state;

  const boardText = boardData.lanes
    .map((lane) => `# ${lane.title}\n${convertCardsToMarkdown(lane.cards)}`)
    .join('\n\n');
  const configText = parseConfig(editorConfig);
  const errorText = parsingErrors.map((error) => error.lineText).join('\n');
  return `${configText}\n\n${boardText}\n\n${errorText}`;
};

const parseConfig = (config: EditorConfig): string => {
  return '';
};

const convertCardsToMarkdown = (cards: Array<KanbanCard>): string => {
  const cardFields = ['description', 'label'];
  return cards
    .map((card) => {
      const fieldData = cardFields
        .map(fieldToMarkdown(card))
        .filter((_) => _)
        .join('\n');
      const commentData = (card.comments || [])
        .map((comment) => `    * ${comment}`)
        .join('\n');
      return `* ${card.title}${fieldData && '\n'}${fieldData}${
        commentData && '\n  * Comments:\n'
      }${commentData}`;
    })
    .join('\n');
};

const fieldToMarkdown = (card: KanbanCard) => (fieldName: string): string =>
  card[fieldName] ? `  * ${titleCase(fieldName)}: ${card[fieldName]}` : null;
