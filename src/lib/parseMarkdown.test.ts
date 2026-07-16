import { KanbanBoard } from '../../types/react-trello';
import { parseMarkdown } from './parseMarkdown';
import featureBoard, { featureBoardConfig } from '../mocks/featureBoard';
import fs from 'fs/promises';

test('converts simple markdown file', () => {
  const input = `# Lane 1
* Card 1
  * Description: desc
  * Label: label`;
  const expectedResult: KanbanBoard = {
    lanes: [
      {
        title: 'Lane 1',
        cards: [{ title: 'Card 1', description: 'desc', label: 'label' }],
      },
    ],
  };
  const { boardData } = parseMarkdown(input);
  expect(boardData).toEqual(expectedResult);
});

test('converts markdown with cards with comments', () => {
  const input = `# Lane 1
* Card 1
  * Description: desc
  * Label: label
  * Comments:
    * Comment 1
    * Comment 2
    * Comment 3
* Card 2
  * Description: desc 2
  * Label: label 2
  * Comments:
    * Comment 4
    * Comment 5

# Lane 2
* Card 3
  * Description: desc 3
  * Label: label 3
  * Comments:
    * Comment 6`;
  const expectedResult: KanbanBoard = {
    lanes: [
      {
        title: 'Lane 1',
        cards: [
          {
            title: 'Card 1',
            description: 'desc',
            label: 'label',
            comments: ['Comment 1', 'Comment 2', 'Comment 3'],
          },
          {
            title: 'Card 2',
            description: 'desc 2',
            label: 'label 2',
            comments: ['Comment 4', 'Comment 5'],
          },
        ],
      },
      {
        title: 'Lane 2',
        cards: [
          {
            title: 'Card 3',
            description: 'desc 3',
            label: 'label 3',
            comments: ['Comment 6'],
          },
        ],
      },
    ],
  };
  const { boardData } = parseMarkdown(input);
  expect(boardData).toEqual(expectedResult);
});

test('parses the extended format: config, tags, custom fields, ids, history', async () => {
  const input = await fs.readFile('./src/mocks/featureBoard.markdown', 'utf8');
  const { boardData, editorConfig, parsingErrors } = parseMarkdown(input);
  expect(parsingErrors).toEqual([]);
  expect(editorConfig).toEqual(featureBoardConfig);
  expect(boardData).toEqual(featureBoard);
});

test('parses tags into tag objects', () => {
  const input = `# Lane 1
* Card 1
  * Tags: Pink, Green Tea`;
  const { boardData } = parseMarkdown(input);
  expect(boardData.lanes[0].cards[0].tags).toEqual([
    { title: 'Pink' },
    { title: 'Green Tea' },
  ]);
});

test('treats unknown key-value lines as custom fields', () => {
  const input = `# Lane 1
* Card 1
  * Story Points: 13`;
  const { boardData, parsingErrors } = parseMarkdown(input);
  expect(parsingErrors).toEqual([]);
  expect(boardData.lanes[0].cards[0].fields).toEqual({ 'Story Points': '13' });
});

test('reports an error for an invalid config block but keeps parsing', () => {
  const input = `<!-- kanban:config
{ not valid json
-->
# Lane 1
* Card 1`;
  const { boardData, parsingErrors } = parseMarkdown(input);
  expect(parsingErrors).toHaveLength(1);
  expect(parsingErrors[0].message).toEqual(
    'Could not parse board configuration block'
  );
  expect(boardData.lanes[0].cards[0].title).toEqual('Card 1');
});

test('keeps history entries separate from comments', () => {
  const input = `# Lane 1
* Card 1
  * Comments:
    * A comment
  * History:
    * [2026-07-16 10:00] Created in "Lane 1"`;
  const { boardData } = parseMarkdown(input);
  const card = boardData.lanes[0].cards[0];
  expect(card.comments).toEqual(['A comment']);
  expect(card.history).toEqual(['[2026-07-16 10:00] Created in "Lane 1"']);
});
