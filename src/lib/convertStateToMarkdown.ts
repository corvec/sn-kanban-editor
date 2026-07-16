import { KanbanBoard, KanbanCard } from '../../types/react-trello';
import { titleCase } from './helpers';
import {
  EditorConfig,
  EditorInterface,
  ParsingErrors,
} from '../../types/editor';
import {
  CONFIG_BLOCK_START,
  CONFIG_BLOCK_END,
  escapeMultiline,
} from './parseMarkdown';

export const convertStateToMarkdown = (state: EditorInterface): string => {
  const { boardData, editorConfig, parsingErrors } = state;

  const configText = convertEditorConfig(editorConfig);
  const boardText = convertBoardData(boardData);
  const errorText = convertParsingErrors(parsingErrors);
  return [configText, boardText, errorText].filter(Boolean).join('\n');
};

const convertParsingErrors = (parsingErrors: ParsingErrors[]): string => {
  const errorText = parsingErrors.map((error) => error.lineText).join('\n');
  return addNewlineIfNotEmpty(errorText);
};

const convertEditorConfig = (config: EditorConfig): string => {
  if (!config || Object.keys(config).length === 0) {
    return '';
  }
  return `${CONFIG_BLOCK_START}\n${JSON.stringify(
    config,
    null,
    2
  )}\n${CONFIG_BLOCK_END}\n`;
};

const convertBoardData = (boardData: KanbanBoard): string => {
  const boardText = boardData.lanes
    .map((lane) => `# ${lane.title}\n${convertCards(lane.cards)}`)
    .join('\n\n');
  return addNewlineIfNotEmpty(boardText);
};

const convertSublist = (name: string, entries?: Array<string>): string => {
  if (!entries || entries.length === 0) {
    return '';
  }
  const lines = entries.map((entry) => `    * ${entry}`).join('\n');
  return `\n  * ${name}:\n${lines}`;
};

const convertCards = (cards: Array<KanbanCard>): string => {
  const cardFields = ['description', 'label'];
  return cards
    .map((card) => {
      const parts: string[] = [];
      cardFields
        .map(fieldToMarkdown(card))
        .filter((_) => _)
        .forEach((fieldText) => parts.push(`\n${fieldText}`));
      if (card.tags && card.tags.length > 0) {
        parts.push(`\n  * Tags: ${card.tags.map((t) => t.title).join(', ')}`);
      }
      Object.entries(card.fields ?? {}).forEach(([key, value]) => {
        parts.push(`\n  * ${key}: ${value}`);
      });
      if (card.stableId) {
        parts.push(`\n  * Id: ${card.stableId}`);
      }
      parts.push(convertSublist('Comments', card.comments));
      parts.push(convertSublist('History', card.history));
      return `* ${card.title}${parts.join('')}`;
    })
    .join('\n');
};

const fieldToMarkdown = (card: KanbanCard) => (fieldName: string): string =>
  card[fieldName]
    ? `  * ${titleCase(fieldName)}: ${
        fieldName === 'description'
          ? escapeMultiline(card[fieldName])
          : card[fieldName]
      }`
    : null;

const addNewlineIfNotEmpty = (text: string): string => {
  return text ? `${text}\n` : '';
};
