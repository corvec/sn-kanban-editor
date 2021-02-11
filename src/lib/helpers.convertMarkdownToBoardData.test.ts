import { convertMarkdownToBoardData } from './helpers';

test('converts simple markdown file', () => {
  const input = `# Lane 1
* Card 1
  * Description: desc
  * Label: label`;
  const result = convertMarkdownToBoardData(input);
  expect(result.lanes.length).toEqual(1);
  expect(result.lanes[0].title).toEqual('Lane 1');
  expect(result.lanes[0].cards.length).toEqual(1);
  expect(result.lanes[0].cards[0].title).toEqual('Card 1');
  expect(result.lanes[0].cards[0].description).toEqual('desc');
  expect(result.lanes[0].cards[0].label).toEqual('label');
});
