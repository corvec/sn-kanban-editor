import { KanbanBoard, KanbanCard, KanbanTag } from '../../types/react-trello';
import { EditorConfig, TagStyle } from '../../types/editor';
import { EditorInterface } from '../../types/editor';
import { formatDateTime } from './datetime';

/**
 * Converts a Trello board export (JSON) into editor state. The note is
 * saved back as our Markdown format the next time the board changes.
 *
 * Mapped: open lists -> lanes, open cards -> cards (name/desc), labels ->
 * tags (with Trello's colors registered as tag styles in the board
 * config), due dates -> a "Due" custom field, and commentCard actions ->
 * comments with datetime prefixes.
 * Not mapped: checklists, attachments, members.
 */

interface TrelloLabel {
  name?: string;
  color?: string;
}

interface TrelloList {
  id: string;
  name: string;
  closed?: boolean;
  pos?: number;
}

interface TrelloCard {
  id: string;
  name: string;
  desc?: string;
  idList: string;
  closed?: boolean;
  pos?: number;
  due?: string | null;
  labels?: TrelloLabel[];
}

interface TrelloAction {
  type: string;
  date?: string;
  data?: { card?: { id?: string }; text?: string };
}

export interface TrelloExport {
  name?: string;
  lists: TrelloList[];
  cards: TrelloCard[];
  actions?: TrelloAction[];
}

export const isTrelloExport = (data: any): data is TrelloExport =>
  Boolean(data) &&
  typeof data === 'object' &&
  Array.isArray(data.lists) &&
  Array.isArray(data.cards);

/** Trello's label palette, so imported tags keep their colors */
const TRELLO_COLORS: Record<string, TagStyle> = {
  green: { bgcolor: '#61bd4f', color: 'white' },
  yellow: { bgcolor: '#f2d600', color: '#333333' },
  orange: { bgcolor: '#ff9f1a', color: 'white' },
  red: { bgcolor: '#eb5a46', color: 'white' },
  purple: { bgcolor: '#c377e0', color: 'white' },
  blue: { bgcolor: '#0079bf', color: 'white' },
  sky: { bgcolor: '#00c2e0', color: '#333333' },
  lime: { bgcolor: '#51e898', color: '#333333' },
  pink: { bgcolor: '#ff78cb', color: '#333333' },
  black: { bgcolor: '#344563', color: 'white' },
};

const byPos = (a: { pos?: number }, b: { pos?: number }) =>
  (a.pos ?? 0) - (b.pos ?? 0);

const labelTitle = (label: TrelloLabel): string =>
  label.name || label.color || 'unnamed';

/** Formats "[YYYY-MM-DD HH:mm]" from a Trello ISO date */
const stampFromIso = (iso?: string): string =>
  iso ? `${formatDateTime(new Date(iso))} ` : '';

export const parseTrelloJson = (data: TrelloExport): EditorInterface => {
  const editorConfig: EditorConfig = {};

  // Comments arrive via the actions array, newest first
  const commentsByCardId: Record<string, string[]> = {};
  (data.actions ?? [])
    .filter((action) => action.type === 'commentCard' && action.data?.text)
    .reverse()
    .forEach((action) => {
      const cardId = action.data?.card?.id;
      if (!cardId) {
        return;
      }
      const text = action.data.text.replace(/\s*\n\s*/g, ' ').trim();
      const comment = `${stampFromIso(action.date)}${text}`;
      commentsByCardId[cardId] = [...(commentsByCardId[cardId] ?? []), comment];
    });

  const usedTagStyles: Record<string, TagStyle> = {};
  let anyDueDates = false;

  const convertCard = (trelloCard: TrelloCard): KanbanCard => {
    const card: KanbanCard = { title: trelloCard.name };
    if (trelloCard.desc) {
      card.description = trelloCard.desc.trim();
    }
    const tags: KanbanTag[] = (trelloCard.labels ?? []).map((label) => {
      const title = labelTitle(label);
      if (label.color && TRELLO_COLORS[label.color]) {
        usedTagStyles[title] = TRELLO_COLORS[label.color];
      }
      return { title };
    });
    if (tags.length > 0) {
      card.tags = tags;
    }
    if (trelloCard.due) {
      anyDueDates = true;
      card.fields = { Due: trelloCard.due.slice(0, 10) };
    }
    const comments = commentsByCardId[trelloCard.id];
    if (comments && comments.length > 0) {
      card.comments = comments;
    }
    return card;
  };

  const boardData: KanbanBoard = {
    lanes: data.lists
      .filter((list) => !list.closed)
      .sort(byPos)
      .map((list) => ({
        title: list.name,
        cards: data.cards
          .filter((card) => !card.closed && card.idList === list.id)
          .sort(byPos)
          .map(convertCard),
      })),
  };

  if (Object.keys(usedTagStyles).length > 0) {
    editorConfig.tags = usedTagStyles;
  }
  if (anyDueDates) {
    editorConfig.fields = [{ name: 'Due', type: 'date' }];
  }

  return {
    boardData,
    editorConfig,
    parsingErrors: [],
  };
};
