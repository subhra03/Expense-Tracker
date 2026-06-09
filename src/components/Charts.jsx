import React, { memo, useMemo } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { format } from 'date-fns';
import { getCategoryTotals, getDailyTotals } from '../utils/expenseUtils';

Chart.register(...registerables);

const EmptyState = ({ message }) => (
  <div className="empty-state" role="status">{message}</div>
);

export const DailySpendingChart = memo(({ expenses, budget, selectedYear, selectedMonth }) => {
  const dailyTotals = useMemo(
    () => getDailyTotals(expenses, selectedYear, selectedMonth),
    [expenses, selectedYear, selectedMonth]
  );

  if (expenses.length === 0) {
    return <EmptyState message="No spending to chart for this month." />;
  }

  const daysInMonth = dailyTotals.length;
  const dailyBudget = budget / daysInMonth;

  const data = {
    labels: dailyTotals.map((_, index) => String(index + 1)),
    datasets: [
      {
        label: 'Spending',
        type: 'bar',
        data: dailyTotals,
        backgroundColor: 'rgba(13, 110, 253, 0.65)',
      },
      {
        label: 'Daily Budget',
        type: 'line',
        data: Array(daysInMonth).fill(dailyBudget),
        borderColor: '#dc3545',
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
      },
    ],
  };

  return (
    <Bar
      data={data}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { title: { display: true, text: format(new Date(Number(selectedYear), Number(selectedMonth), 1), 'MMMM yyyy') } },
          y: { beginAtZero: true },
        },
      }}
    />
  );
});

export const CategoryPieChart = memo(({ expenses, categories }) => {
  const categoryTotals = useMemo(
    () => getCategoryTotals(expenses, categories),
    [expenses, categories]
  );

  if (expenses.length === 0) {
    return <EmptyState message="No category data for this month." />;
  }

  const data = {
    labels: categories.map(category => category.name),
    datasets: [{
      data: categoryTotals,
      backgroundColor: categories.map(category => category.color),
    }],
  };

  return <Pie data={data} options={{ responsive: true, maintainAspectRatio: false }} />;
});
