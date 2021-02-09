# Kanban Editor for Standard Notes

![Kanban Icon](/public/logo1080.png)

## Introduction

The Kanban Editor is an unofficial editor for [Standard Notes](https://standardnotes.org),
a free, open-source, end-to-end encrypted notes app.

It integrates [rcdexta/react-trello](https://github.com/rcdexta/react-trello).
into Standard Notes.

The main use case for this is for a Personal Kanban board, but you can use it for whatever you would like!

Please note that it is a very early release and I have plans to change how notes are saved.
Later releases **may not** be compatible with your existing notes.

## Demo

[Try out the demo here!](https://corvec.github.io/sn-kanban-editor/)
Note that any changes you make will be lost when you close your browser tab.

## Installation

1. Open the Standard Notes web or desktop app.
2. In the lower left corner of the app, click **Extensions**.
3. In the lower right corner, click **Import Extension**.
4. Paste `https://corvec.github.io/sn-kanban-editor/ext.json` in the input box that appears, then press enter on your keyboard.
5. Confirm adding the Kanban Editor.
6. Create a new note.
7. Open the "Editor" menu and then select "Kanban Editor"
8. Add a lane, add some cards, and have fun!

## Features

1. Manage cards with titles, descriptions, and labels
2. Drag and drop the cards between different "lanes"

## Project Roadmap

Please refer to the [Projects Roadmap](https://github.com/corvec/sn-kanban-editor/projects/1)
for details on planned future development (if any).

## Development

**Prerequisites:**
You can follow the instructions to those in the
[editor-template-cra-typescript repository](https://github.com/standardnotes/editor-template-cra-typescript)

You should be able to run either npm or yarn, your choice, to install project dependencies.

The general instructions setting up an environment to develop Standard Notes extensions can be found
[here](https://docs.standardnotes.org/extensions/local-setup). You can also follow these instructions:

1. Fork the [repository](https://github.com/standardnotes/editor-template-cra-typescript) on GitHub.
2. [Clone](https://help.github.com/en/github/creating-cloning-and-archiving-repositories/cloning-a-repository) your fork of the repository.
3. Run `cd editor-template-cra-typescript` to enter the `editor-template-cra-typescript` directory.
4. Run `yarn install` to install the dependencies on your machine as they are described in `yarn.lock`.

### Testing in the browser

1. Set PORT=3001 in your console.
2. Run `npm start` or `yarn start`
3. Visit http://localhost:3001.
4. In the console, press `ctrl/cmd + C` to exit development mode.

### Testing in the Standard Notes app

1. An `ext.json` file is already present in the public directory. You will likely want to edit it.
2. `http-server` should already be installed as a dev dependency.
   If not, install it with `npm i -g http-server`
3. Run `npm run build` or `yarn build` to build the app.
4. Serve the app by running `npm run server` or `yarn server`
5. Install the editor into the [web](https://app.standardnotes.org) or
   [desktop](https://standardnotes.org/download) app with `http://localhost:3000/ext.json`.
6. Press `ctrl/cmd + C` to shut down the server.

### Deployment

1. Run the `deploy-dev`, `deploy-build`, or `deploy-stable` commands with npm or yarn.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

This project was forked from [StandardNotes/editor-template-cra-typescript](https://github.com/standardnotes/editor-template-cra-typescript).
