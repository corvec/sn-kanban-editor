# Kanban Editor for Standard Notes

![Kanban Icon](/public/demo.png)

## Introduction

The Kanban Editor is an unofficial editor for [Standard Notes](https://standardnotes.org),
a free, open-source, end-to-end encrypted notes app.

It integrates [rcdexta/react-trello](https://github.com/rcdexta/react-trello), a Kanban board editor,
and saves your notes in Markdown so that you can easily read them, export them to Listed, etc..

Because Standard Notes has [not yet implemented collaborative editing](https://standardnotes.com/help/50/can-i-collaborate-with-others-on-a-note), the main use case is for a personal Kanban board.
However, I believe [private workspaces](https://standardnotes.com/help/80/what-are-private-workspaces) can be shared to enable asynchronous collaboration.

NOTE: The file format is much more stable now, but it will continue to evolve.
I plan to keep the file format backwards compatible.
However, it is possible that changes will be required in the future that could cause incompatibilities with existing notes.
If possible, I will provide a migration tool to convert your notes to the new format.

## Demo

[Try out the demo here!](https://corvec.github.io/sn-kanban-editor/)
Note that any changes you make will be lost when you close your browser tab.

## Installation

1. Open the Standard Notes web or desktop app.
2. In the lower left corner of the app, click **Extensions**.
3. In the lower right corner, click **Import Extension**.
4. In the input box appears, paste:

```
https://corvec.github.io/sn-kanban-editor/ext.json
```

6. Confirm adding the Kanban Editor.
7. Create a new note.
8. Open the "Editor" menu and then select "Kanban Editor"
9. Add a lane, add some cards, and have fun!

## Features

1. Manage cards with titles, descriptions, and labels
2. Drag and drop the cards between different "lanes"

## Project Roadmap

Please refer to the [Projects Roadmap](https://github.com/corvec/sn-kanban-editor/projects/1)
for details on planned future development (if any).

## Development and Running Locally

**Prerequisites:**

1. (Optional) Fork this repo on Github.
2. [Clone](https://help.github.com/en/github/creating-cloning-and-archiving-repositories/cloning-a-repository) this repo or your fork.
3. Run `cd sn-kanban-editor` and then `npm install` to install all dependencies.

### Testing in the browser

1. Run

```
npm start
```

2. Your browser may open automatically. If not, open your browser and navigate to `http://localhost:3001/`
3. When you're done, in the console, press `ctrl/cmd + C` to stop running the app.

### Testing in your local Standard Notes app

1. An `ext.dev.json` file is already present in the public directory. You may wish to edit it.
2. To build the app, run

```
npm run build
```

4. To serve the app, run

```
npm run server
```

5. Install the editor into the [web](https://app.standardnotes.org) or
   [desktop](https://standardnotes.org/download) app by installing:

```
http://localhost:3000/ext.json
```

6. When you're done, in the console, press `ctrl + C` to shut down the server.

If you run into issues, please refer to the [StandardNotes instructions for local setup](https://docs.standardnotes.com/extensions/local-setup/)

### Deployment

1. Update the package.json version, the public/ext.json version, and the public/ext.dev.json version
2. Update the following command to account for the updates that you wish to deploy as well as the current version, then run it.

```
npx gh-pages -b gh-pages -d build -m "Support comments on cards (show modal on click)" -g "v0.4.0"
```

3. On GitHub, create a new release corresponding to that tag.

This project was forked from [StandardNotes/editor-template-cra-typescript](https://github.com/standardnotes/editor-template-cra-typescript),
which was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
