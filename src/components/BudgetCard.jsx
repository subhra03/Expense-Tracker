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
      <div className="budget-meter mt-3">
        <div className="budget-meter-summary">
          <span>Spent: {formatCurrency(totalSpent)} / {formatCurrency(budget)}</span>
          <span>{Math.round(budgetUsage)}% used</span>
        </div>
        <div className="progress" style={{ height: '25px' }}>
          <div
            className={`progress-bar ${budgetUsage >= 100 ? 'bg-danger' : 'bg-success'}`}
            role="progressbar"
            aria-label="Budget used"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow={Math.round(budgetUsage)}
            style={{ width: `${budgetUsage}%` }}
          />
        </div>
      </div>
    </div>
  </div>
));

export default BudgetCard;
