import { convertBoardDataToMarkdown } from './convertBoardDataToMarkdown';

test('converts simple board data', () => {
  const input = {
    lanes: [
      {
        title: 'Lane 1',
        cards: [
          {
            title: 'Card 1',
            description: 'desc',
            label: 'label',
          },
        ],
      },
    ],
  };
  const expectedOutput = `# Lane 1
* Card 1
  * Description: desc
  * Label: label`;
  const result = convertBoardDataToMarkdown(input);
  expect(result).toEqual(expectedOutput);
});
