import React from 'react';
import { render, screen } from '@testing-library/react';
import Editor from './Editor';

test('renders add another lane button', () => {
  render(<Editor />);
  const addLaneButton = screen.getByText(/Add another lane/i);
  expect(addLaneButton).toBeInTheDocument();
});
