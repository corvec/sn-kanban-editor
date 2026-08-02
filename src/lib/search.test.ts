import {
  cardMatchesSearch,
  findMatchingCardIds,
  moveCardsToLane,
  deleteCards,
} from './search';
import { KanbanBoard } from '../../types/react-trello';

const card = {
  id: 'c1',
  title: 'Fix the login bug',
  description: 'Users cannot sign in',
  label: 'urgent',
  comments: ['tested on staging'],
  tags: [{ title: 'Backend' }],
  fields: { Points: '5' },
};

describe('cardMatchesSearch', () => {
  it('matches any field by default, case-insensitively', () => {
    expect(cardMatchesSearch(card, 'LOGIN')).toBe(true);
    expect(cardMatchesSearch(card, 'sign in')).toBe(true);
    expect(cardMatchesSearch(card, 'staging')).toBe(true);
    expect(cardMatchesSearch(card, 'backend')).toBe(true);
    expect(cardMatchesSearch(card, 'points')).toBe(true);
    expect(cardMatchesSearch(card, 'nowhere')).toBe(false);
  });

  it('restricts matching to the chosen fields', () => {
    expect(cardMatchesSearch(card, 'staging', ['title'])).toBe(false);
    expect(cardMatchesSearch(card, 'staging', ['comments'])).toBe(true);
    expect(cardMatchesSearch(card, 'backend', ['tags'])).toBe(true);
    expect(cardMatchesSearch(card, 'backend', ['title', 'label'])).toBe(false);
  });

  it('never matches an empty query', () => {
    expect(cardMatchesSearch(card, '')).toBe(false);
  });
});

const board: KanbanBoard = {
  lanes: [
    {
      id: 'l1',
      title: 'Todo',
      cards: [
        { id: 'c1', title: 'Alpha task' },
        { id: 'c2', title: 'Beta task' },
      ],
    },
    {
      id: 'l2',
      title: 'Done',
      cards: [{ id: 'c3', title: 'Alpha follow-up' }],
    },
  ],
};

describe('findMatchingCardIds', () => {
  it('collects matching ids across lanes', () => {
    expect(Array.from(findMatchingCardIds(board, 'alpha'))).toEqual([
      'c1',
      'c3',
    ]);
  });
});

describe('moveCardsToLane', () => {
  it('moves matched cards to the end of the target lane', () => {
    const result = moveCardsToLane(board, new Set(['c1']), 'l2');
    expect(result.lanes[0].cards.map((c) => c.id)).toEqual(['c2']);
    expect(result.lanes[1].cards.map((c) => c.id)).toEqual(['c3', 'c1']);
  });

  it('leaves cards already in the target lane alone', () => {
    const result = moveCardsToLane(board, new Set(['c1', 'c3']), 'l2');
    expect(result.lanes[1].cards.map((c) => c.id)).toEqual(['c3', 'c1']);
  });

  it('adds history entries to moved cards when requested', () => {
    const result = moveCardsToLane(
      board,
      new Set(['c1']),
      'l2',
      (from, to) => `Moved from "${from}" to "${to}"`
    );
    expect(result.lanes[1].cards[1].history).toEqual([
      'Moved from "Todo" to "Done"',
    ]);
  });
});

describe('deleteCards', () => {
  it('removes matched cards from every lane', () => {
    const result = deleteCards(board, new Set(['c1', 'c3']));
    expect(result.lanes[0].cards.map((c) => c.id)).toEqual(['c2']);
    expect(result.lanes[1].cards).toEqual([]);
  });
});

describe('label-based tags in search', () => {
  const labeledCard = {
    id: 'c9',
    title: 'Labeled card',
    label: 'Pink, tomorrow',
  };
  const known = new Set(['Pink']);

  it('matches label parts that are known tags under the tags field', () => {
    expect(cardMatchesSearch(labeledCard, 'pink', ['tags'], known)).toBe(true);
  });

  it('does not match label parts that are not known tags under tags', () => {
    expect(cardMatchesSearch(labeledCard, 'tomorrow', ['tags'], known)).toBe(
      false
    );
    // ...but they still match under the label field
    expect(cardMatchesSearch(labeledCard, 'tomorrow', ['label'], known)).toBe(
      true
    );
  });
});
