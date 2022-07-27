import { KanbanBoard } from './react-trello';

declare module 'sn-kanban-editor';

export interface EditorInterface {
  printUrl?: boolean;
  boardData: KanbanBoard;
  editorConfig: EditorConfig;
  parsingErrors: ParsingErrors[];
}

export interface EditorConfig {}

export interface ParsingErrors {
  message: string;
  lineIndex: number;
  lineText: string;
  laneIndex?: number;
  cardIndex?: number;
}
