import React, { useState } from 'react';
import ReactModal from 'react-modal';

const CardComment = ({ comment }) => <div>Comment: {comment}</div>;

export const KanbanCardModal = ({ card, hideModal, setComments }) => {
  const { title, description, label, comments } = card;
  const closeModal = () => {
    // setComments(comments);
    hideModal();
  };
  return (
    <ReactModal isOpen onRequestClose={closeModal}>
      <h1>{title}</h1>
      <p>{description}</p>
      {(comments || []).map((comment, i) => (
        <CardComment comment={comment} key={i} />
      ))}
      <input placeholder="New Comment" />
    </ReactModal>
  );
};
