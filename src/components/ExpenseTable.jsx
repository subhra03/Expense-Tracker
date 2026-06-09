import React, { memo } from 'react';
import { format, parseISO } from 'date-fns';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { formatCurrency, getExpenseCategory } from '../utils/expenseUtils';

const ExpenseTable = memo(({ expenses, categoryById, onEdit, onDelete }) => (
  <div className="card shadow-sm">
    <div className="card-body">
      <h2 className="card-title fs-4 mb-4">Recent Expenses</h2>
      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <tbody>
            {expenses.length === 0 && (
              <tr>
                <td className="text-muted py-4 text-center" colSpan="3">
                  No expenses match the selected filters.
                </td>
              </tr>
            )}
            {expenses.map(expense => {
              const category = getExpenseCategory(expense, categoryById);

              return (
                <tr key={expense.id}>
                  <td style={{ width: '50%' }}>
                    <div className="d-flex align-items-center">
                      <span
                        className="category-badge me-3"
                        style={{ backgroundColor: category?.color || '#6c757d' }}
                      />
                      <div>
                        <div className="fw-bold">{expense.title}</div>
                        <small className="text-muted">
                          {format(parseISO(expense.date), 'dd MMM yyyy')}
                          {category ? ` - ${category.name}` : ''}
                        </small>
                      </div>
                    </div>
                  </td>
                  <td className="text-end" style={{ width: '30%' }}>
                    <span className="badge bg-primary fs-6">
                      {formatCurrency(expense.amount)}
                    </span>
                  </td>
                  <td className="text-end" style={{ width: '20%' }}>
                    <button
                      onClick={() => onEdit(expense)}
                      className="btn btn-sm btn-outline-secondary me-2"
                      aria-label={`Edit ${expense.title}`}
                    >
                      <FaEdit aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => onDelete(expense)}
                      className="btn btn-sm btn-outline-danger"
                      aria-label={`Delete ${expense.title}`}
                    >
                      <FaTrash aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  </div>
));

export default ExpenseTable;
