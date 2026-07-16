import React, { useContext } from 'react';
import {
  MovableCardWrapper,
  CardHeader,
  CardRightContent,
  CardTitle,
  Detail,
  Footer,
  TagSpan,
} from 'react-trello/dist/styles/Base';
import { IconMessage, IconHistory, IconX } from '@tabler/icons';
import { MarkdownEditable } from './MarkdownEditable';
import { BoardContext } from './BoardContext';
import { resolveTagStyle } from '../lib/tagStyles';
import { KanbanTag } from '../../types/react-trello';

/**
 * Custom react-trello card.
 *
 * Unlike the default card, the wrapper has NO onClick handler — editing
 * the title/label/description inline (or moving the cursor in the open
 * textarea) no longer opens the details modal. Instead, a dedicated,
 * touch-friendly "Details" button at the bottom of the card opens it.
 */
export const KanbanCard = (props: any) => {
  const {
    id,
    title,
    description,
    label,
    comments,
    tags,
    fields,
    history,
    showDeleteButton,
    onDelete,
    onClick,
    onChange,
    style,
    className,
    t,
  } = props;
  const { config, searchState } = useContext(BoardContext);

  const updateCard = (changes: object) => onChange({ ...changes, id });

  const searchClass = !searchState?.query
    ? ''
    : searchState.matchedIds.has(id)
    ? ' search-match'
    : ' search-dim';

  const commentCount = (comments ?? []).length;
  const fieldEntries: Array<[string, string]> = Object.entries(fields ?? {});

  return (
    <MovableCardWrapper
      data-id={id}
      style={style}
      className={`${className ?? ''}${searchClass}`}
    >
      <CardHeader>
        <CardTitle>
          <MarkdownEditable
            value={title}
            placeholder={t('placeholder.title')}
            onSave={(value) => updateCard({ title: value })}
          />
        </CardTitle>
        <CardRightContent>
          <MarkdownEditable
            value={label}
            placeholder={t('placeholder.label')}
            onSave={(value) => updateCard({ label: value })}
          />
        </CardRightContent>
        {showDeleteButton && (
          <button
            className="card-delete-button"
            title="Delete card"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <IconX size={16} stroke={1.5} />
          </button>
        )}
      </CardHeader>
      <Detail>
        <MarkdownEditable
          multiline
          value={description}
          placeholder={t('placeholder.description')}
          onSave={(value) => updateCard({ description: value })}
        />
      </Detail>
      {fieldEntries.length > 0 && (
        <div className="card-fields">
          {fieldEntries.map(([name, value]) => (
            <div className="card-field" key={name}>
              <span className="card-field-name">{name}:</span> {value}
            </div>
          ))}
        </div>
      )}
      {tags && tags.length > 0 && (
        <Footer>
          {tags.map((tag: KanbanTag) => (
            <TagSpan key={tag.title} style={resolveTagStyle(tag, config)}>
              {tag.title}
            </TagSpan>
          ))}
        </Footer>
      )}
      <button
        className="card-details-button"
        onClick={(e) => {
          e.stopPropagation();
          onClick(e);
        }}
      >
        <span>Details</span>
        {commentCount > 0 && (
          <span className="card-details-count">
            <IconMessage size={14} stroke={1.5} /> {commentCount}
          </span>
        )}
        {config.history && history && history.length > 0 && (
          <span className="card-details-count">
            <IconHistory size={14} stroke={1.5} /> {history.length}
          </span>
        )}
      </button>
    </MovableCardWrapper>
  );
};
