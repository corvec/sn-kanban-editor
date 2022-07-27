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
  Options = 'Options',
}

const defaultConfig = {};

export const parseMarkdown = (markdown: string): EditorInterface => {
  const boardData: KanbanBoard = {
    lanes: [],
  };
  const lines = markdown.split('\n');
  let laneIndex = -1;
  let cardIndex = -1;
  let propIndex = -1;
  let scope = Scope.Board;
  const editorConfig: EditorConfig = defaultConfig;
  const parsingErrors: ParsingErrors[] = [];

  for (let i = 0; i < lines.length; ++i) {
    const line = lines[i];
    // eslint-disable-next-line no-loop-func
    const errorData = (message: string) => ({
      message,
      lineIndex: i,
      laneIndex,
      cardIndex,
      lineText: line,
    });

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
      }
      const card: KanbanCard = { title: line.slice(2) };
      cardIndex += 1;
      scope = Scope.Card;
      boardData.lanes[laneIndex].cards.push(card);
    } else if (line.toLowerCase().startsWith('  * description: ')) {
      if (cardIndex < 0) {
        parsingErrors.push(
          errorData('Cannot add card fields before adding a card!')
        );
      }
      boardData.lanes[laneIndex].cards[cardIndex].description = line.slice(17);
    } else if (line.toLowerCase().startsWith('  * label: ')) {
      if (cardIndex < 0) {
        parsingErrors.push(
          errorData('Cannot add card fields before adding a card!')
        );
      }
      boardData.lanes[laneIndex].cards[cardIndex].label = line.slice(11);
    } else if (line.toLowerCase().startsWith('  * comments:')) {
      scope = Scope.Comments;
      boardData.lanes[laneIndex].cards[cardIndex].comments = [];
    } else if (
      scope === Scope.Comments &&
      line.toLowerCase().startsWith('    * ')
    ) {
      boardData.lanes[laneIndex].cards[cardIndex].comments.push(line.slice(6));
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
