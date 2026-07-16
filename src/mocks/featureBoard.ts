import { KanbanBoard } from '../../types/react-trello';
import { EditorConfig } from '../../types/editor';

export const featureBoardConfig: EditorConfig = {
  history: true,
  theme: {
    background: '#20202b',
    accent: '#086dd6',
  },
  tags: {
    Pink: { bgcolor: 'pink', color: '#333' },
    Green: { color: 'green', bold: true },
  },
  fields: [
    { name: 'Points', type: 'number' },
    { name: 'Blocks', type: 'card-ref' },
  ],
};

const boardData: KanbanBoard = {
  lanes: [
    {
      title: 'Todo',
      cards: [
        {
          title: 'Card 1',
          description: 'desc with **bold**',
          label: 'tomorrow',
          tags: [{ title: 'Pink' }, { title: 'Green' }],
          fields: { Points: '5', Blocks: 'abc123' },
          stableId: 'abc123',
          comments: ['[2026-07-16 10:00] First comment'],
          history: [
            '[2026-07-15 09:00] Created in "Todo"',
            '[2026-07-16 10:05] Title edited',
          ],
        },
        {
          title: 'Card 2',
        },
      ],
    },
    {
      title: 'Done',
      cards: [],
    },
  ],
};

export default boardData;
