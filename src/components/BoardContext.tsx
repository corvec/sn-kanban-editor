import React from 'react';
import { EditorConfig } from '../../types/editor';

export interface SearchState {
  query: string;
  /** Field names to search; empty array means "all fields" */
  fields: string[];
  matchedIds: Set<string>;
}

export interface BoardContextValue {
  config: EditorConfig;
  searchState: SearchState | null;
  /**
   * Tag titles known to the board (configured or in use). Label parts
   * matching one of these render as tag chips on cards.
   */
  knownTags: Set<string>;
}

/**
 * Shares board-level settings (tag styles, custom fields, search state)
 * with deeply nested react-trello card components without going through
 * the board data prop — mutating the data prop would make react-trello
 * reload the entire board.
 */
export const BoardContext = React.createContext<BoardContextValue>({
  config: {},
  searchState: null,
  knownTags: new Set(),
});
