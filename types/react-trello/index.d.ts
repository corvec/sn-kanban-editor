declare module 'react-trello';

export interface KanbanCard {
  id: string;
  title: string;
  description: string;
  label: string;
  laneId: string;
}
export interface KanbanLane {
  id: string;
  title: string;
  cards: Array<KanbanCard>;
}
export interface KanbanBoard {
  lanes: Array<KanbanLane>;
}

