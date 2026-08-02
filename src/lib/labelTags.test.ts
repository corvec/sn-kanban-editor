import { splitLabel, labelTagTitles, removeLabelTag } from './labelTags';

describe('splitLabel', () => {
  it('splits comma-separated labels and trims whitespace', () => {
    expect(splitLabel('Pink, Green ,Urgent')).toEqual([
      'Pink',
      'Green',
      'Urgent',
    ]);
  });

  it('handles empty and missing labels', () => {
    expect(splitLabel('')).toEqual([]);
    expect(splitLabel(undefined)).toEqual([]);
    expect(splitLabel(' , ')).toEqual([]);
  });
});

describe('labelTagTitles', () => {
  const known = new Set(['Pink', 'Green']);

  it('returns only the label parts that are known tags', () => {
    expect(labelTagTitles({ label: 'Pink, tomorrow, Green' }, known)).toEqual([
      'Pink',
      'Green',
    ]);
  });

  it('returns nothing when no part is a known tag', () => {
    expect(labelTagTitles({ label: 'tomorrow' }, known)).toEqual([]);
  });
});

describe('removeLabelTag', () => {
  it('removes one part and preserves the rest', () => {
    expect(removeLabelTag('Pink, tomorrow, Green', 'Pink')).toEqual(
      'tomorrow, Green'
    );
  });

  it('returns an empty string when the last part is removed', () => {
    expect(removeLabelTag('Pink', 'Pink')).toEqual('');
  });
});
