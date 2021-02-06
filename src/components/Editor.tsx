import React from 'react';
import { EditorKit, EditorKitDelegate } from 'sn-editor-kit';
import Board from 'react-trello';
import { removeFromObject } from '../lib/helpers';

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

interface KanbanCard {
  id: string;
  title: string;
  description: string;
  laneId: string;
}
interface KanbanLane {
  cards: Array<KanbanCard>;
}
export interface KanbanBoard {
  lanes: Array<KanbanLane>;
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
    this.state = initialState;
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
            console.error('Could not parse note as JSON');
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
    const cleanupObject = (obj) =>
      removeFromObject('currentPage')(
        removeFromObject('laneId')(removeFromObject('id')(obj))
      );
    const cleanBoardData = {
      ...cleanupObject(boardData),
      lanes: boardData.lanes.map((lane) => ({
        ...cleanupObject(lane),
        cards: lane.cards.map((card) => cleanupObject(card)),
      })),
    };
    const text = JSON.stringify(cleanBoardData, null, 2);
    this.saveNote(text);
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
    const { boardData } = this.state;
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
          data={boardData}
          canAddLanes
          editable
          editLaneTitle
          onDataChange={this.handleDataChange}
        />
      </div>
    );
  }
}
