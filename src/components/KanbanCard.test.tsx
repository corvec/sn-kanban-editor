import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { KanbanCard } from './KanbanCard';
import { BoardContext } from './BoardContext';

const t = (key: string) => key;

const renderCard = (overrides = {}) => {
  const onClick = jest.fn();
  const onChange = jest.fn();
  const onDelete = jest.fn();
  render(
    <KanbanCard
      id="card-1"
      title="My card"
      description="Some **description**"
      label="tomorrow"
      comments={['first comment']}
      showDeleteButton
      onClick={onClick}
      onChange={onChange}
      onDelete={onDelete}
      t={t}
      {...overrides}
    />
  );
  return { onClick, onChange, onDelete };
};

describe('KanbanCard', () => {
  it('does not open details when clicking the description', () => {
    const { onClick } = renderCard();
    fireEvent.click(screen.getByText('description'));
    expect(onClick).not.toHaveBeenCalled();
    // The click switched the description into edit mode instead
    expect(
      screen.getByDisplayValue('Some **description**')
    ).toBeInTheDocument();
  });

  it('does not open details when typing in the open textarea', () => {
    const { onClick } = renderCard();
    fireEvent.click(screen.getByText('description'));
    const textarea = screen.getByDisplayValue('Some **description**');
    fireEvent.click(textarea);
    fireEvent.keyDown(textarea, { key: 'ArrowLeft' });
    expect(onClick).not.toHaveBeenCalled();
  });

  it('opens details only via the Details button', () => {
    const { onClick } = renderCard();
    fireEvent.click(screen.getByText('Details'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('saves an edited description on blur without opening details', () => {
    const { onClick, onChange } = renderCard();
    fireEvent.click(screen.getByText('description'));
    const textarea = screen.getByDisplayValue('Some **description**');
    fireEvent.change(textarea, { target: { value: 'updated text' } });
    fireEvent.blur(textarea);
    expect(onChange).toHaveBeenCalledWith({
      description: 'updated text',
      id: 'card-1',
    });
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders markdown in the title', () => {
    renderCard({ title: 'has **bold** title' });
    expect(screen.getByText('bold').tagName).toBe('STRONG');
  });

  it('shows the comment count on the Details button', () => {
    renderCard({ comments: ['a', 'b', 'c'] });
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});

describe('label-based tags', () => {
  it('renders known-tag label parts as styled chips', () => {
    render(
      <BoardContext.Provider
        value={{
          config: { tags: { Pink: { bgcolor: 'pink' } } },
          searchState: null,
          knownTags: new Set(['Pink']),
        }}
      >
        <KanbanCard
          id="card-2"
          title="Card"
          label="Pink, tomorrow"
          onClick={jest.fn()}
          onChange={jest.fn()}
          onDelete={jest.fn()}
          t={t}
        />
      </BoardContext.Provider>
    );
    const chip = screen.getByText('Pink');
    expect(chip).toHaveStyle({ backgroundColor: 'pink' });
    expect(screen.getByText('tomorrow')).toBeInTheDocument();
  });
});
