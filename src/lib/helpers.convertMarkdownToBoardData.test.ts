import { convertMarkdownToBoardData } from './helpers';
import { KanbanBoard } from '../../types/react-trello';

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
  const result = convertMarkdownToBoardData(input);
  expect(result).toEqual(expectedResult);
});
