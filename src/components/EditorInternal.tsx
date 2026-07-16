import React, { useMemo, useState } from 'react';
import Board from 'react-trello';
import ReactModal from 'react-modal';
import { KanbanCardModal } from './KanbanCardModal';
import { KanbanCard } from './KanbanCard';
import { BoardContext } from './BoardContext';
import { useModal } from 'react-modal-hook';

export enum HtmlElementId {
  board = 'board',
  snComponent = 'sn-component',
}
export enum HtmlClassName {
  board = 'board',
  snComponent = 'sn-component',
}

export const EditorInternal = ({
  printUrl,
  boardData,
  editorConfig,
  handleDataChange,
}) => {
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
  const [eventBus, setEventBus] = useState({
    publish: (event) => console.log('not yet wired'),
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

  const contextValue = useMemo(
    () => ({
      config: editorConfig ?? {},
      searchState: null,
    }),
    [editorConfig]
  );

  return (
    <BoardContext.Provider value={contextValue}>
      <div
        className={`${HtmlClassName.snComponent}${
          printUrl ? ' print-url' : ''
        }`}
        id={HtmlElementId.snComponent}
        tabIndex={0}
      >
        <Board
          id={HtmlElementId.board}
          className={HtmlClassName.board}
          data={boardData}
          components={{ Card: KanbanCard }}
          canAddLanes
          editable
          editLaneTitle
          draggable
          collapsibleLanes
          eventBusHandle={setEventBus}
          onCardClick={(cardId, metadata, laneId) => {
            const cardData = boardData.lanes
              .find((lane) => lane.id === laneId)
              .cards.find((card) => card.id === cardId);
            openModal({ cardId, cardData, metadata, laneId });
          }}
          onDataChange={handleDataChange}
        />
      </div>
    </BoardContext.Provider>
  );
};
