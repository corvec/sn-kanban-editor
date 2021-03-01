import React, { useState } from 'react';
import ReactModal from 'react-modal';
import { IconMessage, IconCircleX } from '@tabler/icons';

const CardComment = ({ comment, deleteComment }) => (
  <div
    style={{
      backgroundColor: 'var(--sn-stylekit-secondary-contrast-background-color)',
      color: 'var(--sn-stylekit-secondary-contrast-foreground-color)',
      border: '1px solid var(--sn-stylekit-secondary-contrast-border-color)',
      marginBottom: '1em',
      padding: '0.5em',
    }}
  >
    <IconMessage size={14} stroke={1} />
    <span style={{ paddingLeft: '0.5em' }}>{comment}</span>
    <button
      style={{ float: 'right', border: '0', background: 'transparent' }}
      onClick={deleteComment}
      className="comment-remove-button"
    >
      <IconCircleX size={14} stroke={1} />
    </button>
  </div>
);

const NoComments = () => (
  <div>
    <span style={{ fontStyle: 'italic' }}>No Comments yet...</span>
  </div>
);

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'var(--sn-stylekit-contrast-background-color)',
    color: 'var(--sn-stylekit-contrast-foreground-color)',
    borderColor: 'var(--sn-stylekit-contrast-border-color)',
    borderWidth: '3px',
  },
};

export const KanbanCardModal = ({ card, hideModal, setComments }) => {
  const { title, description, label, comments } = card;
  const [newComment, setNewComment] = useState('');
  const [updatedComments, setUpdatedComments] = useState(comments || []);
  const addComment = () => {
    setUpdatedComments([...updatedComments, newComment]);
    setNewComment('');
  };
  const deleteCommentByIndex = (index) => {
    setUpdatedComments(updatedComments.filter((_, i) => index !== i));
  };
  const closeModal = () => {
    setComments(updatedComments);
    hideModal();
  };

  return (
    <ReactModal isOpen onRequestClose={closeModal} style={customStyles}>
      <header>
        <span style={{ fontWeight: 'bold', lineHeight: '18px' }}>{title}</span>
      </header>
      <div
        style={{
          marginBottom: '1em',
          border: '1px dotted var(--sn-stylekit-secondary-border-color)',
          backgroundColor: 'var(--sn-stylekit-secondary-background-color)',
          color: 'var(--sn-stylekit-secondary-foreground-color)',
          padding: '1em',
        }}
      >
        <span>{description}</span>
      </div>
      <div>
        {updatedComments && updatedComments.length > 0 ? (
          updatedComments.map((comment, i) => (
            <CardComment
              key={i}
              comment={comment}
              deleteComment={() => deleteCommentByIndex(i)}
            />
          ))
        ) : (
          <NoComments />
        )}
      </div>
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
    </ReactModal>
  );
};
