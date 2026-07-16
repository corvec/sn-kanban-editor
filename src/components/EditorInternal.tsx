import React, { useMemo, useState } from 'react';
import Board from 'react-trello';
import ReactModal from 'react-modal';
import { v4 as uuid } from 'uuid';
import { KanbanCardModal } from './KanbanCardModal';
import { BoardSettingsModal } from './BoardSettingsModal';
import { KanbanCard } from './KanbanCard';
import { BoardContext } from './BoardContext';
import { Toolbar } from './Toolbar';
import { useModal } from 'react-modal-hook';
import { collectKnownTags } from '../lib/tagStyles';
import {
  SearchableField,
  deleteCards,
  findMatchingCardIds,
  moveCardsToLane,
} from '../lib/search';
import { stampDateTime } from '../lib/datetime';

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
  handleConfigChange,
  onCardAdd,
  onCardUpdate,
  onCardMoveAcrossLanes,
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
  const [query, setQuery] = useState('');
  const [searchField, setSearchField] = useState<SearchableField | 'all'>(
    'all'
  );
  ReactModal.setAppElement(document.getElementById(HtmlElementId.snComponent));

  const config = editorConfig ?? {};

  const searchFields: SearchableField[] =
    searchField === 'all' ? [] : [searchField];

  const matchedIds = useMemo(
    () => findMatchingCardIds(boardData, query, searchFields),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [boardData, query, searchField]
  );

  const laneSummaries = boardData.lanes.map((lane) => ({
    id: lane.id,
    title: lane.title,
  }));

  const allCards = boardData.lanes.flatMap((lane) =>
    lane.cards.map((laneCard) => ({
      id: laneCard.id,
      stableId: laneCard.stableId,
      title: laneCard.title,
      laneId: lane.id,
      laneTitle: lane.title,
    }))
  );

  const findCardLocation = (idOrStableId) => {
    for (const lane of boardData.lanes) {
      const found = lane.cards.find(
        (laneCard) =>
          laneCard.id === idOrStableId || laneCard.stableId === idOrStableId
      );
      if (found) {
        return { laneId: lane.id, card: found };
      }
    }
    return null;
  };

  /**
   * Guarantees a card has a persistent id (saved in the markdown) so other
   * cards can reference it; returns that id.
   */
  const ensureStableId = (idOrStableId) => {
    const location = findCardLocation(idOrStableId);
    if (!location) {
      return idOrStableId;
    }
    if (location.card.stableId) {
      return location.card.stableId;
    }
    const stableId = uuid().slice(0, 8);
    eventBus.publish({
      type: 'UPDATE_CARD',
      laneId: location.laneId,
      card: { id: location.card.id, stableId },
    });
    return stableId;
  };

  const moveMatchesToLane = (toLaneId: string) => {
    const updated = moveCardsToLane(
      boardData,
      matchedIds,
      toLaneId,
      config.history
        ? (from, to) => stampDateTime(`Moved from "${from}" to "${to}"`)
        : undefined
    );
    handleDataChange(updated);
  };

  const deleteMatches = () => {
    handleDataChange(deleteCards(boardData, matchedIds));
  };

  const [showModal, hideModal] = useModal(
    () => (
      <KanbanCardModal
        card={card.cardData}
        laneId={card.laneId}
        lanes={laneSummaries}
        config={config}
        allCards={allCards}
        knownTags={collectKnownTags(config, boardData.lanes)}
        updateCard={(changes) => {
          eventBus.publish({
            type: 'UPDATE_CARD',
            laneId: card.laneId,
            card: { id: card.cardId, ...changes },
          });
        }}
        moveToLane={(toLaneId) => {
          const targetLane = boardData.lanes.find(
            (lane) => lane.id === toLaneId
          );
          eventBus.publish({
            type: 'MOVE_CARD',
            fromLaneId: card.laneId,
            toLaneId,
            cardId: card.cardId,
            index: targetLane ? targetLane.cards.length : 0,
          });
        }}
        cloneCard={(draft) => {
          eventBus.publish({
            type: 'ADD_CARD',
            laneId: card.laneId,
            card: { id: uuid(), laneId: card.laneId, ...draft },
          });
        }}
        ensureStableId={ensureStableId}
        hideModal={hideModal}
      />
    ),
    [card, boardData, editorConfig]
  );

  const [showSettingsModal, hideSettingsModal] = useModal(
    () => (
      <BoardSettingsModal
        config={config}
        knownTags={collectKnownTags(config, boardData.lanes)}
        saveConfig={handleConfigChange}
        hideModal={hideSettingsModal}
      />
    ),
    [editorConfig, boardData]
  );

  const openModal = (card) => {
    setCard(card);
    showModal();
  };

  const contextValue = useMemo(
    () => ({
      config,
      searchState: query ? { query, fields: searchFields, matchedIds } : null,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editorConfig, query, searchField, matchedIds]
  );

  /**
   * Optional board color overrides. When unset, the Standard Notes theme
   * variables cascade through untouched (the default).
   */
  const theme = config.theme ?? {};
  const themeStyle = {
    ...(theme.background
      ? { '--sn-stylekit-background-color': theme.background }
      : {}),
    ...(theme.foreground
      ? { '--sn-stylekit-foreground-color': theme.foreground }
      : {}),
    ...(theme.laneBackground
      ? {
          '--sn-stylekit-contrast-background-color': theme.laneBackground,
        }
      : {}),
    ...(theme.cardBackground
      ? {
          '--sn-stylekit-secondary-background-color': theme.cardBackground,
        }
      : {}),
    ...(theme.accent ? { '--sn-stylekit-info-color': theme.accent } : {}),
  } as React.CSSProperties;

  return (
    <BoardContext.Provider value={contextValue}>
      <div
        className={`${HtmlClassName.snComponent}${
          printUrl ? ' print-url' : ''
        }`}
        id={HtmlElementId.snComponent}
        tabIndex={0}
        style={themeStyle}
      >
        <Toolbar
          query={query}
          setQuery={setQuery}
          searchField={searchField}
          setSearchField={setSearchField}
          matchCount={matchedIds.size}
          lanes={laneSummaries}
          moveMatchesToLane={moveMatchesToLane}
          deleteMatches={deleteMatches}
          openSettings={showSettingsModal}
        />
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
          onCardAdd={onCardAdd}
          onCardUpdate={onCardUpdate}
          onCardMoveAcrossLanes={onCardMoveAcrossLanes}
          onCardClick={(cardId, metadata, laneId) => {
            const cardData = boardData.lanes
              .find((lane) => lane.id === laneId)
              .cards.find((laneCard) => laneCard.id === cardId);
            openModal({ cardId, cardData, metadata, laneId });
          }}
          onDataChange={handleDataChange}
        />
      </div>
    </BoardContext.Provider>
  );
};
