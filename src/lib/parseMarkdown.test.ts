import { KanbanBoard } from '../../types/react-trello';
import { parseMarkdown } from './parseMarkdown';

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
