import { KanbanBoard } from '../../types/react-trello';

const boardData: KanbanBoard = {
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

export default boardData;
