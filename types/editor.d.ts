import { KanbanBoard } from './react-trello';

declare module 'sn-kanban-editor';

export interface EditorInterface {
  printUrl?: boolean;
  boardData: KanbanBoard;
  editorConfig: EditorConfig;
  parsingErrors: ParsingErrors[];
}

export type CustomFieldType = 'text' | 'number' | 'date' | 'card-ref';

export interface CustomFieldDefinition {
  name: string;
  type: CustomFieldType;
}

export interface TagStyle {
  bgcolor?: string;
  color?: string;
  bold?: boolean;
}

export interface BoardTheme {
  /** CSS color overrides; when absent the Standard Notes theme applies */
  background?: string;
  foreground?: string;
  laneBackground?: string;
  cardBackground?: string;
  accent?: string;
}

export interface EditorConfig {
  /** When true, card create/move/edit events are recorded per card */
  history?: boolean;
  /** Optional color overrides; default is to inherit Standard Notes themes */
  theme?: BoardTheme;
  /** Known tags and their styling, keyed by tag title */
  tags?: Record<string, TagStyle>;
  /** Custom card fields available on this board */
  fields?: CustomFieldDefinition[];
}

export interface ParsingErrors {
  message: string;
  lineIndex: number;
  lineText: string;
  laneIndex?: number;
  cardIndex?: number;
}
