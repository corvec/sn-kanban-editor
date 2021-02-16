import React from 'react';
import { EditorKit, EditorKitDelegate } from 'sn-editor-kit';
import Board from 'react-trello';
import { cleanupBoardData, infuseBoardData } from '../lib/helpers';
import { KanbanBoard } from '../../types/react-trello';
import { convertMarkdownToBoardData } from '../lib/convertMarkdownToBoardData';
import './Editor.css';

import { convertBoardDataToMarkdown } from '../lib/convertBoardDataToMarkdown';
export enum HtmlElementId {
  board = 'board',
  snComponent = 'sn-component',
}

export enum HtmlClassName {
  board = 'sk-input contrast board',
  snComponent = 'sn-component',
}

export interface EditorInterface {
  printUrl: boolean;
  boardData: object;
}

const initialState = {
  printUrl: false,
  boardData: { lanes: [] },
};

let keyMap = new Map();

export default class Editor extends React.Component<{}, EditorInterface> {
  editorKit: any;

  constructor(props: EditorInterface) {
    super(props);
    this.configureEditorKit();
    this.state = {
      ...initialState,
      ...props,
    };
  }

  configureEditorKit = () => {
    let delegate = new EditorKitDelegate({
      /** This loads every time a different note is loaded */
      setEditorRawText: (text: string) => {
        // TODO: handle failures to parse
        const parsedBoardData = (() => {
          try {
            const data = JSON.parse(text);
            if (data.hasOwnProperty('lanes')) {
              return data;
            }
          } catch (err) {
            console.log('Could not parse note as JSON, trying Markdown');
            const data = convertMarkdownToBoardData(text);
            return data;
          }
          return { lanes: [] };
        })();
        this.setState({
          ...initialState,
          boardData: parsedBoardData,
        });
      },
      clearUndoHistory: () => {},
      getElementsBySelector: () => [],
    });

    this.editorKit = new EditorKit({
      delegate: delegate,
      mode: 'plaintext',
      supportsFilesafe: false,
    });
  };

  handleDataChange = (boardData: KanbanBoard) => {
    const markdown = convertBoardDataToMarkdown(boardData);
    this.saveNote(markdown);
    if (typeof boardData === 'string') {
      const newBoardData = infuseBoardData(
        convertMarkdownToBoardData(boardData)
      );
      this.setState({ boardData: newBoardData });
      console.log('Convert board data from markdown and infuse');
    } else if (boardData.lanes.length === 0 || boardData.lanes[0].id) {
      this.setState({ boardData });
      console.log('No need to infuse board data');
    } else {
      // If the board was saved without IDs, we need to repopulate those IDs.
      // This should only happen when first loading a note.
      const infusedBoardData = infuseBoardData(boardData);
      this.setState({ boardData: infusedBoardData });
      console.log('Infused board data');
    }
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
      <div
        className={
          HtmlElementId.snComponent + (this.state.printUrl ? ' print-url' : '')
        }
        id={HtmlElementId.snComponent}
        tabIndex={0}
      >
        <Board
          id={HtmlElementId.board}
          data={this.state.boardData}
          canAddLanes
          editable
          editLaneTitle
          onDataChange={this.handleDataChange}
        />
      </div>
    );
  }
}
