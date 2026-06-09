import React, { memo } from 'react';
import { MONTH_OPTIONS } from '../constants';

const Filters = memo(({
  searchTerm,
  selectedMonth,
  selectedYear,
  yearOptions,
  onSearchChange,
  onMonthChange,
  onYearChange,
}) => (
  <div className="row mb-4">
    <div className="col-12">
      <div className="filter-grid">
        <input
          aria-label="Search expenses"
          type="text"
          className="form-control"
          placeholder="Search expenses..."
          value={searchTerm}
          onChange={event => onSearchChange(event.target.value)}
        />
        <select
          aria-label="Month"
          className="form-select"
          value={selectedMonth}
          onChange={event => onMonthChange(event.target.value)}
        >
          {MONTH_OPTIONS.map(month => (
            <option key={month.value} value={month.value}>{month.label}</option>
          ))}
        </select>
        <select
          aria-label="Year"
          className="form-select"
          value={selectedYear}
          onChange={event => onYearChange(event.target.value)}
        >
          {yearOptions.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>
    </div>
  </div>
));

export default Filters;
