import React from 'react';
import { render, screen } from '@testing-library/react';
import CompareRunner from '../CompareRunner';
import { test, expect } from 'vitest';

test('renders CompareRunner basic UI', () => {
  render(<CompareRunner />);
  expect(screen.getByText(/Compare Runner/i)).toBeTruthy();
  const boxes = screen.getAllByRole('textbox');
  const textarea = boxes.find(x => x.tagName === 'TEXTAREA');
  expect(textarea).toBeTruthy();
  expect(screen.getByText(/开始对比/)).toBeTruthy();
});
