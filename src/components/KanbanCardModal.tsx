import React, { useState } from 'react';
import ReactModal from 'react-modal';
import {
  IconMessage,
  IconCircleX,
  IconPencil,
  IconArrowRight,
  IconCopy,
  IconHistory,
  IconTag,
} from '@tabler/icons';
import { KanbanCard, KanbanTag } from '../../types/react-trello';
import { CustomFieldDefinition, EditorConfig } from '../../types/editor';
import { renderInlineMarkdown } from '../lib/inlineMarkdown';
import { removeLabelTag, splitLabel } from '../lib/labelTags';
import { resolveTagStyle } from '../lib/tagStyles';
import { stampDateTime } from '../lib/datetime';

export interface LaneSummary {
  id: string;
  title: string;
}

export interface CardSummary {
  id: string;
  stableId?: string;
  title: string;
  laneTitle: string;
}

interface KanbanCardModalProps {
  card: KanbanCard;
  laneId: string;
  lanes: LaneSummary[];
  config: EditorConfig;
  /** All cards on the board, for card-ref fields */
  allCards: CardSummary[];
  knownTags: string[];
  updateCard: (changes: Partial<KanbanCard>) => void;
  moveToLane: (toLaneId: string) => void;
  cloneCard: (draft: Partial<KanbanCard>) => void;
  /** Guarantees the target card has a persistent id and returns it */
  ensureStableId: (cardId: string) => string;
  hideModal: () => void;
}

const sectionStyle: React.CSSProperties = {
  marginBottom: '1em',
};

const CardComment = ({
  comment,
  updateComment,
  deleteComment,
}: {
  comment: string;
  updateComment: (text: string) => void;
  deleteComment: () => void;
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(comment);
  const save = () => {
    setEditing(false);
    if (draft !== comment) {
      updateComment(draft);
    }
  };
  return (
    <div className="modal-comment">
      <IconMessage size={14} stroke={1} />
      {editing ? (
        <input
          className="modal-comment-input"
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              save();
            } else if (e.key === 'Escape') {
              setDraft(comment);
              setEditing(false);
            }
          }}
        />
      ) : (
        <span className="modal-comment-text">
          {renderInlineMarkdown(comment)}
        </span>
      )}
      <button
        className="modal-icon-button"
        title="Edit comment"
        onClick={() => {
          setDraft(comment);
          setEditing(true);
        }}
      >
        <IconPencil size={14} stroke={1} />
      </button>
      <button
        className="modal-icon-button comment-remove-button"
        title="Delete comment"
        onClick={deleteComment}
      >
        <IconCircleX size={14} stroke={1} />
      </button>
    </div>
  );
};

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    transform: 'translate(-50%, -50%)',
    width: 'min(560px, 94vw)',
    maxHeight: '88vh',
    overflowY: 'auto' as const,
    backgroundColor: 'var(--sn-stylekit-contrast-background-color)',
    color: 'var(--sn-stylekit-contrast-foreground-color)',
    borderColor: 'var(--sn-stylekit-contrast-border-color)',
    borderWidth: '3px',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 1000,
  },
};

const fieldInputType = (type: CustomFieldDefinition['type']): string =>
  type === 'number' ? 'number' : type === 'date' ? 'date' : 'text';

export const KanbanCardModal = ({
  card,
  laneId,
  lanes,
  config,
  allCards,
  knownTags,
  updateCard,
  moveToLane,
  cloneCard,
  ensureStableId,
  hideModal,
}: KanbanCardModalProps) => {
  const [title, setTitle] = useState(card.title ?? '');
  const [label, setLabel] = useState(card.label ?? '');
  const [description, setDescription] = useState(card.description ?? '');
  const [tags, setTags] = useState<KanbanTag[]>(card.tags ?? []);
  const [fields, setFields] = useState<Record<string, string>>(
    card.fields ?? {}
  );
  const [comments, setComments] = useState<string[]>(card.comments ?? []);
  const [newComment, setNewComment] = useState('');
  const [newTag, setNewTag] = useState('');
  const [targetLane, setTargetLane] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const historyEnabled = Boolean(config.history);

  /** Changes vs the original card, plus history entries when enabled */
  const collectChanges = (): Partial<KanbanCard> => {
    const changes: Partial<KanbanCard> = {
      title,
      label,
      description,
      tags,
      fields,
      comments,
    };
    if (historyEnabled) {
      const newEntries: string[] = [];
      if (title !== card.title) {
        newEntries.push('Title edited');
      }
      if (description !== (card.description ?? '')) {
        newEntries.push('Description edited');
      }
      if (newEntries.length > 0) {
        changes.history = [
          ...(card.history ?? []),
          ...newEntries.map((entry) => stampDateTime(entry)),
        ];
      }
    }
    return changes;
  };

  const saveAndClose = () => {
    updateCard(collectChanges());
    hideModal();
  };

  const handleMove = () => {
    if (!targetLane || targetLane === laneId) {
      return;
    }
    const changes = collectChanges();
    if (historyEnabled) {
      const fromTitle = lanes.find((lane) => lane.id === laneId)?.title;
      const toTitle = lanes.find((lane) => lane.id === targetLane)?.title;
      changes.history = [
        ...(changes.history ?? card.history ?? []),
        stampDateTime(`Moved from "${fromTitle}" to "${toTitle}"`),
      ];
    }
    updateCard(changes);
    moveToLane(targetLane);
    hideModal();
  };

  const handleClone = () => {
    updateCard(collectChanges());
    cloneCard({
      title: `${title} (copy)`,
      label,
      description,
      tags: [...tags],
      fields: { ...fields },
      comments: [...comments],
      ...(historyEnabled
        ? { history: [stampDateTime(`Created as a copy of "${title}"`)] }
        : {}),
    });
    hideModal();
  };

  const addComment = () => {
    if (!newComment.trim()) {
      return;
    }
    setComments([...comments, stampDateTime(newComment.trim())]);
    setNewComment('');
  };

  /**
   * Tags historically live in the Label field (upper right of the card)
   * as comma-separated values. Label parts that are known tags appear in
   * the tag row alongside explicit tags; removing one edits the label.
   */
  const knownTagSet = new Set(knownTags);
  const labelTags = splitLabel(label).filter((part) => knownTagSet.has(part));
  const displayedTags: Array<{ title: string; fromLabel: boolean }> = [
    ...tags.map((tag) => ({ title: tag.title, fromLabel: false })),
    ...labelTags
      .filter((part) => !tags.some((tag) => tag.title === part))
      .map((part) => ({ title: part, fromLabel: true })),
  ];

  const removeTag = (title: string) => {
    setTags(tags.filter((tag) => tag.title !== title));
    if (labelTags.includes(title)) {
      setLabel(removeLabelTag(label, title));
    }
  };

  const addTag = (tagTitle: string) => {
    const trimmed = tagTitle.trim();
    if (!trimmed || displayedTags.some((entry) => entry.title === trimmed)) {
      return;
    }
    setTags([...tags, { title: trimmed }]);
    setNewTag('');
  };

  const configuredFields = config.fields ?? [];
  const extraFieldNames = Object.keys(fields).filter(
    (name) => !configuredFields.some((def) => def.name === name)
  );
  const referencableCards = allCards.filter((entry) => entry.id !== card.id);

  const renderFieldInput = (def: CustomFieldDefinition) => {
    if (def.type === 'card-ref') {
      const current = fields[def.name] ?? '';
      const currentTarget = allCards.find(
        (entry) => entry.stableId && entry.stableId === current
      );
      return (
        <>
          <select
            value={current}
            onChange={(e) => {
              const value = e.target.value;
              if (!value) {
                const { [def.name]: _, ...rest } = fields;
                setFields(rest);
                return;
              }
              // Options are keyed by card id; make sure the target card
              // has a persistent id and store that.
              const stableId = ensureStableId(value);
              setFields({ ...fields, [def.name]: stableId });
            }}
          >
            <option value="">(none)</option>
            {referencableCards.map((entry) => (
              <option
                key={entry.id}
                value={
                  entry.stableId && entry.stableId === current
                    ? current
                    : entry.id
                }
              >
                {entry.title} — {entry.laneTitle}
              </option>
            ))}
          </select>
          {currentTarget && (
            <span className="modal-field-ref-preview">
              <IconArrowRight size={12} stroke={1.5} /> {currentTarget.title} (
              {currentTarget.laneTitle})
            </span>
          )}
        </>
      );
    }
    return (
      <input
        type={fieldInputType(def.type)}
        value={fields[def.name] ?? ''}
        onChange={(e) => {
          const value = e.target.value;
          if (value === '') {
            const { [def.name]: _, ...rest } = fields;
            setFields(rest);
          } else {
            setFields({ ...fields, [def.name]: value });
          }
        }}
      />
    );
  };

  return (
    <ReactModal isOpen onRequestClose={saveAndClose} style={customStyles}>
      <div className="card-modal">
        <header style={sectionStyle}>
          <input
            className="modal-title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Card title"
          />
          <input
            className="modal-label-input"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Label (e.g. a due date)"
          />
        </header>

        <div style={sectionStyle}>
          <textarea
            className="modal-description-input"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (markdown supported)"
          />
        </div>

        <div style={sectionStyle} className="modal-tags">
          <IconTag size={14} stroke={1.5} />
          {displayedTags.map(({ title: tagTitle }) => (
            <span
              key={tagTitle}
              className="modal-tag"
              style={resolveTagStyle({ title: tagTitle }, config)}
            >
              {tagTitle}
              <button
                className="modal-tag-remove"
                title={`Remove tag ${tagTitle}`}
                onClick={() => removeTag(tagTitle)}
              >
                ×
              </button>
            </span>
          ))}
          <select
            value=""
            onChange={(e) => addTag(e.target.value)}
            title="Add an existing tag"
          >
            <option value="">+ tag…</option>
            {knownTags
              .filter(
                (tagTitle) =>
                  !displayedTags.some((entry) => entry.title === tagTitle)
              )
              .map((tagTitle) => (
                <option key={tagTitle} value={tagTitle}>
                  {tagTitle}
                </option>
              ))}
          </select>
          <input
            className="modal-new-tag-input"
            placeholder="new tag"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag(newTag);
              }
            }}
          />
        </div>

        {(configuredFields.length > 0 || extraFieldNames.length > 0) && (
          <div style={sectionStyle} className="modal-fields">
            {configuredFields.map((def) => (
              <label className="modal-field" key={def.name}>
                <span className="modal-field-name">{def.name}</span>
                {renderFieldInput(def)}
              </label>
            ))}
            {extraFieldNames.map((name) => (
              <label className="modal-field" key={name}>
                <span className="modal-field-name">{name}</span>
                {renderFieldInput({ name, type: 'text' })}
              </label>
            ))}
          </div>
        )}

        <div style={sectionStyle} className="modal-actions">
          <select
            value={targetLane}
            onChange={(e) => setTargetLane(e.target.value)}
          >
            <option value="">Send to column…</option>
            {lanes
              .filter((lane) => lane.id !== laneId)
              .map((lane) => (
                <option key={lane.id} value={lane.id}>
                  {lane.title}
                </option>
              ))}
          </select>
          <button onClick={handleMove} disabled={!targetLane}>
            <IconArrowRight size={14} stroke={1.5} /> Move
          </button>
          <button onClick={handleClone}>
            <IconCopy size={14} stroke={1.5} /> Clone
          </button>
        </div>

        <div style={sectionStyle}>
          {comments.length > 0 ? (
            comments.map((comment, i) => (
              <CardComment
                key={`${i}-${comment}`}
                comment={comment}
                updateComment={(text) =>
                  setComments(
                    comments.map((entry, j) => (j === i ? text : entry))
                  )
                }
                deleteComment={() =>
                  setComments(comments.filter((_, j) => j !== i))
                }
              />
            ))
          ) : (
            <div>
              <span style={{ fontStyle: 'italic' }}>No Comments yet...</span>
            </div>
          )}
          <div className="modal-new-comment">
            <input
              placeholder="New Comment"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  addComment();
                  e.preventDefault();
                }
              }}
            />
            <button onClick={addComment}>Add Comment</button>
          </div>
        </div>

        {historyEnabled && (card.history ?? []).length > 0 && (
          <div style={sectionStyle} className="modal-history">
            <button
              className="modal-history-toggle"
              onClick={() => setShowHistory(!showHistory)}
            >
              <IconHistory size={14} stroke={1.5} /> History (
              {card.history.length})
            </button>
            {showHistory && (
              <ul>
                {card.history.map((entry, i) => (
                  <li key={i}>{entry}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <footer className="modal-footer">
          <button className="modal-save-button" onClick={saveAndClose}>
            Save & Close
          </button>
        </footer>
      </div>
    </ReactModal>
  );
};
