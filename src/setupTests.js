import React from 'react';
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

vi.mock('react-chartjs-2', () => ({
  Bar: ({ data }) => React.createElement('div', {
    'data-testid': 'bar-chart',
  }, JSON.stringify(data)),
  Pie: ({ data }) => React.createElement('div', {
    'data-testid': 'pie-chart',
  }, JSON.stringify(data)),
}));
