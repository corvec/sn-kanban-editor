import { KanbanBoard, KanbanCard } from '../../types/react-trello';
import { labelTagTitles } from './labelTags';

export type SearchableField =
  | 'title'
  | 'description'
  | 'label'
  | 'comments'
  | 'tags'
  | 'fields';

export const SEARCHABLE_FIELDS: Array<{
  key: SearchableField;
  label: string;
}> = [
  { key: 'title', label: 'Title' },
  { key: 'description', label: 'Description' },
  { key: 'label', label: 'Label' },
  { key: 'comments', label: 'Comments' },
  { key: 'tags', label: 'Tags' },
  { key: 'fields', label: 'Custom fields' },
];

/**
 * Case-insensitive substring match against the chosen fields.
 * An empty fields list means "search all fields". Label parts that are
 * known tags (see labelTags.ts) also match under the "tags" field.
 */
export const cardMatchesSearch = (
  card: KanbanCard,
  query: string,
  fields: SearchableField[] = [],
  knownTags: Set<string> = new Set()
): boolean => {
  if (!query) {
    return false;
  }
  const q = query.toLowerCase();
  const active =
    fields.length > 0 ? fields : SEARCHABLE_FIELDS.map((f) => f.key);
  const haystacks: string[] = [];
  for (const field of active) {
    switch (field) {
      case 'title':
        haystacks.push(card.title ?? '');
        break;
      case 'description':
        haystacks.push(card.description ?? '');
        break;
      case 'label':
        haystacks.push(card.label ?? '');
        break;
      case 'comments':
        haystacks.push(...(card.comments ?? []));
        break;
      case 'tags':
        haystacks.push(...(card.tags ?? []).map((tag) => tag.title));
        haystacks.push(...labelTagTitles(card, knownTags));
        break;
      case 'fields':
        Object.entries(card.fields ?? {}).forEach(([key, value]) => {
          haystacks.push(key, value);
        });
        break;
    }
  }
  return haystacks.some((text) => text.toLowerCase().includes(q));
};

export const findMatchingCardIds = (
  boardData: KanbanBoard,
  query: string,
  fields: SearchableField[] = [],
  knownTags: Set<string> = new Set()
): Set<string> => {
  const ids = new Set<string>();
  if (!query) {
    return ids;
  }
  boardData.lanes.forEach((lane) =>
    lane.cards.forEach((card) => {
      if (card.id && cardMatchesSearch(card, query, fields, knownTags)) {
        ids.add(card.id);
      }
    })
  );
  return ids;
};

/**
 * Moves the given cards to the end of the target lane. When
 * makeHistoryEntry is provided, each moved card gets a history entry.
 */
export const moveCardsToLane = (
  boardData: KanbanBoard,
  cardIds: Set<string>,
  toLaneId: string,
  makeHistoryEntry?: (fromLaneTitle: string, toLaneTitle: string) => string
): KanbanBoard => {
  const toLane = boardData.lanes.find((lane) => lane.id === toLaneId);
  if (!toLane) {
    return boardData;
  }
  const moving: KanbanCard[] = [];
  const strippedLanes = boardData.lanes.map((lane) => {
    if (lane.id === toLaneId) {
      return lane;
    }
    const keep: KanbanCard[] = [];
    lane.cards.forEach((card) => {
      if (card.id && cardIds.has(card.id)) {
        moving.push(
          makeHistoryEntry
            ? {
                ...card,
                laneId: toLaneId,
                history: [
                  ...(card.history ?? []),
                  makeHistoryEntry(lane.title, toLane.title),
                ],
              }
            : { ...card, laneId: toLaneId }
        );
      } else {
        keep.push(card);
      }
    });
    return keep.length === lane.cards.length ? lane : { ...lane, cards: keep };
  });
  return {
    ...boardData,
    lanes: strippedLanes.map((lane) =>
      lane.id === toLaneId
        ? { ...lane, cards: [...lane.cards, ...moving] }
        : lane
    ),
  };
};

export const deleteCards = (
  boardData: KanbanBoard,
  cardIds: Set<string>
): KanbanBoard => ({
  ...boardData,
  lanes: boardData.lanes.map((lane) => ({
    ...lane,
    cards: lane.cards.filter((card) => !card.id || !cardIds.has(card.id)),
  })),
});
