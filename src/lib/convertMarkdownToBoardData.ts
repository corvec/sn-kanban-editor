import { KanbanBoard, KanbanCard } from '../../types/react-trello';

export const convertMarkdownToBoardData = (markdown: string): KanbanBoard => {
  const result: KanbanBoard = { lanes: [] };
  const lines = markdown.split('\n');
  let laneIndex = -1;
  let cardIndex = -1;
  for (let i = 0; i < lines.length; ++i) {
    const line = lines[i];
    const errorData = () =>
      `\nLine ${i}.\nLane Index: ${laneIndex}.\nCard Index: ${cardIndex}.\nLine text: ${line}`;
    if (!line) continue;
    if (line.startsWith('# ')) {
      laneIndex += 1;
      cardIndex = -1;
      const lane = { title: line.slice(2), cards: [] };
      result.lanes.push(lane);
    } else if (line.startsWith('* ')) {
      if (result.lanes.length === 0) {
        throw new Error('Cannot add cards before adding lanes!' + errorData());
      }
      const card: KanbanCard = { title: line.slice(2) };
      cardIndex += 1;
      result.lanes[laneIndex].cards.push(card);
    } else if (line.toLowerCase().startsWith('  * description: ')) {
      if (cardIndex < 0) {
        throw new Error(
          'Cannot add card fields before adding a card!' + errorData()
        );
      }
      result.lanes[laneIndex].cards[cardIndex].description = line.slice(17);
    } else if (line.toLowerCase().startsWith('  * label: ')) {
      if (cardIndex < 0) {
        throw new Error(
          'Cannot add card fields before adding a card!' + errorData()
        );
      }
      result.lanes[laneIndex].cards[cardIndex].label = line.slice(11);
    } else {
      console.log(`Cannot parse line: ${line}${errorData()}`);
    }
  }
  return result;
};
