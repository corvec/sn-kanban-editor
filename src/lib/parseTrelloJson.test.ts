import { isTrelloExport, parseTrelloJson } from './parseTrelloJson';

const trelloExport = {
  name: 'My Trello Board',
  lists: [
    { id: 'list-2', name: 'Doing', pos: 2 },
    { id: 'list-1', name: 'Todo', pos: 1 },
    { id: 'list-3', name: 'Old', pos: 3, closed: true },
  ],
  cards: [
    {
      id: 'card-b',
      name: 'Second card',
      desc: '',
      idList: 'list-1',
      pos: 2,
    },
    {
      id: 'card-a',
      name: 'First card',
      desc: 'Line one\nLine two',
      idList: 'list-1',
      pos: 1,
      due: '2026-08-01T12:00:00.000Z',
      labels: [
        { name: 'Urgent', color: 'red' },
        { name: '', color: 'blue' },
      ],
    },
    {
      id: 'card-c',
      name: 'Closed card',
      idList: 'list-1',
      pos: 3,
      closed: true,
    },
    {
      id: 'card-d',
      name: 'Doing card',
      idList: 'list-2',
      pos: 1,
    },
  ],
  actions: [
    {
      type: 'commentCard',
      date: '2026-07-02T10:30:00.000Z',
      data: { card: { id: 'card-a' }, text: 'Newest comment' },
    },
    {
      type: 'updateCard',
      date: '2026-07-01T10:00:00.000Z',
      data: { card: { id: 'card-a' } },
    },
    {
      type: 'commentCard',
      date: '2026-07-01T09:00:00.000Z',
      data: { card: { id: 'card-a' }, text: 'Oldest\ncomment' },
    },
  ],
};

describe('isTrelloExport', () => {
  it('recognizes a Trello export', () => {
    expect(isTrelloExport(trelloExport)).toBe(true);
  });

  it('rejects our own JSON board format and other shapes', () => {
    expect(isTrelloExport({ lanes: [] })).toBe(false);
    expect(isTrelloExport(null)).toBe(false);
    expect(isTrelloExport('# markdown')).toBe(false);
  });
});

describe('parseTrelloJson', () => {
  const { boardData, editorConfig, parsingErrors } = parseTrelloJson(
    trelloExport as any
  );

  it('parses without errors', () => {
    expect(parsingErrors).toEqual([]);
  });

  it('maps open lists to lanes ordered by position', () => {
    expect(boardData.lanes.map((lane) => lane.title)).toEqual([
      'Todo',
      'Doing',
    ]);
  });

  it('maps open cards to cards ordered by position', () => {
    expect(boardData.lanes[0].cards.map((card) => card.title)).toEqual([
      'First card',
      'Second card',
    ]);
  });

  it('keeps multiline descriptions', () => {
    expect(boardData.lanes[0].cards[0].description).toEqual(
      'Line one\nLine two'
    );
  });

  it('maps labels to tags, falling back to the color as title', () => {
    expect(boardData.lanes[0].cards[0].tags).toEqual([
      { title: 'Urgent' },
      { title: 'blue' },
    ]);
  });

  it('registers Trello label colors as tag styles in the config', () => {
    expect(editorConfig.tags).toEqual({
      Urgent: { bgcolor: '#eb5a46', color: 'white' },
      blue: { bgcolor: '#0079bf', color: 'white' },
    });
  });

  it('maps due dates to a Due custom field', () => {
    expect(boardData.lanes[0].cards[0].fields).toEqual({ Due: '2026-08-01' });
    expect(editorConfig.fields).toEqual([{ name: 'Due', type: 'date' }]);
  });

  it('maps commentCard actions to datetime-stamped comments, oldest first', () => {
    const comments = boardData.lanes[0].cards[0].comments;
    expect(comments).toHaveLength(2);
    expect(comments[0]).toMatch(/^\[2026-07-01 \d{2}:\d{2}\] Oldest comment$/);
    expect(comments[1]).toMatch(/^\[2026-07-02 \d{2}:\d{2}\] Newest comment$/);
  });
});
