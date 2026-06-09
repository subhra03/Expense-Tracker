import React, { memo } from 'react';
import { FaRupeeSign, FaSave, FaTimes } from 'react-icons/fa';

const ExpenseForm = memo(({
  form,
  categories,
  isEditing,
  onChange,
  onSubmit,
  onCancel,
}) => (
  <form onSubmit={onSubmit} className="row g-3 mb-4">
    <div className="col-md-3">
      <input
        aria-label="Expense title"
        type="text"
        className="form-control"
        placeholder="Expense Title"
        value={form.title}
        onChange={event => onChange('title', event.target.value)}
        required
      />
    </div>
    <div className="col-md-2">
      <div className="input-group">
        <span className="input-group-text"><FaRupeeSign aria-hidden="true" /></span>
        <input
          aria-label="Amount"
          type="number"
          min="0.01"
          step="0.01"
          className="form-control"
          placeholder="Amount"
          value={form.amount}
          onChange={event => onChange('amount', event.target.value)}
          required
        />
      </div>
    </div>
    <div className="col-md-2">
      <input
        aria-label="Date"
        type="date"
        className="form-control"
        value={form.date}
        onChange={event => onChange('date', event.target.value)}
        required
      />
    </div>
    <div className="col-md-3">
      <select
        aria-label="Category"
        className="form-select"
        value={form.categoryId}
        onChange={event => onChange('categoryId', event.target.value)}
        required
      >
        <option value="">Select Category</option>
        {categories.map(category => (
          <option key={category.id} value={category.id}>{category.name}</option>
        ))}
      </select>
    </div>
    <div className="col-md-2 d-flex gap-2">
      <button
        type="submit"
        className={`btn ${isEditing ? 'btn-warning' : 'btn-primary'} flex-fill`}
        aria-label={isEditing ? 'Save expense' : 'Add expense'}
      >
        {isEditing ? <FaSave aria-hidden="true" /> : 'Add Expense'}
      </button>
      {isEditing && (
        <button
          type="button"
          className="btn btn-outline-secondary"
          aria-label="Cancel edit"
          onClick={onCancel}
        >
          <FaTimes aria-hidden="true" />
        </button>
      )}
    </div>
  </form>
));

export default ExpenseForm;
