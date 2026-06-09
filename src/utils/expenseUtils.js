import { getDaysInMonth, parseISO } from 'date-fns';

export const formatCurrency = (value) => `Rs. ${Number(value).toLocaleString('en-IN')}`;

export const getExpenseCategory = (expense, categoryById) => (
  categoryById.get(expense.categoryId)
);

export const getCategoryMap = (categories) => new Map(
  categories.map(category => [category.id, category])
);

export const getYearOptions = (expenses, currentYear) => {
  const years = new Set(
    Array.from({ length: 5 }, (_, index) => currentYear - index)
  );

  expenses.forEach(expense => {
    const year = Number(expense.date.split('-')[0]);
    if (Number.isInteger(year)) {
      years.add(year);
    }
  });

  return Array.from(years).sort((a, b) => b - a);
};

export const getPeriodExpenses = (expenses, selectedYear, selectedMonth) => {
  const year = Number(selectedYear);
  const month = Number(selectedMonth);

  return expenses.filter(expense => {
    const expenseDate = parseISO(expense.date);
    return expenseDate.getFullYear() === year && expenseDate.getMonth() === month;
  });
};

export const getSummary = (expenses, categories, budget, selectedYear, selectedMonth) => {
  let totalSpent = 0;
  let largestExpense = null;
  const categoryTotals = new Map(categories.map(category => [category.id, 0]));

  expenses.forEach(expense => {
    totalSpent += expense.amount;
    categoryTotals.set(expense.categoryId, (categoryTotals.get(expense.categoryId) || 0) + expense.amount);

    if (!largestExpense || expense.amount > largestExpense.amount) {
      largestExpense = expense;
    }
  });

  let topCategory = null;
  categories.forEach(category => {
    const total = categoryTotals.get(category.id) || 0;
    if (total > (topCategory?.total || 0)) {
      topCategory = { ...category, total };
    }
  });

  const daysInPeriod = getDaysInMonth(new Date(Number(selectedYear), Number(selectedMonth), 1));

  return {
    totalSpent,
    remainingBudget: budget - totalSpent,
    averageDailySpend: daysInPeriod > 0 ? totalSpent / daysInPeriod : 0,
    largestExpense,
    topCategory: topCategory?.total > 0 ? topCategory : null,
  };
};

export const getDailyTotals = (expenses, selectedYear, selectedMonth) => {
  const daysInMonth = getDaysInMonth(new Date(Number(selectedYear), Number(selectedMonth), 1));
  const totals = Array(daysInMonth).fill(0);

  expenses.forEach(expense => {
    const dayIndex = parseISO(expense.date).getDate() - 1;
    if (dayIndex >= 0 && dayIndex < totals.length) {
      totals[dayIndex] += expense.amount;
    }
  });

  return totals;
};

export const getCategoryTotals = (expenses, categories) => {
  const totals = new Map(categories.map(category => [category.id, 0]));

  expenses.forEach(expense => {
    totals.set(expense.categoryId, (totals.get(expense.categoryId) || 0) + expense.amount);
  });

  return categories.map(category => totals.get(category.id) || 0);
};
