import { KanbanCard } from '../../types/react-trello';

/**
 * Historically, tags on this board lived in the card's Label field
 * (rendered in the upper right of the card) as comma-separated values —
 * there was no dedicated Tags line. To keep that data where it is, any
 * label part that matches a known tag (defined in board settings or in
 * use as an explicit tag) is treated as a tag: styled, searchable, and
 * manageable, while remaining stored in the "Label:" markdown line.
 */

export const splitLabel = (label?: string): string[] =>
  (label ?? '')
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length > 0);

/** Label parts of the card that are known tags */
export const labelTagTitles = (
  card: Pick<KanbanCard, 'label'>,
  knownTags: Set<string>
): string[] => splitLabel(card.label).filter((part) => knownTags.has(part));

/** Removes one tag from a comma-separated label, preserving the rest */
export const removeLabelTag = (
  label: string | undefined,
  tagTitle: string
): string =>
  splitLabel(label)
    .filter((part) => part !== tagTitle)
    .join(', ');
