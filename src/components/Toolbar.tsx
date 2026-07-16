import React from 'react';
import { IconSearch, IconSettings, IconX } from '@tabler/icons';
import { SEARCHABLE_FIELDS, SearchableField } from '../lib/search';

export interface ToolbarProps {
  query: string;
  setQuery: (query: string) => void;
  searchField: SearchableField | 'all';
  setSearchField: (field: SearchableField | 'all') => void;
  matchCount: number;
  lanes: Array<{ id: string; title: string }>;
  moveMatchesToLane: (laneId: string) => void;
  deleteMatches: () => void;
  openSettings: () => void;
}

export const Toolbar = ({
  query,
  setQuery,
  searchField,
  setSearchField,
  matchCount,
  lanes,
  moveMatchesToLane,
  deleteMatches,
  openSettings,
}: ToolbarProps) => (
  <div className="board-toolbar">
    <span className="toolbar-search">
      <IconSearch size={16} stroke={1.5} />
      <input
        type="search"
        placeholder="Search cards…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {query && (
        <button
          className="modal-icon-button"
          title="Clear search"
          onClick={() => setQuery('')}
        >
          <IconX size={14} stroke={1.5} />
        </button>
      )}
    </span>
    <select
      title="Fields to search"
      value={searchField}
      onChange={(e) =>
        setSearchField(e.target.value as SearchableField | 'all')
      }
    >
      <option value="all">All fields</option>
      {SEARCHABLE_FIELDS.map(({ key, label }) => (
        <option key={key} value={key}>
          {label}
        </option>
      ))}
    </select>
    {query && (
      <span className="toolbar-matches">
        {matchCount} {matchCount === 1 ? 'match' : 'matches'}
      </span>
    )}
    {query && matchCount > 0 && (
      <span className="toolbar-bulk-actions">
        <select
          title="Move all matching cards to a column"
          value=""
          onChange={(e) => {
            if (e.target.value) {
              moveMatchesToLane(e.target.value);
            }
          }}
        >
          <option value="">Move matches to…</option>
          {lanes.map((lane) => (
            <option key={lane.id} value={lane.id}>
              {lane.title}
            </option>
          ))}
        </select>
        <button
          onClick={() => {
            if (
              window.confirm(
                `Delete all ${matchCount} matching card${
                  matchCount === 1 ? '' : 's'
                }?`
              )
            ) {
              deleteMatches();
            }
          }}
        >
          Delete matches
        </button>
      </span>
    )}
    <span className="toolbar-spacer" />
    <button
      className="toolbar-settings-button"
      title="Board settings"
      onClick={openSettings}
    >
      <IconSettings size={18} stroke={1.5} />
    </button>
  </div>
);
