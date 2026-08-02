import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { KanbanCardModal } from './KanbanCardModal';

const lanes = [
  { id: 'lane-1', title: 'Todo' },
  { id: 'lane-2', title: 'Done' },
];

const baseCard = {
  id: 'card-1',
  title: 'My card',
  description: 'desc',
  label: 'label',
  comments: ['already here'],
};

const setup = (overrides = {}) => {
  const props = {
    card: baseCard,
    laneId: 'lane-1',
    lanes,
    config: {},
    allCards: [
      { id: 'card-1', title: 'My card', laneTitle: 'Todo' },
      { id: 'card-2', title: 'Other card', laneTitle: 'Done' },
    ],
    knownTags: ['Pink', 'Green'],
    updateCard: jest.fn(),
    moveToLane: jest.fn(),
    cloneCard: jest.fn(),
    ensureStableId: jest.fn((id: string) => `stable-${id}`),
    hideModal: jest.fn(),
    ...overrides,
  };
  render(<KanbanCardModal {...props} />);
  return props;
};

beforeAll(() => {
  // react-modal warns unless an app element is configured
  const root = document.createElement('div');
  root.setAttribute('id', 'root');
  document.body.appendChild(root);
});

describe('KanbanCardModal', () => {
  it('saves edited title and description on Save & Close', () => {
    const props = setup();
    fireEvent.change(screen.getByDisplayValue('My card'), {
      target: { value: 'Renamed card' },
    });
    fireEvent.change(screen.getByDisplayValue('desc'), {
      target: { value: 'new description' },
    });
    fireEvent.click(screen.getByText('Save & Close'));
    expect(props.updateCard).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Renamed card',
        description: 'new description',
      })
    );
    expect(props.hideModal).toHaveBeenCalled();
  });

  it('stamps new comments with a datetime', () => {
    const props = setup();
    fireEvent.change(screen.getByPlaceholderText('New Comment'), {
      target: { value: 'fresh comment' },
    });
    fireEvent.click(screen.getByText('Add Comment'));
    fireEvent.click(screen.getByText('Save & Close'));
    const changes = props.updateCard.mock.calls[0][0];
    expect(changes.comments).toHaveLength(2);
    expect(changes.comments[1]).toMatch(
      /^\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}\] fresh comment$/
    );
  });

  it('does not re-stamp comments that already have a datetime', () => {
    const props = setup({
      card: { ...baseCard, comments: [] },
    });
    fireEvent.change(screen.getByPlaceholderText('New Comment'), {
      target: { value: '[2026-01-01 00:00] old comment' },
    });
    fireEvent.click(screen.getByText('Add Comment'));
    fireEvent.click(screen.getByText('Save & Close'));
    const changes = props.updateCard.mock.calls[0][0];
    expect(changes.comments).toEqual(['[2026-01-01 00:00] old comment']);
  });

  it('allows editing an existing comment', () => {
    const props = setup();
    fireEvent.click(screen.getByTitle('Edit comment'));
    fireEvent.change(screen.getByDisplayValue('already here'), {
      target: { value: 'edited comment' },
    });
    fireEvent.keyDown(screen.getByDisplayValue('edited comment'), {
      key: 'Enter',
    });
    fireEvent.click(screen.getByText('Save & Close'));
    const changes = props.updateCard.mock.calls[0][0];
    expect(changes.comments).toEqual(['edited comment']);
  });

  it('moves the card to the selected lane', () => {
    const props = setup();
    fireEvent.change(screen.getByDisplayValue('Send to column…'), {
      target: { value: 'lane-2' },
    });
    fireEvent.click(screen.getByText('Move'));
    expect(props.moveToLane).toHaveBeenCalledWith('lane-2');
    expect(props.hideModal).toHaveBeenCalled();
  });

  it('records a move history entry when history is enabled', () => {
    const props = setup({ config: { history: true } });
    fireEvent.change(screen.getByDisplayValue('Send to column…'), {
      target: { value: 'lane-2' },
    });
    fireEvent.click(screen.getByText('Move'));
    const changes = props.updateCard.mock.calls[0][0];
    expect(changes.history).toHaveLength(1);
    expect(changes.history[0]).toMatch(/Moved from "Todo" to "Done"$/);
  });

  it('clones the card with a "(copy)" title and no stable id', () => {
    const props = setup();
    fireEvent.click(screen.getByText('Clone'));
    expect(props.cloneCard).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'My card (copy)' })
    );
    const cloneDraft = props.cloneCard.mock.calls[0][0];
    expect(cloneDraft.stableId).toBeUndefined();
  });

  it('adds tags from the known-tags picker', () => {
    const props = setup();
    fireEvent.change(screen.getByTitle('Add an existing tag'), {
      target: { value: 'Pink' },
    });
    fireEvent.click(screen.getByText('Save & Close'));
    const changes = props.updateCard.mock.calls[0][0];
    expect(changes.tags).toEqual([{ title: 'Pink' }]);
  });

  it('edits custom fields defined in the board config', () => {
    const props = setup({
      config: { fields: [{ name: 'Points', type: 'number' }] },
    });
    const input = screen.getByLabelText('Points');
    fireEvent.change(input, { target: { value: '8' } });
    fireEvent.click(screen.getByText('Save & Close'));
    const changes = props.updateCard.mock.calls[0][0];
    expect(changes.fields).toEqual({ Points: '8' });
  });

  it('records title/description edit history when enabled', () => {
    const props = setup({ config: { history: true } });
    fireEvent.change(screen.getByDisplayValue('My card'), {
      target: { value: 'Renamed' },
    });
    fireEvent.click(screen.getByText('Save & Close'));
    const changes = props.updateCard.mock.calls[0][0];
    expect(changes.history).toHaveLength(1);
    expect(changes.history[0]).toMatch(/Title edited$/);
  });
});

describe('label-based tags in the modal', () => {
  it('shows known-tag label parts in the tag row and removes them from the label', () => {
    const props = setup({
      card: { ...baseCard, label: 'Pink, tomorrow' },
      knownTags: ['Pink'],
    });
    // The label part "Pink" appears as a removable tag chip
    fireEvent.click(screen.getByTitle('Remove tag Pink'));
    fireEvent.click(screen.getByText('Save & Close'));
    const changes = props.updateCard.mock.calls[0][0];
    expect(changes.label).toEqual('tomorrow');
    expect(changes.tags).toEqual([]);
  });

  it('does not offer label-derived tags twice in the picker', () => {
    setup({
      card: { ...baseCard, label: 'Pink' },
      knownTags: ['Pink', 'Green'],
    });
    const picker = screen.getByTitle('Add an existing tag');
    const options = Array.from(picker.querySelectorAll('option')).map(
      (option) => option.textContent
    );
    expect(options).toContain('Green');
    expect(options).not.toContain('Pink');
  });
});
