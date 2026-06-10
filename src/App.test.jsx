import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import App from './App';

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth();
const currentMonthNumber = String(currentMonth + 1).padStart(2, '0');
const defaultDate = `${currentYear}-${currentMonthNumber}-10`;

const addExpense = ({
  title = 'Groceries',
  amount = '1234',
  date = defaultDate,
  categoryId = '1',
} = {}) => {
  fireEvent.change(screen.getByLabelText(/expense title/i), {
    target: { value: title },
  });
  fireEvent.change(screen.getByLabelText(/amount/i), {
    target: { value: amount },
  });
  fireEvent.change(screen.getByLabelText(/date/i), {
    target: { value: date },
  });
  fireEvent.change(screen.getByLabelText(/^category$/i), {
    target: { value: categoryId },
  });
  fireEvent.click(screen.getByRole('button', { name: /add expense/i }));
};

const getBarChartData = () => JSON.parse(screen.getByTestId('bar-chart').textContent);

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

test('renders the expense tracker dashboard with monthly filters and empty chart states', () => {
  render(<App />);

  expect(screen.getByRole('heading', { name: /expense tracker/i })).toBeInTheDocument();
  expect(screen.getByLabelText(/monthly budget/i)).toHaveValue(50000);
  expect(screen.getByLabelText(/^month$/i)).toHaveValue(String(currentMonth));
  expect(screen.getByText(/No spending to chart for this month/i)).toBeInTheDocument();
  expect(screen.getByText(/No category data for this month/i)).toBeInTheDocument();
});

test('loads valid expenses, categories, and budget from localStorage', () => {
  localStorage.setItem('categories', JSON.stringify([
    { id: 9, name: 'Health', color: '#123456' },
  ]));
  localStorage.setItem('expenses', JSON.stringify([
    {
      id: 'saved-expense',
      title: 'Saved medicine',
      amount: 250,
      date: defaultDate,
      categoryId: 9,
    },
  ]));
  localStorage.setItem('budget', JSON.stringify(12500));

  render(<App />);

  expect(screen.getAllByText('Saved medicine').length).toBeGreaterThan(0);
  expect(screen.getByRole('option', { name: 'Health' })).toBeInTheDocument();
  expect(screen.getByLabelText(/monthly budget/i)).toHaveValue(12500);
  expect(screen.getByText(/Spent: Rs\. 250 \/ Rs\. 12,500/)).toBeInTheDocument();
});

test('falls back to defaults when localStorage contains invalid JSON or malformed expenses', () => {
  localStorage.setItem('expenses', '{invalid-json');
  localStorage.setItem('categories', JSON.stringify([{ id: 1, name: '', color: 'bad' }]));
  localStorage.setItem('budget', '{invalid-json');

  expect(() => render(<App />)).not.toThrow();
  expect(screen.getByLabelText(/monthly budget/i)).toHaveValue(50000);
  expect(screen.getByText(/Spent: Rs\. 0 \/ Rs\. 50,000/)).toBeInTheDocument();
  expect(screen.getByRole('option', { name: 'Food' })).toBeInTheDocument();
});

test('adds an expense and updates monthly summary and daily chart', () => {
  render(<App />);

  addExpense();

  expect(screen.getAllByText('Groceries').length).toBeGreaterThan(0);
  expect(screen.getAllByText(/Rs\. 1,234/).length).toBeGreaterThan(0);
  expect(screen.getByText(/Spent: Rs\. 1,234 \/ Rs\. 50,000/)).toBeInTheDocument();
  expect(getBarChartData().datasets[0].data[9]).toBe(1234);
});

test('rejects zero and negative expense amounts', () => {
  render(<App />);

  addExpense({ title: '   ', amount: '25' });
  addExpense({ title: 'Free sample', amount: '0' });
  addExpense({ title: 'Invalid charge', amount: '-25' });

  expect(screen.queryByText(/Rs\. 25/)).not.toBeInTheDocument();
  expect(screen.queryByText('Free sample')).not.toBeInTheDocument();
  expect(screen.queryByText('Invalid charge')).not.toBeInTheDocument();
  expect(screen.getByText(/Spent: Rs\. 0 \/ Rs\. 50,000/)).toBeInTheDocument();
});

test('edits an existing expense and rejects invalid edited amounts', () => {
  render(<App />);

  addExpense({ title: 'Tea', amount: '50' });
  fireEvent.click(screen.getByRole('button', { name: /edit tea/i }));

  fireEvent.change(screen.getByLabelText(/expense title/i), {
    target: { value: 'Coffee' },
  });
  fireEvent.change(screen.getByLabelText(/amount/i), {
    target: { value: '0' },
  });
  fireEvent.click(screen.getByRole('button', { name: /save expense/i }));

  expect(screen.getAllByText('Tea').length).toBeGreaterThan(0);
  expect(screen.queryByText('Coffee')).not.toBeInTheDocument();

  fireEvent.change(screen.getByLabelText(/amount/i), {
    target: { value: '75' },
  });
  fireEvent.click(screen.getByRole('button', { name: /save expense/i }));

  expect(screen.queryByText('Tea')).not.toBeInTheDocument();
  expect(screen.getAllByText('Coffee').length).toBeGreaterThan(0);
  expect(screen.getByText(/Spent: Rs\. 75 \/ Rs\. 50,000/)).toBeInTheDocument();
});

test('rejects invalid budgets and keeps progress math stable', () => {
  render(<App />);

  addExpense({ title: 'Groceries', amount: '1000' });

  const budgetInput = screen.getByLabelText(/monthly budget/i);
  fireEvent.change(budgetInput, { target: { value: '0' } });

  expect(screen.getByText(/Spent: Rs\. 1,000 \/ Rs\. 50,000/)).toBeInTheDocument();
  expect(getBarChartData().datasets[1].data[0]).toBeCloseTo(50000 / new Date(currentYear, currentMonth + 1, 0).getDate());

  fireEvent.blur(budgetInput);

  expect(budgetInput).toHaveValue(50000);
});

test('focuses a saved expense period and calculates chart data for it', () => {
  const targetYear = currentYear - 1;

  render(<App />);

  addExpense({
    title: 'March rent',
    amount: '2222',
    date: `${targetYear}-03-12`,
    categoryId: '3',
  });

  expect(screen.getByLabelText(/^year$/i)).toHaveValue(String(targetYear));
  expect(screen.getByLabelText(/^month$/i)).toHaveValue('2');
  expect(screen.getAllByText('March rent').length).toBeGreaterThan(0);
  expect(getBarChartData().datasets[0].data[11]).toBe(2222);
});

test('search only filters visible rows, not budget or chart totals', () => {
  render(<App />);

  addExpense({ title: 'Groceries', amount: '1000' });
  addExpense({ title: 'Fuel', amount: '500', categoryId: '2' });

  fireEvent.change(screen.getByLabelText(/search expenses/i), {
    target: { value: 'Fuel' },
  });

  const table = screen.getByRole('table');
  expect(within(table).queryByText('Groceries')).not.toBeInTheDocument();
  expect(within(table).getByText('Fuel')).toBeInTheDocument();
  expect(screen.getByText(/Spent: Rs\. 1,500 \/ Rs\. 50,000/)).toBeInTheDocument();
  expect(getBarChartData().datasets[0].data[9]).toBe(1500);
});

test('confirms before deleting an expense', () => {
  vi.spyOn(window, 'confirm').mockReturnValue(false);
  render(<App />);

  addExpense({ title: 'Tea', amount: '50' });
  fireEvent.click(screen.getByRole('button', { name: /delete tea/i }));

  expect(screen.getAllByText('Tea').length).toBeGreaterThan(0);

  window.confirm.mockReturnValue(true);
  fireEvent.click(screen.getByRole('button', { name: /delete tea/i }));

  expect(screen.queryByText('Tea')).not.toBeInTheDocument();
});

test('adds, edits, and deletes unused categories', () => {
  render(<App />);

  fireEvent.change(screen.getByLabelText(/new category name/i), {
    target: { value: 'Books' },
  });
  fireEvent.change(screen.getByLabelText(/new category color/i), {
    target: { value: '#111111' },
  });
  fireEvent.click(screen.getByRole('button', { name: /^add$/i }));

  expect(screen.getByRole('option', { name: 'Books' })).toBeInTheDocument();

  fireEvent.change(screen.getByLabelText(/books category name/i), {
    target: { value: 'Reading' },
  });

  expect(screen.getByRole('option', { name: 'Reading' })).toBeInTheDocument();

  fireEvent.change(screen.getByLabelText(/reading category name/i), {
    target: { value: 'Food' },
  });

  expect(screen.getByRole('option', { name: 'Reading' })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /delete category reading/i }));

  expect(screen.queryByRole('option', { name: 'Reading' })).not.toBeInTheDocument();
});

test('imports expenses from CSV', async () => {
  const targetYear = currentYear - 1;
  const targetDate = `${targetYear}-03-14`;

  render(<App />);

  const file = new File(
    [`title,amount,date,category\nImported item,300,${targetDate},Food`],
    'expenses.csv',
    { type: 'text/csv' }
  );

  fireEvent.change(screen.getByLabelText(/import csv/i), {
    target: { files: [file] },
  });

  await waitFor(() => {
    expect(screen.getAllByText('Imported item').length).toBeGreaterThan(0);
  });
  expect(screen.getByLabelText(/^year$/i)).toHaveValue(String(targetYear));
  expect(screen.getByLabelText(/^month$/i)).toHaveValue('2');
  expect(screen.getByText(/Spent: Rs\. 300 \/ Rs\. 50,000/)).toBeInTheDocument();
});

test('exports expenses as CSV', async () => {
  const createObjectURL = vi.fn(() => 'blob:expenses');
  const revokeObjectURL = vi.fn();
  const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  vi.stubGlobal('URL', { createObjectURL, revokeObjectURL });

  render(<App />);
  addExpense({ title: '=SUM(1,2)', amount: '100' });
  fireEvent.click(screen.getByRole('button', { name: /export csv/i }));

  await waitFor(() => {
    expect(createObjectURL).toHaveBeenCalledTimes(1);
  });

  const csvText = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(createObjectURL.mock.calls[0][0]);
  });
  expect(csvText).toContain('"\'=SUM(1,2)"');
  expect(click).toHaveBeenCalledTimes(1);
  expect(revokeObjectURL).toHaveBeenCalledWith('blob:expenses');
});
