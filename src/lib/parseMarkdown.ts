import { KanbanBoard, KanbanCard } from '../../types/react-trello';
import {
  EditorConfig,
  EditorInterface,
  ParsingErrors,
} from '../../types/editor';

enum Scope {
  Board = 'Board',
  Lane = 'Lane',
  Card = 'Card',
  Comments = 'Comments',
  History = 'History',
  Options = 'Options',
}

export const CONFIG_BLOCK_START = '<!-- kanban:config';
export const CONFIG_BLOCK_END = '-->';

/**
 * Card sub-fields with dedicated handling. Any other "  * Key: value" line
 * is treated as a custom field value.
 */
const RESERVED_FIELD_KEYS = [
  'description',
  'label',
  'tags',
  'id',
  'comments',
  'history',
];

const CUSTOM_FIELD_LINE = /^ {2}\* ([^:]+): (.*)$/;

/**
 * Descriptions may span multiple lines; they are stored on a single
 * markdown line with newlines escaped as "\n" (and backslashes as "\\").
 */
export const escapeMultiline = (text: string): string =>
  text.replace(/\\/g, '\\\\').replace(/\n/g, '\\n');

export const unescapeMultiline = (text: string): string =>
  text.replace(/\\(\\|n)/g, (_, char) => (char === 'n' ? '\n' : '\\'));

/**
 * Parses our Markdown code and transforms it into a state object
 * @param {string} markdown
 * @return {EditorInterface}
 */
export const parseMarkdown = (markdown: string): EditorInterface => {
  const boardData: KanbanBoard = {
    lanes: [],
  };
  const lines = markdown.split('\n');
  let laneIndex = -1; // a value of -1 denotes that we aren't in a lane
  let cardIndex = -1; // or card
  let scope = Scope.Board;
  let editorConfig: EditorConfig = {};
  const parsingErrors: ParsingErrors[] = [];

  let i = 0;

  // An optional board-configuration block may appear at the very top:
  //   <!-- kanban:config
  //   { ...JSON... }
  //   -->
  // It is invisible when the note is rendered as regular Markdown.
  if (lines[0]?.trim() === CONFIG_BLOCK_START) {
    const closingIndex = lines.findIndex(
      (line) => line.trim() === CONFIG_BLOCK_END
    );
    if (closingIndex > 0) {
      const configText = lines.slice(1, closingIndex).join('\n');
      try {
        editorConfig = JSON.parse(configText);
        i = closingIndex + 1;
      } catch (err) {
        parsingErrors.push({
          message: 'Could not parse board configuration block',
          lineIndex: 0,
          lineText: lines.slice(0, closingIndex + 1).join('\n'),
        });
        i = closingIndex + 1;
      }
    }
  }

  for (; i < lines.length; ++i) {
    const line = lines[i];
    // eslint-disable-next-line no-loop-func
    const errorData = (message: string) => ({
      message,
      lineIndex: i,
      laneIndex,
      cardIndex,
      lineText: line,
    });
    // eslint-disable-next-line no-loop-func
    const currentCard = (): KanbanCard | null => {
      if (laneIndex < 0 || cardIndex < 0) {
        parsingErrors.push(
          errorData('Cannot add card fields before adding a card!')
        );
        return null;
      }
      return boardData.lanes[laneIndex].cards[cardIndex];
    };

    if (!line) {
      if (
        i === 0 ||
        (parsingErrors.length > 0 &&
          parsingErrors[parsingErrors.length - 1].lineIndex === i - 1)
      ) {
        parsingErrors.push(errorData(''));
      }
      continue;
    }
    if (line.startsWith('# ')) {
      laneIndex += 1;
      cardIndex = -1;
      scope = Scope.Lane;
      const lane = { title: line.slice(2), cards: [] };
      boardData.lanes.push(lane);
    } else if (line.startsWith('* ')) {
      if (boardData.lanes.length === 0) {
        parsingErrors.push(errorData('Cannot add cards before adding lanes!'));
        continue;
      }
      const card: KanbanCard = { title: line.slice(2) };
      cardIndex += 1;
      scope = Scope.Card;
      boardData.lanes[laneIndex].cards.push(card);
    } else if (line.toLowerCase().startsWith('  * description: ')) {
      const card = currentCard();
      if (card) {
        card.description = unescapeMultiline(line.slice(17));
      }
    } else if (line.toLowerCase().startsWith('  * label: ')) {
      const card = currentCard();
      if (card) {
        card.label = line.slice(11);
      }
    } else if (line.toLowerCase().startsWith('  * tags: ')) {
      const card = currentCard();
      if (card) {
        card.tags = line
          .slice(10)
          .split(',')
          .map((title) => title.trim())
          .filter((title) => title.length > 0)
          .map((title) => ({ title }));
      }
    } else if (line.toLowerCase().startsWith('  * id: ')) {
      const card = currentCard();
      if (card) {
        card.stableId = line.slice(8).trim();
      }
    } else if (line.toLowerCase().startsWith('  * comments:')) {
      const card = currentCard();
      if (card) {
        scope = Scope.Comments;
        card.comments = [];
      }
    } else if (line.toLowerCase().startsWith('  * history:')) {
      const card = currentCard();
      if (card) {
        scope = Scope.History;
        card.history = [];
      }
    } else if (scope === Scope.Comments && line.startsWith('    * ')) {
      const card = currentCard();
      if (card) {
        card.comments.push(line.slice(6));
      }
    } else if (scope === Scope.History && line.startsWith('    * ')) {
      const card = currentCard();
      if (card) {
        card.history.push(line.slice(6));
      }
    } else if (CUSTOM_FIELD_LINE.test(line)) {
      // Any other "  * Key: value" line is a custom field
      const [, key, value] = line.match(CUSTOM_FIELD_LINE);
      if (RESERVED_FIELD_KEYS.includes(key.trim().toLowerCase())) {
        // e.g. "  * Description:" with no trailing space and no value
        parsingErrors.push(errorData('Cannot parse line'));
        continue;
      }
      const card = currentCard();
      if (card) {
        card.fields = { ...card.fields, [key.trim()]: value };
      }
    } else {
      parsingErrors.push(errorData('Cannot parse line'));
    }
  }
  return {
    boardData,
    editorConfig,
    parsingErrors,
  };
};
