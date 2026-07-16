import { convertStateToMarkdown } from './convertStateToMarkdown';
import { parseMarkdown } from './parseMarkdown';
import { KanbanBoard } from '../../types/react-trello';
import boardWithComments from '../mocks/boardWithComments';
import simpleBoard from '../mocks/simpleBoard';
import featureBoard, { featureBoardConfig } from '../mocks/featureBoard';
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

test('converts the extended format: config, tags, custom fields, ids, history', async () => {
  const featureBoardMarkdown = await fs.readFile(
    './src/mocks/featureBoard.markdown',
    'utf8'
  );
  const result = convertStateToMarkdown({
    boardData: featureBoard,
    editorConfig: featureBoardConfig,
    parsingErrors: [],
  });
  expect(result.trim()).toEqual(featureBoardMarkdown.trim());
});

test('markdown round-trips through parse and serialize', async () => {
  const featureBoardMarkdown = await fs.readFile(
    './src/mocks/featureBoard.markdown',
    'utf8'
  );
  const state = parseMarkdown(featureBoardMarkdown);
  expect(convertStateToMarkdown(state).trim()).toEqual(
    featureBoardMarkdown.trim()
  );
});
