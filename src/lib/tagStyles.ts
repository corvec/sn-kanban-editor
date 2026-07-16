import { KanbanTag } from '../../types/react-trello';
import { EditorConfig } from '../../types/editor';

export interface ResolvedTagStyle {
  backgroundColor: string;
  color: string;
  fontWeight?: 'bold';
}

/**
 * Resolves the display style for a tag: board-config styling wins,
 * then any inline style on the tag itself, then defaults.
 */
export const resolveTagStyle = (
  tag: KanbanTag,
  config: EditorConfig
): ResolvedTagStyle => {
  const configured = config.tags?.[tag.title];
  return {
    backgroundColor:
      configured?.bgcolor ?? tag.bgcolor ?? 'var(--sn-stylekit-info-color)',
    color:
      configured?.color ??
      tag.color ??
      'var(--sn-stylekit-info-contrast-color)',
    ...(configured?.bold ? { fontWeight: 'bold' as const } : {}),
  };
};

/** All tag titles known to the board: configured ones plus any in use on cards */
export const collectKnownTags = (
  config: EditorConfig,
  lanes: Array<{ cards: Array<{ tags?: KanbanTag[] }> }>
): string[] => {
  const titles = new Set<string>(Object.keys(config.tags ?? {}));
  lanes.forEach((lane) =>
    lane.cards.forEach((card) =>
      (card.tags ?? []).forEach((tag) => titles.add(tag.title))
    )
  );
  return Array.from(titles).sort((a, b) => a.localeCompare(b));
};
