import React from 'react';
import { TagSpan } from 'react-trello/dist/styles/Base';
import { EditorConfig } from '../../types/editor';
import { renderInlineMarkdown } from '../lib/inlineMarkdown';
import { splitLabel } from '../lib/labelTags';
import { resolveTagStyle } from '../lib/tagStyles';

/**
 * Renders a card label (upper right of the card), turning the
 * comma-separated parts that are known tags into styled chips while
 * leaving other parts as plain text.
 */
export const renderLabelWithTags = (
  label: string,
  config: EditorConfig,
  knownTags: Set<string>
): React.ReactNode => {
  const parts = splitLabel(label);
  if (!parts.some((part) => knownTags.has(part))) {
    return renderInlineMarkdown(label);
  }
  return (
    <span className="label-tags">
      {parts.map((part, i) =>
        knownTags.has(part) ? (
          <TagSpan
            key={`${part}-${i}`}
            style={resolveTagStyle({ title: part }, config)}
          >
            {part}
          </TagSpan>
        ) : (
          <span key={`${part}-${i}`}>{renderInlineMarkdown(part)}</span>
        )
      )}
    </span>
  );
};
