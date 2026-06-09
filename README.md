# Expense Tracker

A local-first React expense tracker for monthly budgets, category analysis, summaries, and CSV import/export.

## Features

- Monthly budget progress with safe positive-number validation
- Month and year filters for all reporting
- Search that only filters visible rows, not budget totals
- Daily spending chart and category distribution chart
- Summary cards for spent, remaining budget, top category, largest expense, and daily average
- Add, edit, delete, and validate expenses
- Confirm-before-delete protection
- Editable custom categories with persisted colors
- CSV import/export
- Safe localStorage loading with malformed-data fallbacks
- Vite build and Vitest test setup

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm start
```

Run tests:

```bash
npm test
```

Build for production:

```bash
npm run build
```

## CSV Format

CSV import expects these headers:

```csv
title,amount,date,category
Groceries,1250,2026-06-10,Food
```

Rules:

- `amount` must be greater than `0`
- `date` must use `YYYY-MM-DD`
- `category` must match an existing category name
- Invalid rows are skipped during import

## Data Storage

The app stores expenses, categories, and budget in browser `localStorage`. Invalid saved JSON or malformed saved records are ignored and replaced with safe defaults.
