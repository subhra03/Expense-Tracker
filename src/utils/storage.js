import { DEFAULT_BUDGET, DEFAULT_CATEGORIES } from '../constants';
import { parsePositiveNumber, sanitizeCategories, sanitizeExpenses } from './validation';

const readStorageValue = (key, fallbackValue) => {
  try {
    const storedValue = localStorage.getItem(key);
    return storedValue === null ? fallbackValue : JSON.parse(storedValue);
  } catch {
    return fallbackValue;
  }
};

const writeStorageValue = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore quota/private-mode failures; the in-memory app state still works.
  }
};

export const createInitialState = () => {
  const categories = sanitizeCategories(readStorageValue('categories', DEFAULT_CATEGORIES));
  const expenses = sanitizeExpenses(readStorageValue('expenses', []), categories);
  const budget = parsePositiveNumber(readStorageValue('budget', DEFAULT_BUDGET)) || DEFAULT_BUDGET;

  return {
    expenses,
    categories,
    budget,
  };
};

export const persistState = ({ expenses, categories, budget }) => {
  writeStorageValue('expenses', expenses);
  writeStorageValue('categories', categories);
  writeStorageValue('budget', budget);
};
