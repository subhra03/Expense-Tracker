import React, { memo } from 'react';
import { FaRupeeSign } from 'react-icons/fa';
import { formatCurrency } from '../utils/expenseUtils';

const BudgetCard = memo(({
  budget,
  budgetInput,
  totalSpent,
  budgetUsage,
  onBudgetChange,
  onBudgetBlur,
}) => (
  <div className="card budget-card mb-4 shadow-sm">
    <div className="card-body">
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
        <h2 className="card-title fs-4 mb-0">Monthly Budget</h2>
        <div className="input-group budget-input">
          <span className="input-group-text"><FaRupeeSign aria-hidden="true" /></span>
          <input
            aria-label="Monthly budget"
            type="number"
            min="0.01"
            step="0.01"
            value={budgetInput}
            onChange={event => onBudgetChange(event.target.value)}
            onBlur={onBudgetBlur}
            className="form-control"
          />
        </div>
      </div>
      <div className="progress mt-3" style={{ height: '25px' }}>
        <div
          className={`progress-bar ${budgetUsage >= 100 ? 'bg-danger' : 'bg-success'}`}
          role="progressbar"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={Math.round(budgetUsage)}
          style={{ width: `${budgetUsage}%` }}
        >
          Spent: {formatCurrency(totalSpent)} / {formatCurrency(budget)}
        </div>
      </div>
    </div>
  </div>
));

export default BudgetCard;
