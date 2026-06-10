import { DEFAULT_CATEGORIES } from '../constants';

export const parsePositiveNumber = (value) => {
  if (value === null || value === undefined || String(value).trim() === '') {
    return null;
  }

  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : null;
};

export const isValidId = (value) => (
  (typeof value === 'string' && value.trim() !== '') ||
  (typeof value === 'number' && Number.isFinite(value))
);

export const isValidISODate = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

export const sanitizeCategories = (value) => {
  if (!Array.isArray(value)) {
    return DEFAULT_CATEGORIES;
  }

  const seenIds = new Set();
  const categories = [];

  value.forEach(category => {
    const id = Number(category?.id);
    const name = typeof category?.name === 'string' ? category.name.trim() : '';
    const color = typeof category?.color === 'string' && /^#[0-9a-fA-F]{6}$/.test(category.color)
      ? category.color
      : '#6c757d';

    if (!Number.isInteger(id) || id <= 0 || !name || seenIds.has(id)) {
      return;
    }

    seenIds.add(id);
    categories.push({ id, name, color });
  });

  return categories.length > 0 ? categories : DEFAULT_CATEGORIES;
};

export const sanitizeExpenses = (value, categories) => {
  if (!Array.isArray(value)) {
    return [];
  }

  const categoryIds = new Set(categories.map(category => category.id));

  const expenses = [];

  value.forEach(expense => {
    const id = expense?.id;
    const title = typeof expense?.title === 'string' ? expense.title.trim() : '';
    const amount = parsePositiveNumber(expense?.amount);
    const date = typeof expense?.date === 'string' ? expense.date : '';
    const categoryId = Number(expense?.categoryId);

    if (
      !isValidId(id) ||
      !title ||
      amount === null ||
      !isValidISODate(date) ||
      !categoryIds.has(categoryId)
    ) {
      return;
    }

    expenses.push({ id, title, amount, date, categoryId });
  });

  return expenses;
};
