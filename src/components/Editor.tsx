import React from 'react';
import EditorKit, { EditorKitDelegate } from '@standardnotes/editor-kit';
import { ModalProvider } from 'react-modal-hook';
import { KanbanBoard, KanbanCard } from '../../types/react-trello';
import { infuseBoardData } from '../lib/helpers';
import { parseMarkdown } from '../lib/parseMarkdown';
import { isTrelloExport, parseTrelloJson } from '../lib/parseTrelloJson';
import { convertStateToMarkdown } from '../lib/convertStateToMarkdown';
import { stampDateTime } from '../lib/datetime';
import './Editor.css';
import { EditorConfig, EditorInterface } from '../../types/editor';
import { EditorInternal } from './EditorInternal';

interface PendingHistoryEntry {
  cardId: string;
  entry: string;
}

const initialState: EditorInterface = {
  printUrl: false,
  boardData: {
    lanes: [],
  },
  editorConfig: {},
  parsingErrors: [],
};

let keyMap = new Map();

export default class Editor extends React.Component<{}, EditorInterface> {
  editorKit: any;

  /**
   * History entries recorded by react-trello callbacks (card added, card
   * dragged across lanes, inline edits). The callbacks fire before
   * onDataChange delivers the updated board, so the entries are held here
   * and merged into the matching cards in handleDataChange.
   */
  pendingHistory: PendingHistoryEntry[] = [];

  constructor(props: EditorInterface) {
    super(props);
    this.configureEditorKit();
    this.state = {
      ...initialState,
      ...props,
    };
  }

  historyEnabled = (): boolean => Boolean(this.state.editorConfig?.history);

  laneTitle = (laneId: string): string =>
    this.state.boardData.lanes.find((lane) => lane.id === laneId)?.title ??
    'unknown';

  onCardAdd = (card: KanbanCard, laneId: string) => {
    if (!this.historyEnabled() || !card.id) {
      return;
    }
    this.pendingHistory.push({
      cardId: card.id,
      entry: stampDateTime(`Created in "${this.laneTitle(laneId)}"`),
    });
  };

  onCardMoveAcrossLanes = (
    fromLaneId: string,
    toLaneId: string,
    cardId: string
  ) => {
    if (!this.historyEnabled() || fromLaneId === toLaneId) {
      return;
    }
    this.pendingHistory.push({
      cardId,
      entry: stampDateTime(
        `Moved from "${this.laneTitle(fromLaneId)}" to "${this.laneTitle(
          toLaneId
        )}"`
      ),
    });
  };

  /** Fires on inline card edits (title/label/description on the card) */
  onCardUpdate = (laneId: string, card: Partial<KanbanCard>) => {
    if (!this.historyEnabled() || !card.id) {
      return;
    }
    const oldCard = this.state.boardData.lanes
      .find((lane) => lane.id === laneId)
      ?.cards.find((laneCard) => laneCard.id === card.id);
    if (!oldCard) {
      return;
    }
    if (card.title !== undefined && card.title !== oldCard.title) {
      this.pendingHistory.push({
        cardId: card.id,
        entry: stampDateTime('Title edited'),
      });
    }
    if (
      card.description !== undefined &&
      card.description !== (oldCard.description ?? '')
    ) {
      this.pendingHistory.push({
        cardId: card.id,
        entry: stampDateTime('Description edited'),
      });
    }
  };

  mergePendingHistory = (boardData: KanbanBoard): KanbanBoard => {
    if (this.pendingHistory.length === 0) {
      return boardData;
    }
    const pending = this.pendingHistory;
    this.pendingHistory = [];
    return {
      ...boardData,
      lanes: boardData.lanes.map((lane) => ({
        ...lane,
        cards: lane.cards.map((card) => {
          const entries = pending
            .filter((item) => item.cardId === card.id)
            .map((item) => item.entry);
          return entries.length > 0
            ? { ...card, history: [...(card.history ?? []), ...entries] }
            : card;
        }),
      })),
    };
  };

  parseText(text: string): EditorInterface {
    // In the very first version of this editor, we saved the data as JSON.
    // However, we no longer save the data as JSON.
    // This may be removed at some point in the future.
    try {
      const data = JSON.parse(text);
      if (data.hasOwnProperty('lanes')) {
        console.log('Parsed data from JSON.');
        return data;
      }
      if (isTrelloExport(data)) {
        console.log('Parsed data from a Trello JSON export.');
        return parseTrelloJson(data);
      }
    } catch (err) {
      /* Do Nothing */
    }
    try {
      return parseMarkdown(text);
    } catch {
      console.log('Could not parse data from Markdown.');
      const textByLine = text.split('\n');
      return {
        ...initialState,
        parsingErrors: textByLine.map((lineText, lineIndex) => ({
          lineText,
          lineIndex,
          message: 'Complete Markdown parsing failure',
        })),
      };
    }
  }

  configureEditorKit = () => {
    const delegate: EditorKitDelegate = {
      /** This loads every time a different note is loaded */
      setEditorRawText: (text: string) => {
        const newState = this.parseText(text);
        this.setState({
          ...initialState,
          ...newState,
        });
      },
      clearUndoHistory: () => {},
      handleRequestForContentHeight: () => undefined,
    };

    this.editorKit = new EditorKit(delegate, {
      mode: 'plaintext',
    });
  };

  handleDataChange = (boardData: KanbanBoard) => {
    if (typeof boardData === 'string') {
      this.parseText(boardData);
      const newState = this.parseText(boardData);
      this.setState({
        ...this.state,
        ...newState,
      });
      console.log('Convert board data from markdown and infuse');
    } else if (boardData.lanes.length === 0) {
      this.setState({ boardData });
    } else if (boardData.lanes[0].id) {
      // The only time we should save is when a change ACTUALLY happened.
      const withHistory = this.mergePendingHistory(boardData);
      this.setState({ boardData: withHistory });
      const markdown = convertStateToMarkdown({
        ...this.state,
        boardData: withHistory,
      });
      this.saveNote(markdown);
    } else {
      // If the board was saved without IDs, we need to repopulate those IDs.
      // This should only happen when first loading a note.
      const infusedBoardData = infuseBoardData(boardData);
      this.setState({ boardData: infusedBoardData });
      console.log('Infused board data');
    }
  };

  handleConfigChange = (editorConfig: EditorConfig) => {
    this.setState({ editorConfig }, () => {
      this.saveNote(convertStateToMarkdown(this.state));
    });
  };

  saveNote = (text: string) => {
    /** This will work in an SN context, but breaks the standalone editor,
     * so we need to catch the error
     */
    try {
      this.editorKit.onEditorValueChanged(text);
    } catch (error) {
      console.log('Error saving note:', error);
    }
  };

  onBlur = (e: React.FocusEvent) => {};

  onFocus = (e: React.FocusEvent) => {};

  onKeyDown = (e: React.KeyboardEvent | KeyboardEvent) => {
    keyMap.set(e.key, true);
    // Do nothing if 'Control' and 's' are pressed
    if (keyMap.get('Control') && keyMap.get('s')) {
      e.preventDefault();
    }
  };

  onKeyUp = (e: React.KeyboardEvent | KeyboardEvent) => {
    keyMap.delete(e.key);
  };

  render() {
    return (
      <ModalProvider>
        <EditorInternal
          printUrl={this.state.printUrl}
          boardData={this.state.boardData}
          editorConfig={this.state.editorConfig}
          handleDataChange={this.handleDataChange}
          handleConfigChange={this.handleConfigChange}
          onCardAdd={this.onCardAdd}
          onCardUpdate={this.onCardUpdate}
          onCardMoveAcrossLanes={this.onCardMoveAcrossLanes}
        />
      </ModalProvider>
    );
  }
}
