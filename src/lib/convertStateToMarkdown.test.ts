import { convertStateToMarkdown } from './convertStateToMarkdown';
import { KanbanBoard } from '../../types/react-trello';
import boardWithComments from '../mocks/boardWithComments';
import simpleBoard from '../mocks/simpleBoard';
import fs from 'fs/promises';

// const boardWithCommentsMarkdown = require('../mocks/boardWithComments.markdown');
// const simpleBoardMarkdown = require('../mocks/simpleBoard.markdown');

const defaultState = {
  editorConfig: {},
  parsingErrors: [],
};

test('converts simple board data', async () => {
  const boardData = simpleBoard;
  const simpleBoardMarkdown = await fs.readFile(
    './src/mocks/simpleBoard.markdown',
    'utf8'
  );
  const expectedOutput = simpleBoardMarkdown.trim();
  const result = convertStateToMarkdown({ ...defaultState, boardData });
  expect(result.trim()).toEqual(expectedOutput);
});

test('converts JSON with cards with comments', async () => {
  const boardData: KanbanBoard = boardWithComments;
  // const boardWithCommentsMarkdown = require('../mocks/boardWithComments.markdown');
  const boardWithCommentsMarkdown = await fs.readFile(
    './src/mocks/boardWithComments.markdown',
    'utf8'
  );
  const expectedResult = boardWithCommentsMarkdown.trim();
  const result = convertStateToMarkdown({ ...defaultState, boardData });
  expect(result.trim()).toEqual(expectedResult);
});
