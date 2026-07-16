import React from 'react';
import { render, screen } from '@testing-library/react';
import { Markdown } from './inlineMarkdown';

describe('inline markdown rendering', () => {
  it('renders plain text unchanged', () => {
    render(<Markdown text="just some text" />);
    expect(screen.getByText('just some text')).toBeInTheDocument();
  });

  it('renders **bold** as <strong>', () => {
    render(<Markdown text="this is **Bold** text" />);
    const bold = screen.getByText('Bold');
    expect(bold.tagName).toBe('STRONG');
  });

  it('renders *italic* as <em>', () => {
    render(<Markdown text="this is *Italic* text" />);
    const em = screen.getByText('Italic');
    expect(em.tagName).toBe('EM');
  });

  it('renders ~~strike~~ as <del>', () => {
    render(<Markdown text="~~gone~~" />);
    expect(screen.getByText('gone').tagName).toBe('DEL');
  });

  it('renders `code` as <code>', () => {
    render(<Markdown text="run `npm test` now" />);
    expect(screen.getByText('npm test').tagName).toBe('CODE');
  });

  it('renders [links](url) as anchors', () => {
    render(<Markdown text="[Standard Notes](https://standardnotes.com)" />);
    const anchor = screen.getByText('Standard Notes');
    expect(anchor.tagName).toBe('A');
    expect(anchor).toHaveAttribute('href', 'https://standardnotes.com');
  });

  it('renders nested bold within italic content', () => {
    render(<Markdown text="**bold with *italic* inside**" />);
    const em = screen.getByText('italic');
    expect(em.tagName).toBe('EM');
    expect(em.closest('strong')).not.toBeNull();
  });

  it('does not treat unmatched asterisks as formatting', () => {
    render(<Markdown text="2 * 3 = 6" />);
    expect(screen.getByText('2 * 3 = 6')).toBeInTheDocument();
  });

  it('does not treat spaced asterisks as italics', () => {
    render(<Markdown text="2 * 3 * 4" />);
    expect(screen.getByText('2 * 3 * 4')).toBeInTheDocument();
  });
});
