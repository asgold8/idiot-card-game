import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

test('renders how to play link', () => {
  const { getByText } = render(<App />);
  const linkElement = getByText(/how to play/i);
  expect(linkElement).toBeInTheDocument();
});
