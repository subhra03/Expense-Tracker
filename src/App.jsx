import React, { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import BudgetCard from './components/BudgetCard';
import CategoryManager from './components/CategoryManager';
import { CategoryPieChart, DailySpendingChart } from './components/Charts';
import DataTools from './components/DataTools';
import ExpenseForm from './components/ExpenseForm';
import ExpenseTable from './components/ExpenseTable';
import Filters from './components/Filters';
import SummaryCards from './components/SummaryCards';
import { expensesToCsv, parseExpensesCsv } from './utils/csv';
import { getCategoryMap, getPeriodExpenses, getSummary, getYearOptions } from './utils/expenseUtils';
import { createInitialState, persistState } from './utils/storage';
import { parsePositiveNumber } from './utils/validation';
import './App.css';

const emptyForm = {
  title: '',
  amount: '',
  date: '',
  categoryId: '',
};

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_EXPENSE':
      return { ...state, expenses: [action.payload, ...state.expenses] };
    case 'ADD_EXPENSES':
      return { ...state, expenses: [...action.payload, ...state.expenses] };
    case 'DELETE_EXPENSE':
      return { ...state, expenses: state.expenses.filter(expense => expense.id !== action.payload) };
    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map(expense => (
          expense.id === action.payload.id ? action.payload : expense
        )),
      };
    case 'SET_BUDGET':
      return { ...state, budget: action.payload };
    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] };
    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map(category => {
          if (category.id !== action.payload.id) {
            return category;
          }

          const updates = action.payload.updates;
          const name = updates.name === undefined ? category.name : updates.name.trim();

          return {
            ...category,
            ...updates,
            name: name || category.name,
          };
        }),
      };
    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter(category => category.id !== action.payload),
      };
    default:
      return state;
  }
}

const App = () => {
  const initialPeriod = useMemo(() => {
    const now = new Date();
    return {
      month: String(now.getMonth()),
      year: String(now.getFullYear()),
      currentYear: now.getFullYear(),
    };
  }, []);
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);
  const [form, setForm] = useState(emptyForm);
  const [selectedYear, setSelectedYear] = useState(initialPeriod.year);
  const [selectedMonth, setSelectedMonth] = useState(initialPeriod.month);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [budgetInput, setBudgetInput] = useState(String(state.budget));

  useEffect(() => {
    persistState(state);
  }, [state]);

  const yearOptions = useMemo(
    () => getYearOptions(state.expenses, initialPeriod.currentYear),
    [state.expenses, initialPeriod.currentYear]
  );

  const categoryById = useMemo(
    () => getCategoryMap(state.categories),
    [state.categories]
  );

  const periodExpenses = useMemo(
    () => getPeriodExpenses(state.expenses, selectedYear, selectedMonth),
    [state.expenses, selectedYear, selectedMonth]
  );

  const visibleExpenses = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return periodExpenses;
    }

    return periodExpenses.filter(expense => (
      expense.title.toLowerCase().includes(normalizedSearch)
    ));
  }, [periodExpenses, searchTerm]);

  const summary = useMemo(
    () => getSummary(periodExpenses, state.categories, state.budget, selectedYear, selectedMonth),
    [periodExpenses, state.categories, state.budget, selectedYear, selectedMonth]
  );

  const budgetUsage = state.budget > 0
    ? Math.min((summary.totalSpent / state.budget) * 100, 100)
    : 0;

  const updateForm = useCallback((field, value) => {
    setForm(currentForm => ({ ...currentForm, [field]: value }));
  }, []);

  const resetForm = useCallback(() => {
    setForm(emptyForm);
    setEditingId(null);
  }, []);

  const buildExpenseFromForm = useCallback(() => {
    if (!form.title || !form.amount || !form.date || !form.categoryId) {
      toast.error('Please fill all fields.');
      return null;
    }

    const amount = parsePositiveNumber(form.amount);
    if (amount === null) {
      toast.error('Amount must be greater than 0.');
      return null;
    }

    return {
      id: editingId || Date.now(),
      title: form.title.trim(),
      amount,
      date: format(parseISO(form.date), 'yyyy-MM-dd'),
      categoryId: Number(form.categoryId),
    };
  }, [editingId, form]);

  const saveExpense = useCallback((event) => {
    event.preventDefault();
    const expense = buildExpenseFromForm();

    if (!expense) {
      return;
    }

    dispatch({ type: editingId ? 'UPDATE_EXPENSE' : 'ADD_EXPENSE', payload: expense });
    toast.success(editingId ? 'Expense updated successfully.' : 'Expense added successfully.');
    resetForm();
  }, [buildExpenseFromForm, editingId, resetForm]);

  const startEditing = useCallback((expense) => {
    setEditingId(expense.id);
    setForm({
      title: expense.title,
      amount: String(expense.amount),
      date: format(parseISO(expense.date), 'yyyy-MM-dd'),
      categoryId: String(expense.categoryId),
    });
  }, []);

  const deleteExpense = useCallback((expense) => {
    if (!window.confirm(`Delete "${expense.title}"?`)) {
      return;
    }

    dispatch({ type: 'DELETE_EXPENSE', payload: expense.id });
    toast.info('Expense deleted.');
  }, []);

  const updateBudgetInput = useCallback((value) => {
    setBudgetInput(value);

    const nextBudget = parsePositiveNumber(value);
    if (nextBudget !== null) {
      dispatch({ type: 'SET_BUDGET', payload: nextBudget });
    }
  }, []);

  const resetInvalidBudgetInput = useCallback(() => {
    if (parsePositiveNumber(budgetInput) === null) {
      toast.error('Budget must be greater than 0.');
      setBudgetInput(String(state.budget));
    }
  }, [budgetInput, state.budget]);

  const addCategory = useCallback(({ name, color }) => {
    const duplicate = state.categories.some(
      category => category.name.toLowerCase() === name.toLowerCase()
    );

    if (duplicate) {
      toast.error('Category already exists.');
      return;
    }

    const nextId = Math.max(...state.categories.map(category => category.id), 0) + 1;
    dispatch({ type: 'ADD_CATEGORY', payload: { id: nextId, name, color } });
    toast.success('Category added.');
  }, [state.categories]);

  const updateCategory = useCallback((id, updates) => {
    dispatch({ type: 'UPDATE_CATEGORY', payload: { id, updates } });
  }, []);

  const deleteCategory = useCallback((id) => {
    const isUsed = state.expenses.some(expense => expense.categoryId === id);
    if (isUsed || state.categories.length <= 1) {
      toast.error('Only unused categories can be deleted.');
      return;
    }

    dispatch({ type: 'DELETE_CATEGORY', payload: id });
    toast.info('Category deleted.');
  }, [state.categories.length, state.expenses]);

  const exportCsv = useCallback(() => {
    const csv = expensesToCsv(state.expenses, state.categories);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'expenses.csv';
    link.click();
    URL.revokeObjectURL(url);
  }, [state.categories, state.expenses]);

  const importCsv = useCallback((text) => {
    const result = parseExpensesCsv(text, state.categories);

    if (result.expenses.length === 0) {
      toast.error('No valid expenses found in CSV.');
      return;
    }

    dispatch({ type: 'ADD_EXPENSES', payload: result.expenses });
    toast.success(
      `Imported ${result.expenses.length} expenses${result.skipped ? `, skipped ${result.skipped}` : ''}.`
    );
  }, [state.categories]);

  return (
    <div className="container py-4">
      <header className="app-header mb-4">
        <img src="/app-icon.svg" alt="" className="app-header-icon" aria-hidden="true" />
        <div>
          <p className="app-eyebrow mb-1">Monthly budget dashboard</p>
          <h1 className="display-5 text-primary fw-bold mb-1">Expense Tracker</h1>
          <p className="text-muted mb-0">
            Track every rupee, compare category spending, and keep your monthly budget on course.
          </p>
        </div>
      </header>

      <BudgetCard
        budget={state.budget}
        budgetInput={budgetInput}
        totalSpent={summary.totalSpent}
        budgetUsage={budgetUsage}
        onBudgetChange={updateBudgetInput}
        onBudgetBlur={resetInvalidBudgetInput}
      />

      <Filters
        searchTerm={searchTerm}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        yearOptions={yearOptions}
        onSearchChange={setSearchTerm}
        onMonthChange={setSelectedMonth}
        onYearChange={setSelectedYear}
      />

      <SummaryCards summary={summary} categoryById={categoryById} />

      <ExpenseForm
        form={form}
        categories={state.categories}
        isEditing={editingId !== null}
        onChange={updateForm}
        onSubmit={saveExpense}
        onCancel={resetForm}
      />

      <DataTools onExport={exportCsv} onImport={importCsv} />

      <div className="row mb-4">
        <div className="col-md-8">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h3 className="card-title fs-5 mb-3">Daily Spending Analysis</h3>
              <div className="chart-container">
                <DailySpendingChart
                  expenses={periodExpenses}
                  budget={state.budget}
                  selectedYear={selectedYear}
                  selectedMonth={selectedMonth}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h3 className="card-title fs-5 mb-3">Category Distribution</h3>
              <div className="chart-container">
                <CategoryPieChart expenses={periodExpenses} categories={state.categories} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <ExpenseTable
        expenses={visibleExpenses}
        categoryById={categoryById}
        onEdit={startEditing}
        onDelete={deleteExpense}
      />

      <CategoryManager
        categories={state.categories}
        expenses={state.expenses}
        onAdd={addCategory}
        onUpdate={updateCategory}
        onDelete={deleteCategory}
      />

      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default App;
