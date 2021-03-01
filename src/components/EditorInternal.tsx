import React, { useState } from 'react';
import Board from 'react-trello';
import ReactModal from 'react-modal';
import { KanbanCardModal } from './KanbanCardModal';
import { useModal } from 'react-modal-hook';

export enum HtmlElementId {
  board = 'board',
  snComponent = 'sn-component',
}
export enum HtmlClassName {
  board = 'board',
  snComponent = 'sn-component',
}

export const EditorInternal = ({ printUrl, boardData, handleDataChange }) => {
  const [card, setCard] = useState({
    cardData: {
      title: '',
      description: '',
      label: '',
      comments: [],
    },
    metadata: null,
    cardId: null,
    laneId: null,
  });
  ReactModal.setAppElement(document.getElementById(HtmlElementId.snComponent));
  const [showModal, hideModal] = useModal(
    () => (
      <KanbanCardModal
        card={card.cardData}
        hideModal={hideModal}
        setComments={(comments) => {
          eventBus.publish({
            type: 'UPDATE_CARD',
            laneId: card.laneId,
            card: {
              id: card.cardId,
              comments,
            },
          });
        }}
      />
    ),
    [card]
  );
  const openModal = (card) => {
    setCard(card);
    showModal();
  };
  let eventBus = undefined;
  const setEventBus = (handle) => {
    eventBus = handle;
  };
  return (
    <div
      className={`${HtmlClassName.snComponent}${printUrl ? ' print-url' : ''}`}
      id={HtmlElementId.snComponent}
      tabIndex={0}
    >
      <Board
        id={HtmlElementId.board}
        className={HtmlClassName.board}
        data={boardData}
        canAddLanes
        editable
        editLaneTitle
        eventBusHandle={setEventBus}
        onCardClick={(cardId, metadata, laneId) => {
          const cardData = boardData.lanes
            .find((lane) => lane.id === laneId)
            .cards.find((card) => card.id === cardId);
          console.log(`Opening card in modal: ${JSON.stringify(cardData)}`);
          openModal({ cardId, cardData, metadata, laneId });
        }}
        onDataChange={handleDataChange}
      />
    </div>
  );
};
