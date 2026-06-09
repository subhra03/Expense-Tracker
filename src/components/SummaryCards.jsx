import React, { memo } from 'react';
import { formatCurrency, getExpenseCategory } from '../utils/expenseUtils';

const SummaryCards = memo(({ summary, categoryById }) => {
  const largestCategory = summary.largestExpense
    ? getExpenseCategory(summary.largestExpense, categoryById)
    : null;

  const cards = [
    {
      label: 'Spent',
      value: formatCurrency(summary.totalSpent),
      detail: 'This period',
    },
    {
      label: 'Remaining',
      value: formatCurrency(summary.remainingBudget),
      detail: summary.remainingBudget < 0 ? 'Over budget' : 'Left to spend',
      tone: summary.remainingBudget < 0 ? 'text-danger' : 'text-success',
    },
    {
      label: 'Top Category',
      value: summary.topCategory ? summary.topCategory.name : 'None',
      detail: summary.topCategory ? formatCurrency(summary.topCategory.total) : 'No spend yet',
    },
    {
      label: 'Largest Expense',
      value: summary.largestExpense ? summary.largestExpense.title : 'None',
      detail: summary.largestExpense
        ? `${formatCurrency(summary.largestExpense.amount)}${largestCategory ? ` in ${largestCategory.name}` : ''}`
        : 'No spend yet',
    },
    {
      label: 'Daily Average',
      value: formatCurrency(summary.averageDailySpend),
      detail: 'Across selected month',
    },
  ];

  return (
    <div className="summary-grid mb-4">
      {cards.map(card => (
        <div key={card.label} className="card summary-card shadow-sm">
          <div className="card-body">
            <div className="text-muted small text-uppercase">{card.label}</div>
            <div className={`summary-value ${card.tone || ''}`}>{card.value}</div>
            <div className="text-muted small">{card.detail}</div>
          </div>
        </div>
      ))}
    </div>
  );
});

export default SummaryCards;
