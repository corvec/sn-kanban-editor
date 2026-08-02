import React, { useEffect, useRef, useState } from 'react';
import { renderInlineMarkdown } from '../lib/inlineMarkdown';

interface MarkdownEditableProps {
  value?: string;
  placeholder?: string;
  onSave: (value: string) => void;
  className?: string;
  multiline?: boolean;
  /** Custom view-mode renderer (editing still uses the raw text) */
  renderView?: (value: string) => React.ReactNode;
}

/**
 * Renders text as inline Markdown; click to switch to a plain textarea.
 * Enter saves (Shift+Enter inserts a newline in multiline mode),
 * Escape cancels, blur saves. Editing clicks never bubble up, so they
 * cannot trigger card-level click handlers.
 */
export const MarkdownEditable = ({
  value,
  placeholder,
  onSave,
  className,
  multiline,
  renderView,
}: MarkdownEditableProps) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? '');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.setSelectionRange(draft.length, draft.length);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);

  const startEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDraft(value ?? '');
    setEditing(true);
  };

  const save = () => {
    setEditing(false);
    if (draft !== (value ?? '')) {
      onSave(draft);
    }
  };

  const cancel = () => {
    setEditing(false);
    setDraft(value ?? '');
  };

  if (editing) {
    return (
      <textarea
        ref={inputRef}
        className={`markdown-editable-input ${className ?? ''}`}
        rows={multiline ? 3 : 1}
        value={draft}
        placeholder={placeholder}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={save}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          e.stopPropagation();
          if (e.key === 'Enter' && !(multiline && e.shiftKey)) {
            e.preventDefault();
            save();
          } else if (e.key === 'Escape') {
            e.preventDefault();
            cancel();
          }
        }}
      />
    );
  }

  return (
    <div
      className={`markdown-editable ${className ?? ''} ${
        value ? '' : 'markdown-editable-empty'
      }`}
      onClick={startEditing}
      title="Click to edit"
    >
      {value
        ? renderView
          ? renderView(value)
          : renderInlineMarkdown(value)
        : placeholder ?? ''}
    </div>
  );
};
