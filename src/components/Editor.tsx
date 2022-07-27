import React from 'react';
import { EditorKit, EditorKitDelegate } from 'sn-editor-kit';
import { ModalProvider } from 'react-modal-hook';
import { KanbanBoard } from '../../types/react-trello';
import { infuseBoardData } from '../lib/helpers';
import { parseMarkdown } from '../lib/parseMarkdown';
import { convertStateToMarkdown } from '../lib/convertStateToMarkdown';
import './Editor.css';
import { EditorInterface } from '../../types/editor';
import { EditorInternal } from './EditorInternal';

const initialState: EditorInterface = {
  printUrl: false,
  boardData: {
    lanes: [],
  },
  editorConfig: '',
  parsingErrors: [],
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
    let delegate = new EditorKitDelegate({
      /** This loads every time a different note is loaded */
      setEditorRawText: (text: string) => {
        const newState = this.parseText(text);
        this.setState({
          ...initialState,
          ...newState,
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
      this.setState({ boardData });
      const markdown = convertStateToMarkdown({
        ...this.state,
        boardData,
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
          handleDataChange={this.handleDataChange}
        />
      </ModalProvider>
    );
  }
}
