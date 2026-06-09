import React, { memo, useMemo, useState } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';

const CategoryManager = memo(({ categories, expenses, onAdd, onUpdate, onDelete }) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#6c757d');

  const usedCategoryIds = useMemo(
    () => new Set(expenses.map(expense => expense.categoryId)),
    [expenses]
  );

  const submitCategory = (event) => {
    event.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      return;
    }

    onAdd({ name: trimmedName, color });
    setName('');
    setColor('#6c757d');
  };

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        <h2 className="card-title fs-4 mb-3">Categories</h2>
        <form onSubmit={submitCategory} className="row g-2 mb-3">
          <div className="col-md-6">
            <input
              aria-label="New category name"
              className="form-control"
              value={name}
              onChange={event => setName(event.target.value)}
              placeholder="New category"
            />
          </div>
          <div className="col-md-3">
            <input
              aria-label="New category color"
              type="color"
              className="form-control form-control-color w-100"
              value={color}
              onChange={event => setColor(event.target.value)}
            />
          </div>
          <div className="col-md-3">
            <button type="submit" className="btn btn-outline-primary w-100">
              <FaPlus aria-hidden="true" /> Add
            </button>
          </div>
        </form>

        <div className="category-list">
          {categories.map(category => {
            const isUsed = usedCategoryIds.has(category.id);
            const canDelete = categories.length > 1 && !isUsed;

            return (
              <div className="category-row" key={category.id}>
                <input
                  aria-label={`${category.name} color`}
                  type="color"
                  className="form-control form-control-color"
                  value={category.color}
                  onChange={event => onUpdate(category.id, { color: event.target.value })}
                />
                <input
                  aria-label={`${category.name} category name`}
                  className="form-control"
                  value={category.name}
                  onChange={event => onUpdate(category.id, { name: event.target.value })}
                />
                <button
                  type="button"
                  className="btn btn-outline-danger"
                  aria-label={`Delete category ${category.name}`}
                  disabled={!canDelete}
                  title={isUsed ? 'Category is used by expenses' : 'Delete category'}
                  onClick={() => onDelete(category.id)}
                >
                  <FaTrash aria-hidden="true" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

export default CategoryManager;
