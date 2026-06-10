import { isValidISODate, parsePositiveNumber } from './validation';
import { createId } from './id';

const csvEscape = (value) => {
  const stringValue = String(value ?? '');
  const safeValue = /^[=+\-@]/.test(stringValue) ? `'${stringValue}` : stringValue;
  return /[",\n\r]/.test(safeValue)
    ? `"${safeValue.replace(/"/g, '""')}"`
    : safeValue;
};

const parseCsvLine = (line) => {
  const values = [];
  let currentValue = '';
  let insideQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"' && insideQuotes && nextChar === '"') {
      currentValue += '"';
      index += 1;
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === ',' && !insideQuotes) {
      values.push(currentValue);
      currentValue = '';
    } else {
      currentValue += char;
    }
  }

  values.push(currentValue);
  return values.map(value => value.trim());
};

export const expensesToCsv = (expenses, categories) => {
  const categoryById = new Map(categories.map(category => [category.id, category]));
  const rows = expenses.map(expense => {
    const category = categoryById.get(expense.categoryId);
    return [
      expense.title,
      expense.amount,
      expense.date,
      category?.name || '',
    ].map(csvEscape).join(',');
  });

  return ['title,amount,date,category', ...rows].join('\n');
};

export const parseExpensesCsv = (text, categories) => {
  const categoryByName = new Map(
    categories.map(category => [category.name.toLowerCase(), category.id])
  );

  const lines = text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);

  if (lines.length <= 1) {
    return { expenses: [], skipped: 0 };
  }

  const [headerLine, ...dataLines] = lines;
  const headers = parseCsvLine(headerLine).map(header => header.toLowerCase());
  const titleIndex = headers.indexOf('title');
  const amountIndex = headers.indexOf('amount');
  const dateIndex = headers.indexOf('date');
  const categoryIndex = headers.indexOf('category');

  if ([titleIndex, amountIndex, dateIndex, categoryIndex].some(index => index === -1)) {
    return { expenses: [], skipped: dataLines.length };
  }

  let skipped = 0;
  const expenses = [];

  dataLines.forEach(line => {
    const values = parseCsvLine(line);
    const title = values[titleIndex]?.trim();
    const amount = parsePositiveNumber(values[amountIndex]);
    const date = values[dateIndex]?.trim();
    const categoryId = categoryByName.get(values[categoryIndex]?.trim().toLowerCase());

    if (!title || amount === null || !isValidISODate(date) || !categoryId) {
      skipped += 1;
      return;
    }

    expenses.push({
      id: createId(),
      title,
      amount,
      date,
      categoryId,
    });
  });

  return { expenses, skipped };
};
