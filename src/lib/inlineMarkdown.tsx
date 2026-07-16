import React from 'react';

/**
 * Minimal inline-Markdown renderer (no external dependencies).
 * Supports **bold**, __bold__, *italic*, _italic_, ~~strikethrough~~,
 * `code`, and [links](url). Newlines become <br/>.
 *
 * Block-level markdown (headers, lists) is intentionally not handled:
 * card titles/descriptions/comments are short, inline-formatted texts.
 */

/**
 * Emphasis delimiters must be followed by a non-space character, so prose
 * like "2 * 3 * 4" is not misread as italics. (No lookbehind — older iOS
 * Safari versions would fail to parse the regex.)
 */
const TOKEN = /(\*\*[^\s*][^\n]*?\*\*|__[^\s_][^\n]*?__|\*[^\s*][^*\n]*?\*|_[^\s_][^_\n]*?_|~~[^\s~][^~\n]*?~~|`[^`\n]+?`|\[[^\]\n]+?\]\([^)\s]+?\))/;

const LINK = /^\[([^\]]+)\]\(([^)\s]+)\)$/;

const renderToken = (token: string, key: number): React.ReactNode => {
  if (
    (token.startsWith('**') && token.endsWith('**')) ||
    (token.startsWith('__') && token.endsWith('__'))
  ) {
    return <strong key={key}>{renderLine(token.slice(2, -2))}</strong>;
  }
  if (token.startsWith('~~') && token.endsWith('~~')) {
    return <del key={key}>{renderLine(token.slice(2, -2))}</del>;
  }
  if (
    (token.startsWith('*') && token.endsWith('*')) ||
    (token.startsWith('_') && token.endsWith('_'))
  ) {
    return <em key={key}>{renderLine(token.slice(1, -1))}</em>;
  }
  if (token.startsWith('`') && token.endsWith('`')) {
    return <code key={key}>{token.slice(1, -1)}</code>;
  }
  const link = token.match(LINK);
  if (link) {
    return (
      <a
        key={key}
        href={link[2]}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
      >
        {renderLine(link[1])}
      </a>
    );
  }
  return token;
};

const renderLine = (line: string): React.ReactNode => {
  const parts = line.split(TOKEN);
  if (parts.length === 1) {
    return line;
  }
  return parts.map((part, i) =>
    i % 2 === 1 ? renderToken(part, i) : part || null
  );
};

export const renderInlineMarkdown = (text: string): React.ReactNode => {
  if (!text) {
    return null;
  }
  const lines = text.split('\n');
  return lines.map((line, i) => (
    <React.Fragment key={i}>
      {i > 0 && <br />}
      {renderLine(line)}
    </React.Fragment>
  ));
};

export const Markdown = ({ text }: { text: string }) => (
  <>{renderInlineMarkdown(text)}</>
);
