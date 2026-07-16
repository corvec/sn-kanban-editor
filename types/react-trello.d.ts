declare module 'react-trello';
declare module 'react-trello/dist/styles/Base';
declare module 'react-trello/dist/widgets/InlineInput';

export interface KanbanTag {
  title: string;
  bgcolor?: string;
  color?: string;
}

export interface KanbanCard {
  id?: string;
  title: string;
  description?: string;
  label?: string;
  laneId?: string;
  comments?: Array<string>;
  tags?: Array<KanbanTag>;
  /** Custom field values, keyed by field name (defined per board in EditorConfig) */
  fields?: Record<string, string>;
  /** History entries, e.g. "[2026-07-16 10:00] Created" */
  history?: Array<string>;
  /** Persistent id saved in the markdown, used for card references */
  stableId?: string;
  style?: object;
}
export interface KanbanLane {
  id?: string;
  title: string;
  cards: Array<KanbanCard>;
  currentPage?: number;
}
export interface KanbanBoard {
  lanes: Array<KanbanLane>;
}
