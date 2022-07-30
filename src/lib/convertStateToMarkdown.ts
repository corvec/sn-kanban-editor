import { KanbanBoard, KanbanCard } from '../../types/react-trello';
import { titleCase } from './helpers';
import {
  EditorConfig,
  EditorInterface,
  ParsingErrors,
} from '../../types/editor';

export const convertStateToMarkdown = (state: EditorInterface): string => {
  const { boardData, editorConfig, parsingErrors } = state;

  const boardText = convertBoardData(boardData);
  const configText = convertEditorConfig(editorConfig);
  const errorText = convertParsingErrors(parsingErrors);
  return `${boardText}${configText}${errorText}`;
};

const convertParsingErrors = (parsingErrors: ParsingErrors[]): string => {
  const errorText = parsingErrors.map((error) => error.lineText).join('\n');
  return addNewlineIfNotEmpty(errorText);
};

const convertEditorConfig = (config: EditorConfig): string => {
  const configText = '';
  return addNewlineIfNotEmpty(configText);
};

const convertBoardData = (boardData: KanbanBoard): string => {
  const boardText = boardData.lanes
    .map((lane) => `# ${lane.title}\n${convertCards(lane.cards)}`)
    .join('\n\n');
  return addNewlineIfNotEmpty(boardText);
};

const convertCards = (cards: Array<KanbanCard>): string => {
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

const addNewlineIfNotEmpty = (text: string): string => {
  return text ? `${text}\n` : '';
};
